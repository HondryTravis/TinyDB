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
