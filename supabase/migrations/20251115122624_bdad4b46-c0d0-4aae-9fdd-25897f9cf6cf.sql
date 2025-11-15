-- Create audit logs table for tracking sensitive operations
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  table_name TEXT,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit_logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.audit_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (true);

-- Create index for better performance
CREATE INDEX idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action_type ON public.audit_logs(action_type);

-- Function to log role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action_type,
      table_name,
      record_id,
      new_data
    ) VALUES (
      auth.uid(),
      'role_assigned',
      'user_roles',
      NEW.id,
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role
      )
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action_type,
      table_name,
      record_id,
      old_data
    ) VALUES (
      auth.uid(),
      'role_removed',
      'user_roles',
      OLD.id,
      jsonb_build_object(
        'user_id', OLD.user_id,
        'role', OLD.role
      )
    );
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (
      user_id,
      action_type,
      table_name,
      record_id,
      old_data,
      new_data
    ) VALUES (
      auth.uid(),
      'role_updated',
      'user_roles',
      NEW.id,
      jsonb_build_object(
        'user_id', OLD.user_id,
        'role', OLD.role
      ),
      jsonb_build_object(
        'user_id', NEW.user_id,
        'role', NEW.role
      )
    );
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for role changes
CREATE TRIGGER audit_user_roles_changes
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.audit_role_changes();

-- Update cleanup_logs RLS policy to restrict to admins only
DROP POLICY IF EXISTS "Authenticated users can view cleanup logs" ON public.cleanup_logs;

CREATE POLICY "Admins can view cleanup logs"
ON public.cleanup_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));