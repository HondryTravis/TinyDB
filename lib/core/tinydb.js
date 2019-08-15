var Table = (function () {
    function Table(name, db) {
        this.name = name;
        this.db = db;
    }
    Table.prototype.transaction = function (mode) {
        if (mode === void 0) { mode = true; }
        return this.db.transaction([this.name], mode === true ? 'readwrite' : 'readonly');
    };
    Table.prototype.request = function () {
        return this.transaction().objectStore(this.name);
    };
    Table.prototype.select = function (selector) {
        var _this = this;
        console.log(1);
        var index;
        var indexValue;
        for (var name in selector) {
            index = name;
            indexValue = selector[name];
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
                }
                else {
                    console.log('数据抽取结束');
                    resolve(temp);
                }
            };
            cursor.openCursor(range).onerror = function (ev) {
                reject(ev);
            };
        });
    };
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
    Table.prototype.delete = function (selector) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.select(selector).then(function (res) {
                res.forEach(function (item) {
                    var deleteRequest = _this.request().delete(item.id);
                    deleteRequest.onsuccess = function (e) {
                        resolve(e);
                    };
                    deleteRequest.onerror = function (e) {
                        reject(e);
                    };
                });
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
}());

var TinyDB = (function () {
    function TinyDB(config) {
        var databaseName = config.databaseName, tables = config.tables;
        this.name = databaseName;
        this.tables = tables;
        this.createTable(this.tables);
    }
    TinyDB.prototype.createDateBase = function (name, version) {
        if (version === void 0) { version = 1; }
        var indb = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
        this.openedDB = indb.open(name, version);
    };
    TinyDB.prototype.createTable = function (tables, version) {
        var _this = this;
        if (version === void 0) { version = 1; }
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
    TinyDB.prototype.createIndex = function (table, option) {
        table.createIndex(option.index, option.relativeIndex, { unique: option.unique });
    };
    TinyDB.prototype.connect = function (name) {
        var _this = this;
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
        this.connect().then(function (db) {
            var table = new Table(name, db);
            table.insert(data);
        });
    };
    TinyDB.prototype.select = function (name, selecter) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table(name, db);
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
                var table = new Table(name, db);
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
                var table = new Table(name, db);
                table.some(index, startIndex, endIndex).then(function (res) {
                    resolve(res);
                }).catch(function (error) {
                    reject(error);
                });
            });
        });
    };
    TinyDB.prototype.update = function (name, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.connect().then(function (db) {
                var table = new Table(name, db);
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
                var table = new Table(name, db);
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
                var table = new Table(name, db);
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
                var table = new Table(name, db);
                table.clear().then(function (res) {
                    resolve(res);
                }).catch(function (error) {
                    reject(error);
                });
            });
        });
    };
    return TinyDB;
}());

var exportGlobalObject = function (indexedDB) {
    window.tinyDB = indexedDB;
};
exportGlobalObject(TinyDB);
//# sourceMappingURL=tinydb.js.map
