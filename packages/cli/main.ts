import { askMove } from "../lib/utils/utils";
import { Board, formatProof } from "../lib";
import fs from "fs";
import { art, loadConnect4 } from "./conf";
import assert from "assert";
import { aggregate } from "./aggregate";

export const main = async () => {
    // cleaning out folder
    fs.readdirSync('./out/').forEach(f => fs.rmSync(`./out/${f}`));
    const board = new Board();
    console.clear();
    let message = 'Loading board...';
    console.log(art);
    console.log(message);
    const { agent, weights, connect4Circuit } = await loadConnect4();
    message = '';
    let moves = 0;
    let winner = 0;
    while (true) {
        console.clear();
        console.log(art);
        board.printBoard();
        console.log(message);
        const agentMove = agent.getMove(board);
        if (agentMove?.prediction == undefined) {
            message = "Error getting move from agent";
            continue;
        }
        let playerMove = agentMove?.prediction;
        if (board.currentPlayer == 1) {
            playerMove = parseInt(await askMove("Move: ") as string);
        }
        console.clear();
        try {
            const playProofPlayer = formatProof(board.play(playerMove, false, 1), 'player');
            const playProofAgent = formatProof(board.play(agentMove.prediction, false, 2), 'agent');
            const boardArray = [[board.getBoard()]];
            const boardProof = board.getBoardProof();
            const baseInput = {
                ...weights,
                playerPlayedIndex: playerMove,
                step_in: [board.boardTree.root, board.currentPlayer - 1, winner],
                board: boardArray,
                pathElements: boardProof.pathsElements,
                pathIndices: boardProof.pathsIndices,
                ...playProofPlayer,
                ...playProofAgent,
                agentMoveRowHelper: agentMove.rowHelper,
            }

            const move = board.currentPlayer == 1 ? playerMove : agentMove.prediction;
            board.play(move);
            const updatedBoardProof = board.getBoardProof();
            const updatedBoardArray = [[board.getBoard()]];
            const input = {
                ...baseInput,
                updatedBoard: updatedBoardArray,
                updatedBoardPathElements: updatedBoardProof.pathsElements,
                updatedBoardPathIndices: updatedBoardProof.pathsIndices,
            }
            const wtns = await connect4Circuit.calculateWitness(input);
            fs.writeFileSync(
                `out/move_${moves}.json`, JSON.stringify(input)
            )
            assert(wtns[1] == board.boardTree.root, "Root is not correct");
            winner = Number(wtns[3]);
            message = '';
            moves++;
            if (winner != 0) {
                break;
            }
        } catch (e: any) {
            message = e.message;
        }
    }
}

main().then(() => aggregate());
