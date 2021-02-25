import Table from "./Table";
import { ITinyDB } from "./types/index";


const IN_DB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;

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
  }
  upgrade() {

  }
  createTable(options: ITinyDB.ITableConfig[] = undefined) {
    const { dbName } = this
    const that = this

    if (options === undefined) {
      return console.error('database table config must a list')
    }

    const request = IN_DB.open(dbName, this.getVersion())


    const unlisten = () => {
      request.removeEventListener('upgradeneeded', upgrade);
    };

    const upgrade = () => {
      console.log('upgrade')
      const db = request.result
      for (const table of options) {
        if (!db.objectStoreNames.contains(table.name)) {
          const record = db.createObjectStore(table.name, {
            keyPath: table.keyPath,
            autoIncrement: table.autoIncrement ? true : false
          })
          if (table.indexs && table.indexs.length !== 0) {
            for (const index of table.indexs) {
              record.createIndex(index.index, index.relativeIndex, { unique: index.unique })
            }
          }
        }
      }
      that.setVersion(db.version)
      unlisten()
    }

    request.addEventListener('upgradeneeded', upgrade)

    const promise = new Promise((resolve, reject) => {
      this.connect(request).then(db => {
        const versionChange = (evt: IDBVersionChangeEvent) => {
          console.log('versionchange')
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
        console.log(222)
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
        console.log('connect blocked')
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
  update(table_name: string, index: ITinyDB.IValidateKey, record: any) {
    const promise = new Promise((resolve, reject) => {
      const request = IN_DB.open(this.dbName, this.getVersion())
      this.connect(request).then((db: IDBDatabase) => {
        const operator = Table.of({
          name: table_name,
          db
        })
        operator.update(index, record).then(res => resolve(res)).catch((err) => reject(err))
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
}

