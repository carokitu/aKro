create or replace function get_user_profile(p_user_id uuid, p_viewer_id uuid)
returns json as $$
declare
  result json;
begin
  select json_build_object(
    'user', u,
    'is_following', exists (
      select 1 from follows where follower_id = p_viewer_id and followed_id = p_user_id
    ),
    'is_followed', exists (
      select 1 from follows where follower_id = p_user_id and followed_id = p_viewer_id
    ),
    'followers_count', (select count(*) from follows where followed_id = p_user_id),
    'followers', (
      select json_agg(followers_subset) from (
        select u2.id, u2.username, u2.avatar_url
        from follows f
        join users u2 on f.follower_id = u2.id
        where f.followed_id = p_user_id
        limit 5
      ) followers_subset
    ),
    'following', (
      select json_agg(following_subset) from (
        select u2.id, u2.username, u2.avatar_url
        from follows f
        join users u2 on f.followed_id = u2.id
        where f.follower_id = p_user_id
        limit 5
      ) following_subset
    )
  ) into result
  from users u where u.id = p_user_id;

  return result;
end;
$$ language plpgsql;
