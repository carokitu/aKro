DROP FUNCTION IF EXISTS search_users_with_stats;

create or replace function search_users_with_stats(p_query text, p_user_id uuid)
returns table (
  id uuid,
  username text,
  name text,
  avatar_url text,
  is_followed boolean,
  -- Nombre d'amis en commun
  mutual_count bigint
) as $$
begin
  return query
  select 
    u.id,
    u.username,
    u.name,
    u.avatar_url,
    exists (
      select 1 from follows f
      where f.follower_id = p_user_id
        and f.followed_id = u.id
    ) as is_followed,
    (
      select count(*) from follows f1
      where f1.follower_id = p_user_id
        and f1.followed_id in (
          select f2.followed_id from follows f2
          where f2.follower_id = u.id
        )
    ) as mutual_count
  from users u
  where u.id != p_user_id
    and (
      u.username ilike '%' || p_query || '%' or
      u.name ilike '%' || p_query || '%'
    )
  order by mutual_count desc
  limit 50;
end;
$$ language plpgsql stable;
