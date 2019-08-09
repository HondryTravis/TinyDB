import { DatabaseTable, Database, RuleIndex } from "./types";
import { Table } from './Table'
export class TinyDB {
  openedDB!: IDBOpenDBRequest
  name: string
  version!: number 
  tables: Array<DatabaseTable>
  constructor(config:Database) {
    const { databaseName, tables} = config
    this.name = databaseName
    this.tables = tables
    this.createTable(this.tables)
  }
  createDateBase (name: string, version =1) {
    const indb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    this.openedDB =  indb.open(name, version)
  }
  createTable(tables: Array<DatabaseTable>, version = 1) {  
      console.log('version create:', version)
      const indb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
      const conn_request = indb.open(this.name, version)
      conn_request.onupgradeneeded = (ev:any) => {
        const db = ev.target.result
        tables.forEach( (table: DatabaseTable) => {
          const hadTableNames = Array.from(db.objectStoreNames)
          if(!hadTableNames.includes(table.name)){
            const table_info = db.createObjectStore(table.name,{keyPath: table.keyPath, autoIncrement: table.autoIncrement})
            table.indexs.forEach( item => {
              this.createIndex(table_info, item)
            })
          }
        })
      }
  }
  deleteTable(tableName: string, version: number){
    const indb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.indexedDB
    console.log('version delete:', version)
    const conn_request = indb.open(this.name, version)
    conn_request.onupgradeneeded = (ev:any) => {
      const db = ev.target.result;
      if(ev.oldVersion< version){
        console.log('我要删除表')
        db.deleteObjectStore(tableName)
      }
    }
  }
  // create index 
  createIndex(table: IDBObjectStore ,option: RuleIndex){
    table.createIndex(option.index, option.relativeIndex, { unique: option.unique })
  }
  connect(name: string = '') {
    return new Promise<IDBDatabase>((resolve, reject)=> { 
      const indb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB
      const conn_request = indb.open(this.name, this.version)
      conn_request.onsuccess = (ev:any) => {
        resolve(ev.target.result)
      }
      conn_request.onerror = (ev:any) => {
        reject(ev)
      }
    })
  } 
  close() {
    this.connect().then( (db: IDBDatabase) => {
      db.close()
    })
  }
  insert(name: string, data: any) {
    // return new Promise( (resolve, reject) => {
      this.connect().then( (db: IDBDatabase) => {
        const table = new Table(name, db)
        table.insert(data)
      // })
    })
  }
  select(name: string, selecter: any){
    return new Promise((resolve, reject) => {
      this.connect().then( (db: IDBDatabase) => {
        const table = new Table(name, db)
        table.select(selecter).then((res:any) =>{
          resolve(res)
        }).catch( (err:any) => {
          reject(err)
        })
      })
    })
  }
  selectId(name:string, id:number){
    return new Promise((resolve, reject) => {
      this.connect().then( (db: IDBDatabase) => {
        const table = new Table(name, db)
        table.selectId(id).then((res:any) =>{
          resolve(res)
        }).catch( (err:any) => {
          reject(err)
        })
      })
    })
  }
  // exec(way: string, db: IDBDatabase, name: string,  data: any, resolve:Function,  reject:Function) {
  //   const table = new Table(name, db)
  //   const ways = ['select', 'insert', 'delete', 'update'] 
  //   if(ways.includes(way)){
  //     table[way](data).then((res:any) =>{
  //       resolve(res)
  //     }).catch( (err:any) => {
  //       reject(err)
  //     })
  //   }
  // }
  update(name: string, data: any){
    return new Promise( (resolve, reject) => {
      this.connect().then( (db: IDBDatabase) => {
        const table = new Table(name, db)
        table.update(data).then((res:any) =>{
          resolve(res)
        }).catch( (err:any) => {
          reject(err)
        })
      })
    })
  }
  delete(name: string, data: any) {
    return new Promise( (resolve,reject) => {
      this.connect().then( (db: IDBDatabase) => {
        const table = new Table(name, db)
        table.delete(data).then((res:any) =>{
          resolve(res)
        }).catch( (err:any) => {
          reject(err)
        })
      })
    })
  }
  selectAll(name: string) {
    return new Promise( (resolve,reject) => {
      this.connect().then( (db: IDBDatabase) => {
        const table = new Table(name, db)
        table.selectAll().then((res:any) =>{
          resolve(res)
        }).catch( (err:any) => {
          reject(err)
        })
      })
    })
  }
}
