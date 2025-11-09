import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phase, locale = "ar" } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = locale === "ar" 
      ? `أنت مساعدة صحية متخصصة في صحة المرأة. قدمي نصائح صحية قصيرة وإيجابية ودعم عاطفي بناءً على مرحلة الدورة الشهرية. استخدمي لغة دافئة ومشجعة.`
      : `You are a women's health assistant. Provide brief, positive health tips and emotional support based on the menstrual cycle phase. Use warm and encouraging language.`;

    const userPrompt = locale === "ar"
      ? `المستخدمة في مرحلة ${phase}. قدمي:
1. نصيحة صحية قصيرة (جملتين فقط)
2. رسالة تحفيزية يومية (جملة واحدة)
3. نصيحة جمالية سريعة (جملة واحدة)

اجعلي الرد قصيراً ومباشراً.`
      : `The user is in ${phase} phase. Provide:
1. Brief health tip (2 sentences max)
2. Daily affirmation (1 sentence)
3. Quick beauty tip (1 sentence)

Keep it short and direct.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    return new Response(
      JSON.stringify({ insights: content }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in daily-insights function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
