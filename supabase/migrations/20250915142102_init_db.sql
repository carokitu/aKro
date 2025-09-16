SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = on;

SELECT pg_catalog.set_config('search_path', '', false);

SET check_function_bodies = false;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = off;

CREATE EXTENSION IF NOT EXISTS "pgsodium";

COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

CREATE TYPE "public"."streaming_platforms" AS ENUM (
  'amazonMusic',
  'appleMusic',
  'deezer',
  'soundcloud',
  'spotify',
  'tidal'
);

ALTER TYPE "public"."streaming_platforms" OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_comments_for_post"(
    "p_post_id" "uuid",
    "p_limit" integer DEFAULT 20,
    "p_offset" integer DEFAULT 0
  ) RETURNS TABLE(
    "id" "uuid",
    "content" "text",
    "created_at" timestamp with time zone,
    "author_id" "uuid",
    "username" "text",
    "name" "text",
    "avatar_url" "text"
  ) LANGUAGE "plpgsql" STABLE AS $$ begin return query
select c.id,
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

$$;

ALTER FUNCTION "public"."get_comments_for_post"(
  "p_post_id" "uuid",
  "p_limit" integer,
  "p_offset" integer
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_post_likers_with_stats"(
    "p_post_id" "uuid",
    "p_viewer_id" "uuid",
    "p_limit" integer DEFAULT 20,
    "p_offset" integer DEFAULT 0
  ) RETURNS TABLE(
    "id" "uuid",
    "username" "text",
    "name" "text",
    "avatar_url" "text",
    "is_followed" boolean,
    "follows_me" boolean,
    "mutual_count" bigint
  ) LANGUAGE "plpgsql" STABLE AS $$ begin return query
select u.id,
  u.username,
  u.name,
  u.avatar_url,
  -- Est-ce que le viewer suit l'utilisateur qui a liké ?
  exists (
    select 1
    from follows f
    where f.follower_id = p_viewer_id
      and f.followed_id = u.id
  ) as is_followed,
  -- Est-ce que cet utilisateur suit le viewer ?
  exists (
    select 1
    from follows f
    where f.follower_id = u.id
      and f.followed_id = p_viewer_id
  ) as follows_me,
  -- Nombre de contacts en commun
  (
    select count(*)
    from follows f1
    where f1.follower_id = p_viewer_id
      and f1.followed_id in (
        select f2.followed_id
        from follows f2
        where f2.follower_id = u.id
      )
  ) as mutual_count
from post_likes pl
  join users u on u.id = pl.user_id
where pl.post_id = p_post_id
order by mutual_count desc
limit p_limit offset p_offset;

end;

$$;

ALTER FUNCTION "public"."get_post_likers_with_stats"(
  "p_post_id" "uuid",
  "p_viewer_id" "uuid",
  "p_limit" integer,
  "p_offset" integer
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_feed"(
    "p_user_id" "uuid",
    "p_limit" integer DEFAULT 50,
    "p_offset" integer DEFAULT 0
  ) RETURNS TABLE(
    "id" "uuid",
    "album_cover_small" "text",
    "album_cover_medium" "text",
    "album_cover_big" "text",
    "artist_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone,
    "isrc" "text",
    "description" "text",
    "is_liked_by_current_user" boolean,
    "likes_count" integer,
    "comments_count" integer,
    "preview_url" "text",
    "deezer_track_id" "text",
    "title" "text",
    "user_id" "uuid",
    "platform_links" "jsonb",
    "username" "text"
  ) LANGUAGE "sql" STABLE AS $$
select p.id,
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
    where pl.post_id = p.id
      and pl.user_id = p_user_id
  ) as is_liked_by_current_user,
  (
    select count(*)
    from post_likes pl
    where pl.post_id = p.id
  ) as likes_count,
  (
    select count(*)
    from comments c
    where c.post_id = p.id
  ) as comments_count,
  t.preview_url,
  t.deezer_track_id,
  t.title,
  p.user_id,
  t.platform_links,
  u.username
from posts p
  join users u on u.id = p.user_id
  join tracks t on p.isrc = t.isrc
where p.user_id = p_user_id
  or p.user_id in (
    select followed_id
    from follows
    where follower_id = p_user_id
  )
order by p.created_at desc
limit p_limit offset p_offset;

$$;

ALTER FUNCTION "public"."get_user_feed"(
  "p_user_id" "uuid",
  "p_limit" integer,
  "p_offset" integer
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_followers_count"("p_username" "text") RETURNS bigint LANGUAGE "sql" STABLE AS $$
select count(*)
from follows f
  join users u on u.id = f.followed_id
where u.username = p_username $$;

ALTER FUNCTION "public"."get_user_followers_count"("p_username" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_followers_with_stats"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer DEFAULT 20,
    "p_offset" integer DEFAULT 0
  ) RETURNS TABLE(
    "id" "uuid",
    "username" "text",
    "name" "text",
    "avatar_url" "text",
    "is_followed" boolean,
    "follows_me" boolean,
    "mutual_count" bigint
  ) LANGUAGE "plpgsql" STABLE AS $$ begin return query
select follower.id,
  follower.username,
  follower.name,
  follower.avatar_url,
  exists (
    select 1
    from follows f
    where f.follower_id = p_viewer_id
      and f.followed_id = follower.id
  ) as is_followed,
  exists (
    select 1
    from follows f
    where f.follower_id = follower.id
      and f.followed_id = p_viewer_id
  ) as follows_me,
  (
    select count(*)
    from follows f1
    where f1.follower_id = p_viewer_id
      and f1.followed_id in (
        select f2.followed_id
        from follows f2
        where f2.follower_id = follower.id
      )
  ) as mutual_count
from users target
  join follows on follows.followed_id = target.id
  join users follower on follower.id = follows.follower_id
where target.username = p_username
order by mutual_count desc
limit p_limit offset p_offset;

end;

$$;

ALTER FUNCTION "public"."get_user_followers_with_stats"(
  "p_username" "text",
  "p_viewer_id" "uuid",
  "p_limit" integer,
  "p_offset" integer
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_following_with_stats"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer DEFAULT 20,
    "p_offset" integer DEFAULT 0
  ) RETURNS TABLE(
    "id" "uuid",
    "username" "text",
    "name" "text",
    "avatar_url" "text",
    "is_followed" boolean,
    "follows_me" boolean,
    "mutual_count" bigint
  ) LANGUAGE "plpgsql" STABLE AS $$ begin return query
select followed.id,
  followed.username,
  followed.name,
  followed.avatar_url,
  exists (
    select 1
    from follows f
    where f.follower_id = p_viewer_id
      and f.followed_id = followed.id
  ) as is_followed,
  exists (
    select 1
    from follows f
    where f.follower_id = followed.id
      and f.followed_id = p_viewer_id
  ) as follows_me,
  (
    select count(*)
    from follows f1
    where f1.follower_id = p_viewer_id
      and f1.followed_id in (
        select f2.followed_id
        from follows f2
        where f2.follower_id = followed.id
      )
  ) as mutual_count
from users target
  join follows on follows.follower_id = target.id
  join users followed on followed.id = follows.followed_id
where target.username = p_username
order by mutual_count desc
limit p_limit offset p_offset;

end;

$$;

ALTER FUNCTION "public"."get_user_following_with_stats"(
  "p_username" "text",
  "p_viewer_id" "uuid",
  "p_limit" integer,
  "p_offset" integer
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_like_global_ranking"(
    "p_period" "text" DEFAULT 'all'::"text",
    "p_limit" integer DEFAULT 20,
    "p_offset" integer DEFAULT 0
  ) RETURNS TABLE(
    "user_id" "uuid",
    "username" "text",
    "avatar_url" "text",
    "total_likes" bigint,
    "rank" integer
  ) LANGUAGE "sql" AS $$ with ranked_users as (
    select u.id as user_id,
      u.username,
      u.avatar_url,
      count(*) as total_likes,
      rank() over (
        order by count(*) desc
      ) as rank
    from post_likes pl
      join posts p on pl.post_id = p.id
      join users u on u.id = p.user_id
    where (
        p_period = 'all'
        or (
          p_period = 'week'
          and pl.created_at >= now() - interval '7 days'
        )
      )
    group by u.id,
      u.username,
      u.avatar_url
  )
select *
from ranked_users
order by rank
limit p_limit offset p_offset $$;

ALTER FUNCTION "public"."get_user_like_global_ranking"(
  "p_period" "text",
  "p_limit" integer,
  "p_offset" integer
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_like_rank"("p_username" "text") RETURNS TABLE(
    "user_id" "uuid",
    "username" "text",
    "avatar_url" "text",
    "total_likes_all" bigint,
    "rank_all" integer,
    "total_likes_week" bigint,
    "rank_week" integer
  ) LANGUAGE "sql" AS $$ with ranked_all as (
    select u.id,
      u.username,
      u.avatar_url,
      count(*) as total_likes,
      rank() over (
        order by count(*) desc
      ) as rank
    from post_likes pl
      join posts p on pl.post_id = p.id
      join users u on u.id = p.user_id
    group by u.id,
      u.username,
      u.avatar_url
  ),
  ranked_week as (
    select u.id,
      u.username,
      count(*) as total_likes,
      rank() over (
        order by count(*) desc
      ) as rank
    from post_likes pl
      join posts p on pl.post_id = p.id
      join users u on u.id = p.user_id
    where pl.created_at >= now() - interval '7 days'
    group by u.id,
      u.username
  )
select ra.id as user_id,
  ra.username,
  ra.avatar_url,
  ra.total_likes as total_likes_all,
  ra.rank as rank_all,
  coalesce(rw.total_likes, 0) as total_likes_week,
  coalesce(rw.rank, null) as rank_week
from ranked_all ra
  left join ranked_week rw on rw.id = ra.id
where ra.username = p_username $$;

ALTER FUNCTION "public"."get_user_like_rank"("p_username" "text") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_posts"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer DEFAULT 20,
    "p_offset" integer DEFAULT 0
  ) RETURNS TABLE(
    "id" "uuid",
    "album_cover_small" "text",
    "album_cover_medium" "text",
    "album_cover_big" "text",
    "artist_name" "text",
    "avatar_url" "text",
    "created_at" timestamp with time zone,
    "isrc" "text",
    "description" "text",
    "is_liked_by_current_user" boolean,
    "likes_count" integer,
    "comments_count" integer,
    "platform_links" "jsonb",
    "preview_url" "text",
    "deezer_track_id" "text",
    "title" "text",
    "user_id" "uuid",
    "username" "text"
  ) LANGUAGE "sql" AS $$
select p.id,
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
    where pl.post_id = p.id
      and pl.user_id = p_viewer_id
  ) as is_liked_by_current_user,
  (
    select count(*)
    from post_likes pl
    where pl.post_id = p.id
  ) as likes_count,
  (
    select count(*)
    from comments c
    where c.post_id = p.id
  ) as comments_count,
  t.platform_links,
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
limit p_limit offset p_offset $$;

ALTER FUNCTION "public"."get_user_posts"(
  "p_username" "text",
  "p_viewer_id" "uuid",
  "p_limit" integer,
  "p_offset" integer
) OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."get_user_profile"("p_username" "text", "p_viewer_id" "uuid") RETURNS "json" LANGUAGE "plpgsql" AS $$
declare result json;

begin
select json_build_object(
    'id',
    u.id,
    'username',
    u.username,
    'name',
    u.name,
    'avatar_url',
    u.avatar_url,
    'bio',
    u.bio,
    'birthday',
    u.birthday,
    'created_at',
    u.created_at,
    'is_followed',
    exists (
      select 1
      from follows
      where follower_id = p_viewer_id
        and followed_id = u.id
    ),
    'follows_me',
    exists (
      select 1
      from follows
      where follower_id = u.id
        and followed_id = p_viewer_id
    ),
    'followers_count',
    (
      select count(*)
      from follows
      where followed_id = u.id
    ),
    'followers',
    (
      select json_agg(follower)
      from (
          select u2.id,
            u2.username,
            u2.avatar_url
          from follows f
            join users u2 on f.follower_id = u2.id
          where f.followed_id = u.id
          order by f.created_at desc
          limit 5
        ) follower
    ), 'following', (
      select json_agg(following)
      from (
          select u2.id,
            u2.username,
            u2.avatar_url
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

$$;

ALTER FUNCTION "public"."get_user_profile"("p_username" "text", "p_viewer_id" "uuid") OWNER TO "postgres";

CREATE OR REPLACE FUNCTION "public"."search_users_with_stats"("p_query" "text", "p_user_id" "uuid") RETURNS TABLE(
    "id" "uuid",
    "username" "text",
    "name" "text",
    "avatar_url" "text",
    "is_followed" boolean,
    "follows_me" boolean,
    "mutual_count" bigint
  ) LANGUAGE "sql" STABLE AS $$
select u.id,
  u.username,
  u.name,
  u.avatar_url,
  exists (
    select 1
    from follows f
    where f.follower_id = p_user_id
      and f.followed_id = u.id
  ) as is_followed,
  exists (
    select 1
    from follows f
    where f.follower_id = u.id
      and f.followed_id = p_user_id
  ) as follows_me,
  (
    select count(*)
    from follows f1
    where f1.follower_id = p_user_id
      and f1.followed_id in (
        select f2.followed_id
        from follows f2
        where f2.follower_id = u.id
      )
  ) as mutual_count
from users u
where u.id != p_user_id
  and (
    u.username ilike '%' || p_query || '%'
    or u.name ilike '%' || p_query || '%'
  )
order by mutual_count desc,
  u.username asc
limit 50 $$;

ALTER FUNCTION "public"."search_users_with_stats"("p_query" "text", "p_user_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";

CREATE TABLE IF NOT EXISTS "public"."bug_reports" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "user_id" "uuid",
  "message" "text" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"(),
  "device_info" "jsonb"
);

ALTER TABLE "public"."bug_reports" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."comment_reports" (
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "comment_id" "uuid" NOT NULL,
  "user_id" "uuid",
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."comment_reports" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."comments" (
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
  "post_id" "uuid" NOT NULL,
  "author_id" "uuid" NOT NULL,
  "content" "text" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"(),
  CONSTRAINT "content_min_length" CHECK (("char_length"("content") > 0))
);

ALTER TABLE "public"."comments" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."follows" (
  "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
  "follower_id" "uuid" NOT NULL,
  "followed_id" "uuid" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."follows" OWNER TO "postgres";

COMMENT ON TABLE "public"."follows" IS 'Who the users are following / followed by';

CREATE TABLE IF NOT EXISTS "public"."post_likes" (
  "post_id" "uuid" NOT NULL,
  "user_id" "uuid" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"()
);

ALTER TABLE "public"."post_likes" OWNER TO "postgres";

COMMENT ON TABLE "public"."post_likes" IS 'Who likes which post';

CREATE TABLE IF NOT EXISTS "public"."post_reports" (
  "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
  "post_id" "uuid" NOT NULL,
  "user_id" "uuid",
  "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL
);

ALTER TABLE "public"."post_reports" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."posts" (
  "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
  "user_id" "uuid" NOT NULL,
  "description" "text",
  "created_at" timestamp with time zone DEFAULT "now"(),
  "isrc" "text" NOT NULL,
  CONSTRAINT "posts_description_check" CHECK (("length"("description") < 500))
);

ALTER TABLE "public"."posts" OWNER TO "postgres";

COMMENT ON TABLE "public"."posts" IS 'Who share which music, and basic music info';

COMMENT ON COLUMN "public"."posts"."isrc" IS 'International Standard Recording Code';

CREATE TABLE IF NOT EXISTS "public"."tracks" (
  "isrc" "text" NOT NULL,
  "deezer_track_id" "text" NOT NULL,
  "title" "text" NOT NULL,
  "bpm" numeric,
  "disk_number" integer,
  "duration" integer,
  "rank" integer NOT NULL,
  "deezer_link" "text" NOT NULL,
  "preview_url" "text" NOT NULL,
  "release_date" "date",
  "deezer_artist_id" "text" NOT NULL,
  "artist_name" "text" NOT NULL,
  "artist_picture" "text" NOT NULL,
  "artist_role" "text",
  "deezer_album_id" "text" NOT NULL,
  "album_release_date" "date" NOT NULL,
  "album_title" "text" NOT NULL,
  "album_cover_big" "text" NOT NULL,
  "album_cover_medium" "text" NOT NULL,
  "album_cover_small" "text" NOT NULL,
  "album_cover_xl" "text" NOT NULL,
  "deezer_album_link" "text" NOT NULL,
  "created_at" timestamp with time zone DEFAULT "now"(),
  "platform_links" "jsonb"
);

ALTER TABLE "public"."tracks" OWNER TO "postgres";

CREATE TABLE IF NOT EXISTS "public"."users" (
  "id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
  "username" "text" NOT NULL,
  "name" "text" NOT NULL,
  "bio" "text",
  "avatar_url" "text",
  "phone" "text" DEFAULT 'NULL'::"text",
  "created_at" timestamp with time zone DEFAULT "now"(),
  "birthday" timestamp with time zone NOT NULL,
  "email" "text",
  "streaming_platform" "public"."streaming_platforms",
  CONSTRAINT "bio_length_check" CHECK (("char_length"("bio") <= 150))
);

ALTER TABLE "public"."users" OWNER TO "postgres";

COMMENT ON COLUMN "public"."users"."birthday" IS 'The date of birth of the user';

ALTER TABLE ONLY "public"."bug_reports"
ADD CONSTRAINT "bug_reports_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."comment_reports"
ADD CONSTRAINT "comment_reports_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."comments"
ADD CONSTRAINT "comments_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."follows"
ADD CONSTRAINT "follows_follower_id_followed_id_key" UNIQUE ("follower_id", "followed_id");

ALTER TABLE ONLY "public"."follows"
ADD CONSTRAINT "follows_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."post_likes"
ADD CONSTRAINT "post_likes_pkey" PRIMARY KEY ("post_id", "user_id");

ALTER TABLE ONLY "public"."post_reports"
ADD CONSTRAINT "post_reports_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."post_reports"
ADD CONSTRAINT "post_reports_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."posts"
ADD CONSTRAINT "posts_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."tracks"
ADD CONSTRAINT "tracks_pkey" PRIMARY KEY ("isrc");

ALTER TABLE ONLY "public"."users"
ADD CONSTRAINT "users_id_key" UNIQUE ("id");

ALTER TABLE ONLY "public"."users"
ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
ADD CONSTRAINT "users_username_key" UNIQUE ("username");

CREATE INDEX "idx_comments_post_id" ON "public"."comments" USING "btree" ("post_id");

CREATE INDEX "tracks_deezer_track_id_idx" ON "public"."tracks" USING "btree" ("deezer_track_id");

ALTER TABLE ONLY "public"."bug_reports"
ADD CONSTRAINT "bug_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE
SET NULL;

ALTER TABLE ONLY "public"."comment_reports"
ADD CONSTRAINT "comment_reports_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "public"."comments"("id");

ALTER TABLE ONLY "public"."comment_reports"
ADD CONSTRAINT "comment_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."comments"
ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."comments"
ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."follows"
ADD CONSTRAINT "follows_followed_id_fkey" FOREIGN KEY ("followed_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."follows"
ADD CONSTRAINT "follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."post_likes"
ADD CONSTRAINT "post_likes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."post_likes"
ADD CONSTRAINT "post_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

ALTER TABLE ONLY "public"."post_reports"
ADD CONSTRAINT "post_reports_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id");

ALTER TABLE ONLY "public"."post_reports"
ADD CONSTRAINT "post_reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

ALTER TABLE ONLY "public"."posts"
ADD CONSTRAINT "posts_isrc_fkey" FOREIGN KEY ("isrc") REFERENCES "public"."tracks"("isrc") ON DELETE RESTRICT;

ALTER TABLE ONLY "public"."posts"
ADD CONSTRAINT "posts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;

CREATE POLICY "Allow authenticated DELETE on follows / followed" ON "public"."follows" FOR DELETE TO "authenticated" USING (
  (
    ("follower_id" = "auth"."uid"())
    OR ("followed_id" = "auth"."uid"())
  )
);

CREATE POLICY "Allow authenticated INSERT on follows" ON "public"."follows" FOR
INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "follower_id"));

CREATE POLICY "Allow authenticated users to submit bug reports" ON "public"."bug_reports" FOR
INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));

CREATE POLICY "Enable delete for users based on user_id" ON "public"."posts" FOR DELETE TO "authenticated" USING (
  (
    (
      SELECT "auth"."uid"() AS "uid"
    ) = "user_id"
  )
);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."bug_reports" FOR
INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."comment_reports" FOR
INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."post_reports" FOR
INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for authenticated users only" ON "public"."tracks" FOR
INSERT TO "authenticated" WITH CHECK (true);

CREATE POLICY "Enable insert for users based on user_id" ON "public"."posts" FOR
INSERT TO "authenticated" WITH CHECK (
    (
      (
        SELECT "auth"."uid"() AS "uid"
      ) = "user_id"
    )
  );

CREATE POLICY "Enable read access for all authenticated users" ON "public"."posts" FOR
SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."tracks" FOR
SELECT USING (true);

CREATE POLICY "Enable read access for all users" ON "public"."users" FOR
SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable read access for authenticated users only" ON "public"."follows" FOR
SELECT TO "authenticated" USING (true);

CREATE POLICY "Enable update for authenticated users only" ON "public"."tracks" FOR
UPDATE TO "authenticated" USING (true) WITH CHECK (true);

CREATE POLICY "Enable update for users based on user_id" ON "public"."users" FOR
UPDATE TO "authenticated" USING (("auth"."uid"() = "id")) WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Public read access to comments" ON "public"."comments" FOR
SELECT TO "authenticated" USING (true);

CREATE POLICY "User can read their own data" ON "public"."users" FOR
SELECT TO "authenticated" USING (("auth"."uid"() = "id"));

CREATE POLICY "Users can delete their own comments" ON "public"."comments" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "author_id"));

CREATE POLICY "Users can insert their own comments" ON "public"."comments" FOR
INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));

CREATE POLICY "Users can insert their own profile" ON "public"."users" FOR
INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "id"));

CREATE POLICY "Users can update their own comments" ON "public"."comments" FOR
UPDATE TO "authenticated" USING (("auth"."uid"() = "author_id")) WITH CHECK (("auth"."uid"() = "author_id"));

ALTER TABLE "public"."bug_reports" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."comment_reports" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."comments" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."follows" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "like_own" ON "public"."post_likes" FOR
INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));

ALTER TABLE "public"."post_likes" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."post_reports" ENABLE ROW LEVEL SECURITY;

ALTER TABLE "public"."posts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_likes" ON "public"."post_likes" FOR
SELECT TO "authenticated" USING (true);

ALTER TABLE "public"."tracks" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "unlike_own" ON "public"."post_likes" FOR DELETE TO "authenticated" USING (("user_id" = "auth"."uid"()));

ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "postgres";

GRANT USAGE ON SCHEMA "public" TO "anon";

GRANT USAGE ON SCHEMA "public" TO "authenticated";

GRANT USAGE ON SCHEMA "public" TO "service_role";

GRANT ALL ON FUNCTION "public"."get_comments_for_post"(
    "p_post_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "anon";

GRANT ALL ON FUNCTION "public"."get_comments_for_post"(
    "p_post_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_comments_for_post"(
    "p_post_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_post_likers_with_stats"(
    "p_post_id" "uuid",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "anon";

GRANT ALL ON FUNCTION "public"."get_post_likers_with_stats"(
    "p_post_id" "uuid",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_post_likers_with_stats"(
    "p_post_id" "uuid",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_feed"(
    "p_user_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "anon";

GRANT ALL ON FUNCTION "public"."get_user_feed"(
    "p_user_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_user_feed"(
    "p_user_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_followers_count"("p_username" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."get_user_followers_count"("p_username" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_user_followers_count"("p_username" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_followers_with_stats"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "anon";

GRANT ALL ON FUNCTION "public"."get_user_followers_with_stats"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_user_followers_with_stats"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_following_with_stats"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "anon";

GRANT ALL ON FUNCTION "public"."get_user_following_with_stats"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_user_following_with_stats"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_like_global_ranking"(
    "p_period" "text",
    "p_limit" integer,
    "p_offset" integer
  ) TO "anon";

GRANT ALL ON FUNCTION "public"."get_user_like_global_ranking"(
    "p_period" "text",
    "p_limit" integer,
    "p_offset" integer
  ) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_user_like_global_ranking"(
    "p_period" "text",
    "p_limit" integer,
    "p_offset" integer
  ) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_like_rank"("p_username" "text") TO "anon";

GRANT ALL ON FUNCTION "public"."get_user_like_rank"("p_username" "text") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_user_like_rank"("p_username" "text") TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_posts"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "anon";

GRANT ALL ON FUNCTION "public"."get_user_posts"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_user_posts"(
    "p_username" "text",
    "p_viewer_id" "uuid",
    "p_limit" integer,
    "p_offset" integer
  ) TO "service_role";

GRANT ALL ON FUNCTION "public"."get_user_profile"("p_username" "text", "p_viewer_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."get_user_profile"("p_username" "text", "p_viewer_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."get_user_profile"("p_username" "text", "p_viewer_id" "uuid") TO "service_role";

GRANT ALL ON FUNCTION "public"."search_users_with_stats"("p_query" "text", "p_user_id" "uuid") TO "anon";

GRANT ALL ON FUNCTION "public"."search_users_with_stats"("p_query" "text", "p_user_id" "uuid") TO "authenticated";

GRANT ALL ON FUNCTION "public"."search_users_with_stats"("p_query" "text", "p_user_id" "uuid") TO "service_role";

GRANT ALL ON TABLE "public"."bug_reports" TO "anon";

GRANT ALL ON TABLE "public"."bug_reports" TO "authenticated";

GRANT ALL ON TABLE "public"."bug_reports" TO "service_role";

GRANT ALL ON TABLE "public"."comment_reports" TO "anon";

GRANT ALL ON TABLE "public"."comment_reports" TO "authenticated";

GRANT ALL ON TABLE "public"."comment_reports" TO "service_role";

GRANT ALL ON TABLE "public"."comments" TO "anon";

GRANT ALL ON TABLE "public"."comments" TO "authenticated";

GRANT ALL ON TABLE "public"."comments" TO "service_role";

GRANT ALL ON TABLE "public"."follows" TO "anon";

GRANT ALL ON TABLE "public"."follows" TO "authenticated";

GRANT ALL ON TABLE "public"."follows" TO "service_role";

GRANT ALL ON TABLE "public"."post_likes" TO "anon";

GRANT ALL ON TABLE "public"."post_likes" TO "authenticated";

GRANT ALL ON TABLE "public"."post_likes" TO "service_role";

GRANT ALL ON TABLE "public"."post_reports" TO "anon";

GRANT ALL ON TABLE "public"."post_reports" TO "authenticated";

GRANT ALL ON TABLE "public"."post_reports" TO "service_role";

GRANT ALL ON TABLE "public"."posts" TO "anon";

GRANT ALL ON TABLE "public"."posts" TO "authenticated";

GRANT ALL ON TABLE "public"."posts" TO "service_role";

GRANT ALL ON TABLE "public"."tracks" TO "anon";

GRANT ALL ON TABLE "public"."tracks" TO "authenticated";

GRANT ALL ON TABLE "public"."tracks" TO "service_role";

GRANT ALL ON TABLE "public"."users" TO "anon";

GRANT ALL ON TABLE "public"."users" TO "authenticated";

GRANT ALL ON TABLE "public"."users" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON SEQUENCES TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON FUNCTIONS TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "postgres";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public"
GRANT ALL ON TABLES TO "service_role";

RESET ALL;

