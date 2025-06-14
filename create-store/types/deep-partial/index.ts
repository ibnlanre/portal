import type { Primitives } from "@/create-store/types/primitives";
import type { Dictionary } from "../dictionary";

type Reference =
  | Array<any>
  | ReadonlyArray<any>
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array
  | BigInt64Array
  | BigUint64Array
  | Map<any, any>
  | WeakMap<WeakKey, any>
  | ReadonlyMap<any, any>
  | Set<any>
  | WeakSet<WeakKey>
  | ReadonlySet<any>
  | Date
  | RegExp
  | Error
  | Function
  | Promise<any>
  | ArrayBuffer
  | DataView
  | SharedArrayBuffer
  | SharedArrayBufferConstructor
  | Atomics;

export type DeepPartial<Argument> = Argument extends Primitives | Reference
  ? Argument
  : Argument extends Dictionary
  ? { [Key in keyof Argument]?: DeepPartial<Argument[Key]> }
  : never;
