import { ilike, or, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(req: NextRequest) {
  const searchTerm = req.nextUrl.searchParams.get("search") || "";
  console.log("Search term:", searchTerm);

  const { rows: data, error } = await db
    .select()
    .from(advocates)
    .where(
      or(
        ilike(advocates.firstName, `%${searchTerm}%`),
        ilike(advocates.lastName, `%${searchTerm}%`),
        ilike(advocates.city, `%${searchTerm}%`),
        ilike(advocates.degree, `%${searchTerm}%`),
        sql`(${advocates.specialties}::text ILIKE ${`%${searchTerm}%`})`,
        sql`(${advocates.yearsOfExperience}::text ILIKE ${`%${searchTerm}%`})`,
      ),
    )
    .limit(100)
    .then((rows) => ({ rows, error: null }) as const)
    .catch((error: Error) => ({ rows: null, error }) as const);
  if (error) {
    console.error("Error fetching advocates:", error);
    return Response.json(
      { error: "Failed to fetch advocates" },
      { status: 500 },
    );
  }

  return Response.json({ data });
}
