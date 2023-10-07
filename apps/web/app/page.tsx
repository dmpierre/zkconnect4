"use client";

import { BoardDisplay, Header, Info, text } from "ui";
import { Board, initEmptyGame } from "lib";
import { useState } from "react";
import 'ui/styles.css';
import { AgentState, useAgent } from "../hooks/useAgent";
import agentWeightsJSON from "../public/connect4_agent/weights.json";
import { Game } from "lib/types/types";
import { useWorker } from "../hooks/useWorker";
import { Josefin_Slab, Urbanist } from "next/font/google";
import { PuffLoader } from "react-spinners";

const josephineSlab = Josefin_Slab({
  subsets: ['latin'],
});

const urbanist = Urbanist({
  subsets: ['latin'],
});

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};


export default function Page() {
  const [board, setboard] = useState(new Board());
  const [movecounts, setmovecounts] = useState(0);
  const { agent, agentState, setagentState } = useAgent();
  const [winner, setwinner] = useState<0 | 1 | 2>(0);
  const [gameInputs, setgameInputs] = useState<Game>(initEmptyGame());
  const { downloadParams, downloading, chunks, generateProof, proof, proving } = useWorker(gameInputs);
  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-col pt-5 basis-60 md:basis-96">
          <div className={`text-2xl font-bold md:text-4xl px-4 py-2 text-center ${josephineSlab.className}`}>
            <Header text="zkCONNECT-4"></Header>
          </div>
          <div className="flex justify-center space-x-2 items-center pb-2">
            <a href="https://github.com/dmpierre/zkconnect4" target="_blank">
              <img src="/github.png" height={30} width={30} />
            </a>
            <a className={`${urbanist.className} text-blue-400 underline`} href="https://www.loom.com/share/529239dcf67648c0a4548d6efbf7e000?sid=a2ef3dfc-1461-4d4d-b28d-69a0fff7013c" target="_blank">
              Video
            </a>
            <a className={`${urbanist.className} text-blue-400 underline`} href="https://hackmd.io/lfL00N75R_G4dVVMU_iMsA" target="_blank">
              Writeup
            </a>
          </div>
          <div className={`px-2 py-2 text-center ${urbanist.className}`}>
            <Info className="" text={"You will play against an RL connect4 trained agent (~76% win rate against a random playing strategy, not too bad but don't expect too much) and generate a snark to prove your game using nova."}></Info>
            <br />
            <Info className="text-xs font-bold" text={"It is a resource intensive app that may crash on mobile."}></Info>
          </div>
          <br />
          <BoardDisplay setgameInputs={setgameInputs} gameInputs={gameInputs} winner={winner}
            agentWeights={agentWeightsJSON} agentState={agentState} setagentState={setagentState}
            agent={agent} movecounts={movecounts} setmovecounts={setmovecounts}
            setboard={setboard} board={board} />
          <div className="py-2">
            {
              board.isWinner() ?
                <div className={`${urbanist.className} text-center py-2`} >Player {board.isWinner()['player']} wins!</div>
                :
                <div className={`${urbanist.className} text-center py-2 flex justify-center items-center space-x-5`} >
                  <div>
                    {agentState}
                  </div>
                </div>
            }
          </div>
          <div className="py-2 text-center flex justify-center space-y-2">
            {
              agentState != AgentState.LOADED ?
                <button className={`${urbanist.className} border-teal-700 border-2 p-1 rounded-md hover:bg-slate-200`} onClick={() => window.location.reload()}> Reload </button>
                :
                chunks.length > 0 ?
                  gameInputs.board.length > 0 ?
                    proving ?
                      <PuffLoader size={30} />
                      :
                      proof ?
                        <a download={"proof.json"} href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({ proof: proof }))}`}>
                          <button className={`${urbanist.className} border-teal-700 border-2 p-1 rounded-md hover:bg-slate-200`} >
                            Download proof
                          </button>
                        </a>
                        :
                        <button className={`${urbanist.className} border-teal-700 border-2 p-1 rounded-md hover:bg-slate-200`} onClick={generateProof}> Prove </button>
                    :
                    <></>
                  :
                  downloading ?
                    <PuffLoader size={30} />
                    :
                    <button className={`${urbanist.className} border-teal-700 border-2 p-1 rounded-md hover:bg-slate-200`} onClick={downloadParams}> Download parameters </button>
            }
          </div>
        </div>
      </div>

    </>
  );
}
