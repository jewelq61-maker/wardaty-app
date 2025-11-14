import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for recommendations (6 hour TTL)
const cache = new Map<string, { recommendations: any; cycleInfo: any; timestamp: number }>();
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // CRITICAL SECURITY: Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Authentication required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Extract and verify JWT token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Use authenticated user's ID only - ignore any userId from request body
    const userId = user.id;
    const { currentDate } = await req.json();

    // Use service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user's last cycle (using authenticated user's ID only)
    const { data: cycles } = await supabaseAdmin
      .from('cycles')
      .select('*')
      .eq('user_id', userId)
      .order('start_date', { ascending: false })
      .limit(1);

    if (!cycles || cycles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No cycle data found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const lastCycle = cycles[0];
    const cycleStartDate = new Date(lastCycle.start_date);
    const today = currentDate ? new Date(currentDate) : new Date();
    const daysSinceStart = Math.floor((today.getTime() - cycleStartDate.getTime()) / (1000 * 60 * 60 * 24));
    const cycleDay = (daysSinceStart % (lastCycle.length || 28)) + 1;

    // Determine cycle phase
    let phase = 'follicular';
    if (cycleDay <= (lastCycle.duration || 5)) {
      phase = 'menstrual';
    } else if (cycleDay >= 14 && cycleDay <= 16) {
      phase = 'ovulation';
    } else if (cycleDay > 16) {
      phase = 'luteal';
    }

    // Calculate Hijri day (approximation)
    const hijriDay = Math.floor((today.getTime() / (1000 * 60 * 60 * 24)) % 29.5) + 1;
    const isGoodHijamaDay = [17, 19, 21].includes(hijriDay);

    // Check cache first
    const cacheKey = `${userId}-${phase}-${cycleDay}-${hijriDay}`;
    const cached = cache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      console.log('Returning cached recommendations for user');
      return new Response(
        JSON.stringify({
          recommendations: cached.recommendations,
          cycleInfo: cached.cycleInfo,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare AI prompt
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const prompt = `أنت خبيرة في العناية بالجمال والصحة النسائية. قدمي توصيات مخصصة بناءً على المعلومات التالية:

معلومات الدورة الشهرية:
- المرحلة الحالية: ${phase}
- اليوم في الدورة: ${cycleDay} من ${lastCycle.length || 28}
- اليوم الهجري: ${hijriDay}
- مناسب للحجامة: ${isGoodHijamaDay ? 'نعم' : 'لا'}

المراحل:
- menstrual: فترة الحيض (أيام 1-5)
- follicular: المرحلة الجريبية (أيام 6-13)
- ovulation: فترة الإباضة (أيام 14-16)
- luteal: المرحلة الأصفرية (أيام 17-28)

قدمي توصيات محددة حول:
1. **قص الشعر**: هل الوقت مناسب؟ ما هي الفوائد المتوقعة؟
2. **الحجامة**: هل اليوم الهجري مناسب؟ ما هي الاعتبارات؟
3. **العناية بالبشرة**: ما هي العلاجات المناسبة في هذه المرحلة؟
4. **إزالة الشعر**: هل التوقيت مثالي؟

قدمي إجابة منظمة بتنسيق JSON فقط بدون أي نص إضافي:
{
  "haircut": {
    "recommended": boolean,
    "score": number (0-100),
    "reason": "سبب مختصر",
    "benefits": ["فائدة 1", "فائدة 2"]
  },
  "hijama": {
    "recommended": boolean,
    "score": number (0-100),
    "reason": "سبب مختصر",
    "hijriDay": ${hijriDay},
    "considerations": ["اعتبار 1", "اعتبار 2"]
  },
  "skincare": {
    "recommended": boolean,
    "score": number (0-100),
    "treatments": ["علاج 1", "علاج 2"],
    "avoid": ["شيء 1", "شيء 2"]
  },
  "waxing": {
    "recommended": boolean,
    "score": number (0-100),
    "reason": "سبب مختصر"
  },
  "generalAdvice": "نصيحة عامة للعناية بالجمال في هذه المرحلة"
}`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'أنت خبيرة في العناية بالجمال والصحة النسائية. قدمي توصيات علمية ودقيقة بناءً على الدورة الشهرية والأيام القمرية.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'تم تجاوز الحد المسموح من الطلبات. يرجى المحاولة لاحقاً.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'يرجى إضافة رصيد إلى حساب Lovable AI الخاص بك.' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 402 }
        );
      }
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;

    // Parse JSON from response
    let recommendations;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      recommendations = JSON.parse(jsonString);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse AI recommendations');
    }

    const cycleInfo = {
      phase,
      cycleDay,
      totalDays: lastCycle.length || 28,
      hijriDay,
      isGoodHijamaDay,
    };

    // Cache the result
    cache.set(cacheKey, { recommendations, cycleInfo, timestamp: Date.now() });
    console.log('Cached new recommendations for user');

    return new Response(
      JSON.stringify({
        recommendations,
        cycleInfo,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in beauty-recommendations:', error);
    return new Response(
      JSON.stringify({ error: String(error) || 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
