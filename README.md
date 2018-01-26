# Avro Typescript

A simple JS library to convert Avro Schemas to TypeScript interfaces.

This is a Captain401 fork from the fork by reThought Insurance Corporation.

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
import { avroToTypeScript, RecordType, AvroToTypeScriptOptions } from "avro-typescript";

const schemaText = fs.readFileSync("example.avsc", "UTF8");
const schema = JSON.parse(schemaText) as RecordType;

const options: AvroToTypeScriptOptions = {
  // Declare "logicalType": "uuid" to have "string" type
  logicalTypes: {
    "uuid": "string"
  }
}

let avroToTypeScriptResult: string = avroToTypeScript(avscSchema as RecordType, options);
console.log(avroToTypeScriptResult);
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
