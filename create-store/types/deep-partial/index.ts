import type { Dictionary } from "../dictionary";
import type { Primitives } from "@/create-store/types/primitives";

export type DeepPartial<Argument> = Argument extends Primitives | Reference
  ? Argument
  : Argument extends Dictionary
    ? { [Key in keyof Argument]?: DeepPartial<Argument[Key]> }
    : never;

type Reference =
  | Array<any>
  | ArrayBuffer
  | Atomics
  | BigInt64Array
  | BigUint64Array
  | DataView
  | Date
  | Error
  | Float32Array
  | Float64Array
  | Function
  | Int8Array
  | Int16Array
  | Int32Array
  | Map<any, any>
  | Promise<any>
  | ReadonlyArray<any>
  | ReadonlyMap<any, any>
  | ReadonlySet<any>
  | RegExp
  | Set<any>
  | SharedArrayBuffer
  | SharedArrayBufferConstructor
  | Uint8Array
  | Uint8ClampedArray
  | Uint16Array
  | Uint32Array
  | WeakMap<WeakKey, any>
  | WeakSet<WeakKey>;
