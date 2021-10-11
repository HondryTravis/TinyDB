
/**
 * @description TinyDB types
 */
export declare namespace ITinyDB {

  export type key_index = string | number
  export type request_callback = undefined | (<T>(request: T, option?: IState) => any)
  export type IOperateMode = 'readonly' | 'readwrite'
  export type IValidateKey = IDBValidKey

  export interface IDatabase {
    dbName: string
    version?: number
  }
  
  export interface ITableConfig {
    name: string
    primaryKey: string
    autoIncrement: boolean
    indexs: Array<IIndex>
  }
  
  export interface IIndex{
    index: string
    relativeIndex: string | string[]
    unique: boolean,
  }
  
  export interface IState {
    status?: boolean
    msg?: string
    activedRequest?: IDBRequest
  }
  export interface IInvokeTable {
    db: IDBDatabase
    name: string
  }
  export interface ISomeOptions {
    index: string
    lower: any
    upper: any
  }

  export interface IGetIndex {
    index: string
    value: any
  }
  export interface ILimt {
    length: number
    start?: number
    range?: IDBKeyRange
    direction?: IDBCursorDirection
  }

  export interface IRequestCallback {
    successfully?: request_callback
    error?: request_callback
    blocked?: request_callback
  }

}
