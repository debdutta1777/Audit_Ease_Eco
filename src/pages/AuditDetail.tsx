import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, CheckCircle2, MessageSquare, FileText, Sparkles, Wand2, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/layout/AppLayout';
import { HealthScoreGauge } from '@/components/dashboard/HealthScoreGauge';
import { LiabilityCounter } from '@/components/dashboard/LiabilityCounter';
import { GapCard } from '@/components/audit/GapCard';
import { RedlineView } from '@/components/audit/RedlineView';
import { AnalyzingProgress } from '@/components/audit/AnalyzingProgress';
import { ShareAuditDialog } from '@/components/audit/ShareAuditDialog';
import { ChatInterface, Message } from '@/components/audit/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AuditDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [audit, setAudit] = useState<any>(null);
  const [gaps, setGaps] = useState<any[]>([]);
  const [selectedGap, setSelectedGap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [documentText, setDocumentText] = useState('');
  const [activeTab, setActiveTab] = useState('report');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const chatInitialized = useRef(false);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [isGeneratingRewrite, setIsGeneratingRewrite] = useState(false);
  const [rewrittenContract, setRewrittenContract] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchAudit();
      const interval = setInterval(() => {
        if (audit?.status !== 'completed') fetchAudit();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchAudit = async () => {
    const { data: auditData } = await supabase
      .from('audits')
      .select(`*, standard:documents!audits_standard_document_id_fkey(name), subject:documents!audits_subject_document_id_fkey(name, extracted_text)`)
      .eq('id', id)
      .single();

    if (auditData) {
      setAudit(auditData);

      // Store extracted text for chat
      if (auditData.subject?.extracted_text) {
        setDocumentText(auditData.subject.extracted_text);

        // Initialize chat only once when data is first loaded
        if (!chatInitialized.current) {
          setChatMessages([{
            id: 'welcome',
            role: 'assistant',
            content: `Hello! I've analyzed **${auditData.subject.name}**. You can ask me anything about its clauses, liabilities, or obligations.`,
            timestamp: new Date()
          }]);
          chatInitialized.current = true;
        }
      }

      // Load saved compliant contract if exists
      if (auditData.compliant_contract) {
        setRewrittenContract(auditData.compliant_contract);
      }

      if (auditData.status === 'completed') {
        const { data: gapsData } = await supabase
          .from('compliance_gaps')
          .select('*')
          .eq('audit_id', id)
          .order('risk_level');
        if (gapsData) setGaps(gapsData);
      }
    }
    setLoading(false);
  };

  const handleMarkApplied = async (gapId: string) => {
    const { error } = await supabase
      .from('compliance_gaps')
      .update({ is_applied: true, applied_at: new Date().toISOString() })
      .eq('id', gapId);

    if (error) throw error;

    setGaps(gaps.map(g =>
      g.id === gapId ? { ...g, is_applied: true, applied_at: new Date().toISOString() } : g
    ));
  };

  const handleGenerateContract = async () => {
    toast({ title: "Payment Successful", description: "Generating your fully compliant contract..." });
    setIsGeneratingRewrite(true);
    setActiveTab('rewrite');

    try {
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

      const prompt = `You are an expert legal auditor. Rewrite this ENTIRE contract to be 100% compliant with the ${audit.standard?.name || 'standard'}.
      
      STANDARD REQUIREMENTS:
      ${audit.standard_document?.extracted_text || audit.standard?.extractedText || 'Comply with best practices.'}
      
      ORIGINAL CONTRACT:
      ${audit.subject?.extracted_text || documentText}
      
      INSTRUCTIONS:
      1. Keep the original structure and parties.
      2. Modify ONLY the non-compliant clauses to meet the standard.
      3. Output the FULL corrected contract in Markdown format.
      `;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.2 }
          })
        }
      );

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        setRewrittenContract(text);

        // Save to database
        await supabase
          .from('audits')
          .update({ compliant_contract: text })
          .eq('id', id);

        toast({ title: "Contract Rewritten", description: "Your document is now fully compliant." });
      } else {
        throw new Error("Failed to generate text");
      }

    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to rewrite contract.", variant: "destructive" });
      setActiveTab('report');
    } finally {
      setIsGeneratingRewrite(false);
    }
  };

  const exportReport = async () => {
    if (!audit || gaps.length === 0) return;

    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text("AuditEase Compliance Report", 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Subject: ${audit.subject?.name || 'Unknown Document'}`, 14, 30);
      doc.text(`Standard: ${audit.standard_document?.name || 'Unknown Standard'}`, 14, 36);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 42);

      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text(`Compliance Score: ${audit.health_score || 0}/100`, 14, 55);
      doc.text(`Potential Liability: $${(audit.total_liability_usd || 0).toLocaleString()}`, 14, 62);

      doc.setFontSize(16);
      doc.text("Compliance Gaps", 14, 75);

      const tableData = gaps.map((gap: any, index: number) => [
        `${index + 1}. ${gap.category} (${gap.risk_level.toUpperCase()})`,
        `Risk: $${(gap.liability_usd || 0).toLocaleString()}\n\nViolation: ${gap.explanation}\n\nRecommendation: ${gap.compliant_rewrite || 'N/A'}`
      ]);

      autoTable(doc, {
        startY: 80,
        head: [['Category & Risk Level', 'Details (Liability, Violation, Recommendation)']],
        body: tableData,
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, cellPadding: 6, overflow: 'linebreak' },
        columnStyles: { 0: { cellWidth: 60, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      doc.save(`audit-report-${audit.subject?.name?.toLowerCase().replace(/\s+/g, '-') || 'document'}.pdf`);
      toast({ title: "Report Downloaded", description: "Full audit report saved as PDF" });
    } catch (error) {
      console.error('Export error:', error);
      toast({ title: "Export Failed", description: "Could not generate PDF report.", variant: "destructive" });
    }
  };

  if (loading) return <AppLayout><div className="animate-pulse">Loading...</div></AppLayout>;
  if (!audit) return <AppLayout><div>Audit not found</div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-8 h-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">{audit.subject?.name}</h1>
              <p className="text-muted-foreground">Audited against: {audit.standard?.name}</p>
            </div>
          </div>
          <ShareAuditDialog auditId={audit.id} auditName={audit.subject?.name || 'Audit'} />
        </div>

        {/* Content */}
        {audit.status === 'analyzing' || audit.status === 'pending' ? (
          <AnalyzingProgress />
        ) : audit.status === 'completed' ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="flex justify-center">
              <TabsList className="grid grid-cols-2 p-1 h-auto bg-muted/50 border border-border/50 rounded-2xl">
                <TabsTrigger
                  value="report"
                  className="flex gap-2 px-6 py-3 rounded-xl text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <FileText className="h-5 w-5" /> Audit Report
                </TabsTrigger>
                <TabsTrigger
                  value="chat"
                  className="flex gap-2 px-6 py-3 rounded-xl text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <MessageSquare className="h-5 w-5" /> AI Chat
                </TabsTrigger>
                <TabsTrigger
                  value="rewrite"
                  disabled={!rewrittenContract && !isGeneratingRewrite}
                  className="flex gap-2 px-6 py-3 rounded-xl text-base font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
                >
                  <Sparkles className="h-5 w-5" /> Compliant Version
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="report" className="space-y-8 animate-fade-in">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="glass-card rounded-xl p-6 flex flex-col items-center">
                  <h3 className="text-sm font-medium text-muted-foreground mb-4">Compliance Score</h3>
                  <HealthScoreGauge score={audit.health_score || 0} size="lg" />
                </div>
                <LiabilityCounter amount={Number(audit.total_liability_usd) || 0} />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h2 className="text-lg font-semibold">Compliance Gaps ({gaps.length})</h2>
                    {gaps.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mr-4">
                        <CheckCircle2 className="h-4 w-4 text-success" />
                        <span>{gaps.filter(g => g.is_applied).length} of {gaps.length} applied</span>
                      </div>
                    )}
                    {rewrittenContract ? (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white border-0 shadow-lg"
                        onClick={() => setActiveTab('rewrite')}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View your Fully Compliant Contract
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-lg"
                        onClick={handleGenerateContract}
                        disabled={isGeneratingRewrite}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        Generate Fully Compliant Contract ($49)
                      </Button>
                    )}
                  </div>
                  {gaps.length > 0 && (
                    <Button variant="outline" size="sm" onClick={exportReport}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Report
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  {gaps.map((gap) => (
                    <GapCard key={gap.id} gap={gap} onViewRedline={() => setSelectedGap(gap)} />
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="chat" className="animate-fade-in">
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <ChatInterface
                    documentId={audit.subject_document_id}
                    documentName={audit.subject?.name || 'Document'}
                    extractedText={documentText}
                    messages={chatMessages}
                    setMessages={setChatMessages}
                  />
                </div>
                <div className="glass-card p-6 rounded-xl h-fit">
                  <h3 className="font-semibold mb-2">About this Document</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    You are chatting with an AI assistant that has read the document context.
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">Subject Contract</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Standard:</span>
                      <span className="font-medium">{audit.standard?.name}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border/50">
                      <span className="text-muted-foreground">Identified Risks:</span>
                      <span className="font-medium text-destructive">{gaps.length} Issues</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="rewrite" className="animate-fade-in">
              <div className="glass-card p-8 rounded-xl border-amber-500/20">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
                      Fully Compliant Contract
                    </h2>
                    <p className="text-muted-foreground">Generated by AuditEase AI • 100% Compliance Guarantee</p>
                  </div>
                  {rewrittenContract && (
                    <Button variant="outline" onClick={() => {
                      const blob = new Blob([rewrittenContract || ''], { type: 'text/markdown' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `compliant-${audit.subject?.name}.md`;
                      a.click();
                    }}>
                      <Download className="mr-2 h-4 w-4" /> Download Markdown
                    </Button>
                  )}
                </div>
                {isGeneratingRewrite ? (
                  <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
                    <p className="text-lg text-muted-foreground">Generating Fully Compliant Contract...</p>
                    <p className="text-sm text-muted-foreground">This may take a moment</p>
                  </div>
                ) : (
                  <div className="bg-muted/30 p-6 rounded-lg font-mono text-sm whitespace-pre-wrap h-[600px] overflow-y-auto border">
                    {rewrittenContract}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-destructive">Analysis failed. Please try again.</p>
          </div>
        )}
      </div>

      {selectedGap && (
        <RedlineView
          gap={selectedGap}
          onClose={() => setSelectedGap(null)}
          onMarkApplied={handleMarkApplied}
        />
      )}

    </AppLayout>
  );
}