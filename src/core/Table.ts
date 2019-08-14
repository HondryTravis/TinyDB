export class Table {
  name: string
  db: IDBDatabase
  constructor(name: string, db:IDBDatabase){
    this.name = name
    this.db = db
  }
  // create transaction 
  transaction(mode = true) {
    return this.db.transaction([this.name], mode === true ? 'readwrite' : 'readonly')
  }
  // open or conntect this table 
  request() {
    return this.transaction().objectStore(this.name)
  }
  // get
  select(selector: any){
    console.log(1)
    let index: string
    let indexValue: any
    for(let name in  selector){
      index = name;
      indexValue = selector[name]
    }
    return new Promise((resolve,reject)=>{
      const selectRequest = this.request().index(index).getAll(indexValue)
      selectRequest.onsuccess = (e:any) => {
        resolve(e.target.result)
      }
      selectRequest.onerror = (e:any) => {
        reject(e.target.result)
      }
    })
  }
  selectId(id:number) {
    return new Promise((resolve,reject)=>{
      const selectRequest = this.request().get(id)
      selectRequest.onsuccess = (e:any) => {
        resolve(e.target.result)
      }
      selectRequest.onerror = (e:any) => {
        reject(e.target.result)
      }
    })
  }
  selectAll(){
    return new Promise((resolve,reject)=>{
      const selectRequest = this.request().getAll()
      selectRequest.onsuccess = (e:any) => {
        resolve(e.target.result)
      }
      selectRequest.onerror = (e:any) => {
        reject(e.target.result)
      }
    })
  }
  // some 
  some(index: any, start:any, end:any) {
  return new Promise((resolve, reject) => {
    const temp:any = [];
    const cursor =  this.request().index(index);
    const range = IDBKeyRange.bound(start, end)
    cursor.openCursor(range).onsuccess = (ev:any ) => {
       const res = ev.target.result;
       if(res){
        temp.push(res.value)
        res.continue()
       }else{
         console.log('数据抽取结束')
         resolve(temp)
       }
    }
    cursor.openCursor(range).onerror = (ev: any) => {
      reject(ev)
    }
  })
  }
  // put 
  update(data: any) {
    return new Promise( (resolve, reject) => {
      const updateRequest =  this.request().put(data)
      updateRequest.onsuccess = (e:any) => {
        resolve(e)
      }
      updateRequest.onerror = (e:any) => {
        reject(e)
      }
    })
  }
  // add 
  insert(data: any) {
   
    return new Promise( (resolve, reject) => {
      const addRequest = this.request().add(data)
      addRequest.onsuccess = (e:any) => {
        resolve(e)
      }
      addRequest.onerror = (e:any) => {
        reject(e)
      }
    }) 
  }
  // get -> delete
  delete(selector: any) {
    return new Promise( (resolve, reject) => {
      this.select(selector).then( (res: any) => {
        res.forEach( (item: any) => {
          const deleteRequest = this.request().delete(item.id)
          deleteRequest.onsuccess = (e: any) => {
            resolve(e)
          }
          deleteRequest.onerror = (e: any) => {
            reject(e)
          }
        })
      })
    })
  }
}
