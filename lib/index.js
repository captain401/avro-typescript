"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var model_1 = require("./model");
var Converter = /** @class */ (function () {
    function Converter(options) {
        if (options === void 0) { options = {}; }
        this.typeNames = [];
        this.options = options;
    }
    /** Convert a primitive type from avro to TypeScript */
    Converter.prototype.convertPrimitive = function (avroType) {
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
    };
    /** Convert an Avro Record type. Return the name, but add the definition to the file */
    Converter.prototype.convertRecord = function (recordType, fileBuffer) {
        // If this exported top-level type was already created, skip it.
        // Still return the recordType.name for nested record type fields.
        if (this.typeNames.indexOf(recordType.name) > -1) {
            return recordType.name;
        }
        var buffer = "export interface " + recordType.name + " {\n";
        for (var _i = 0, _a = recordType.fields; _i < _a.length; _i++) {
            var field = _a[_i];
            buffer += this.convertFieldDec(field, fileBuffer) + "\n";
        }
        buffer += "}\n";
        fileBuffer.push(buffer);
        this.typeNames.push(recordType.name);
        return recordType.name;
    };
    /** Convert an Avro Enum type. Return the name, but add the definition to the file */
    Converter.prototype.convertEnum = function (enumType, fileBuffer) {
        // Skip the enum if already created.
        if (this.typeNames.indexOf(enumType.name) > -1) {
            return enumType.name;
        }
        var enumDef = "export enum " + enumType.name + " {\n";
        var ctr = 0;
        var suffix;
        for (var _i = 0, _a = enumType.symbols; _i < _a.length; _i++) {
            var enumSymbol = _a[_i];
            enumDef += "  " + enumSymbol + " = '" + enumSymbol + "'";
            ctr++;
            if (ctr === enumType.symbols.length) {
                suffix = "\n";
            }
            else {
                suffix = ",\n";
            }
            enumDef += "" + suffix;
        }
        enumDef += "};\n";
        fileBuffer.push(enumDef);
        this.typeNames.push(enumType.name);
        return enumType.name;
    };
    /** Convert an Avro Logical type. Return a custom (from options) or primitive type. */
    Converter.prototype.convertLogicalType = function (type, buffer) {
        var logicalType = type;
        // Use `this.options` to handle custom logical types.
        if (this.options.logicalTypes) {
            var customType = this.options.logicalTypes[logicalType.logicalType];
            if (customType) {
                return customType;
            }
        }
        return this.convertPrimitive(logicalType.type);
    };
    Converter.prototype.convertType = function (type, buffer) {
        var _this = this;
        // if it's just a name, then use that
        if (typeof type === "string") {
            return this.convertPrimitive(type) || type;
        }
        else if (type instanceof Array) {
            // array means a Union. Use the names and call recursively
            return type.map(function (t) { return _this.convertType(t, buffer); }).join(" | ");
        }
        else if (model_1.isRecordType(type)) {
            //} type)) {
            // record, use the name and add to the buffer
            return this.convertRecord(type, buffer);
        }
        else if (model_1.isArrayType(type)) {
            // array, call recursively for the array element type
            return this.convertType(type.items, buffer) + "[]";
        }
        else if (model_1.isMapType(type)) {
            // Dictionary of types, string as key
            return "{ [index:string]:" + this.convertType(type.values, buffer) + " }";
        }
        else if (model_1.isEnumType(type)) {
            // array, call recursively for the array element type
            return this.convertEnum(type, buffer);
        }
        else if (model_1.isLogicalType(type)) {
            return this.convertLogicalType(type, buffer);
        }
        else {
            console.error("Cannot work out type", type);
            return "UNKNOWN";
        }
    };
    Converter.prototype.convertFieldDec = function (field, buffer) {
        // Union Type
        return "\t" + field.name + (model_1.isOptional(field.type) ? "?" : "") + ": " + this.convertType(field.type, buffer) + ";";
    };
    return Converter;
}());
/** Converts an Avro record type to a TypeScript file */
function avroToTypeScript(recordType, options) {
    var converter = new Converter(options);
    var output = [];
    converter.convertRecord(recordType, output);
    return output.join("\n");
}
exports.avroToTypeScript = avroToTypeScript;
