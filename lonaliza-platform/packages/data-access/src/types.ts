export type DataBackendId = "pocketbase" | "postgres";

export type ListOptions = {
  filter?: string;
  sort?: string;
  page?: number;
  perPage?: number;
};

export type DataRecord = Record<string, unknown> & { id: string };

export interface DataBackend {
  readonly id: DataBackendId;
  getOne(collection: string, id: string): Promise<DataRecord | null>;
  getList(collection: string, options?: ListOptions): Promise<DataRecord[]>;
  create(collection: string, body: Record<string, unknown>): Promise<DataRecord>;
  update(collection: string, id: string, body: Record<string, unknown>): Promise<DataRecord>;
  delete(collection: string, id: string): Promise<void>;
}
