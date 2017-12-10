# Avro Typescript

A simple JS library to convert Avro Schemas to TypeScript interfaces.

This is a fork modified and maintained by reThought Insurance Corporation.

Modifictions include:

* Support for de-duplication of types across multiple calls

## Install

```
yarn add https://github.com/rethoughtinsurance/avro-typescript.git
yarn install
```

The library can be run in node.js or the browser. It takes a Avro Schema as a JavaScript object (from JSON) and returns the TypeScript code as a string.

## Usage

```typescript
import { avroToTypeScript, RecordType, avroToTypeScriptResult } from "avro-typescript"

const schemaText = fs.readFileSync("example.avsc", "UTF8");
const schema = JSON.parse(schemaText) as RecordType;
// Pass an empty array of typenames into avroToTypeScript function, it is returned in the avroToTypeScriptResult.
let typeNames: string[] = [];
let avroToTypeScriptResult: avroToTypeScriptResult = avroToTypeScript(avscSchema as RecordType,
      typeNames);
console.log(avroToTypeScriptResult.tsInterface);
// If multiple types are created, pass the avroToTypeScriptResult.typeNames in for each call to de-duplicate common types.
```

## Features

Most Avro features are supported, including:

* Enumerated Types
* Maps
* Named Records
* Mandatory and optional fields
* Unions
* Primitives

### To-do

* Generate a function to set defaults as per the schema
* Add support for fixed
* Generate JSDocs from documentation
* Add namespace support
