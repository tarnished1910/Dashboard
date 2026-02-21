type SqlRow = Record<string, unknown>;

type NeonModule = {
  neon: (connectionString: string) => (
    strings: TemplateStringsArray,
    ...params: unknown[]
  ) => Promise<SqlRow[]>;
};

export type DashboardHealth = {
  readOk: boolean;
  writeOk: boolean;
  tables: string[];
  missingTables: string[];
  errorMessage?: string;
};

const expectedTables = [
  'guild_settings',
  'custom_commands',
  'tickets',
  'audit_logs',
  'guild_members',
  'info_topics',
  'votes',
  'triggers',
];

function getDatabaseUrl() {
  return import.meta.env.VITE_DATABASE_URL || import.meta.env.DATABASE_URL;
}

async function getNeonSql(databaseUrl: string) {
  const neonModule = (await import(
    /* @vite-ignore */ 'https://esm.sh/@neondatabase/serverless@1.0.1'
  )) as NeonModule;
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
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return {
      readOk: false,
      writeOk: false,
      tables: [],
      missingTables: expectedTables,
      errorMessage:
        'Missing database URL. Set VITE_DATABASE_URL (recommended) or DATABASE_URL before running the dashboard.',
    };
  }

  try {
    const sql = await getNeonSql(databaseUrl);

    const tableRows = (await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `) as SqlRow[];

    const tables = tableRows
      .map((row) => String(row.table_name ?? ''))
      .filter(Boolean);

    const missingTables = expectedTables.filter((table) => !tables.includes(table));

    const readRows = (await sql`SELECT NOW() AS current_time`) as SqlRow[];
    const readOk = readRows.length === 1;

    await sql`CREATE TEMP TABLE IF NOT EXISTS dashboard_write_test (id integer)`;
    await sql`INSERT INTO dashboard_write_test (id) VALUES (1)`;
    await sql`DELETE FROM dashboard_write_test WHERE id = 1`;

    return {
      readOk,
      writeOk: true,
      tables,
      missingTables,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown NeonDB error';
    return {
      readOk: false,
      writeOk: false,
      tables: [],
      missingTables: expectedTables,
      errorMessage: message,
    };
  }
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
