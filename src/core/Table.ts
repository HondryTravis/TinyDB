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
      const addRequest = this.requestStore().put(record)
      const unlisten = () => {
        addRequest.removeEventListener('success', success)
        addRequest.removeEventListener('error', error)
      }
      const success = () => {
        resolve({
          msg: 'add one record successfully!',
          status: true
        })
        unlisten()
      }
      const error = () => {
        resolve({
          msg: 'add one record failed!',
          status: false
        })
      }
      addRequest.addEventListener('success', success)
      addRequest.addEventListener('error', error)
    })
    return promise
  }
  update(index: ITinyDB.IValidateKey, record: any) {
    const promise = new Promise((resolve, reject) => {
      const getRequest = this.requestStore().get(index);
      getRequest.onsuccess = () => {
        const data = getRequest.result
        const update_data = {
          ...data,
          ...record
        }
        const updateRequest = this.requestStore().put(update_data);
        updateRequest.onsuccess = () => {
          resolve({
            msg: 'update successfully!',
            activedRequest: updateRequest
          })
        }
        updateRequest.onerror = () => {
          reject({
            msg: 'update failed!',
            activedRequest: updateRequest
          })
        }
      }
      getRequest.onerror = () => {
        reject({
          msg: 'get failed!',
          activedRequest: getRequest
        })
      }
    })
    return promise
  }
  getByPrimaryKey(id: ITinyDB.IValidateKey) {
    return new Promise((resolve, reject) => {
      const getRequest = this.requestStore().get(id)
      getRequest.onsuccess = () => {
        resolve(getRequest.result)
      }
      getRequest.onerror = () => {
        reject(getRequest.result)
      }
    })
  }
  getByIndex(option: ITinyDB.IGetIndex) {
    const { index, value } = option
    return new Promise((resolve, reject) => {
      const getRequest = this.requestStore().index(index).getAll(value)
      getRequest.onsuccess = () => {
        resolve(getRequest.result)
      }
      getRequest.onerror = () => {
        reject(getRequest.result)
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
  deleteRecord(option: ITinyDB.IGetIndex) {
    return new Promise((resolve, reject) => {
      this.getByIndex(option).then((data: any[]) => {

        if (!data.length) {
          return console.warn('not find this record')
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
    return new Promise( (resolve, reject) => {
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
          status: false
        })
      }
    })
  }
  destroyed() {
    this.db = undefined
    this.name = ''
  }
}