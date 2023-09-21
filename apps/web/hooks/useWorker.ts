import { wrap } from "comlink";
import { Game } from "lib/types/types.js";
import { useState } from "react";

export const useWorker = (game: Game) => {
    const [chunks, setchunks] = useState<string[]>([]);
    const [proof, setproof] = useState("");

    const worker = new Worker(new URL("../workers/worker.ts", import.meta.url), {
        type: "module",
        name: "zkconnect4-worker",
    });
    const workerApi =
    wrap<import("../workers/worker.ts").ZKConnect4Worker>(worker);

    const downloadParams = async () => {
        const chunks = await workerApi.download_pp_chunks();
        setchunks(chunks);
    };

    const generateProof = async () => {

        const proof = await workerApi.generateProof(chunks, JSON.stringify(game));
        console.log(proof);
        
        setproof(proof);
    };

    return { downloadParams, chunks, generateProof };
};

