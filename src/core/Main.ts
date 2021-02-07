import { TinyDB } from "./TinyDB";


const exportGlobalObject = function(indexedDB:any){
  window.TinyDB = indexedDB
}
exportGlobalObject(TinyDB)