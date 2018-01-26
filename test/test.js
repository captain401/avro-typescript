"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("file-system");
var lib_1 = require("../lib");
var schemaText = fs.readFileSync("./test/example.avsc", "UTF8");
var schema = JSON.parse(schemaText);
var avroToTypeScriptResult = lib_1.avroToTypeScript(schema);
console.log(avroToTypeScriptResult);
