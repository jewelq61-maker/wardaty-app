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

    console.log('Starting duplicate recurring actions job...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all recurring actions
    const { data: recurringActions, error: fetchError } = await supabase
      .from('beauty_actions')
      .select('*')
      .in('frequency', ['daily', 'weekly', 'monthly'])
      .eq('completed', true)
      .not('scheduled_at', 'is', null);

    if (fetchError) {
      console.error('Error fetching recurring actions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${recurringActions?.length || 0} completed recurring actions`);

    let duplicatedCount = 0;

    for (const action of recurringActions || []) {
      const scheduledDate = new Date(action.scheduled_at);
      
      // Calculate next due date based on frequency
      let nextDueDate = new Date(scheduledDate);
      
      switch (action.frequency) {
        case 'daily':
          nextDueDate.setDate(nextDueDate.getDate() + 1);
          break;
        case 'weekly':
          nextDueDate.setDate(nextDueDate.getDate() + 7);
          break;
        case 'monthly':
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
          break;
      }

      nextDueDate.setHours(0, 0, 0, 0);

      // Check if we should create the next occurrence
      if (nextDueDate <= today) {
        // Check if already duplicated
        const { data: existingHistory } = await supabase
          .from('beauty_action_history')
          .select('id')
          .eq('original_action_id', action.id)
          .eq('next_due_date', nextDueDate.toISOString().split('T')[0])
          .single();

        if (!existingHistory) {
          // Create new action
          const { error: insertError } = await supabase
            .from('beauty_actions')
            .insert({
              user_id: action.user_id,
              title: action.title,
              notes: action.notes,
              phase: action.phase,
              frequency: action.frequency,
              time_of_day: action.time_of_day,
              scheduled_at: nextDueDate.toISOString(),
              completed: false,
              reminder_enabled: action.reminder_enabled,
              reminder_hours_before: action.reminder_hours_before
            });

          if (insertError) {
            console.error(`Error duplicating action ${action.id}:`, insertError);
            continue;
          }

          // Record in history
          await supabase
            .from('beauty_action_history')
            .insert({
              user_id: action.user_id,
              original_action_id: action.id,
              next_due_date: nextDueDate.toISOString().split('T')[0]
            });

          duplicatedCount++;
          console.log(`Duplicated action ${action.id} for ${nextDueDate.toISOString()}`);
        }
      }
    }

    console.log(`Duplication complete. Created ${duplicatedCount} new actions.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        duplicated: duplicatedCount,
        message: `Successfully duplicated ${duplicatedCount} recurring actions`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in duplicate-recurring-actions:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
