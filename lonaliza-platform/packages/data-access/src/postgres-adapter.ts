import pg from "pg";
import type { DataBackend, DataRecord, ListOptions } from "./types.js";

const IDENT = /^[a-z][a-z0-9_]{0,62}$/;

function assertIdent(name: string): string {
  if (!IDENT.test(name)) throw new Error(`invalid_ident:${name}`);
  return name;
}

export class PostgresAdapter implements DataBackend {
  readonly id = "postgres" as const;
  private pool: pg.Pool | null = null;

  private getPool(): pg.Pool {
    if (this.pool) return this.pool;
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
    if (!connectionString) throw new Error("postgres_not_configured");
    this.pool = new pg.Pool({ connectionString, max: 20 });
    return this.pool;
  }

  async getOne(collection: string, id: string): Promise<DataRecord | null> {
    const table = assertIdent(collection);
    const pool = this.getPool();
    const result = await pool.query(`SELECT * FROM ${table} WHERE id = $1 LIMIT 1`, [id]);
    return (result.rows[0] as DataRecord) || null;
  }

  async getList(collection: string, options: ListOptions = {}): Promise<DataRecord[]> {
    const table = assertIdent(collection);
    const pool = this.getPool();
    const perPage = Math.min(200, options.perPage || 50);
    const page = Math.max(1, options.page || 1);
    const offset = (page - 1) * perPage;
    const sort = options.sort && IDENT.test(options.sort.split(" ")[0] || "")
      ? options.sort
      : "created DESC";
    const result = await pool.query(
      `SELECT * FROM ${table} ORDER BY ${sort} LIMIT $1 OFFSET $2`,
      [perPage, offset]
    );
    return result.rows as DataRecord[];
  }

  async create(collection: string, body: Record<string, unknown>): Promise<DataRecord> {
    const table = assertIdent(collection);
    const pool = this.getPool();
    const keys = Object.keys(body).filter((k) => IDENT.test(k));
    const cols = keys.join(", ");
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");
    const values = keys.map((k) => body[k]);
    const result = await pool.query(
      `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return result.rows[0] as DataRecord;
  }

  async update(collection: string, id: string, body: Record<string, unknown>): Promise<DataRecord> {
    const table = assertIdent(collection);
    const pool = this.getPool();
    const keys = Object.keys(body).filter((k) => IDENT.test(k) && k !== "id");
    if (!keys.length) return (await this.getOne(collection, id)) as DataRecord;
    const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(", ");
    const values = [id, ...keys.map((k) => body[k])];
    const result = await pool.query(
      `UPDATE ${table} SET ${sets} WHERE id = $1 RETURNING *`,
      values
    );
    return result.rows[0] as DataRecord;
  }

  async delete(collection: string, id: string): Promise<void> {
    const table = assertIdent(collection);
    const pool = this.getPool();
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  }
}
