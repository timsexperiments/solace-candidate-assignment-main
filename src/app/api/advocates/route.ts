import { desc, sql } from "drizzle-orm";
import { NextRequest } from "next/server";
import db from "../../../db";
import { Advocate, advocates } from "../../../db/schema";

export type PageInfo = {
  nextPage?: number;
  totalItems?: number;
  pageSize: number;
  totalPages: number;
};

export type ApiResponse<T> = {
  data: T;
  pageInfo: PageInfo;
};

const DEFAULT_PAGE_SIZE = 10;

export async function GET(req: NextRequest) {
  const searchTerm = req.nextUrl.searchParams.get("search")?.trim() || "";
  const pageSize = Math.max(
    parseInt(req.nextUrl.searchParams.get("size") || `${DEFAULT_PAGE_SIZE}`),
    1,
  );
  const pageNumber = Math.max(
    parseInt(req.nextUrl.searchParams.get("page") || "1"),
    1,
  );
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
      searchVector: advocates.searchVector,
      rank: searchQuery
        ? sql<number>`ts_rank(${advocates.searchVector}, to_tsquery('english', ${searchQuery}))`
        : sql<number>`0`,
      totalResults: sql<number>`count(*) over()`,
    })
    .from(advocates)
    .where(
      searchQuery
        ? sql`${advocates.searchVector} @@ to_tsquery('english', ${searchQuery})`
        : sql`true`,
    )
    .offset((pageNumber - 1) * pageSize)
    .limit(pageSize)
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

  const totalItems = data[0]?.totalResults || data.length;
  return Response.json({
    data: data,
    pageInfo: {
      nextPage: totalItems > pageSize * pageNumber ? pageNumber + 1 : undefined,
      totalItems,
      pageSize: pageSize,
      totalPages: Math.ceil((data[0]?.totalResults || 0) / pageSize),
    },
  } satisfies ApiResponse<Advocate[]>);
}
