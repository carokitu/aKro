drop function if exists get_user_followers_with_stats;
create or replace function get_user_followers_with_stats(
  p_username text,
  p_viewer_id uuid,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  username text,
  name text,
  avatar_url text,
  is_followed boolean,
  follows_me boolean,
  mutual_count integer
) as $$
begin
  return query
  select 
    follower.id,
    follower.username,
    follower.name,
    follower.avatar_url,
    exists (
      select 1 from follows f
      where f.follower_id = p_viewer_id
        and f.followed_id = follower.id
    ) as is_followed,
    exists (
      select 1 from follows f
      where f.follower_id = follower.id
        and f.followed_id = p_viewer_id
    ) as follows_me,
    (
      select count(*) from follows f1
      where f1.follower_id = p_viewer_id
        and f1.followed_id in (
          select f2.followed_id from follows f2
          where f2.follower_id = follower.id
        )
    ) as mutual_count
  from users target
  join follows on follows.followed_id = target.id
  join users follower on follower.id = follows.follower_id
  where target.username = p_username
  order by mutual_count desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql stable;
