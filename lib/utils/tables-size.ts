import { sql } from "drizzle-orm";
import { db } from "../config/drizzle";
import { safeAction } from "./safe-action";

const calculateTableSizes = safeAction.action(async ({ ctx: { userId } }) => {
  const sizeQuery = sql`
    SELECT SUM(total_size) as total_bytes
    FROM (
      SELECT pg_column_size(p.*) as total_size
      FROM posts p
      WHERE p.user_id = ${userId}
      UNION ALL
      SELECT pg_column_size(c.*) as total_size
      FROM comments c
      WHERE c.user_id = ${userId}
      UNION ALL
      SELECT pg_column_size(e.*) as total_size
      FROM embeddings e
      WHERE e.user_id = ${userId}
    ) as user_data;
  `;

  try {
    const result = await db.execute(sizeQuery);
    let totalSize = result.rows.reduce(
      (acc, row) => acc + Number(row.total_bytes),
      0
    );
    return {
      totalSizeInBytes: totalSize,
    };
  } catch (error) {
    console.error("Error calculating user table sizes:", error);
    throw error;
  }
});

export { calculateTableSizes };
