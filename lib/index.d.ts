import { RecordType } from "./model";
export { RecordType } from "./model";
/** Result interface for avroToTypeScript function. */
export interface avroToTypeScriptResult {
    tsInterface: string;
    typeNames: string[];
}
/** Converts an Avro record type to a TypeScript file */
export declare function avroToTypeScript(recordType: RecordType, aTypeNames: string[]): avroToTypeScriptResult;
