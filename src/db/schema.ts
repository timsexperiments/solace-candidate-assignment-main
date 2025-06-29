import { SQL, sql } from "drizzle-orm";
import {
  bigint,
  customType,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

// Taken from: https://orm.drizzle.team/docs/guides/full-text-search-with-generated-columns
export const tsvector = customType<{
  data: string;
}>({
  dataType() {
    return `tsvector`;
  },
});

const advocates = pgTable(
  "advocates",
  {
    id: serial("id").primaryKey(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    city: text("city").notNull(),
    degree: text("degree").notNull(),
    specialties: jsonb("payload").default([]).notNull().$type<string[]>(),
    yearsOfExperience: integer("years_of_experience").notNull(),
    phoneNumber: bigint("phone_number", { mode: "number" }).notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    searchVector: tsvector("search_vector")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`(
          setweight(
            to_tsvector('english', ${advocates.firstName} || ' ' || ${advocates.lastName}), 
            'A'
          ) ||
          setweight(
            to_tsvector('english', ${advocates.specialties}), 
            'B'
          ) ||
          setweight(
            to_tsvector('english', ${advocates.degree}), 
            'B'
          ) ||
          setweight(
            to_tsvector('english', ${advocates.city}), 
            'C'
          ) ||
          setweight(
            to_tsvector('english', ${advocates.yearsOfExperience}::text), 
            'D'
          )
        )`,
      ),
  },
  (table) => [
    index("ft_advocates_search_vector_idx").using("gin", table.searchVector),
  ],
);

export type Advocate = typeof advocates.$inferSelect;

export { advocates };
