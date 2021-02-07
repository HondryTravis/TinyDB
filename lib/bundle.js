(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var TinyDB_1 = require("./TinyDB");
var exportGlobalObject = function exportGlobalObject(indexedDB) {
    window.TinyDB = indexedDB;
};
exportGlobalObject(TinyDB_1.TinyDB);

},{"./TinyDB":3}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.Table = void 0;
var Table = /** @class */function () {
    function Table(name, db) {
        this.name = name;
        this.db = db;
    }
    // create transaction 
    Table.prototype.transaction = function (mode) {
        if (mode === void 0) {
            mode = true;
        }
        return this.db.transaction([this.name], mode === true ? 'readwrite' : 'readonly');
    };
    // open or conntect this table 
    Table.prototype.request = function () {
        return this.transaction().objectStore(this.name);
    };
    // get
    Table.prototype.select = function (selector) {
        var _this = this;
        console.log(1);
        var index;
        var indexValue;
        for (var name_1 in selector) {
            index = name_1;
            indexValue = selector[name_1];
        }
        return new Promise(function (resolve, reject) {
            var selectRequest = _this.request().index(index).getAll(indexValue);
            selectRequest.onsuccess = function (e) {
                resolve(e.target.result);
            };
            selectRequest.onerror = function (e) {
                reject(e.target.result);
            };
        });
    };
    Table.prototype.selectId = function (id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var selectRequest = _this.request().get(id);
            selectRequest.onsuccess = function (e) {
                resolve(e.target.result);
            };
            selectRequest.onerror = function (e) {
                reject(e.target.result);
            };
        });
    };
    Table.prototype.selectAll = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var selectRequest = _this.request().getAll();
            selectRequest.onsuccess = function (e) {
                resolve(e.target.result);
            };
            selectRequest.onerror = function (e) {
                reject(e.target.result);
            };
        });
    };
    // some 
    Table.prototype.some = function (index, start, end) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var temp = [];
            var cursor = _this.request().index(index);
            var range = IDBKeyRange.bound(start, end);
            cursor.openCursor(range).onsuccess = function (ev) {
                var res = ev.target.result;
                if (res) {
                    temp.push(res.value);
                    res.continue();
                } else {
                    console.log('数据抽取结束');
                    resolve(temp);
                }
            };
            cursor.openCursor(range).onerror = function (ev) {
                reject(ev);
            };
        });
    };
    // put 
    Table.prototype.update = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var updateRequest = _this.request().put(data);
            updateRequest.onsuccess = function (e) {
                resolve(e);
            };
            updateRequest.onerror = function (e) {
                reject(e);
            };
        });
    };
    // add 
    Table.prototype.insert = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var addRequest = _this.request().add(data);
            addRequest.onsuccess = function (e) {
                resolve(e);
            };
            addRequest.onerror = function (e) {
                reject(e);
            };
        });
    };
    // get -> delete
    Table.prototype.delete = function (selector) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.select(selector).then(function (res) {
                if (res.length) {
                    res.forEach(function (item, index, arr) {
                        var request = _this.request();
                        var keyPath = request.keyPath;
                        var deleteRequest = request.delete(item[keyPath]);
                        deleteRequest.onsuccess = function (e) {
                            if (index === arr.length - 1) {
                                resolve(e);
                            }
                        };
                        deleteRequest.onerror = function (e) {
                            reject(e);
                        };
                    });
                }
            });
        });
    };
    Table.prototype.clear = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var deleteRequest = _this.request().clear();
            deleteRequest.onsuccess = function (e) {
                resolve(e);
            };
            deleteRequest.onerror = function (e) {
                reject(e);
            };
        });
    };
    return Table;
}();
exports.Table = Table;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TinyDB = void 0;
var Table_1 = require("./Table");
var TinyDB = /** @class */function () {
    function TinyDB(config) {
        var databaseName = config.databaseName,
            tables = config.tables;
        this.name = databaseName;
        this.tables = tables;
        this.createTable(this.tables);
    }
    TinyDB.prototype.createDateBase = function (name, version) {
        if (version === void 0) {
            version = 1;
        }
        var indb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        this.openedDB = indb.open(name, version);
    };
    TinyDB.prototype.createTable = function (tables, version) {
        var _this = this;
        if (version === void 0) {
            version = 1;
        }
        console.log('version create:', version);
        var indb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        var conn_request = indb.open(this.name, version);
        conn_request.onupgradeneeded = function (ev) {
            var db = ev.target.result;
            tables.forEach(function (table) {
                var hadTableNames = Array.from(db.objectStoreNames);
                if (!hadTableNames.includes(table.name)) {
                    var table_info_1 = db.createObjectStore(table.name, { keyPath: table.keyPath, autoIncrement: table.autoIncrement });
                    table.indexs.forEach(function (item) {
                        _this.createIndex(table_info_1, item);
                    });
                }
            });
        };
    };
    TinyDB.prototype.deleteTable = function (tableName, version) {
        var indb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.indexedDB;
        console.log('version delete:', version);
        var conn_request = indb.open(this.name, version);
        conn_request.onupgradeneeded = function (ev) {
            var db = ev.target.result;
            if (ev.oldVersion < version) {
                console.log('我要删除表');
                db.deleteObjectStore(tableName);
            }
        };
    };
    // create index 
    TinyDB.prototype.createIndex = function (table, option) {
        table.createIndex(option.index, option.relativeIndex, { unique: option.unique });
    };
    TinyDB.prototype.connect = function (name) {
        var _this = this;
        if (name === void 0) {
            name = '';
        }
        return new Promise(function (resolve, reject) {
            var indb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            var conn_request = indb.open(_this.name, _this.version);
            conn_request.onsuccess = function (ev) {
                resolve(ev.target.result);
            };
            conn_request.onerror = function (ev) {
                reject(ev);
            };
        });
    };
    TinyDB.prototype.close = function () {
        this.connect().then(function (db) {
            db.close();
        });
    };
    TinyDB.prototype.insert = function (name, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table_1.Table(name, db);
                table.insert(data).then(function (res) {
                    resolve(res);
                }).catch(function (error) {
                    reject(error);
                });
            });
        });
    };
    TinyDB.prototype.select = function (name, selecter) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table_1.Table(name, db);
                table.select(selecter).then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        });
    };
    TinyDB.prototype.selectId = function (name, id) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table_1.Table(name, db);
                table.selectId(id).then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        });
    };
    TinyDB.prototype.some = function (name, index, startIndex, endIndex) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table_1.Table(name, db);
                table.some(index, startIndex, endIndex).then(function (res) {
                    resolve(res);
                }).catch(function (error) {
                    reject(error);
                });
            });
        });
    };
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
    TinyDB.prototype.update = function (name, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table_1.Table(name, db);
                table.update(data).then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        });
    };
    TinyDB.prototype.delete = function (name, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table_1.Table(name, db);
                table.delete(data).then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        });
    };
    TinyDB.prototype.selectAll = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table_1.Table(name, db);
                table.selectAll().then(function (res) {
                    resolve(res);
                }).catch(function (err) {
                    reject(err);
                });
            });
        });
    };
    TinyDB.prototype.clearTable = function (name) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table_1.Table(name, db);
                table.clear().then(function (res) {
                    resolve(res);
                }).catch(function (error) {
                    reject(error);
                });
            });
        });
    };
    return TinyDB;
}();
exports.TinyDB = TinyDB;

},{"./Table":2}]},{},[1])

//# sourceMappingURL=bundle.js.map
