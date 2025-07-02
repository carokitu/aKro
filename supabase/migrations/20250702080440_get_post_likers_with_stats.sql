drop function if exists get_post_likers_with_stats;
create or replace function get_post_likers_with_stats(
  p_post_id uuid,
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
    u.id,
    u.username,
    u.name,
    u.avatar_url,

    -- Est-ce que le viewer suit l'utilisateur qui a liké ?
    exists (
      select 1 from follows f
      where f.follower_id = p_viewer_id
        and f.followed_id = u.id
    ) as is_followed,

    -- Est-ce que cet utilisateur suit le viewer ?
    exists (
      select 1 from follows f
      where f.follower_id = u.id
        and f.followed_id = p_viewer_id
    ) as follows_me,

    -- Nombre de contacts en commun
    (
      select count(*) from follows f1
      where f1.follower_id = p_viewer_id
        and f1.followed_id in (
          select f2.followed_id from follows f2
          where f2.follower_id = u.id
        )
    ) as mutual_count

  from post_likes pl
  join users u on u.id = pl.user_id
  where pl.post_id = p_post_id
  order by mutual_count desc
  limit p_limit
  offset p_offset;
end;
$$ language plpgsql stable;
