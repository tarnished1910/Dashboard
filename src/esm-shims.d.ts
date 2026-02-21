declare module 'https://esm.sh/@neondatabase/serverless@1.0.1' {
  export function neon(connectionString: string): (
    strings: TemplateStringsArray,
    ...params: unknown[]
  ) => Promise<Record<string, unknown>[]>;
}
