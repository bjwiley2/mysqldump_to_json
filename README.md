# Overview

This node.js script allows the conversion of a mysqldump file to JSON, which is useful for importing data into MongoDB.

See this link to export your MySQL database via mysqldump:
http://dev.mysql.com/doc/refman/5.1/en/mysqldump.html

Once you have the dump.sql file, run this command to generate output.json:

```
node converter.js dump.sql
```
