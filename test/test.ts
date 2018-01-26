import * as fs from "file-system";
import { avroToTypeScript, RecordType } from "../lib";

const schemaText = fs.readFileSync("./test/example.avsc", "UTF8");
const schema = JSON.parse(schemaText);
let avroToTypeScriptResult: string = avroToTypeScript(schema as RecordType);
console.log(avroToTypeScriptResult);
