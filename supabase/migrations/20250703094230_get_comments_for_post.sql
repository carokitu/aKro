create or replace function get_comments_for_post(
  p_post_id uuid,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  content text,
  created_at timestamptz,
  author_id uuid,
  username text,
  name text,
  avatar_url text
) as $$
begin
  return query
  select
    c.id,
    c.content,
    c.created_at,
    u.id,
    u.username,
    u.name,
    u.avatar_url
  from comments c
  join users u on u.id = c.author_id
  where c.post_id = p_post_id
  order by c.created_at asc
  limit p_limit offset p_offset;
end;
$$ language plpgsql stable;
