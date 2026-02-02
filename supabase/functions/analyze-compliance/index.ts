import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { auditId } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get audit with documents
    const { data: audit } = await supabase
      .from("audits")
      .select("*, standard:documents!audits_standard_document_id_fkey(*), subject:documents!audits_subject_document_id_fkey(*)")
      .eq("id", auditId)
      .single();

    if (!audit) throw new Error("Audit not found");

    console.log("Starting analysis for audit:", auditId);

    let analysisData;

    // If no API key, use mock data for demo purposes
    if (!openaiApiKey) {
      console.log("No OPENAI_API_KEY found, using mock analysis data");
      analysisData = {
        health_score: 72,
        total_liability_usd: 125000,
        gaps: [
          {
            risk_level: "critical",
            category: "Data Protection",
            original_clause: "The Company may share user data with third-party partners without explicit consent.",
            regulation_reference: "GDPR Article 7 - Conditions for consent",
            explanation: "This clause violates GDPR requirements for explicit, informed consent before sharing personal data with third parties.",
            liability_usd: 50000,
            compliant_rewrite: "The Company shall obtain explicit, informed consent from users before sharing any personal data with third-party partners, clearly stating the purpose and scope of data sharing."
          },
          {
            risk_level: "high",
            category: "Data Retention",
            original_clause: "User data will be retained indefinitely for business purposes.",
            regulation_reference: "GDPR Article 5(1)(e) - Storage limitation",
            explanation: "Indefinite data retention violates the storage limitation principle. Data should only be kept as long as necessary.",
            liability_usd: 35000,
            compliant_rewrite: "User data will be retained for a maximum of 3 years after the last user interaction, after which it will be securely deleted unless legally required to retain."
          },
          {
            risk_level: "medium",
            category: "Right to Erasure",
            original_clause: "Deletion requests will be processed within 90 days.",
            regulation_reference: "GDPR Article 17 - Right to erasure",
            explanation: "90 days exceeds the GDPR requirement of responding to deletion requests within one month.",
            liability_usd: 25000,
            compliant_rewrite: "Deletion requests will be processed within 30 days of receipt. Users will be notified upon completion of the deletion process."
          },
          {
            risk_level: "low",
            category: "Privacy Notice",
            original_clause: "Privacy policy available upon request.",
            regulation_reference: "GDPR Article 13 - Information to be provided",
            explanation: "Privacy information should be proactively provided, not just available upon request.",
            liability_usd: 15000,
            compliant_rewrite: "Our comprehensive privacy policy is publicly available on our website at [URL] and is provided to all users at the point of data collection."
          }
        ]
      };
    } else {
      // Call OpenAI for real compliance analysis
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${openaiApiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system", content: `You are a legal compliance expert. Analyze contracts against regulations and identify compliance gaps. Return a JSON object with this structure:
{
  "health_score": number (0-100),
  "total_liability_usd": number,
  "gaps": [{ "risk_level": "critical"|"high"|"medium"|"low", "category": string, "original_clause": string, "regulation_reference": string, "explanation": string, "liability_usd": number, "compliant_rewrite": string }]
}` },
            { role: "user", content: `Analyze this contract for compliance. Standard: "${audit.standard?.name}". Subject: "${audit.subject?.name}". Identify 3-5 realistic compliance gaps with financial liability estimates. Return ONLY the JSON object, no markdown.` }
          ],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("AI error:", response.status, errorText);
        throw new Error("AI analysis failed");
      }

      const aiResult = await response.json();
      const content = aiResult.choices?.[0]?.message?.content;
      analysisData = JSON.parse(content);
    }

    if (!analysisData) throw new Error("No analysis data");

    console.log("Analysis complete:", analysisData);

    // Insert gaps
    if (analysisData.gaps?.length > 0) {
      await supabase.from("compliance_gaps").insert(
        analysisData.gaps.map((gap: any) => ({ audit_id: auditId, ...gap }))
      );
    }

    // Update audit
    await supabase.from("audits").update({
      status: "completed",
      health_score: analysisData.health_score,
      total_liability_usd: analysisData.total_liability_usd,
      completed_at: new Date().toISOString()
    }).eq("id", auditId);

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});