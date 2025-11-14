-- Create cleanup_logs table to track cleanup job execution
CREATE TABLE IF NOT EXISTS public.cleanup_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'success',
  stats JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_deleted INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_cleanup_logs_executed_at 
ON public.cleanup_logs(executed_at DESC);

-- Enable RLS
ALTER TABLE public.cleanup_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view cleanup logs (for now, any authenticated user)
-- In production, you would check against a specific admin role
CREATE POLICY "Authenticated users can view cleanup logs"
ON public.cleanup_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

COMMENT ON TABLE public.cleanup_logs IS 'Stores execution history of cleanup jobs';
COMMENT ON COLUMN public.cleanup_logs.stats IS 'JSON object containing detailed deletion statistics';
COMMENT ON COLUMN public.cleanup_logs.total_deleted IS 'Total number of records deleted in this run';