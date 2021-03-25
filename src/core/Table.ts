import { ITinyDB } from "./types/index";

// 操作 table 使用
export default class Table {
  static of(option: ITinyDB.IInvokeTable) {
    return new Table(option)
  }
  private name: string
  private db: IDBDatabase | undefined;
  private mode: ITinyDB.IOperateMode = 'readwrite'
  constructor(option: ITinyDB.IInvokeTable) {
    const { name, db } = option
    this.name = name
    this.db = db
  }
  setMode(mode: ITinyDB.IOperateMode) {
    this.mode = mode
    return this
  }
  getMode() {
    return this.mode
  }
  // create transaction 
  transaction(name: string) {
    const transaction = this.db.transaction([name], this.getMode())
    return transaction
  }
  // open or conntect this table 
  requestStore() {
    const { name } = this
    return this.transaction(name).objectStore(name)
  }
  insert(record: any) {
    const promise = new Promise((resolve, reject) => {
      const addRequest = this.requestStore().add(record)
      const unlisten = () => {
        addRequest.removeEventListener('success', success)
        addRequest.removeEventListener('error', error)
      }
      const success = () => {
        resolve({
          msg: 'add one record successfully!',
          status: true,
          // activedRequest: addRequest
        })
        unlisten()
      }
      const error = () => {
        reject({
          msg: 'add one record failed!',
          status: false,
          activedRequest: addRequest
        })
      }
      addRequest.addEventListener('success', success)
      addRequest.addEventListener('error', error)
    })
    return promise
  }
  update(option: ITinyDB.IGetIndex, record: any) {
    const promise = new Promise((resolve, reject) => {
      const { index, value } = option
      this.getByIndex(option).then((result: any[]) => {
        if (!result.length) {
          console.warn('not found this record')
          return false
        }
        for (const item of result) {
          const store = this.requestStore()
          const newRecord = {
            ...item,
            ...record
          }
          const updateRequest = store.put(newRecord)
          updateRequest.onsuccess = () => {
            resolve({
              msg: 'update successfully!',
              status: true,
            })
          }
          updateRequest.onerror = () => {
            reject({
              msg: 'update failed!',
              status: false,
              activedRequest: updateRequest
            })
          }
        }
      })
    })
    return promise
  }
  getByPrimaryKey(primaryKey: ITinyDB.IValidateKey) {
    return new Promise((resolve, reject) => {
      const getRequest = this.requestStore().get(primaryKey)
      getRequest.onsuccess = () => {
        resolve(getRequest.result)
      }
      getRequest.onerror = () => {
        reject({
          msg: 'not found this primary key!',
          status: false,
          activedRequest: getRequest
        })
      }
    })
  }
  getByIndex(option: ITinyDB.IGetIndex) {

    if(!option || !option.value) {
      return Promise.reject({
        msg: 'must have one index!',
      })
    }
    const { index, value } = option
    return new Promise((resolve, reject) => {
      const getRequest = this.requestStore().index(index).getAll(value)
      getRequest.onsuccess = () => {
        if(getRequest.result.length) {
          resolve(getRequest.result)
        } else {
          console.warn('not find record!')
          resolve([])
        }
      }
      getRequest.onerror = () => {
        reject({
          msg: 'not found this index!',
          status: false,
          activedRequest: getRequest
        })
      }
    })
  }
  getAll() {
    return new Promise((resolve, reject) => {
      const getRequest = this.requestStore().getAll()
      getRequest.onsuccess = () => {
        resolve(getRequest.result)
      }
      getRequest.onerror = () => {
        reject(getRequest.result)
      }
    })
  }
  some(option: ITinyDB.ISomeOptions) {
    const { index, lower, upper } = option
    return new Promise((resolve, reject) => {
      const cache: any = [];
      const cursor = this.requestStore().index(index);
      const range = IDBKeyRange.bound(lower, upper)
      const rangeRequest = cursor.openCursor(range)
      rangeRequest.onsuccess = () => {
        const result = rangeRequest.result;
        if (result) {
          cache.push(result.value)
          result.continue()
        } else {
          resolve(cache)
        }
      }
      rangeRequest.onerror = () => {
        reject(rangeRequest.error)
      }
    })
  }
  deleteRecord(option: ITinyDB.IGetIndex){
    return new Promise((resolve, reject) => {
      this.getByIndex(option).then((data: any[]) => {

        if (!data.length) {
          console.warn('not find this record')
          return false
        }

        for (const item of data) {
          const store = this.requestStore()
          const { keyPath } = store
          const deleteRequest = store.delete(item[keyPath as string])
          deleteRequest.onsuccess = () => {
            resolve({
              msg: 'delete successfully!',
              status: true
            })
          }
          deleteRequest.onerror = () => {
            reject({
              msg: 'delete failed!',
              status: false
            })
          }
        }
      })
    })
  }
  clear() {
    return new Promise((resolve, reject) => {
      const clearRequest = this.requestStore().clear()
      clearRequest.onsuccess = () => {
        resolve({
          msg: 'clear successfully!',
          status: true
        })
      }
      clearRequest.onerror = () => {
        reject({
          msg: 'clear failed!',
          status: false,
          activedRequest: clearRequest
        })
      }
    })
  }
  destroyed() {
    this.db = undefined
    this.name = ''
  }
}