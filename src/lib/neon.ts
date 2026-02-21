const databaseUrl = import.meta.env.VITE_DATABASE_URL;

if (!databaseUrl) {
  throw new Error('Missing VITE_DATABASE_URL environment variable');
}

type SqlRow = Record<string, unknown>;

type DashboardHealth = {
  readOk: boolean;
  writeOk: boolean;
  tables: string[];
};

async function getNeonSql() {
  const neonModule = await import(
    /* @vite-ignore */ 'https://esm.sh/@neondatabase/serverless@1.0.1'
  );

  return neonModule.neon(databaseUrl);
}

export async function runDashboardHealthCheck(): Promise<DashboardHealth> {
  const sql = await getNeonSql();

  const tableRows = (await sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `) as SqlRow[];

  const tables = tableRows
    .map((row) => String(row.table_name ?? ''))
    .filter(Boolean);

  const readRows = (await sql`SELECT NOW() AS current_time`) as SqlRow[];
  const readOk = readRows.length === 1;

  await sql`CREATE TEMP TABLE IF NOT EXISTS dashboard_write_test (id integer)`;
  await sql`INSERT INTO dashboard_write_test (id) VALUES (1)`;
  await sql`TRUNCATE dashboard_write_test`;
  const writeOk = true;

  return {
    readOk,
    writeOk,
    tables,
  };
}
