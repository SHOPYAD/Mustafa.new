import type { DataBackend, DataRecord, ListOptions } from "./types.js";

type PocketBaseLike = {
  collection(name: string): {
    getOne(id: string): Promise<DataRecord>;
    getList(page: number, perPage: number, opts?: { filter?: string; sort?: string }): Promise<{ items: DataRecord[] }>;
    create(body: Record<string, unknown>): Promise<DataRecord>;
    update(id: string, body: Record<string, unknown>): Promise<DataRecord>;
    delete(id: string): Promise<boolean>;
  };
};

export class PocketBaseAdapter implements DataBackend {
  readonly id = "pocketbase" as const;

  constructor(private readonly pb: PocketBaseLike) {}

  async getOne(collection: string, id: string): Promise<DataRecord | null> {
    try {
      return await this.pb.collection(collection).getOne(id);
    } catch {
      return null;
    }
  }

  async getList(collection: string, options: ListOptions = {}): Promise<DataRecord[]> {
    const page = options.page || 1;
    const perPage = options.perPage || 50;
    const result = await this.pb.collection(collection).getList(page, perPage, {
      filter: options.filter,
      sort: options.sort,
    });
    return result.items;
  }

  async create(collection: string, body: Record<string, unknown>): Promise<DataRecord> {
    return this.pb.collection(collection).create(body);
  }

  async update(collection: string, id: string, body: Record<string, unknown>): Promise<DataRecord> {
    return this.pb.collection(collection).update(id, body);
  }

  async delete(collection: string, id: string): Promise<void> {
    await this.pb.collection(collection).delete(id);
  }
}
