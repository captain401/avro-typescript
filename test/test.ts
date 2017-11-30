import * as fs from "file-system";
import { avroToTypeScript, RecordType, avroToTypeScriptResult } from "../lib/"

const schemaText = fs.readFileSync("./example.avsc", "UTF8");
const schema = JSON.parse(schemaText);
let typeNames: string[] = [];
console.log(`test: ${typeNames}`);
let avroToTypeScriptResult: avroToTypeScriptResult = 
    avroToTypeScript(schema as RecordType, typeNames);
console.log(avroToTypeScriptResult.tsInterface);

