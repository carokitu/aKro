drop function if exists get_user_posts;

create function get_user_posts(
  p_username text,
  p_viewer_id uuid,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  album_cover_small text,
  album_cover_medium text,
  album_cover_big text,
  artist_name text,
  avatar_url text,
  created_at timestamptz,
  isrc text,
  description text,
  is_liked_by_current_user boolean,
  likes_count int,
  comments_count int,
  preview_url text,
  deezer_track_id text,
  title text,
  user_id uuid,
  username text
)
language sql
as $$
  select
    p.id,
    t.album_cover_small,
    t.album_cover_medium,
    t.album_cover_big,
    t.artist_name,
    u.avatar_url,
    p.created_at,
    p.isrc,
    p.description,
    exists (
      select 1
      from post_likes pl
      where pl.post_id = p.id and pl.user_id = p_viewer_id
    ) as is_liked_by_current_user,
    (
      select count(*) from post_likes pl where pl.post_id = p.id
    ) as likes_count,
    (
      select count(*) from comments c where c.post_id = p.id
    ) as comments_count,
    t.preview_url,
    t.deezer_track_id,
    t.title,
    p.user_id,
    u.username
  from posts p
  join users u on p.user_id = u.id
  join tracks t on p.isrc = t.isrc
  where u.username = p_username
  order by p.created_at desc
  limit p_limit
  offset p_offset
$$;
