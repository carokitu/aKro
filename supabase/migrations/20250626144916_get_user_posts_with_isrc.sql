drop function if exists get_user_posts;

create function get_user_posts(
  p_username text,
  p_viewer_id uuid,
  p_limit int default 20,
  p_offset int default 0
)
returns table (
  id uuid,
  album_cover_url text,
  artist_name text,
  avatar_url text,
  created_at timestamptz,
  isrc text,
  description text,
  is_liked_by_current_user boolean,
  likes_count int,
  preview_url text,
  spotify_track_id text,
  track_name text,
  user_id uuid,
  username text
)
language sql
as $$
  select
    p.id,
    p.album_cover_url,
    p.artist_name,
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
    p.preview_url,
    p.spotify_track_id,
    p.track_name,
    p.user_id,
    u.username
  from posts p
  join users u on p.user_id = u.id
  where u.username = p_username
  order by p.created_at desc
  limit p_limit
  offset p_offset
$$;
