import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader2, Upload, Library, FileText, CheckCircle2, ShieldCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { DocumentUploader } from '@/components/audit/DocumentUploader';
import { StandardsLibrary, PresetStandard } from '@/components/audit/StandardsLibrary';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useSubscription } from '@/hooks/useSubscription';
import { UpgradePromptDialog } from '@/components/billing/UpgradePromptDialog';

export default function NewAudit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { canCreateAudit, auditsRemaining, subscription } = useSubscription();
  const [currentStep, setCurrentStep] = useState(1);
  const [standardDoc, setStandardDoc] = useState<{ id: string; name: string; file_path: string } | null>(null);
  const [presetStandard, setPresetStandard] = useState<PresetStandard | null>(null);
  const [subjectDoc, setSubjectDoc] = useState<{ id: string; name: string; file_path: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [standardSource, setStandardSource] = useState<'library' | 'upload'>('library');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);

  const hasStandard = standardDoc || presetStandard;

  const handleSelectPreset = async (standard: PresetStandard) => {
    if (!user) {
      toast({ title: 'Error', description: 'Please log in first', variant: 'destructive' });
      return;
    }

    const { data: docData, error } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        name: `${standard.shortName} - ${standard.name}`,
        document_type: 'standard',
        file_path: `preset/${standard.id}`,
        extracted_text: standard.extractedText,
        file_size: standard.extractedText.length
      })
      .select('id, name, file_path')
      .single();

    if (error) {
      console.error('Document insert error:', error);
      toast({ title: 'Error', description: `Failed to select standard: ${error.message}`, variant: 'destructive' });
      return;
    }

    setPresetStandard(standard);
    setStandardDoc(docData);
    // Auto-advance
    setTimeout(() => setCurrentStep(2), 500);
  };

  const handleClearStandard = () => {
    setPresetStandard(null);
    setStandardDoc(null);
  };

  const simulateProgress = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 800);
    return interval;
  };

  const handleStartAudit = async () => {
    if (!hasStandard || !subjectDoc || !user) return;

    // Check if user can create audit
    if (!canCreateAudit) {
      setShowUpgradeDialog(true);
      return;
    }

    setIsAnalyzing(true);
    const progressInterval = simulateProgress();

    try {
      // Get the standard document text
      const { data: standardDocData } = await supabase
        .from('documents')
        .select('extracted_text, name')
        .eq('id', standardDoc!.id)
        .single();

      // Get the subject document text
      const { data: subjectDocData } = await supabase
        .from('documents')
        .select('extracted_text, name')
        .eq('id', subjectDoc.id)
        .single();

      const standardText = standardDocData?.extracted_text || presetStandard?.extractedText || '';
      const subjectText = subjectDocData?.extracted_text || '';

      if (subjectText.length < 50) {
        toast({
          title: 'Cannot analyze document',
          description: 'Please remove this document and re-upload the PDF. The text could not be extracted.',
          variant: 'destructive'
        });
        setIsAnalyzing(false);
        clearInterval(progressInterval);
        return;
      }

      // Create audit record
      const { data: audit, error: auditError } = await supabase
        .from('audits')
        .insert({
          user_id: user.id,
          standard_document_id: standardDoc!.id,
          subject_document_id: subjectDoc.id,
          status: 'analyzing'
        })
        .select()
        .single();

      if (auditError) throw auditError;

      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiApiKey) throw new Error('Gemini API key not configured');

      // Limit text to ensure response doesn't get truncated
      const maxStandardChars = 8000;
      const maxContractChars = 8000;

      const prompt = `Analyze this contract for compliance gaps against the regulation. Respond with JSON only.

REGULATION:
${standardText.substring(0, maxStandardChars)}${standardText.length > maxStandardChars ? '...(truncated)' : ''}

CONTRACT:
${subjectText.substring(0, maxContractChars)}${subjectText.length > maxContractChars ? '...(truncated)' : ''}

Return JSON with this exact structure (identify TOP 5 CRITICAL gaps maximum):
{
  "health_score": <0-100>,
  "total_liability_usd": <number>,
  "gaps": [
    {
      "risk_level": "critical|high|medium|low",
      "category": "string",
      "original_clause": "string or Missing",
      "regulation_reference": "string",
      "explanation": "concise explanation",
      "liability_usd": <number>,
      "compliant_rewrite": "brief suggested fix"
    }
  ]
}

Respond with ONLY the JSON. Keep explanations concise (max 2 sentences each). Limit to 5 most critical gaps.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192
            }
          })
        }
      );

      if (!response.ok) {
        if (response.status === 403) {
          throw new Error('API Key Error: Domain not allowed. Please check your Google AI Studio key restrictions.');
        }
        throw new Error(`AI analysis failed (Status ${response.status}). Please try again.`);
      }

      const result = await response.json();
      const aiContent = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiContent) throw new Error('No response from AI');

      let analysisData;
      try {
        // 1. Basic cleanup
        let cleanedContent = aiContent.trim();
        cleanedContent = cleanedContent.replace(/^```(?:json)?\s*/gm, '').replace(/```\s*$/gm, '');

        // 2. Extract JSON part
        const start = cleanedContent.indexOf('{');
        const end = cleanedContent.lastIndexOf('}');

        let jsonStr = '';
        if (start !== -1) {
          // If we have a closing brace, try taking the whole block first
          if (end !== -1 && end > start) {
            jsonStr = cleanedContent.substring(start, end + 1);
            try {
              analysisData = JSON.parse(jsonStr);
            } catch (e) {
              // Start/End pair exists but parse failed, might be valid JSON but truncated/garbled inside?
              // Or maybe there are multiple JSONs and we took too much or too little.
              // Fall back to repair strategy.
              jsonStr = cleanedContent.substring(start);
            }
          } else {
            // No closing brace, definitely truncated
            jsonStr = cleanedContent.substring(start);
          }
        } else {
          throw new Error('No JSON start found');
        }

        // 3. Robust Repair Strategy if not yet parsed
        if (!analysisData) {
          console.log('Attempting robust JSON repair...');

          // Heuristic A: It's likely an unclosed array in "gaps"
          // Start from the end and work backwards finding the last valid closing of an object "},"
          // This is the safest way to save the valid parts of a list.

          let repaired = false;
          let attemptStr = jsonStr;

          // Try iteratively removing chars from end until we find a place we can close it
          // Limit attempts to avoid infinite loops, though practically we usually just need to find the last '},'

          // 3.1. Try to find the last complete object in the gaps array
          const lastObjEnd = attemptStr.lastIndexOf('},');
          if (lastObjEnd !== -1) {
            // Keep everything up to the comma: ... },
            // Remove the string after it, close array and object.
            // We assume structure is { ..., "gaps": [ { ... }, { ... }, <truncated>
            const potentialJson = attemptStr.substring(0, lastObjEnd + 1) + ']}';
            try {
              analysisData = JSON.parse(potentialJson);
              repaired = true;
            } catch (e) {
              // Failed key structure? try just }
              try {
                analysisData = JSON.parse(attemptStr.substring(0, lastObjEnd + 1) + '}');
                repaired = true;
              } catch (e2) { }
            }
          }

          if (!repaired) {
            // 3.2. Last ditch: Aggressive brute force closure
            // Just count brackets and force close them
            const openBrackets = (attemptStr.match(/\[/g) || []).length;
            const closeBrackets = (attemptStr.match(/\]/g) || []).length;
            const openBraces = (attemptStr.match(/\{/g) || []).length;
            const closeBraces = (attemptStr.match(/\}/g) || []).length;

            let closer = '';
            for (let i = 0; i < (openBrackets - closeBrackets); i++) closer += ']';
            for (let i = 0; i < (openBraces - closeBraces); i++) closer += '}';

            try {
              analysisData = JSON.parse(attemptStr + closer);
            } catch (e) {
              // 4. Ultimate Fallback: Return a valid dummy object so the UI doesn't crash
              // and put the raw AI text in the explanation
              console.error('JSON repair failed, using fallback.');
              analysisData = {
                health_score: 50,
                total_liability_usd: 0,
                gaps: [{
                  risk_level: "high",
                  category: "AI Response Error",
                  original_clause: "Analysis Interrupted",
                  regulation_reference: "N/A",
                  explanation: "The AI analysis was truncated. Here is the raw output received: " + aiContent.substring(0, 500) + "...",
                  liability_usd: 0,
                  compliant_rewrite: "Please retry the analysis."
                }]
              };
            }
          }
        }

      } catch (parseError) {
        console.error('Fatal Parse Error:', parseError);
        // Only throw if even the fallback failed (which shouldn't happen)
        analysisData = {
          health_score: 50,
          total_liability_usd: 0,
          gaps: [{
            risk_level: "medium",
            category: "System Error",
            original_clause: "N/A",
            regulation_reference: "System",
            explanation: "Failed to parse AI response. Please try again.",
            liability_usd: 0,
            compliant_rewrite: "N/A"
          }]
        };
      }

      if (analysisData.gaps?.length > 0) {
        const gapsWithAuditId = analysisData.gaps.map((gap: any) => ({
          audit_id: audit.id,
          risk_level: gap.risk_level,
          category: gap.category,
          original_clause: gap.original_clause,
          regulation_reference: gap.regulation_reference,
          explanation: gap.explanation,
          liability_usd: gap.liability_usd || 0,
          compliant_rewrite: gap.compliant_rewrite
        }));

        const { error: gapsError } = await supabase.from('compliance_gaps').insert(gapsWithAuditId);
        if (gapsError) console.error('Gaps insert error:', gapsError);
      }

      const { error: updateError } = await supabase.from('audits').update({
        status: 'completed',
        health_score: analysisData.health_score || 50,
        total_liability_usd: analysisData.total_liability_usd || 0,
        completed_at: new Date().toISOString()
      }).eq('id', audit.id);

      if (updateError) throw updateError;

      setAnalysisProgress(100);

      // Increment free audits used
      await supabase.rpc('increment_audits_used', { row_user_id: user.id });

      clearInterval(progressInterval);
      setTimeout(() => navigate(`/audit/${audit.id}`), 500);

    } catch (error) {
      console.error('Full error:', error);
      toast({ title: 'Audit Failed', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
      setIsAnalyzing(false);
      clearInterval(progressInterval);
    }
  };

  const steps = [
    { title: 'Select Standard', icon: Library, description: 'Choose regulation framework' },
    { title: 'Upload Contract', icon: Upload, description: 'PDF or DOCX file' },
    { title: 'Review & Analyze', icon: ShieldCheck, description: 'Start AI inspection' },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground">New Compliance Audit</h1>
          <p className="text-muted-foreground mt-2">Follow the steps below to initiate a comprehensive AI risk analysis.</p>
        </div>

        {/* Wizard Steps */}
        <div className="relative flex flex-col md:flex-row justify-between items-center bg-card/50 p-6 rounded-2xl border border-border/50 backdrop-blur-sm">
          {steps.map((step, idx) => (
            <div key={idx} className={cn("flex items-center gap-4 relative z-10 w-full md:w-auto", idx + 1 === currentStep ? "opacity-100" : "opacity-60")}>
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                idx + 1 < currentStep ? "bg-primary border-primary text-primary-foreground" :
                  idx + 1 === currentStep ? "bg-background border-primary text-primary shadow-lg shadow-primary/20" :
                    "bg-muted border-muted-foreground/30 text-muted-foreground"
              )}>
                {idx + 1 < currentStep ? <CheckCircle2 className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
              </div>
              <div className="hidden md:block">
                <h3 className={cn("font-medium", idx + 1 === currentStep && "text-primary")}>{step.title}</h3>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute left-full top-1/2 w-full h-[2px] bg-border mx-4 -translate-y-1/2 -z-10"
                  style={{ width: 'calc(100% - 3rem)', left: '3rem' }} />
              )}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {/* STEP 1: Standard Selection */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-card/50 p-1 rounded-xl inline-flex mb-4">
                <Tabs value={standardSource} onValueChange={(v) => setStandardSource(v as 'library' | 'upload')}>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="library">Standard Library</TabsTrigger>
                    <TabsTrigger value="upload">Custom Upload</TabsTrigger>
                  </TabsList>

                  <div className="mt-6">
                    <TabsContent value="library" className="mt-0">
                      <StandardsLibrary
                        onSelectStandard={handleSelectPreset}
                        selectedStandard={presetStandard}
                        onClear={handleClearStandard}
                      />
                    </TabsContent>

                    <TabsContent value="upload" className="mt-0">
                      <div className="max-w-2xl mx-auto">
                        <DocumentUploader
                          type="standard"
                          onUploadComplete={(doc) => {
                            setStandardDoc(doc);
                            setPresetStandard(null);
                            setTimeout(() => setCurrentStep(2), 500);
                          }}
                          uploadedDocument={standardDoc && !presetStandard ? standardDoc : null}
                          onRemove={handleClearStandard}
                        />
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          )}

          {/* STEP 2: Subject Document */}
          {currentStep === 2 && (
            <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-semibold">Upload Contract</h2>
                <p className="text-muted-foreground">Upload the legal document you want to audit against {presetStandard?.shortName || 'the standard'}.</p>
              </div>

              <DocumentUploader
                type="subject"
                onUploadComplete={(doc) => {
                  setSubjectDoc(doc);
                  setTimeout(() => setCurrentStep(3), 500);
                }}
                uploadedDocument={subjectDoc}
                onRemove={() => setSubjectDoc(null)}
              />

              <div className="flex justify-between pt-8">
                <Button variant="ghost" onClick={() => setCurrentStep(1)}>Back</Button>
                {subjectDoc && <Button onClick={() => setCurrentStep(3)}>Next <ArrowRight className="ml-2 h-4 w-4" /></Button>}
              </div>
            </div>
          )}

          {/* STEP 3: Review & Launch */}
          {currentStep === 3 && (
            <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
              <div className="text-center">
                <h2 className="text-2xl font-semibold">Ready to Analyze</h2>
                <p className="text-muted-foreground">Review your selections before starting the AI audit.</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="glass-card p-6 rounded-xl border border-primary/20 relative overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Library className="w-16 h-16 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Standard</h3>
                  <p className="text-lg font-semibold text-foreground truncate pr-8">
                    {presetStandard ? presetStandard.name : standardDoc?.name}
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-2 text-primary" onClick={() => setCurrentStep(1)}>Change</Button>
                </div>

                <div className="glass-card p-6 rounded-xl border border-primary/20 relative overflow-hidden group hover:border-primary/50 transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <FileText className="w-16 h-16 text-primary" />
                  </div>
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Subject Document</h3>
                  <p className="text-lg font-semibold text-foreground truncate pr-8">
                    {subjectDoc?.name}
                  </p>
                  <Button variant="link" className="p-0 h-auto mt-2 text-primary" onClick={() => setCurrentStep(2)}>Change</Button>
                </div>
              </div>

              {isAnalyzing ? (
                <div className="glass-card p-8 rounded-2xl text-center space-y-6 border-primary/30 shadow-2xl">
                  <div className="relative w-20 h-20 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-muted opacity-20"></div>
                    <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
                    <ShieldCheck className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400">
                      AI Analysis in Progress
                    </h3>
                    <p className="text-muted-foreground mt-2">Checking clauses against regulations...</p>
                  </div>
                  <Progress value={analysisProgress} className="h-2 w-full max-w-xs mx-auto" />
                  <div className="flex justify-between max-w-xs mx-auto text-xs text-muted-foreground">
                    <span>Initializing AI</span>
                    <span>Reviewing Clauses</span>
                    <span>Generating Report</span>
                  </div>
                </div>
              ) : (
                <Button
                  size="lg"
                  className="w-full h-16 text-lg font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform bg-gradient-to-r from-primary to-blue-600"
                  onClick={handleStartAudit}
                >
                  Start Analysis <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              )}

              <div className="flex justify-center">
                {!isAnalyzing && <Button variant="ghost" onClick={() => setCurrentStep(2)}>Back</Button>}
              </div>
            </div>
          )}
        </div>
      </div>

      <UpgradePromptDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        auditsUsed={subscription?.free_audits_used || 0}
      />
    </AppLayout>
  );
}
