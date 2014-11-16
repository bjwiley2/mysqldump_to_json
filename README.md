# Overview

This node.js script allows the conversion of a mysqldump file to JSON, which is useful for importing data into MongoDB.

See this link to export your MySQL database via mysqldump:
http://dev.mysql.com/doc/refman/5.1/en/mysqldump.html

Once you have the dump.sql file, run this command to generate output.json:

```
node converter.js dump.sql
```

The converter will create a json file per table/collection and will also rename fields titled "id" to "_id". You can now import the json file to mongo via this command:

```
mongoimport --type json --jsonArray --db db_name_here --collection collection_name_here --file file_name_here.json
```
