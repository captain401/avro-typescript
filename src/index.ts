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

export interface AvroToTypeScriptOptions {
  // Convert logical types to user-defined type names.
  logicalTypes?: {[key: string]: string};
}

class Converter {
  /** A constant array of strings for typeNames, to avoid duplicates. */
  typeNames: string[];
  options: AvroToTypeScriptOptions;

  constructor(options: AvroToTypeScriptOptions = {}) {
    this.typeNames = [];
    this.options = options;
  }

  /** Convert a primitive type from avro to TypeScript */
  convertPrimitive(avroType: string): string {
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

  /** Convert an Avro Record type. Return the name, but add the definition to the file */
  convertRecord(recordType: RecordType, fileBuffer: string[]): string {
    // If this exported top-level type was already created, skip it.
    // Still return the recordType.name for nested record type fields.
    if(this.typeNames.indexOf(recordType.name) > -1) {
      return recordType.name;
    }
    let buffer = `export interface ${recordType.name} {\n`;
    for (let field of recordType.fields) {
      buffer += this.convertFieldDec(field, fileBuffer) + "\n";
    }
    buffer += "}\n";
    fileBuffer.push(buffer);
    this.typeNames.push(recordType.name);
    return recordType.name;
  }

  /** Convert an Avro Enum type. Return the name, but add the definition to the file */
  convertEnum(enumType: EnumType, fileBuffer: string[]): string {
    // Skip the enum if already created.
    if(this.typeNames.indexOf(enumType.name) > -1) {
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
    this.typeNames.push(enumType.name);
    return enumType.name;
  }

  /** Convert an Avro Logical type. Return a custom (from options) or primitive type. */
  convertLogicalType(type: Type, buffer: string[]) {
    let logicalType: LogicalType = <LogicalType>type;
    // Use `this.options` to handle custom logical types.
    if (this.options.logicalTypes) {
      const customType = this.options.logicalTypes[logicalType.logicalType];
      if (customType) {
	return customType;
      }
    }

    // Force decimal to a number, otherwise bytes will generate a Buffer object.
    // TODO: Does this even make sense?
    if(logicalType.logicalType === "decimal") {
      logicalType.type = "float";
    }
    return this.convertPrimitive(logicalType.type);
  }

  convertType(type: Type, buffer: string[]): string {
    // if it's just a name, then use that
    if (typeof type === "string") {
      return this.convertPrimitive(type) || type;
    } else if (type instanceof Array) {
      // array means a Union. Use the names and call recursively
      return type.map(t => this.convertType(t, buffer)).join(" | ");
    } else if (isRecordType(type)) {
      //} type)) {
      // record, use the name and add to the buffer
      return this.convertRecord(type, buffer);
    } else if (isArrayType(type)) {
      // array, call recursively for the array element type
      return this.convertType(type.items, buffer) + "[]";
    } else if (isMapType(type)) {
      // Dictionary of types, string as key
      return `{ [index:string]:${this.convertType(type.values, buffer)} }`;
    } else if (isEnumType(type)) {
      // array, call recursively for the array element type
      return this.convertEnum(type, buffer);
    } else if (isLogicalType(type)) {
      return this.convertLogicalType(type, buffer);
    } else {
      console.error("Cannot work out type", type);
      return "UNKNOWN";
    }
  }

  convertFieldDec(field: Field, buffer: string[]): string {
    // Union Type
    return `\t${field.name}${isOptional(field.type) ? "?" : ""}: ${this.convertType(field.type, buffer)};`;
  }

}

/** Converts an Avro record type to a TypeScript file */
export function avroToTypeScript(recordType: RecordType, options?: AvroToTypeScriptOptions): string {
  const converter = new Converter(options);
  const output: string[] = [];
  converter.convertRecord(recordType, output);
  return output.join("\n");
}
