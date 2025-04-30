create or replace function get_user_feed(
  p_user_id uuid,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  user_id uuid,
  username text,
  avatar_url text,
  spotify_track_id text,
  track_name text,
  artist_name text,
  album_cover_url text,
  description text,
  created_at timestamptz
)
language sql
stable
as $$
  select
    p.id,
    p.user_id,
    u.username,
    u.avatar_url,
    p.spotify_track_id,
    p.track_name,
    p.artist_name,
    p.album_cover_url,
    p.description,
    p.created_at
  from posts p
  join users u on u.id = p.user_id
  where p.user_id = p_user_id
     or p.user_id in (
       select followed_id from follows where follower_id = p_user_id
     )
  order by p.created_at desc
  limit p_limit
  offset p_offset
$$;
