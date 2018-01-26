import {
  Type,
  Field,
  isRecordType,
  isArrayType,
  isEnumType,
  isMapType,
  RecordType,
  EnumType,
  isOptional,
  isLogicalType,
  LogicalType
} from "./model";
export { RecordType } from "./model";
/** Convert a primitive type from avro to TypeScript */
function convertPrimitive(avroType: string): string {
  switch (avroType) {
  case "long":
  case "int":
  case "double":
  case "float":
    return "number";
  case "bytes":
    return "Buffer";
  case "null":
    return "null | undefined";
  case "boolean":
    return "boolean";
  default:
    return null;
  }
}

/** A constant array of strings for typeNames, to avoid duplicates. */
let typeNames: string[] = [];

/** Result interface for avroToTypeScript function. */
export interface avroToTypeScriptResult {
  tsInterface: string;
  typeNames: string[];
}

/** Converts an Avro record type to a TypeScript file */
export function avroToTypeScript(recordType: RecordType, aTypeNames: string[]):
avroToTypeScriptResult {

  // Start with the aTypeNames provided by the caller.
  typeNames = aTypeNames;
  const output: string[] = [];
  convertRecord(recordType, output);

  let result: avroToTypeScriptResult = {
    tsInterface: output.join("\n"),
    typeNames: typeNames
  }
  return result;
}

/** Convert an Avro Record type. Return the name, but add the definition to the file */
function convertRecord(recordType: RecordType, fileBuffer: string[]): string {

  //console.log(`convertRecord: export interface ${recordType.name}`);
  // If this exported top-level type was already created, skip it.
  // Still return the recordType.name for nested record type field.s
  if(typeNames.indexOf(recordType.name) > -1) {
    return recordType.name;
  }
  let buffer = `export interface ${recordType.name} {\n`;
  for (let field of recordType.fields) {
    buffer += convertFieldDec(field, fileBuffer) + "\n";
  }
  buffer += "}\n";
  fileBuffer.push(buffer);
  typeNames.push(recordType.name);
  return recordType.name;
}

/** Convert an Avro Enum type. Return the name, but add the definition to the file */
function convertEnum(enumType: EnumType, fileBuffer: string[]): string {
  // Skip the enum if already created.
  if(typeNames.indexOf(enumType.name) > -1) {
    return enumType.name;
  }
  let enumDef = `export enum ${enumType.name} {\n`;
  let ctr: number = 0;
  let suffix: string;
  for(let enumSymbol of enumType.symbols) {
    enumDef += `  ${enumSymbol} = '${enumSymbol}'`
    ctr++;
    if(ctr === enumType.symbols.length) {
      suffix = `\n`;
    } else {
      suffix = `,\n`;
    }
    enumDef += `${suffix}`
  }
  enumDef += `};\n`;

  fileBuffer.push(enumDef);
  typeNames.push(enumType.name);
  return enumType.name;
}

/** Convert an Avro Logical type. Return the primitive type. */
function convertLogicalType(type: Type, buffer: string[]) {
  // Force decimal to a number, otherwise bytes will generate a Buffer object.
  let logicalType: LogicalType = <LogicalType>type;
  // console.log(`convertLogicalType: ${logicalType.logicalType} ${logicalType.type}`);
  if(logicalType.logicalType === "decimal") {
    logicalType.type = "float";
  }
  return convertPrimitive(logicalType.type);
}

function convertType(type: Type, buffer: string[]): string {
  // if it's just a name, then use that
  if (typeof type === "string") {
    return convertPrimitive(type) || type;
  } else if (type instanceof Array) {
    // array means a Union. Use the names and call recursively
    return type.map(t => convertType(t, buffer)).join(" | ");
  } else if (isRecordType(type)) {
    //} type)) {
    // record, use the name and add to the buffer
    return convertRecord(type, buffer);
  } else if (isArrayType(type)) {
    // array, call recursively for the array element type
    return convertType(type.items, buffer) + "[]";
  } else if (isMapType(type)) {
    // Dictionary of types, string as key
    return `{ [index:string]:${convertType(type.values, buffer)} }`;
  } else if (isEnumType(type)) {
    // array, call recursively for the array element type
    return convertEnum(type, buffer);
  } else if (isLogicalType(type)) {
    return convertLogicalType(type, buffer);
  } else {
    console.error("Cannot work out type", type);
    return "UNKNOWN";
  }
}

function convertFieldDec(field: Field, buffer: string[]): string {
  // Union Type
  return `\t${field.name}${isOptional(field.type) ? "?" : ""}: ${convertType(field.type, buffer)};`;
}
