import { TableClient } from "@azure/data-tables";
const TABLE = process.env.TABLE_NAME || "leaderboard";

export default async function (context, req) {
  try {
    const b = req.body || {};
    const name = String(b.name || "").trim().slice(0, 24);
    const score = Number.isFinite(b.score) ? Math.floor(b.score) : NaN;
    const level = Number.isFinite(b.level) ? Math.floor(b.level) : null;

    // NEW fields (optional)
    let timeSec = Number.isFinite(b.timeSec) ? Math.floor(b.timeSec) : null;
    let findsFound = Number.isFinite(b.findsFound) ? Math.floor(b.findsFound) : null;
    let findsTotal = Number.isFinite(b.findsTotal) ? Math.floor(b.findsTotal) : null;

    if (!name || name.length < 2) return (context.res = { status: 400, body: { message: "Invalid name" } });
    if (!Number.isFinite(score) || score < 0 || score > 1_000_000) return (context.res = { status: 400, body: { message: "Invalid score" } });

    // sanitize ranges
    if (timeSec != null)  timeSec  = Math.max(0, Math.min(timeSec, 7200));           // ≤2h
    if (findsFound != null) findsFound = Math.max(0, Math.min(findsFound, 999));
    if (findsTotal != null) findsTotal = Math.max(0, Math.min(findsTotal, 999));

    const conn = process.env.STORAGE_CONNECTION;
    if (!conn) return (context.res = { status: 500, body: { message: "Storage not configured" } });

    const client = TableClient.fromConnectionString(conn, TABLE);
    try { await client.createTable(); } catch {}

    await client.createEntity({
      partitionKey: "global",
      rowKey: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      score: Number(score),
      level: level ?? undefined,
      timeSec: timeSec ?? undefined,              // NEW
      findsFound: findsFound ?? undefined,        // NEW
      findsTotal: findsTotal ?? undefined,        // NEW
      ts: new Date().toISOString()
    });

    context.res = { status: 200, body: { ok: true } };
  } catch (e) {
    context.log(e);
    context.res = { status: 500, body: { message: "Score submit error" } };
  }
}
