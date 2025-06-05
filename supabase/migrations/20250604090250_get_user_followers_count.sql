create or replace function get_user_followers_count(p_username text)
returns bigint
language sql
stable
as $$
  select count(*)
  from follows f
  join users u on u.id = f.followed_id
  where u.username = p_username
$$;
