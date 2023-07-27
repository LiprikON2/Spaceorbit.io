/**
 * DeepRequired
 * @desc Required that works for deeply nested structure
 * @example
 *   // Expect: {
 *   //   first: {
 *   //     second: {
 *   //       name: string;
 *   //     };
 *   //   };
 *   // }
 *   type NestedProps = {
 *     first?: {
 *       second?: {
 *         name?: string;
 *       };
 *     };
 *   };
 *   type RequiredNestedProps = DeepRequired<NestedProps>;
 */
export type DeepRequired<T> = T extends (...args: any[]) => any
    ? T
    : T extends any[]
    ? _DeepRequiredArray<T[number]>
    : T extends object
    ? _DeepRequiredObject<T>
    : T;
/** @private */
// tslint:disable-next-line:class-name
export interface _DeepRequiredArray<T> extends Array<DeepRequired<NonUndefined<T>>> {}
/** @private */
export type _DeepRequiredObject<T> = {
    [P in keyof T]-?: DeepRequired<NonUndefined<T[P]>>;
};
