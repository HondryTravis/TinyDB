# TinyDB

easy to use multi-table indexeddb lib

## 🌟 quick start dev

```sh
  # start
  yarn 
  # then
  gulp
```

## ⚙️ Setup

### init config

初始化配置

```js
const tables = [
  {
      name: "table_student",
      primaryKey: "id",
      autoIncrement: true,
      indexs: [{
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
    },
  ]

const test = TinyDB.of()

test.setup({
    dbName: 'test',
    version: 1
})

async function init() {
  const result = await test.createTable(tables)
  console.log(result)
}

init()
```

then you can checkout you local indexeddb

## 🔨 insert record

插入数据

```js
async function test_insert() {
    await test.insert('table_student', {
      name: 'lee1',
      school: 'Github1',
    })
    await test.insert('table_student', {
      name: 'lee2',
      school: 'Github2',
    })
    await test.insert('table_student', {
      name: 'lee3',
      school: 'Github3'
    })
    await test.insert('table_student', {
      name: 'lee4',
      school: 'Github4'
    })
    await test.insert('table_student', {
      name: 'lee5',
      school: 'Github5'
    })
  }
test_insert()
```

## 🔨 getAll

获得选中表格所有数据

```js
  async function test_getAll() {
    const result = await test.getAll('table_student')
    console.log(result)
  }
  // test_getAll()
```

## 🔨 some

获取一些数据，lower <= rang <= upper

```js
  async function test_some() {
    const result = await test.some('table_student', {
      index: 'id',
      lower: 1,
      upper: 3
    })
    console.log(result)
  }
  // test_some()
```

## 🔨 updateRecord

更新数据

```js
  async function test_update() {
    const newData = {
      name: 'lee11'
    }
    const result = await test.updateRecord('table_student', {
      index: 'id',
      value: 1
    }, newData)
    console.log(result)
  }
  // test_update()
```

## 🔨 getByPrimaryKey

通过主键检索数据

```js
  async function test_getByPrimaryKey() {
    const result = await test.getByPrimaryKey('table_student', 3)
    console.log(result)
  }
  // test_getByPrimaryKey()
```

## 🔨 getByIndex

通过创建的索引检索数据

```js
  async function test_getByIndex() {
    const result = await test.getByIndex('table_student', {
      index: 'id',
      value: 2
    })
    console.log(result)
  }
  // test_getByIndex()
```

## 🔨 deleteRecord

删除记录，通过创建的索引删除

```js
  async function test_deleteRecord() {
    const result = await test.deleteRecord('table_student', {
      index: 'id',
      value: 6
    })
    console.log(result)
  }
  // test_deleteRecord()
```

## 🔨 deleteDatabase

删除数据库

```js
  async function test_deleteDatabase() {
    const result = await test.deleteDatabase('test')
    console.log(result)
  }
  // test_deleteDatabase()
```

## 🔨 clearTableRecord

清除表格数据

```js
  async function test_clearTableRecord() {
    const result = await test.clearTableRecord('table_student')
    console.log(result)
  }
  // test_clearTableRecord()
```

## 🔨 deleteTable

删除表格

```js
  async function test_deleteTable() {
    const result = await test.setVersion(3).deleteTable('table_delete')
    console.log(result)
  }
  // test_deleteTable()
```
