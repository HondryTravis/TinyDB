declare interface Window {
  TinyDB: any;
  mozIndexedDB: IDBFactory;
  webkitIndexedDB: IDBFactory;
  msIndexedDB: IDBFactory;
}

declare interface IDBFactory {
  databases<T>(): Promise<T>
}