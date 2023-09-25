"use client";

import { BoardDisplay } from "ui";
import { Board, initEmptyGame } from "lib";
import { useState } from "react";
import 'ui/styles.css';
import { useAgent } from "../hooks/useAgent";
import agentWeightsJSON from "../public/connect4_model/model.json";
import { Game } from "lib/types/types";
import { useWorker } from "../hooks/useWorker";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export default function Page() {

  const [board, setboard] = useState(new Board());
  const [movecounts, setmovecounts] = useState(0);
  const { agent, agentState, setagentState } = useAgent();
  const [winner, setwinner] = useState<0 | 1 | 2>(0);
  const [gameInputs, setgameInputs] = useState<Game>(initEmptyGame());
  const { downloadParams, chunks, generateProof } = useWorker(gameInputs);

  return (
    <>
      <div className="flex justify-center">
        <div className="flex flex-col">
          <BoardDisplay setgameInputs={setgameInputs} gameInputs={gameInputs} winner={winner} agentWeights={agentWeightsJSON} agentState={agentState} setagentState={setagentState} agent={agent} movecounts={movecounts} setmovecounts={setmovecounts} setboard={setboard} board={board} />
          <div>{agentState}</div>
          <div>
            <button onClick={downloadParams}> Generate </button>
            <br />
            <button onClick={generateProof}> Prove </button>
          </div>
        </div>
      </div>
    </>
  );
}
