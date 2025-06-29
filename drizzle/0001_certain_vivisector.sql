ALTER TABLE "advocates" ADD COLUMN "search_vector" "tsvector" GENERATED ALWAYS AS ((
          setweight(
            to_tsvector('english', "advocates"."first_name" || ' ' || "advocates"."last_name"), 
            'A'
          ) ||
          setweight(
            to_tsvector('english', "advocates"."payload"), 
            'B'
          ) ||
          setweight(
            to_tsvector('english', "advocates"."degree"), 
            'B'
          ) ||
          setweight(
            to_tsvector('english', "advocates"."city"), 
            'C'
          ) ||
          setweight(
            to_tsvector('english', "advocates"."years_of_experience"::text), 
            'D'
          )
        )) STORED NOT NULL;--> statement-breakpoint
CREATE INDEX "ft_advocates_search_vector_idx" ON "advocates" USING gin ("search_vector");