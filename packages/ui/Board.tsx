import * as React from "react";
import { Agent, Board, formatProof, updateGameWithTurn } from "lib";
import { AgentState } from "../../apps/web/hooks/useAgent";
import { Game, Turn } from "lib/types/types";

interface BoardDisplayProps {
    board: Board;
    setboard: React.Dispatch<React.SetStateAction<Board>>;
    setmovecounts: React.Dispatch<React.SetStateAction<number>>;
    setagentState: React.Dispatch<React.SetStateAction<AgentState>>;
    movecounts: number;
    agent: Agent;
    agentState: AgentState;
    agentWeights: any;
    winner: 0 | 1 | 2;
    setgameInputs: React.Dispatch<React.SetStateAction<Game>>;
    gameInputs: Game;
}

const getBaseInputs = (cellNumber: number, winner: 0 | 1 | 2, board: Board, agentMove: {
    column: number; prediction: number; rowHelper: number;
}, agentWeights: any) => {
    // base inputs to the circuit
    // does not contain updated board proof
    const playProofPlayer = formatProof(board.play(cellNumber, false, 1), 'player')
    const playProofAgent = formatProof(board.play(agentMove.prediction, false, 2), 'agent')
    const boardArray = [[board.getBoard()]]
    const boardProof = board.getBoardProof()
    const baseInput = {
        ...agentWeights,
        playerPlayedIndex: cellNumber,
        step_in: [board.boardTree.root, board.currentPlayer - 1, winner],
        board: boardArray,
        pathElements: boardProof.pathsElements,
        pathIndices: boardProof.pathsIndices,
        ...playProofPlayer,
        ...playProofAgent,
        agentMoveRowHelper: agentMove.rowHelper,
    }
    return baseInput;
};

const inferAgentMove = (board: Board, agent: Agent, setagentState: React.Dispatch<React.SetStateAction<AgentState>>) => {
    const agentMove = agent.getMove(board)

    if (agentMove?.prediction === undefined) {
        setagentState(AgentState.STALLED);
        throw new Error("Agent returned undefined move");
    } else {
        if (board.isValidMove(agentMove.prediction, 2)) {
            setagentState(AgentState.LOADED);
        } else {
            setagentState(AgentState.STALLED);
            throw new Error("Agent returned invalid move");
        }
    }
    return agentMove;
}

const getFinalInput = (baseInput: any, board: Board) =>  {
    // add the updated board proof to the base input
    const updatedBoardProof = board.getBoardProof()
    const updatedBoardArray = [[board.getBoard()]]
    const input = {
        ...baseInput,
        updatedBoard: updatedBoardArray,
        updatedBoardPathElements: updatedBoardProof.pathsElements,
        updatedBoardPathIndices: updatedBoardProof.pathsIndices,
    }
    return input as Turn;
}

export const BoardDisplay: React.FC<BoardDisplayProps> = ({ winner, agentWeights, board, setboard, setmovecounts, movecounts, agentState, agent, setagentState, setgameInputs, gameInputs }) => {
    return (
        <div className="bg-slate-200 border-teal-700 border-2 grid grid-rows-6 px-4 py-4 rounded-lg grid-cols-7 gap-x-10 gap-y-4">
            {
                board.board.map((cell, i) => {
                    const color = cell[1] === 0 ? "bg-stone-50" : cell[1] === 1 ? "bg-yellow-200" : "bg-red-200";
                    const hover = cell[1] === 0 ? "hover:bg-stone-200" : "";
                    const isValidMove = board.isValidMove(i, board.currentPlayer, false);
                    const isLoadedAgent = agentState == AgentState.LOADED;
                    const canPlay = isValidMove && isLoadedAgent;
                    const cursor = canPlay ? "cursor-pointer" : "";
                    return (
                        <div onClick={
                            () => {
                                if (!canPlay) return;
                                // Player plays move
                                console.log(i);
                                
                                let agentMove = inferAgentMove(board, agent, setagentState);
                                let baseInputPlayer = getBaseInputs(i, winner, board, agentMove, agentWeights);
                                board.play(i)
                                let inputPlayer = getFinalInput(baseInputPlayer, board);
                                let updatedGame = updateGameWithTurn(gameInputs, inputPlayer)                                

                                // Agent plays move
                                agentMove = inferAgentMove(board, agent, setagentState);
                                let baseInputAgent = getBaseInputs(agentMove.prediction, winner, board, agentMove, agentWeights);
                                board.play(agentMove.prediction)
                                let inputAgent = getFinalInput(baseInputAgent, board);
                                let updatedGameFinal = updateGameWithTurn(updatedGame, inputAgent)

                                setgameInputs(updatedGameFinal)
                                setboard(board)
                                setmovecounts(movecounts + 1)
                            }
                        } className={`${color} ${cursor} ${hover} border-teal-700 border-2 rounded-full p-4`} key={i}>
                        </div>
                    )
                })
            }
        </div >
    );
};