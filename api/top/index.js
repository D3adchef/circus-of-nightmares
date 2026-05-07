import { TableClient } from "@azure/data-tables";
const TABLE = process.env.TABLE_NAME || "leaderboard";

export default async function (context, req) {
  try {
    const conn = process.env.STORAGE_CONNECTION;
    if (!conn) return (context.res = { status: 500, body: { message: "Storage not configured" } });

    const client = TableClient.fromConnectionString(conn, TABLE);
    try { await client.createTable(); } catch {}

    const items = [];
    for await (const e of client.listEntities({ queryOptions: { filter: `PartitionKey eq 'global'` } })) {
      items.push({
        name: e.name,
        score: Number(e.score || 0),
        level: e.level ?? null,
        timeSec: e.timeSec != null ? Number(e.timeSec) : null,        // NEW
        findsFound: e.findsFound != null ? Number(e.findsFound) : null,
        findsTotal: e.findsTotal != null ? Number(e.findsTotal) : null,
        ts: e.ts
      });
    }

    // sort: score desc → shorter time → more finds → newest
    items.sort((a, b) =>
      (b.score - a.score) ||
      ((a.timeSec ?? 1e9) - (b.timeSec ?? 1e9)) ||
      ((b.findsFound ?? 0) - (a.findsFound ?? 0)) ||
      (a.ts > b.ts ? -1 : 1)
    );

    context.res = { status: 200, body: { scores: items.slice(0, 10) } };
  } catch (e) {
    context.log(e);
    context.res = { status: 500, body: { message: "Top fetch error" } };
  }
}
