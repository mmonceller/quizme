type Param = string | number | null | ArrayBuffer | Uint8Array;

/** Thin async wrapper over D1 with the same get/all/run shape the routes use. */
export class Db {
  constructor(private readonly d1: D1Database) {}

  stmt(sql: string, ...params: Param[]): D1PreparedStatement {
    return this.d1.prepare(sql).bind(...params);
  }

  async get<T>(sql: string, ...params: Param[]): Promise<T | undefined> {
    return (await this.stmt(sql, ...params).first<T>()) ?? undefined;
  }

  async all<T>(sql: string, ...params: Param[]): Promise<T[]> {
    return (await this.stmt(sql, ...params).all<T>()).results;
  }

  async run(sql: string, ...params: Param[]) {
    return this.stmt(sql, ...params).run();
  }

  /** Runs the statements atomically: all of them apply or none do. */
  async batch(statements: D1PreparedStatement[]) {
    return this.d1.batch(statements);
  }
}
