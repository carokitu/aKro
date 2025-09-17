create table if not exists public.user_reports (
    id uuid default gen_random_uuid() primary key,
    reporter_id uuid not null references auth.users(id) on delete cascade,  -- celui qui fait le report
    reported_user_id uuid not null references public.users(id) on delete cascade, -- celui qui est reporté
    created_at timestamp with time zone default now() not null
);
