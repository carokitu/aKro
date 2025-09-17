-- Activation du Row Level Security
alter table public.user_reports enable row level security;

-- Policy pour que chaque user authentifié puisse insérer un report pour un autre user
CREATE POLICY "Enable insert for authenticated users only" ON "public"."user_reports" FOR
INSERT TO "authenticated" WITH CHECK (true);
