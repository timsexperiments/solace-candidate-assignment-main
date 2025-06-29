import { desc, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET(req: NextRequest) {
  const searchTerm = req.nextUrl.searchParams.get("search")?.trim() || "";
  const searchQuery = searchTerm
    .trim()
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word + ":*")
    .join(" & ");

  const { rows: data, error } = await db
    .select({
      id: advocates.id,
      firstName: advocates.firstName,
      lastName: advocates.lastName,
      city: advocates.city,
      degree: advocates.degree,
      specialties: advocates.specialties,
      yearsOfExperience: advocates.yearsOfExperience,
      phoneNumber: advocates.phoneNumber,
      createdAt: advocates.createdAt,
      rank: searchQuery
        ? sql<number>`ts_rank(${advocates.searchVector}, to_tsquery('english', ${searchQuery}))`
        : sql<number>`0`,
    })
    .from(advocates)
    .where(
      searchQuery
        ? sql`${advocates.searchVector} @@ to_tsquery('english', ${searchQuery})`
        : sql`true`,
    )
    .limit(100)
    .orderBy((t) => (searchQuery ? desc(t.rank) : desc(t.createdAt)))
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
