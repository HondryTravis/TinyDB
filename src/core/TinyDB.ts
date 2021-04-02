import Table from "./Table";
import { ITinyDB } from "./types/index";


const win = (typeof window == "undefined" ? global : window);

const IN_DB = win.indexedDB

export default class TinyDB {
  private dbName: string;
  private version: number;
  private db: IDBDatabase
  static of() {
    return new TinyDB
  }
  constructor() { }
  setup(options: ITinyDB.IDatabase) {
    const { dbName } = options
    this.dbName = dbName
    return this;
  }
  getVersion() {
    return this.version ? this.version : 1
  }
  setVersion(version: number) {
    this.version = version
    return this
  }
  upgrade(db: IDBDatabase, options: ITinyDB.ITableConfig[]) {
    this.setVersion(db.version)
    this.db = db

    for (const table of options) {
      if (!db.objectStoreNames.contains(table.name)) {
        const store = db.createObjectStore(table.name, {
          keyPath: table.primaryKey,
          autoIncrement: table.autoIncrement ? true : false
        })
        if (table.indexs && table.indexs.length !== 0) {
          for (const index of table.indexs) {
            this.createIndex(store, {
              index: index.index,
              relativeIndex: index.relativeIndex,
              unique: index.unique
            })
          }
        }
      }
    }
  }
  createIndex(db: IDBObjectStore, options: ITinyDB.IIndex) {
    db.createIndex(options.index, options.relativeIndex, { unique: options.unique })
  }
  createTable(options: ITinyDB.ITableConfig[] = undefined) {
    const { dbName } = this

    if (options === undefined) {
      return console.error('database table config must a list')
    }

    const request = IN_DB.open(dbName, this.getVersion())

    const unlisten = () => {
      request.removeEventListener('upgradeneeded', upgrade);
    };

    const upgrade = () => {
      this.upgrade(request.result, options)
      unlisten()
    }

    request.addEventListener('upgradeneeded', upgrade)

    const promise = new Promise((resolve, reject) => {
      this.connect(request).then(db => {
        const versionChange = (evt: IDBVersionChangeEvent) => {
          db.close()
          db.removeEventListener('versionchange', versionChange)
        }
        db.addEventListener('versionchange', versionChange)
      })
    })
    return promise
  }
  deleteDatabase(name: string) {
   
    const request = IN_DB.deleteDatabase(name)
    const promise = new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const msg: ITinyDB.IState = {
          msg: 'Database deleted successfully',
          status: true
        }
        resolve(msg)
      }
      request.onerror = () => {
        
        const msg: ITinyDB.IState = {
          msg: 'Database deleted failed',
          status: true,
          activedRequest: request
        }
        reject(msg)
      }
    })
    return promise
  }
  connect<T>(request: IDBRequest<T>, options?: ITinyDB.IRequestCallback): Promise<T> {

    const promise = new Promise<T>((resolve, reject) => {

      const unlisten = () => {
        request.removeEventListener('success', success);
        request.removeEventListener('error', error);
      };

      const success = () => {
        if (options && options.successfully) {
          options.successfully(request)
        }
        resolve(request.result);
        unlisten()
      }
      const blocked = () => {
        if (options && options.blocked) {
          options.blocked(request)
        }
      }

      const error = () => {
        if (options && options.error) {
          options.error(request)
        }

        reject(request.error);
        unlisten()
      }
      request.addEventListener('success', success)
      request.addEventListener('error', error)
      request.addEventListener('blocked', blocked)
    })

    return promise
  }
  insert(table_name: string, record: any) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.insert(record).then(res => resolve(res)).catch((err) => reject(err))
      })
    })
    return promise
  }
  updateRecord(table_name: string, options: ITinyDB.IGetIndex, record: any) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.update(options, record).then(res => resolve(res)).catch((err) => reject(err))
      })
    })
    return promise
  }
  getAll(table_name: string) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.getAll().then(res => resolve(res)).catch((err) => reject(err))
      })
    })
    return promise
  }
  getByPrimaryKey(table_name: string, key: ITinyDB.IValidateKey) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.getByPrimaryKey(key).then(res => resolve(res)).catch((err) => reject(err))
      })
    })
    return promise
  }
  getByIndex(table_name: string, options: ITinyDB.IGetIndex) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.getByIndex(options).then(res => resolve(res)).catch((err) => reject(err))
      })
    })
    return promise
  }
  deleteRecord(table_name: string, options: ITinyDB.IGetIndex) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.deleteRecord(options).then(res => resolve(res)).catch((err) => reject(err))
      })
    })
    return promise
  }
  deleteTable(tableName: string){
    const promise = new Promise((resolve, reject)=> {
      const conn_request = IN_DB.open(this.dbName, this.getVersion())
      conn_request.onupgradeneeded = (evt: IDBVersionChangeEvent) => {
        const db = conn_request.result;

        this.db = db
        this.setVersion(db.version)

        if(evt.oldVersion < this.getVersion()){
          db.deleteObjectStore(tableName)
        }
      }
      conn_request.onsuccess = () => {
        resolve({
          msg:' deleted table successfully!'
        })
      }
      conn_request.onerror = () => {
        reject({
          msg:' deleted table failed!'
        })
      }
    })
    
    return promise
  }
  some(table_name: string, options: ITinyDB.ISomeOptions) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.some(options).then(res => resolve(res)).catch((err) => reject(err))
      })
    })
    return promise
  }
  clearTableRecord(table_name: string) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.clear().then(res => resolve(res)).catch((err) => reject(err))
      })
    })
    return promise
  }
  getDataWithLimits(table_name: string, options: ITinyDB.ILimt) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.limit(options).then(res => resolve(res)).catch((err) => reject(err))
      })
    })
    return promise
  }
}

