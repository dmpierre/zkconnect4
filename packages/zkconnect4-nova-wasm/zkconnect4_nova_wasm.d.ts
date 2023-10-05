/* tslint:disable */
/* eslint-disable */
/**
*/
export function init_panic_hook(): void;
/**
* @param {number} chunk
* @returns {Promise<string>}
*/
export function download_pp_chunk(chunk: number): Promise<string>;
/**
* @returns {Promise<string>}
*/
export function download_params(): Promise<string>;
/**
* @param {Array<any>} pp_chunks
* @param {string} game_string
* @returns {Promise<string>}
*/
export function generate_proof(pp_chunks: Array<any>, game_string: string): Promise<string>;
/**
* @param {string} path
* @returns {Promise<Uint8Array>}
*/
export function read_file(path: string): Promise<Uint8Array>;
/**
* @param {string} input_json_string
* @param {string} wasm_file
* @returns {Promise<Uint8Array>}
*/
export function generate_witness_browser(input_json_string: string, wasm_file: string): Promise<Uint8Array>;
/**
* @param {number} num_threads
* @returns {Promise<any>}
*/
export function initThreadPool(num_threads: number): Promise<any>;
/**
* @param {number} receiver
*/
export function wbg_rayon_start_worker(receiver: number): void;
/**
*/
export class wbg_rayon_PoolBuilder {
  free(): void;
/**
* @returns {number}
*/
  numThreads(): number;
/**
* @returns {number}
*/
  receiver(): number;
/**
*/
  build(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly download_pp_chunk: (a: number) => number;
  readonly download_params: () => number;
  readonly generate_proof: (a: number, b: number, c: number) => number;
  readonly init_panic_hook: () => void;
  readonly read_file: (a: number, b: number) => number;
  readonly generate_witness_browser: (a: number, b: number, c: number, d: number) => number;
  readonly __wbg_wbg_rayon_poolbuilder_free: (a: number) => void;
  readonly wbg_rayon_poolbuilder_numThreads: (a: number) => number;
  readonly wbg_rayon_poolbuilder_receiver: (a: number) => number;
  readonly wbg_rayon_poolbuilder_build: (a: number) => void;
  readonly wbg_rayon_start_worker: (a: number) => void;
  readonly initThreadPool: (a: number) => number;
  readonly memory: WebAssembly.Memory;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly _dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__h4cfaf2fb276f526b: (a: number, b: number, c: number) => void;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly wasm_bindgen__convert__closures__invoke2_mut__h3c03d26d9a256132: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_thread_destroy: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput, maybe_memory?: WebAssembly.Memory): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
* @param {WebAssembly.Memory} maybe_memory
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>, maybe_memory?: WebAssembly.Memory): Promise<InitOutput>;
