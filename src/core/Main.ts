import { TinyDB } from "./TinyDB";

const exportGlobalObject = function(indexedDB:any){
  window.tinyDB = indexedDB
}
exportGlobalObject(TinyDB)