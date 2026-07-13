


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE TYPE "public"."gender_type" AS ENUM (
    'female',
    'male',
    'prefer_not_to_say'
);


ALTER TYPE "public"."gender_type" OWNER TO "postgres";


CREATE TYPE "public"."item_source_type" AS ENUM (
    'catalog',
    'user_upload',
    'affiliate'
);


ALTER TYPE "public"."item_source_type" OWNER TO "postgres";


CREATE TYPE "public"."subscription_tier" AS ENUM (
    'free',
    'premium'
);


ALTER TYPE "public"."subscription_tier" OWNER TO "postgres";


CREATE TYPE "public"."wardrobe_source" AS ENUM (
    'TikTok',
    'Instagram',
    'Original'
);


ALTER TYPE "public"."wardrobe_source" OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."follow" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "follower_id" "uuid",
    "following_id" "uuid",
    "is_approved" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."follow" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."item" (
    "item_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "category" "text" NOT NULL,
    "subcategory" "text",
    "color" "text",
    "brand" "text",
    "material" "text",
    "image_url" "text",
    "source_type" "public"."item_source_type" DEFAULT 'catalog'::"public"."item_source_type"
);


ALTER TABLE "public"."item" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."outfit" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "occasion" "text",
    "cover_image_url" "text",
    "wear_count" integer DEFAULT 0,
    "is_saved" boolean DEFAULT false,
    "is_public" boolean DEFAULT false,
    "item_not_available" integer DEFAULT 0,
    "added_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."outfit" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."outfit_item" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "outfit_id" "uuid",
    "wardrobe_item_id" "uuid",
    "layer_order" integer DEFAULT 0,
    "notes" "text"
);


ALTER TABLE "public"."outfit_item" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."outfit_recommendation" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "outfit_id" "uuid",
    "reason" "text",
    "occasion" "text",
    "score" double precision,
    "is_clicked" boolean DEFAULT false,
    "is_saved" boolean DEFAULT false,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."outfit_recommendation" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user" (
    "user_id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "username" "text" NOT NULL,
    "email" "text" NOT NULL,
    "profile_photo" "text",
    "is_private" boolean DEFAULT false,
    "occupation" "text",
    "gender" "public"."gender_type",
    "height" integer,
    "weight" integer,
    "subscription_tier" "public"."subscription_tier" DEFAULT 'free'::"public"."subscription_tier",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."user" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wardrobe_item" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "item_id" "uuid",
    "user_id" "uuid",
    "size" "text",
    "price" double precision,
    "is_public" boolean DEFAULT false,
    "acquired_at" timestamp without time zone,
    "image_url" "text",
    "wear_count" integer DEFAULT 0,
    "is_wishlist" boolean DEFAULT false,
    "source" "public"."wardrobe_source",
    "source_url" "text",
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."wardrobe_item" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."wear_log" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid",
    "outfit_id" "uuid",
    "worn_on" "date" NOT NULL,
    "created_at" timestamp without time zone DEFAULT "now"()
);


ALTER TABLE "public"."wear_log" OWNER TO "postgres";


ALTER TABLE ONLY "public"."follow"
    ADD CONSTRAINT "follow_follower_id_following_id_key" UNIQUE ("follower_id", "following_id");



ALTER TABLE ONLY "public"."follow"
    ADD CONSTRAINT "follow_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."item"
    ADD CONSTRAINT "item_pkey" PRIMARY KEY ("item_id");



ALTER TABLE ONLY "public"."outfit_item"
    ADD CONSTRAINT "outfit_item_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."outfit"
    ADD CONSTRAINT "outfit_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."outfit_recommendation"
    ADD CONSTRAINT "outfit_recommendation_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_pkey" PRIMARY KEY ("user_id");



ALTER TABLE ONLY "public"."user"
    ADD CONSTRAINT "user_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."wardrobe_item"
    ADD CONSTRAINT "wardrobe_item_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."wear_log"
    ADD CONSTRAINT "wear_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."follow"
    ADD CONSTRAINT "follow_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "public"."user"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."follow"
    ADD CONSTRAINT "follow_following_id_fkey" FOREIGN KEY ("following_id") REFERENCES "public"."user"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."outfit_item"
    ADD CONSTRAINT "outfit_item_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfit"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."outfit_item"
    ADD CONSTRAINT "outfit_item_wardrobe_item_id_fkey" FOREIGN KEY ("wardrobe_item_id") REFERENCES "public"."wardrobe_item"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."outfit_recommendation"
    ADD CONSTRAINT "outfit_recommendation_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfit"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."outfit_recommendation"
    ADD CONSTRAINT "outfit_recommendation_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."outfit"
    ADD CONSTRAINT "outfit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wardrobe_item"
    ADD CONSTRAINT "wardrobe_item_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "public"."item"("item_id");



ALTER TABLE ONLY "public"."wardrobe_item"
    ADD CONSTRAINT "wardrobe_item_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wear_log"
    ADD CONSTRAINT "wear_log_outfit_id_fkey" FOREIGN KEY ("outfit_id") REFERENCES "public"."outfit"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."wear_log"
    ADD CONSTRAINT "wear_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user"("user_id") ON DELETE CASCADE;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."follow" TO "anon";
GRANT ALL ON TABLE "public"."follow" TO "authenticated";
GRANT ALL ON TABLE "public"."follow" TO "service_role";



GRANT ALL ON TABLE "public"."item" TO "anon";
GRANT ALL ON TABLE "public"."item" TO "authenticated";
GRANT ALL ON TABLE "public"."item" TO "service_role";



GRANT ALL ON TABLE "public"."outfit" TO "anon";
GRANT ALL ON TABLE "public"."outfit" TO "authenticated";
GRANT ALL ON TABLE "public"."outfit" TO "service_role";



GRANT ALL ON TABLE "public"."outfit_item" TO "anon";
GRANT ALL ON TABLE "public"."outfit_item" TO "authenticated";
GRANT ALL ON TABLE "public"."outfit_item" TO "service_role";



GRANT ALL ON TABLE "public"."outfit_recommendation" TO "anon";
GRANT ALL ON TABLE "public"."outfit_recommendation" TO "authenticated";
GRANT ALL ON TABLE "public"."outfit_recommendation" TO "service_role";



GRANT ALL ON TABLE "public"."user" TO "anon";
GRANT ALL ON TABLE "public"."user" TO "authenticated";
GRANT ALL ON TABLE "public"."user" TO "service_role";



GRANT ALL ON TABLE "public"."wardrobe_item" TO "anon";
GRANT ALL ON TABLE "public"."wardrobe_item" TO "authenticated";
GRANT ALL ON TABLE "public"."wardrobe_item" TO "service_role";



GRANT ALL ON TABLE "public"."wear_log" TO "anon";
GRANT ALL ON TABLE "public"."wear_log" TO "authenticated";
GRANT ALL ON TABLE "public"."wear_log" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







