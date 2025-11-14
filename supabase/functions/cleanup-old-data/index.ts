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
    // SECURITY: This function is designed for cron jobs only
    const apiKey = req.headers.get('apikey');
    
    if (!apiKey || apiKey !== Deno.env.get('SUPABASE_ANON_KEY')) {
      console.error('Unauthorized: Invalid API key');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - This endpoint is for internal use only' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting cleanup job...');

    const now = new Date();
    const stats = {
      beautyActions: 0,
      actionHistory: 0,
      fastingEntries: 0,
      routineLogs: 0,
      sharedEvents: 0,
    };

    // 1. Delete completed beauty actions older than 90 days
    const ninetyDaysAgo = new Date(now);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const { data: oldBeautyActions, error: beautyActionsError } = await supabase
      .from('beauty_actions')
      .delete()
      .eq('completed', true)
      .lt('completed_at', ninetyDaysAgo.toISOString())
      .select('id');
    
    if (!beautyActionsError && oldBeautyActions) {
      stats.beautyActions = oldBeautyActions.length;
      console.log(`Deleted ${stats.beautyActions} old completed beauty actions`);
    }

    // 2. Delete action history older than 180 days
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
    
    const { data: oldHistory, error: historyError } = await supabase
      .from('beauty_action_history')
      .delete()
      .lt('duplicated_at', sixMonthsAgo.toISOString())
      .select('id');
    
    if (!historyError && oldHistory) {
      stats.actionHistory = oldHistory.length;
      console.log(`Deleted ${stats.actionHistory} old action history records`);
    }

    // 3. Delete completed fasting entries older than 1 year
    const oneYearAgo = new Date(now);
    oneYearAgo.setDate(oneYearAgo.getDate() - 365);
    
    const { data: oldFasting, error: fastingError } = await supabase
      .from('fasting_entries')
      .delete()
      .eq('is_completed', true)
      .lt('completed_at', oneYearAgo.toISOString())
      .select('id');
    
    if (!fastingError && oldFasting) {
      stats.fastingEntries = oldFasting.length;
      console.log(`Deleted ${stats.fastingEntries} old fasting entries`);
    }

    // 4. Delete routine logs older than 6 months
    const { data: oldRoutineLogs, error: routineLogsError } = await supabase
      .from('routine_logs')
      .delete()
      .lt('log_date', sixMonthsAgo.toISOString().split('T')[0])
      .select('id');
    
    if (!routineLogsError && oldRoutineLogs) {
      stats.routineLogs = oldRoutineLogs.length;
      console.log(`Deleted ${stats.routineLogs} old routine logs`);
    }

    // 5. Delete shared events older than 1 year
    const { data: oldEvents, error: eventsError } = await supabase
      .from('shared_events')
      .delete()
      .lt('event_date', oneYearAgo.toISOString().split('T')[0])
      .select('id');
    
    if (!eventsError && oldEvents) {
      stats.sharedEvents = oldEvents.length;
      console.log(`Deleted ${stats.sharedEvents} old shared events`);
    }

    // 6. Delete inactive share links older than 6 months
    const { data: oldShareLinks, error: shareLinksError } = await supabase
      .from('share_links')
      .delete()
      .in('status', ['expired', 'revoked'])
      .lt('updated_at', sixMonthsAgo.toISOString())
      .select('id');
    
    if (!shareLinksError && oldShareLinks) {
      console.log(`Deleted ${oldShareLinks.length} old inactive share links`);
    }

    const totalDeleted = Object.values(stats).reduce((a, b) => a + b, 0);
    console.log(`Cleanup complete. Total records deleted: ${totalDeleted}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        stats,
        totalDeleted,
        timestamp: now.toISOString(),
        message: 'Cleanup completed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in cleanup-old-data:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
