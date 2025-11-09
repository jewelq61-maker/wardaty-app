import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting beauty reminders job...');

    const now = new Date();
    
    // Get all actions with reminders enabled and not completed
    const { data: actionsWithReminders, error: fetchError } = await supabase
      .from('beauty_actions')
      .select('*, profiles!inner(email, name)')
      .eq('reminder_enabled', true)
      .eq('completed', false)
      .not('scheduled_at', 'is', null);

    if (fetchError) {
      console.error('Error fetching actions with reminders:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${actionsWithReminders?.length || 0} actions with reminders`);

    let remindersSent = 0;

    for (const action of actionsWithReminders || []) {
      const scheduledDate = new Date(action.scheduled_at);
      const reminderHours = action.reminder_hours_before || 24;
      const reminderTime = new Date(scheduledDate.getTime() - (reminderHours * 60 * 60 * 1000));

      // Check if it's time to send reminder (within the next hour)
      const timeDiff = reminderTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);

      if (hoursDiff <= 1 && hoursDiff >= 0) {
        // TODO: Integrate with email service (Resend) or push notifications
        // For now, we'll just log that a reminder should be sent
        console.log(`Reminder should be sent for action: ${action.title}`);
        console.log(`User: ${action.profiles?.email || 'No email'}`);
        console.log(`Scheduled for: ${scheduledDate.toISOString()}`);
        console.log(`Time of day: ${action.time_of_day || 'Not specified'}`);
        
        // In a production environment, you would send an email here:
        // await sendEmail({
        //   to: action.profiles.email,
        //   subject: `Reminder: ${action.title}`,
        //   body: `Your beauty action "${action.title}" is scheduled for ${scheduledDate.toLocaleDateString()}`
        // });

        remindersSent++;
      }
    }

    console.log(`Reminders check complete. ${remindersSent} reminders should be sent.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        reminders: remindersSent,
        message: `Found ${remindersSent} reminders to send`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in send-beauty-reminders:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
