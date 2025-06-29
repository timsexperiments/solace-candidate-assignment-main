import db from "../../../db";
import { advocates } from "../../../db/schema";

export async function GET() {
  // Uncomment this line to use a database
  const { rows: data, error } = await db
    .select()
    .from(advocates)
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
