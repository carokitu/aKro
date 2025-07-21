create or replace function get_user_like_global_ranking(
  p_period text default 'all',
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  total_likes bigint,
  rank int
)
language sql
as $$
  with ranked_users as (
    select
      u.id as user_id,
      u.username,
      u.avatar_url,
      count(*) as total_likes,
      rank() over (order by count(*) desc) as rank
    from post_likes pl
    join posts p on pl.post_id = p.id
    join users u on u.id = p.user_id
    where (
      p_period = 'all'
      or (p_period = 'week' and pl.created_at >= date_trunc('week', now()))
    )
    group by u.id, u.username, u.avatar_url
  )
  select *
  from ranked_users
  order by rank
  limit p_limit
  offset p_offset
$$;
