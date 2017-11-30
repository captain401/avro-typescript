"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("./model");
/** Convert a primitive type from avro to TypeScript */
function convertPrimitive(avroType) {
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
var typeNames = [];
/** Converts an Avro record type to a TypeScript file */
function avroToTypeScript(recordType, aTypeNames) {
    // Start with the aTypeNames provided by the caller.
    typeNames = aTypeNames;
    var output = [];
    convertRecord(recordType, output);
    var result = {
        tsInterface: output.join("\n"),
        typeNames: typeNames
    };
    return result;
}
exports.avroToTypeScript = avroToTypeScript;
/** Convert an Avro Record type. Return the name, but add the definition to the file */
function convertRecord(recordType, fileBuffer) {
    //console.log(`convertRecord: export interface ${recordType.name}`);
    console.log("convertRecord: " + typeNames);
    // If this exported top-level type was already created, skip it.
    // Still return the recordType.name for nested record type field.s
    if (typeNames.indexOf(recordType.name) > -1) {
        return recordType.name;
    }
    var buffer = "export interface " + recordType.name + " {\n";
    for (var _i = 0, _a = recordType.fields; _i < _a.length; _i++) {
        var field = _a[_i];
        buffer += convertFieldDec(field, fileBuffer) + "\n";
    }
    buffer += "}\n";
    fileBuffer.push(buffer);
    typeNames.push(recordType.name);
    return recordType.name;
}
/** Convert an Avro Enum type. Return the name, but add the definition to the file */
function convertEnum(enumType, fileBuffer) {
    // Skip the enum if already created.
    if (typeNames.indexOf(enumType.name) > -1) {
        return enumType.name;
    }
    var enumDef = "export enum " + enumType.name + " { " + enumType.symbols.join(", ") + " };\n";
    fileBuffer.push(enumDef);
    typeNames.push(enumType.name);
    return enumType.name;
}
/** Convert an Avro Logical type. Return the primitive type. */
/** TODO: If move to setters then enforce logical type rules (e.g., decimal(10,2)) */
function convertLogicalType(type, buffer) {
    // Force decimal to a number, otherwise bytes will generate a Buffer object.
    // TODO: This may not work with Java encoding, may require bytes.
    var logicalType = type;
    // console.log(`convertLogicalType: ${logicalType.logicalType} ${logicalType.type}`);
    if (logicalType.logicalType === "decimal") {
        logicalType.type = "float";
    }
    return convertPrimitive(logicalType.type);
}
function convertType(type, buffer) {
    // if it's just a name, then use that
    if (typeof type === "string") {
        return convertPrimitive(type) || type;
    }
    else if (type instanceof Array) {
        // array means a Union. Use the names and call recursively
        return type.map(function (t) { return convertType(t, buffer); }).join(" | ");
    }
    else if (model_1.isRecordType(type)) {
        //} type)) {
        // record, use the name and add to the buffer
        return convertRecord(type, buffer);
    }
    else if (model_1.isArrayType(type)) {
        // array, call recursively for the array element type
        return convertType(type.items, buffer) + "[]";
    }
    else if (model_1.isMapType(type)) {
        // Dictionary of types, string as key
        return "{ [index:string]:" + convertType(type.values, buffer) + " }";
    }
    else if (model_1.isEnumType(type)) {
        // array, call recursively for the array element type
        return convertEnum(type, buffer);
    }
    else if (model_1.isLogicalType(type)) {
        return convertLogicalType(type, buffer);
    }
    else {
        console.error("Cannot work out type", type);
        return "UNKNOWN";
    }
}
function convertFieldDec(field, buffer) {
    // Union Type
    return "\t" + field.name + (model_1.isOptional(field.type) ? "?" : "") + ": " + convertType(field.type, buffer) + ";";
}
