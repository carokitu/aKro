drop function if exists get_user_profile;
drop function if exists get_user_profile_from_username;

create or replace function get_user_profile(
  p_username text,
  p_viewer_id uuid
)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'id', u.id,
    'username', u.username,
    'name', u.name,
    'avatar_url', u.avatar_url,
    'bio', u.bio,
    'birthday', u.birthday,
    'created_at', u.created_at,
    
    'is_followed', exists (
      select 1 from follows
      where follower_id = p_viewer_id and followed_id = u.id
    ),
    
    'follows_me', exists (
      select 1 from follows
      where follower_id = u.id and followed_id = p_viewer_id
    ),
    
    'followers_count', (
      select count(*) from follows where followed_id = u.id
    ),
    
    'followers', (
      select json_agg(follower) from (
        select u2.id, u2.username, u2.avatar_url
        from follows f
        join users u2 on f.follower_id = u2.id
        where f.followed_id = u.id
        order by f.created_at desc
        limit 5
      ) follower
    ),
    
    'following', (
      select json_agg(following) from (
        select u2.id, u2.username, u2.avatar_url
        from follows f
        join users u2 on f.followed_id = u2.id
        where f.follower_id = u.id
        order by f.created_at desc
        limit 5
      ) following
    )
  ) into result
  from users u
  where u.username = p_username;

  return result;
end;
$$ language plpgsql;
