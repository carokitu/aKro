create or replace function get_user_like_rank(
  p_username text
)
returns table (
  user_id uuid,
  username text,
  avatar_url text,
  total_likes_all bigint,
  rank_all int,
  total_likes_week bigint,
  rank_week int
)
language sql
as $$
  with ranked_all as (
    select
      u.id,
      u.username,
      u.avatar_url,
      count(*) as total_likes,
      rank() over (order by count(*) desc) as rank
    from post_likes pl
    join posts p on pl.post_id = p.id
    join users u on u.id = p.user_id
    group by u.id, u.username, u.avatar_url
  ),
  ranked_week as (
    select
      u.id,
      u.username,
      count(*) as total_likes,
      rank() over (order by count(*) desc) as rank
    from post_likes pl
    join posts p on pl.post_id = p.id
    join users u on u.id = p.user_id
    where pl.created_at >= now() - interval '7 days'
    group by u.id, u.username
  )
  select
    ra.id as user_id,
    ra.username,
    ra.avatar_url,
    ra.total_likes as total_likes_all,
    ra.rank as rank_all,
    coalesce(rw.total_likes, 0) as total_likes_week,
    coalesce(rw.rank, null) as rank_week
  from ranked_all ra
  left join ranked_week rw on rw.id = ra.id
  where ra.username = p_username
$$;
