/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
var e = function () {
    return (e = Object.assign || function (e) {
      for (var n, t = 1, r = arguments.length; t < r; t++)
        for (var o in n = arguments[t]) Object.prototype.hasOwnProperty.call(n, o) && (e[o] = n[o]);
      return e
    }).apply(this, arguments)
  },
  n = function () {
    function n(e) {
      this.mode = "readwrite";
      var n = e.db;
      this.name = e.name, this.db = n
    }
    return n.of = function (e) {
      return new n(e)
    }, n.prototype.setMode = function (e) {
      return this.mode = e, this
    }, n.prototype.getMode = function () {
      return this.mode
    }, n.prototype.transaction = function (e) {
      return this.db.transaction([e], this.getMode())
    }, n.prototype.requestStore = function () {
      var e = this.name;
      return this.transaction(e).objectStore(e)
    }, n.prototype.insert = function (e) {
      var n = this;
      return new Promise((function (t, r) {
        var o = n.requestStore().add(e),
          i = function () {
            t({
              msg: "add one record successfully!",
              status: !0
            }), o.removeEventListener("success", i), o.removeEventListener("error", s)
          },
          s = function () {
            r({
              msg: "add one record failed!",
              status: !1,
              activedRequest: o
            })
          };
        o.addEventListener("success", i), o.addEventListener("error", s)
      }))
    }, n.prototype.update = function (n, t) {
      var r = this;
      return new Promise((function (o, i) {
        r.getByIndex(n).then((function (n) {
          if (!n.length) return console.warn("not found this record"), o([]);
          for (var s = function (n) {
              var s = r.requestStore(),
                u = e(e({}, n), t),
                c = s.put(u);
              c.onsuccess = function () {
                o({
                  msg: "update successfully!",
                  status: !0
                })
              }, c.onerror = function () {
                i({
                  msg: "update failed!",
                  status: !1,
                  activedRequest: c
                })
              }
            }, u = 0, c = n; u < c.length; u++) {
            s(c[u])
          }
        }))
      }))
    }, n.prototype.getByPrimaryKey = function (e) {
      var n = this;
      return new Promise((function (t, r) {
        var o = n.requestStore().get(e);
        o.onsuccess = function () {
          t(o.result)
        }, o.onerror = function () {
          r({
            msg: "not found this primary key!",
            status: !1,
            activedRequest: o
          })
        }
      }))
    }, n.prototype.getByIndex = function (e) {
      var n = this;
      if (!e || !e.value) return Promise.reject({
        msg: "must have one index!"
      });
      var t = e.index,
        r = e.value;
      return new Promise((function (e, o) {
        var i = n.requestStore().index(t).getAll(r);
        i.onsuccess = function () {
          i.result.length ? e(i.result) : (console.warn("not find record!"), e([]))
        }, i.onerror = function () {
          o({
            msg: "not found this index!",
            status: !1,
            activedRequest: i
          })
        }
      }))
    }, n.prototype.getAll = function () {
      var e = this;
      return new Promise((function (n, t) {
        var r = e.requestStore().getAll();
        r.onsuccess = function () {
          n(r.result)
        }, r.onerror = function () {
          t(r.result)
        }
      }))
    }, n.prototype.some = function (e) {
      var n = this,
        t = e.index,
        r = e.lower,
        o = e.upper;
      return new Promise((function (e, i) {
        var s = [],
          u = n.requestStore().index(t),
          c = IDBKeyRange.bound(r, o),
          a = u.openCursor(c);
        a.onsuccess = function () {
          var n = a.result;
          n ? (s.push(n.value), n.continue()) : e(s)
        }, a.onerror = function () {
          i(a.error)
        }
      }))
    }, n.prototype.deleteRecord = function (e) {
      var n = this;
      return new Promise((function (t, r) {
        n.getByIndex(e).then((function (e) {
          if (!e.length) return console.warn("not find this record"), !1;
          for (var o = 0, i = e; o < i.length; o++) {
            var s = i[o],
              u = n.requestStore(),
              c = u.delete(s[u.keyPath]);
            c.onsuccess = function () {
              t({
                msg: "delete successfully!",
                status: !0
              })
            }, c.onerror = function () {
              r({
                msg: "delete failed!",
                status: !1
              })
            }
          }
        }))
      }))
    }, n.prototype.clear = function () {
      var e = this;
      return new Promise((function (n, t) {
        var r = e.requestStore().clear();
        r.onsuccess = function () {
          n({
            msg: "clear successfully!",
            status: !0
          })
        }, r.onerror = function () {
          t({
            msg: "clear failed!",
            status: !1,
            activedRequest: r
          })
        }
      }))
    }, n.prototype.destroyed = function () {
      this.db = void 0, this.name = ""
    }, n
  }(),
  t = ("undefined" == typeof window ? global : window).indexedDB,
  r = function () {
    function e() {}
    return e.of = function () {
      return new e
    }, e.prototype.setup = function (e) {
      return this.dbName = e.dbName, this
    }, e.prototype.getVersion = function () {
      return this.version ? this.version : 1
    }, e.prototype.setVersion = function (e) {
      return this.version = e, this
    }, e.prototype.upgrade = function (e, n) {
      this.setVersion(e.version), this.db = e;
      for (var t = 0, r = n; t < r.length; t++) {
        var o = r[t];
        if (!e.objectStoreNames.contains(o.name)) {
          var i = e.createObjectStore(o.name, {
            keyPath: o.primaryKey,
            autoIncrement: !!o.autoIncrement
          });
          if (o.indexs && 0 !== o.indexs.length)
            for (var s = 0, u = o.indexs; s < u.length; s++) {
              var c = u[s];
              this.createIndex(i, {
                index: c.index,
                relativeIndex: c.relativeIndex,
                unique: c.unique
              })
            }
        }
      }
    }, e.prototype.createIndex = function (e, n) {
      e.createIndex(n.index, n.relativeIndex, {
        unique: n.unique
      })
    }, e.prototype.createTable = function (e) {
      var n = this;
      void 0 === e && (e = void 0);
      var r = this.dbName;
      if (void 0 === e) return console.error("database table config must a list");
      var o = t.open(r, this.getVersion()),
        i = function () {
          n.upgrade(o.result, e), o.removeEventListener("upgradeneeded", i)
        };
      return o.addEventListener("upgradeneeded", i), new Promise((function (e, t) {
        n.connect(o).then((function (e) {
          var n = function (t) {
            e.close(), e.removeEventListener("versionchange", n)
          };
          e.addEventListener("versionchange", n)
        }))
      }))
    }, e.prototype.deleteDatabase = function (e) {
      var n = t.deleteDatabase(e);
      return new Promise((function (e, t) {
        n.onsuccess = function () {
          e({
            msg: "Database deleted successfully",
            status: !0
          })
        }, n.onerror = function () {
          t({
            msg: "Database deleted failed",
            status: !0,
            activedRequest: n
          })
        }
      }))
    }, e.prototype.connect = function (e, n) {
      return new Promise((function (t, r) {
        var o = function () {
            e.removeEventListener("success", i), e.removeEventListener("error", s)
          },
          i = function () {
            n && n.successfully && n.successfully(e), t(e.result), o()
          },
          s = function () {
            n && n.error && n.error(e), r(e.error), o()
          };
        e.addEventListener("success", i), e.addEventListener("error", s), e.addEventListener("blocked", (function () {
          n && n.blocked && n.blocked(e)
        }))
      }))
    }, e.prototype.insert = function (e, r) {
      var o = this;
      return new Promise((function (i, s) {
        var u = t.open(o.dbName, o.getVersion());
        o.connect(u).then((function (t) {
          n.of({
            name: e,
            db: t
          }).insert(r).then((function (e) {
            return i(e)
          })).catch((function (e) {
            return s(e)
          }))
        }))
      }))
    }, e.prototype.updateRecord = function (e, r, o) {
      var i = this;
      return new Promise((function (s, u) {
        var c = t.open(i.dbName, i.getVersion());
        i.connect(c).then((function (t) {
          n.of({
            name: e,
            db: t
          }).update(r, o).then((function (e) {
            return s(e)
          })).catch((function (e) {
            return u(e)
          }))
        }))
      }))
    }, e.prototype.getAll = function (e) {
      var r = this;
      return new Promise((function (o, i) {
        var s = t.open(r.dbName, r.getVersion());
        r.connect(s).then((function (t) {
          n.of({
            name: e,
            db: t
          }).getAll().then((function (e) {
            return o(e)
          })).catch((function (e) {
            return i(e)
          }))
        }))
      }))
    }, e.prototype.getByPrimaryKey = function (e, r) {
      var o = this;
      return new Promise((function (i, s) {
        var u = t.open(o.dbName, o.getVersion());
        o.connect(u).then((function (t) {
          n.of({
            name: e,
            db: t
          }).getByPrimaryKey(r).then((function (e) {
            return i(e)
          })).catch((function (e) {
            return s(e)
          }))
        }))
      }))
    }, e.prototype.getByIndex = function (e, r) {
      var o = this;
      return new Promise((function (i, s) {
        var u = t.open(o.dbName, o.getVersion());
        o.connect(u).then((function (t) {
          n.of({
            name: e,
            db: t
          }).getByIndex(r).then((function (e) {
            return i(e)
          })).catch((function (e) {
            return s(e)
          }))
        }))
      }))
    }, e.prototype.deleteRecord = function (e, r) {
      var o = this;
      return new Promise((function (i, s) {
        var u = t.open(o.dbName, o.getVersion());
        o.connect(u).then((function (t) {
          n.of({
            name: e,
            db: t
          }).deleteRecord(r).then((function (e) {
            return i(e)
          })).catch((function (e) {
            return s(e)
          }))
        }))
      }))
    }, e.prototype.deleteTable = function (e) {
      var n = this;
      return new Promise((function (r, o) {
        var i = t.open(n.dbName, n.getVersion());
        i.onupgradeneeded = function (t) {
          var r = i.result;
          n.db = r, n.setVersion(r.version), t.oldVersion < n.getVersion() && r.deleteObjectStore(e)
        }, i.onsuccess = function () {
          r({
            msg: " deleted table successfully!"
          })
        }, i.onerror = function () {
          o({
            msg: " deleted table failed!"
          })
        }
      }))
    }, e.prototype.some = function (e, r) {
      var o = this;
      return new Promise((function (i, s) {
        var u = t.open(o.dbName, o.getVersion());
        o.connect(u).then((function (t) {
          n.of({
            name: e,
            db: t
          }).some(r).then((function (e) {
            return i(e)
          })).catch((function (e) {
            return s(e)
          }))
        }))
      }))
    }, e.prototype.clearTableRecord = function (e) {
      var r = this;
      return new Promise((function (o, i) {
        var s = t.open(r.dbName, r.getVersion());
        r.connect(s).then((function (t) {
          n.of({
            name: e,
            db: t
          }).clear().then((function (e) {
            return o(e)
          })).catch((function (e) {
            return i(e)
          }))
        }))
      }))
    }, e
  }();
export {
  r as TinyDB
};
