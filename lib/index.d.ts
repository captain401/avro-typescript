import { RecordType } from "./model";
export { RecordType } from "./model";
export interface LogicalTypeParams {
    customType: string;
    importStatement?: string;
}
export interface AvroToTypeScriptOptions {
    logicalTypes?: {
        [logicalType: string]: LogicalTypeParams;
    };
}
/** Converts an Avro record type to a TypeScript file */
export declare function avroToTypeScript(recordType: RecordType, options?: AvroToTypeScriptOptions): string;
