import { Remote, wrap } from "comlink";
import { Game } from "lib/types/types.js";
import { useEffect, useRef, useState } from "react";

export const useWorker = (game: Game) => {

    const [chunks, setchunks] = useState<string[]>([]);
    const [proof, setproof] = useState("");
    const [downloading, setdownloading] = useState(false);
    const [proving, setproving] = useState(false);

    const workerApiRef = useRef<Remote<{
        download_pp_chunks: () => Promise<string[]>;
        generateProof: (chunks: string[], game: string) => Promise<string>;
    }>>();

    useEffect(() => {
        const worker = new Worker(new URL("../workers/worker.ts", import.meta.url));
        const workerApi = wrap<import("../workers/worker").ZKConnect4Worker>(worker);
        workerApiRef.current = workerApi;
    }, [chunks, proof]);

    const downloadParams = async () => {
        setdownloading(true);
        const chunks = await workerApiRef.current.download_pp_chunks();
        setdownloading(false);
        setchunks(chunks);
    };

    const generateProof = async () => {
        if (game.board.length == 0) {
            throw new Error("No game");
        }
        if (chunks.length == 0) {
            throw new Error("No pp chunks found");
        }
        setproving(true);
        const proof = await workerApiRef.current.generateProof(chunks, JSON.stringify(game));
        setproving(false);
        console.log(proof);
        setproof(proof);
    };

    return { downloadParams, proving, downloading, chunks, generateProof, proof };
};

