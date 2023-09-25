import { expose } from "comlink";

const N_CHUNKS = 11;

const downloadChunk = async (multithread: typeof import("../../../packages/zkconnect4-nova-wasm/zkconnect4_nova_wasm"), chunk: number) => {
    const download = await multithread.download_pp_chunk(chunk);
    return { chunk, data: download };
};

async function download_pp_chunks() {
    const multiThread = await import("zkconnect4-nova-wasm");
    await multiThread.default();
    await multiThread.initThreadPool(navigator.hardwareConcurrency - 1);
    const start = performance.now();
    const downloads = new Array(11);
    for (let i = 0; i < N_CHUNKS; i++) {
        downloads[i] = downloadChunk(multiThread, i);
    }
    const chunks = await Promise.all(downloads);
    const orderedChunks: string[] = new Array(11);
    chunks.forEach((chunk) => {
        orderedChunks[chunk.chunk] = chunk.data;
    });
    const end = performance.now();
    return orderedChunks;
}

async function generateProof(chunks: string[], game: string) {
    console.log(game);
    const multiThread = await import("zkconnect4-nova-wasm");
    await multiThread.default();
    await multiThread.initThreadPool(navigator.hardwareConcurrency - 1);
    const start = performance.now();
    const data = await multiThread.generate_proof(chunks, game);
    const end = performance.now();
    return data;
}

const exports = {
    download_pp_chunks,
    generateProof
};

export type ZKConnect4Worker = typeof exports;

expose(exports);