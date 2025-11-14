import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get current time in HH:MM format
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    console.log('Checking for reminders at:', currentTime);

    // Get all routines with reminders enabled for the current time
    const { data: routines, error: routinesError } = await supabaseClient
      .from('beauty_routines')
      .select('*, profiles!inner(email, name)')
      .eq('reminder_enabled', true)
      .eq('reminder_time', currentTime);

    if (routinesError) throw routinesError;

    console.log('Found routines:', routines?.length || 0);

    if (!routines || routines.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No reminders to send at this time' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Send notifications (you can integrate with a notification service here)
    const results = await Promise.all(
      routines.map(async (routine: any) => {
        try {
          // Check if this is a daily routine or if it matches today's schedule
          const today = new Date();
          const dayOfWeek = today.getDay();
          const dayOfMonth = today.getDate();

          let shouldSend = false;

          if (routine.frequency === 'daily') {
            shouldSend = true;
          } else if (routine.frequency === 'weekly' && dayOfWeek === 1) {
            shouldSend = true; // Monday
          } else if (routine.frequency === 'monthly' && dayOfMonth === 1) {
            shouldSend = true; // First of month
          }

          if (!shouldSend) {
            return { routine_id: routine.id, status: 'skipped', reason: 'not scheduled for today' };
          }

          // Here you would integrate with your notification service
          // For now, we'll log without PII
          console.log(`[REMINDER] Routine reminder for user ${routine.user_id}`);
          console.log(`Routine ID: ${routine.id}`);
          console.log(`Title: ${routine.title}`);
          
          // TODO: Integrate with email service or push notifications

          return { routine_id: routine.id, status: 'sent' };
        } catch (error) {
          console.error(`Error sending reminder for routine ${routine.id}:`, error);
          return { routine_id: routine.id, status: 'error', error: String(error) };
        }
      })
    );

    return new Response(
      JSON.stringify({
        message: 'Reminders processed',
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in send-routine-reminders:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
