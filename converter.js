var Converter = (function () {

  var _fs = null;
  var _fileLines = null;
  var _currentLine = null;
  var _collections = [];

  var reportError = function (errorText) {
    console.log('ERROR: ' + errorText);
    process.exit(1);
  };

  var getNextLine = function () {
    return _fileLines.shift().trim();
  };

  var hasMoreLines = function () {
    return _fileLines.length > 0;
  };

  var readFile = function (fileName) {
    var fileAsString = _fs.readFileSync(fileName, 'utf8');
    _fileLines = fileAsString.split('\n');
  };

  var startsWith = function (str, textToFind) {
    return str.trim().indexOf(textToFind.trim()) === 0;
  };

  var convertData = function (data, type) {
    if(startsWith(type, 'varchar') || startsWith(type, 'text') || startsWith(type, 'date')) {
      return data;
    }
    else if(startsWith(type, 'int') || startsWith(type, 'decimal')) {
      return Number(data);
    }
    else if(startsWith(type, 'tinyint')) {
      return data == 1;
    }
    else if(startsWith(type,'timestamp')||startsWith(type,'bigint(20)')) {
      return data;
    }
    else {
      console.log('Don\'t know this type: ' + type);
      return data;
    }
  };

  var readNextTableDef = function () {
    while(hasMoreLines()) {
      var currentLine = getNextLine();

      if(startsWith(currentLine, 'CREATE TABLE')) {
        var tableName = currentLine.split('`')[1];
        console.log('Converting table: ' + tableName);
        currentLine = getNextLine();
        var fields = [];

        while(startsWith(currentLine, '`')) {
          var parts = currentLine.split('`');
          var fieldName = parts[1];
          var fieldType = parts[2].split(' ')[1];

          if(fieldName === 'id') {
            fieldName = '_id';
            fieldType = 'text';
          }

          fields.push({
            name: fieldName,
            type: fieldType
          });

          currentLine = getNextLine();
        }

        _collections.push({
          name: tableName,
          fields: fields
        });

        return;
      }
    }
  };

  var readTableValues = function () {
    var currentCollection = _collections[_collections.length - 1];
    var tableName = currentCollection.name;
    var fields = currentCollection.fields;

    var values = [];
    while(hasMoreLines()) {
      var currentLine = getNextLine();

      if(startsWith(currentLine, 'INSERT INTO')) {
        currentLine = currentLine.replace('INSERT INTO `' + tableName + '` VALUES ', '');
        var index = 1;
        var valueId = 0
        var insideString = false;
        var currentValue = '';

        var pair = {};

        while(index < currentLine.length) {
          var previousChar = currentLine.charAt(index - 1);
          var currentChar = currentLine.charAt(index);

          if((currentChar === ',' || currentChar === ')') && !insideString) {
            var field = fields[valueId];
            pair[field.name] = convertData(currentValue, field.type);

            valueId++;
            currentValue = '';

            if(currentChar === ')') {
              index += 2;
              values.push(pair);
              pair = {};
              valueId = 0;
            }
          }
          else if(currentChar === "'" && previousChar !== '\\') {
            insideString = !insideString;
          }
          else {
            currentValue = currentValue + currentChar;
          }

          index++;
        }

        _collections[_collections.length - 1].values = values;
        //return;
      }
    }
  };

  return {
    init: function () {
      if(process.argv.length != 3) {
        reportError(':-)Please specify exactly one mysqldump input file');
      }

      _fs = require('fs');
      var fileName = process.argv[2];
      readFile(fileName);

      while(hasMoreLines()) {
        readNextTableDef();
        readTableValues();
      }

      for(var i = 0; i < _collections.length; i++) {
        _fs.writeFileSync(_collections[i].name + '.json', JSON.stringify(_collections[i].values, undefined, 2));
      }

      process.exit();
    }
  };
})();

Converter.init();
