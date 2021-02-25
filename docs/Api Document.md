# TinyDB Api Document

## 快速实例化

一般的我们只需要 `TinyDB.of().setup(config)` 就可以拿到这个数据库包裹对象

```javascript
<script src="tinydb.js">
<script>
  const config = {...}
  const mydb = TinyDB.of()
  mydb.setup(config)
</script>  
```

### 实例化需要配置的参数

#### 数据库配置项

创建数据库

| 名称 |      属性      |   类型   | 是否必须 |
|:----:| :------------: | :------: | :------: |
| 数据库名称 | `dbName` | `String` |   Must   |
|  版本 | `version` | `number` |   Must   |

**数据库名称**：创建的数据表名称

**版本**：指定的版本号

例子

```javascript
{
  dbName: 'test'
  version: 1
}
```

#### 数据表配置项

创建数据库中的表，一个数据库可以有多个表，有一些表属性需要提前设定，虽然也可以动态创建表，但不建议这么做，尽量在一开始建立好

|名称|  属性  |   类型   | 是否必须 |
|:---:| :----: | :------: | :------: |
| 数据表名称 | `name` | `string` | Must |
| keyPath | `keyPath` | `string` | Must |
| 是否允许数据表自增(不重复) | `autoIncrement` | `Boolean` | Must |
| 索引列表 | `indexs` | `Array<Object>` | Must |

**数据表名称**：您要创建的数据表名称

**表主键**：自增的一个变量且不重复，

**是否允许数据表自增**：默认`true`在插入一条新数据的时候，`keypath`自增1，可能的值： false

**索引列表**：在初始化创建一个对该表的快速查询的索引列表，也可以后续创建

#### 索引配置项

|     名称     |      属性       |   类型    | 是否必须 |
| :----------: | :-------------: | :-------: | :------: |
|    index     |     `index`     | `string`  |   Must   |
| 相对索引名称 | `relativeIndex` | `string`  |   Must   |
| 是否允许重复 |    `unique`     | `Boolean` |   Must   |

**索引名称**：用来查询数据表中的数据的索引

**相对索引名称**：对应保存数据中的某个字段

**是否允许重复**：有些时候，我们需要有些数据是重复的，有些是不重复的，比如学号我们希望不是重复的，名字希望是重复的

例子:

```javascript
 const tables = [
        {
          name: "table_student",
          keyPath: "id",
          autoIncrement: true,
          indexs: [
            {
              index: "id",
              relativeIndex: "id",
              unique: true
            },
            {
              index: "name",
              relativeIndex: "name",
              unique: false
            },
            {
              index: "school",
              relativeIndex: "school",
              unique: false
            }
          ]
        }
      ]
```

## DataBase Api 实例方法

关于特殊类型参考 types/index.ts

### setup(options: ITinyDB.IDatabase) 设置数据表

```ts
interface IDatabase {
    dbName: string
    version?: number
}
```

### getVersion

返回当前数据表

### setVersion(version: number): TinyDB

设置数据库版本，返回当前数据库包裹实例

### createTable(options: ITinyDB.ITableConfig[] = undefined): Promise

创建表

### upgrade(db: IDBDatabase, options: ITinyDB.ITableConfig[]): void

数据库升级事件，可以改写

### createIndex(db: IDBObjectStore, options: ITinyDB.IIndex)

创建索引

### deleteDatabase(name: string): Promise

删除数据库

### connect<T>(request: IDBRequest<T>, options?: ITinyDB.IRequestCallback): Promise<T>

创建数据库连接

### insert(table_name: string, record: any): Promise

插入数据

### updateRecord(table_name: string, options: ITinyDB.IGetIndex, record: any): Promise

通过索引配置更新数据

### getAll(table_name: string): Promise

获取某个表中的所有数据

### getByPrimaryKey(table_name: string, key: ITinyDB.IValidateKey): Promise

获得某个表中的数据，且使用主键作为索引查询

### getByIndex(table_name: string, options: ITinyDB.IGetIndex): Promise

使用创建的索引进行查询

### deleteRecord(table_name: string, options: ITinyDB.IGetIndex): Promise

通过创建的索引删除

### deleteTable(tableName: string): Promise

删除某个表

### some(table_name: string, options: ITinyDB.ISomeOptions): Promise

提取某个包含于范围中的数据

### clearTableRecord(table_name: string): Promise

清除某张表全部数据

## 类型文件参考

```ts

/**
 * @description TinyDB types
 */
export declare namespace ITinyDB {

  export type key_index = string | number
  export type request_callback = undefined | (<T>(request: T, option?: IState) => any)
  export type IOperateMode = 'readonly' | 'readwrite'
  export type IValidateKey = string | number | Date | ArrayBufferView | ArrayBuffer | IDBArrayKey | IDBKeyRange

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

  export interface IRequestCallback {
    successfully?: request_callback
    error?: request_callback
    blocked?: request_callback
  }

}
```
