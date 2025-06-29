import db from "../../../db";
import { advocates } from "../../../db/schema";
import { advocateData } from "../../../db/seed/advocates";

export async function POST() {
  const records = [];
  for (let i = 0; i < 70_000; i++) {
    records.push(
      ...(await db.insert(advocates).values(advocateData).returning()),
    );
    console.log(
      `Inserted advocates batch ${i + 1} of 70,000 - ${records.length} records`,
    );
  }

  return Response.json({ advocates: records });
}
