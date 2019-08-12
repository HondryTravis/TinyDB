#TinyDB Api Document

## 快速实例化

一般的我们只需要 `new TinyDB(config)` 就可以拿到这个数据表对象

```javascript
<script src="tinydb.js">
<script>
  const config = {...}
  const mydb = new TinyDB(config)
</script>  
```

###  实例化需要配置的参数

#### 数据库配置项

创建数据库

| 名称 |      属性      |   类型   | 是否必须 |
|:----:| :------------: | :------: | :------: |
| 数据库名称 | `databaseName` | `String` |   Must   |
| 数据表 | `tables` | `Array<Object>` |   Must   |

**数据库名称**：创建的数据表名称

**数据表**：一个数据表集合包含属性，可能有多个表。

例子

```javascript
{
  databaseName: 'test'
  tables: [...{...}]
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

**表主键**：默认为`id`，自增的一个变量，

**是否允许数据表自增**：默认`true`在插入一条新数据的时候，`keypath`自增1，可能的值： false

**索引列表**：创建一个对该表的快速查询的索引列表，默认id

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
 const options = {
      databaseName: "test",
      tables: [
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
    };

```

## DataBase Api 数据库方法



### ``