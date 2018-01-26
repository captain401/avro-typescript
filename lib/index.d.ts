import { RecordType } from "./model";
export { RecordType } from "./model";
export interface Options {
    logicalTypes?: {
        [key: string]: string;
    };
}
/** Converts an Avro record type to a TypeScript file */
export declare function avroToTypeScript(recordType: RecordType, options?: Options): string;
