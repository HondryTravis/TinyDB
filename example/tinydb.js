(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var __assign = undefined && undefined.__assign || function () {
    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) {
                if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
// 操作 table 使用
var Table = /** @class */function () {
    function Table(option) {
        this.mode = 'readwrite';
        var name = option.name,
            db = option.db;
        this.name = name;
        this.db = db;
    }
    Table.of = function (option) {
        return new Table(option);
    };
    Table.prototype.setMode = function (mode) {
        this.mode = mode;
        return this;
    };
    Table.prototype.getMode = function () {
        return this.mode;
    };
    // create transaction 
    Table.prototype.transaction = function (name) {
        var transaction = this.db.transaction([name], this.getMode());
        return transaction;
    };
    // open or conntect this table 
    Table.prototype.requestStore = function () {
        var name = this.name;
        return this.transaction(name).objectStore(name);
    };
    Table.prototype.insert = function (record) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var addRequest = _this.requestStore().add(record);
            var unlisten = function unlisten() {
                addRequest.removeEventListener('success', success);
                addRequest.removeEventListener('error', error);
            };
            var success = function success() {
                resolve({
                    msg: 'add one record successfully!',
                    status: true
                });
                unlisten();
            };
            var error = function error() {
                reject({
                    msg: 'add one record failed!',
                    status: false,
                    activedRequest: addRequest
                });
            };
            addRequest.addEventListener('success', success);
            addRequest.addEventListener('error', error);
        });
        return promise;
    };
    Table.prototype.update = function (option, record) {
        if (!option) {
            throw new Error('must be one index or option');
        }
        if ((typeof option === "undefined" ? "undefined" : _typeof(option)) === 'object') {
            return this.updateByOption(option, record);
        } else {
            return this.updateByPrimaryKey(option, record);
        }
    };
    Table.prototype.updateByOption = function (option, record) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var innerUpdate = function innerUpdate(result) {
                if (!result.length) {
                    console.warn('not found this record');
                    resolve([]);
                }
                var _loop_1 = function _loop_1(item) {
                    var store = _this.requestStore();
                    var newRecord = __assign(__assign({}, item), record);
                    var updateRequest = store.put(newRecord);
                    updateRequest.onsuccess = function () {
                        resolve({
                            msg: 'update successfully!',
                            status: true
                        });
                    };
                    updateRequest.onerror = function () {
                        reject({
                            msg: 'update failed!',
                            status: false,
                            activedRequest: updateRequest
                        });
                    };
                };
                for (var _i = 0, result_1 = result; _i < result_1.length; _i++) {
                    var item = result_1[_i];
                    _loop_1(item);
                }
            };
            _this.getByIndex(option).then(function (result) {
                return innerUpdate(result);
            });
        });
        return promise;
    };
    Table.prototype.updateByPrimaryKey = function (primaryKey, record) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var innerUpdate = function innerUpdate(result) {
                if (!result) {
                    console.warn('not found this record');
                    resolve([]);
                }
                var store = _this.requestStore();
                var newRecord = __assign(__assign({}, result), record);
                var updateRequest = store.put(newRecord);
                updateRequest.onsuccess = function () {
                    resolve({
                        msg: 'update successfully!',
                        status: true
                    });
                };
                updateRequest.onerror = function () {
                    reject({
                        msg: 'update failed!',
                        status: false,
                        activedRequest: updateRequest
                    });
                };
            };
            _this.getByPrimaryKey(primaryKey).then(function (result) {
                return innerUpdate(result);
            });
        });
        return promise;
    };
    Table.prototype.getByPrimaryKey = function (primaryKey) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var getRequest = _this.requestStore().get(primaryKey);
            getRequest.onsuccess = function () {
                resolve(getRequest.result);
            };
            getRequest.onerror = function () {
                reject({
                    msg: 'not found this primary key!',
                    status: false,
                    activedRequest: getRequest
                });
            };
        });
    };
    Table.prototype.getByIndex = function (option) {
        var _this = this;
        if (!option || !option.value) {
            return Promise.reject({
                msg: 'must have one index!'
            });
        }
        var index = option.index,
            value = option.value;
        return new Promise(function (resolve, reject) {
            var getRequest = _this.requestStore().index(index).getAll(value);
            getRequest.onsuccess = function () {
                if (getRequest.result.length) {
                    resolve(getRequest.result);
                } else {
                    console.warn('not find record!');
                    resolve([]);
                }
            };
            getRequest.onerror = function () {
                reject({
                    msg: 'not found this index!',
                    status: false,
                    activedRequest: getRequest
                });
            };
        });
    };
    Table.prototype.getAll = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var getRequest = _this.requestStore().getAll();
            getRequest.onsuccess = function () {
                resolve(getRequest.result);
            };
            getRequest.onerror = function () {
                reject(getRequest.result);
            };
        });
    };
    Table.prototype.limit = function (option) {
        var _this = this;
        var length = option.length,
            start = option.start;
        var index = start || 0;
        var limit = length;
        if (!option || !option.length) {
            throw console.error('please set length');
        }
        return new Promise(function (resolve, reject) {
            var current = [];
            var cursorRequest = _this.requestStore().openCursor();
            cursorRequest.onsuccess = function () {
                var cursor = cursorRequest.result;
                if (cursor) {
                    if (cursor.key > index && limit) {
                        current.push(cursor.value);
                        limit--;
                    }
                    if (limit !== 0) {
                        cursor.continue();
                    } else {
                        resolve(current);
                    }
                } else {
                    resolve(current);
                }
            };
            cursorRequest.onerror = function () {
                var cursorError = cursorRequest.error;
                reject(cursorError);
            };
        });
    };
    Table.prototype.some = function (option) {
        var _this = this;
        var index = option.index,
            lower = option.lower,
            upper = option.upper;
        return new Promise(function (resolve, reject) {
            var cache = [];
            var indexs = _this.requestStore().index(index);
            var range = IDBKeyRange.bound(lower, upper);
            var cursorRangeRequest = indexs.openCursor(range);
            cursorRangeRequest.onsuccess = function () {
                var result = cursorRangeRequest.result;
                if (result) {
                    cache.push(result.value);
                    result.continue();
                } else {
                    resolve(cache);
                }
            };
            cursorRangeRequest.onerror = function () {
                reject(cursorRangeRequest.error);
            };
        });
    };
    Table.prototype.deleteRecord = function (option) {
        if (!option) {
            throw new Error('must be one index or option');
        }
        if ((typeof option === "undefined" ? "undefined" : _typeof(option)) === 'object') {
            return this.deleteRecordByOption(option);
        } else {
            return this.deleteRecordByPrimaryKey(option);
        }
    };
    Table.prototype.deleteRecordByOption = function (option) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getByIndex(option).then(function (data) {
                if (!data.length) {
                    console.warn('not find this record');
                    return false;
                }
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var item = data_1[_i];
                    var store = _this.requestStore();
                    var keyPath = store.keyPath;
                    var deleteRequest = store.delete(item[keyPath]);
                    deleteRequest.onsuccess = function () {
                        resolve({
                            msg: 'delete successfully!',
                            status: true
                        });
                    };
                    deleteRequest.onerror = function () {
                        reject({
                            msg: 'delete failed!',
                            status: false
                        });
                    };
                }
            });
        });
    };
    Table.prototype.deleteRecordByPrimaryKey = function (primaryKey) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getByPrimaryKey(primaryKey).then(function (data) {
                if (!data) {
                    console.warn('not find this record');
                    return false;
                }
                var store = _this.requestStore();
                var keyPath = store.keyPath;
                var deleteRequest = store.delete(data[keyPath]);
                deleteRequest.onsuccess = function () {
                    resolve({
                        msg: 'delete successfully!',
                        status: true
                    });
                };
                deleteRequest.onerror = function () {
                    reject({
                        msg: 'delete failed!',
                        status: false
                    });
                };
            });
        });
    };
    Table.prototype.clear = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var clearRequest = _this.requestStore().clear();
            clearRequest.onsuccess = function () {
                resolve({
                    msg: 'clear successfully!',
                    status: true
                });
            };
            clearRequest.onerror = function () {
                reject({
                    msg: 'clear failed!',
                    status: false,
                    activedRequest: clearRequest
                });
            };
        });
    };
    Table.prototype.destroyed = function () {
        this.db = undefined;
        this.name = '';
    };
    return Table;
}();
exports.default = Table;

},{}],2:[function(require,module,exports){
(function (global){(function (){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Table_1 = require("./Table");
var win = typeof window == "undefined" ? global : window;
var IN_DB = win.indexedDB;
var TinyDB = /** @class */function () {
    function TinyDB() {}
    TinyDB.of = function () {
        return new TinyDB();
    };
    TinyDB.prototype.setup = function (options) {
        var dbName = options.dbName;
        this.dbName = dbName;
        return this;
    };
    TinyDB.prototype.getVersion = function () {
        return this.version ? this.version : 1;
    };
    TinyDB.prototype.setVersion = function (version) {
        this.version = version;
        return this;
    };
    TinyDB.prototype.upgrade = function (db, options) {
        this.setVersion(db.version);
        this.db = db;
        for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
            var table = options_1[_i];
            if (!db.objectStoreNames.contains(table.name)) {
                var store = db.createObjectStore(table.name, {
                    keyPath: table.primaryKey,
                    autoIncrement: table.autoIncrement ? true : false
                });
                if (table.indexs && table.indexs.length !== 0) {
                    for (var _a = 0, _b = table.indexs; _a < _b.length; _a++) {
                        var index = _b[_a];
                        this.createIndex(store, {
                            index: index.index,
                            relativeIndex: index.relativeIndex,
                            unique: index.unique
                        });
                    }
                }
            }
        }
    };
    TinyDB.prototype.createIndex = function (db, options) {
        db.createIndex(options.index, options.relativeIndex, { unique: options.unique });
    };
    TinyDB.prototype.createTable = function (options) {
        var _this = this;
        if (options === void 0) {
            options = undefined;
        }
        var dbName = this.dbName;
        if (options === undefined) {
            return console.error('database table config must a list');
        }
        var request = IN_DB.open(dbName, this.getVersion());
        var unlisten = function unlisten() {
            request.removeEventListener('upgradeneeded', upgrade);
        };
        var upgrade = function upgrade() {
            _this.upgrade(request.result, options);
            unlisten();
        };
        request.addEventListener('upgradeneeded', upgrade);
        var promise = new Promise(function (resolve, reject) {
            _this.connect(request).then(function (db) {
                var versionChange = function versionChange(evt) {
                    db.close();
                    db.removeEventListener('versionchange', versionChange);
                };
                db.addEventListener('versionchange', versionChange);
            });
        });
        return promise;
    };
    TinyDB.prototype.deleteDatabase = function (name) {
        var request = IN_DB.deleteDatabase(name);
        var promise = new Promise(function (resolve, reject) {
            request.onsuccess = function () {
                var msg = {
                    msg: 'Database deleted successfully',
                    status: true
                };
                resolve(msg);
            };
            request.onerror = function () {
                var msg = {
                    msg: 'Database deleted failed',
                    status: true,
                    activedRequest: request
                };
                reject(msg);
            };
        });
        return promise;
    };
    TinyDB.prototype.connect = function (request, options) {
        var promise = new Promise(function (resolve, reject) {
            var unlisten = function unlisten() {
                request.removeEventListener('success', success);
                request.removeEventListener('error', error);
            };
            var success = function success() {
                if (options && options.successfully) {
                    options.successfully(request);
                }
                resolve(request.result);
                unlisten();
            };
            var blocked = function blocked() {
                if (options && options.blocked) {
                    options.blocked(request);
                }
            };
            var error = function error() {
                if (options && options.error) {
                    options.error(request);
                }
                reject(request.error);
                unlisten();
            };
            request.addEventListener('success', success);
            request.addEventListener('error', error);
            request.addEventListener('blocked', blocked);
        });
        return promise;
    };
    TinyDB.prototype.insert = function (table_name, record) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var request = IN_DB.open(_this.dbName, _this.getVersion());
            _this.connect(request).then(function (db) {
                var operator = Table_1.default.of({
                    name: table_name,
                    db: db
                });
                operator.insert(record).then(function (res) {
                    return resolve(res);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        });
        return promise;
    };
    TinyDB.prototype.updateRecord = function (table_name, options, record) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var request = IN_DB.open(_this.dbName, _this.getVersion());
            _this.connect(request).then(function (db) {
                var operator = Table_1.default.of({
                    name: table_name,
                    db: db
                });
                operator.update(options, record).then(function (res) {
                    return resolve(res);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        });
        return promise;
    };
    TinyDB.prototype.getAll = function (table_name) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var request = IN_DB.open(_this.dbName, _this.getVersion());
            _this.connect(request).then(function (db) {
                var operator = Table_1.default.of({
                    name: table_name,
                    db: db
                });
                operator.getAll().then(function (res) {
                    return resolve(res);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        });
        return promise;
    };
    TinyDB.prototype.getByPrimaryKey = function (table_name, key) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var request = IN_DB.open(_this.dbName, _this.getVersion());
            _this.connect(request).then(function (db) {
                var operator = Table_1.default.of({
                    name: table_name,
                    db: db
                });
                operator.getByPrimaryKey(key).then(function (res) {
                    return resolve(res);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        });
        return promise;
    };
    TinyDB.prototype.getByIndex = function (table_name, options) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var request = IN_DB.open(_this.dbName, _this.getVersion());
            _this.connect(request).then(function (db) {
                var operator = Table_1.default.of({
                    name: table_name,
                    db: db
                });
                operator.getByIndex(options).then(function (res) {
                    return resolve(res);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        });
        return promise;
    };
    TinyDB.prototype.deleteRecord = function (table_name, options) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var request = IN_DB.open(_this.dbName, _this.getVersion());
            _this.connect(request).then(function (db) {
                var operator = Table_1.default.of({
                    name: table_name,
                    db: db
                });
                operator.deleteRecord(options).then(function (res) {
                    return resolve(res);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        });
        return promise;
    };
    TinyDB.prototype.deleteTable = function (tableName) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var conn_request = IN_DB.open(_this.dbName, _this.getVersion());
            conn_request.onupgradeneeded = function (evt) {
                var db = conn_request.result;
                _this.db = db;
                _this.setVersion(db.version);
                if (evt.oldVersion < _this.getVersion()) {
                    db.deleteObjectStore(tableName);
                }
            };
            conn_request.onsuccess = function () {
                resolve({
                    msg: ' deleted table successfully!'
                });
            };
            conn_request.onerror = function () {
                reject({
                    msg: ' deleted table failed!'
                });
            };
        });
        return promise;
    };
    TinyDB.prototype.some = function (table_name, options) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var request = IN_DB.open(_this.dbName, _this.getVersion());
            _this.connect(request).then(function (db) {
                var operator = Table_1.default.of({
                    name: table_name,
                    db: db
                });
                operator.some(options).then(function (res) {
                    return resolve(res);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        });
        return promise;
    };
    TinyDB.prototype.clearTableRecord = function (table_name) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var request = IN_DB.open(_this.dbName, _this.getVersion());
            _this.connect(request).then(function (db) {
                var operator = Table_1.default.of({
                    name: table_name,
                    db: db
                });
                operator.clear().then(function (res) {
                    return resolve(res);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        });
        return promise;
    };
    TinyDB.prototype.getDataWithLimits = function (table_name, options) {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var request = IN_DB.open(_this.dbName, _this.getVersion());
            _this.connect(request).then(function (db) {
                var operator = Table_1.default.of({
                    name: table_name,
                    db: db
                });
                operator.limit(options).then(function (res) {
                    return resolve(res);
                }).catch(function (err) {
                    return reject(err);
                });
            });
        });
        return promise;
    };
    return TinyDB;
}();
exports.default = TinyDB;

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"./Table":1}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.TinyDB = void 0;
var TinyDB_1 = require("./TinyDB");
exports.TinyDB = TinyDB_1.default;
if (!window.TinyDB) {
    window.TinyDB = TinyDB_1.default;
}

},{"./TinyDB":2}]},{},[3])

//# sourceMappingURL=tinydb.js.map
