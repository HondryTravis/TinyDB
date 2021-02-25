
export interface Database {
  databaseName: string
  tables: Array<DatabaseTable>
  version?: number
}

export interface DatabaseTable {
  name: string
  keyPath: string
  autoIncrement: boolean
  indexs: Array<RuleIndex>
}

export interface RuleIndex{
  index: string
  relativeIndex: string
  unique: boolean
}

export interface TinyDBRule {
  db: IDBDatabase
  name: string 
  version: number
  table: IDBObjectStore
  tables: Array<DatabaseTable>
  connect(): Promise<IDBDatabase> 
}

export interface TableFn {
  select<T>(): Promise<T>
  update<T>(): Promise<T> 
  insert<T>(): Promise<T> 
  delete<T>(): Promise<T> 
}