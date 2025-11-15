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

  const startTime = Date.now();

  try {
    // Get authentication headers
    const apiKey = req.headers.get('apikey');
    const authHeader = req.headers.get('authorization');
    
    let isAuthorized = false;
    let userId: string | null = null;

    // Check cron job authentication (API key)
    if (apiKey && apiKey === Deno.env.get('SUPABASE_ANON_KEY')) {
      isAuthorized = true;
      console.log('Authenticated via API key (cron job)');
    }
    // Check admin user authentication (JWT)
    else if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
      
      const tempClient = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      const { data: { user }, error: userError } = await tempClient.auth.getUser(token);
      
      if (userError || !user) {
        console.error('Invalid JWT token:', userError);
        return new Response(
          JSON.stringify({ error: 'Unauthorized: Invalid token' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      userId = user.id;
      
      // Verify admin role
      const { data: isAdmin, error: roleError } = await tempClient.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      if (roleError || !isAdmin) {
        console.error('User is not admin:', roleError);
        return new Response(
          JSON.stringify({ error: 'Forbidden: Admin role required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      isAuthorized = true;
      console.log('Authenticated via JWT (admin user):', userId);
    }

    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role for cleanup operations
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
      shareLinks: 0,
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
      stats.shareLinks = oldShareLinks.length;
      console.log(`Deleted ${stats.shareLinks} old inactive share links`);
    }

    const totalDeleted = Object.values(stats).reduce((a, b) => a + b, 0);
    const executionTime = Date.now() - startTime;
    console.log(`Cleanup complete. Total records deleted: ${totalDeleted}`);
    console.log(`Execution time: ${executionTime}ms`);

    // Save cleanup log to database
    const { error: logError } = await supabase
      .from('cleanup_logs')
      .insert({
        executed_at: now.toISOString(),
        status: 'success',
        stats: stats,
        total_deleted: totalDeleted,
        execution_time_ms: executionTime,
      });

    if (logError) {
      console.error('Failed to save cleanup log:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        stats,
        totalDeleted,
        executionTime,
        triggeredBy: userId ? 'admin_user' : 'cron_job'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    
    const executionTime = Date.now() - startTime;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    // Try to log the error
    try {
      await supabase.from('cleanup_logs').insert({
        status: 'error',
        total_deleted: 0,
        stats: {},
        error_message: errorMessage,
        execution_time_ms: executionTime,
        executed_at: new Date().toISOString(),
      });
    } catch (logError) {
      console.error('Error logging failure:', logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        executionTime
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
