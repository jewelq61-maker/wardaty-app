-- Create shared events table for couples
CREATE TABLE IF NOT EXISTS public.shared_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_link_id UUID NOT NULL REFERENCES public.share_links(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type TEXT NOT NULL, -- 'reminder', 'appointment', 'note'
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users connected via share link can view shared events
CREATE POLICY "Users can view shared events"
ON public.shared_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.share_links
    WHERE share_links.id = shared_events.share_link_id
    AND (share_links.owner_id = auth.uid() OR share_links.connected_user_id = auth.uid())
    AND share_links.status = 'active'
  )
);

-- Policy: Connected users can create shared events
CREATE POLICY "Connected users can create shared events"
ON public.shared_events
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.share_links
    WHERE share_links.id = shared_events.share_link_id
    AND (share_links.owner_id = auth.uid() OR share_links.connected_user_id = auth.uid())
    AND share_links.status = 'active'
  )
);

-- Policy: Users can update their own shared events
CREATE POLICY "Users can update own shared events"
ON public.shared_events
FOR UPDATE
USING (created_by = auth.uid());

-- Policy: Users can delete their own shared events
CREATE POLICY "Users can delete own shared events"
ON public.shared_events
FOR DELETE
USING (created_by = auth.uid());

-- Create index for performance
CREATE INDEX idx_shared_events_share_link_id ON public.shared_events(share_link_id);
CREATE INDEX idx_shared_events_date ON public.shared_events(event_date);