CREATE TABLE public.scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  hb_value NUMERIC(4,1) NOT NULL,
  severity TEXT NOT NULL,
  mode TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.scans TO authenticated;
GRANT ALL ON public.scans TO service_role;

ALTER TABLE public.scans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scans" ON public.scans FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own scans" ON public.scans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own scans" ON public.scans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own scans" ON public.scans FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE INDEX scans_user_created_idx ON public.scans (user_id, created_at DESC);