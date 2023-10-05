import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { BoardArray, Cell, Empty, Game, PlayProof, PlayerOne, PlayerTwo, Turn } from "../types/types";
//@ts-ignore
import { poseidon } from "circomlibjs";

export class Board {

    board: BoardArray;
    boardTree: IncrementalMerkleTree;
    currentPlayer: PlayerOne | PlayerTwo;

    constructor() {
        this.board = Array.from({ length: 42 }, (_, i) => [i, 0]);
        this.boardTree = buildBoardTree(this.board);
        this.currentPlayer = 1;
    }

    getBoard() {
        return this.board.filter((cell, i) => (i < 42)).map((cell) => cell[1]);
    }

    getBoardTree() {
        return this.boardTree;
    }

    isWinner() {
        // check horizontal
        for (let i = 0; i < 42; i += 7) {
            for (let j = i; j < i + 4; j++) {
                if (this.board[j][1] != 0) {
                    if (this.board[j][1] == this.board[j + 1][1] &&
                        this.board[j][1] == this.board[j + 2][1] &&
                        this.board[j][1] == this.board[j + 3][1]) {
                        return { winner: true, player: this.board[j][1] };
                    }
                }
            }
        }

        // check vertical
        for (let i = 0; i < 7; i++) {
            for (let j = i; j < i + 21; j += 7) {
                if (this.board[j][1] != 0) {
                    if (this.board[j][1] == this.board[j + 7][1] &&
                        this.board[j][1] == this.board[j + 14][1] &&
                        this.board[j][1] == this.board[j + 21][1]) {
                        return { winner: true, player: this.board[j][1] };
                    }
                }
            }
        }

        // check right to left diagonals
        for (let i = 3; i <= 17; i += 7) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i + j][1] != 0) {
                    if (this.board[i + j][1] == this.board[i + j + 6][1] &&
                        this.board[i + j][1] == this.board[i + j + 12][1] &&
                        this.board[i + j][1] == this.board[i + j + 18][1]) {
                        return { winner: true, player: this.board[i + j][1] };
                    }
                }
            }
        }

        // check left to right diagonals
        for (let i = 0; i <= 14; i += 7) {
            for (let j = 0; j < 4; j++) {
                if (this.board[i + j][1] != 0) {
                    if (this.board[i + j][1] == this.board[i + j + 8][1] &&
                        this.board[i + j][1] == this.board[i + j + 16][1] &&
                        this.board[i + j][1] == this.board[i + j + 24][1]) {
                        return { winner: true, player: this.board[i + j][1] };
                    }
                }
            }
        }
        return false
    }

    isValidMove(playIdx: number, move: PlayerOne | PlayerTwo | Empty, throwErr = true) {
        if (move == 0) {
            throw new Error("Move can not be empty");
        }

        const belowIdx = playIdx + 7;

        // check in the tree that cell below is not empty
        if (this.getCellHash(belowIdx) == this.hashCell([belowIdx, 0])) {
            if (throwErr) {
                throw new Error("Cell below is empty in tree.");
            }
            else return false;
        }

        // check in the tree that current cell is empty
        if (this.getCellHash(playIdx) != this.hashCell([playIdx, 0])) {
            if (throwErr) {
                throw new Error("Cell is not empty in tree.");
            }
            else return false;
        }

        // check on board that cell is empty
        if (this.board[playIdx][1] == 0) {
            if (playIdx < 35) {
                // check that cell below is not empty when not playing bottom line
                if (this.board[belowIdx][1] == 0) {
                    if (throwErr) {
                        throw new Error("Cell below is empty in board.");
                    }
                    else return false;
                }
                return true;
            }
            return true;
        } else {
            if (throwErr) {
                throw new Error("Cell is not empty in board.");
            }
            else return false;
        }

    }

    playNoCheck(playIdx: number, move: PlayerOne | PlayerTwo | Empty) {
        this.board[playIdx][1] = move;
    }

    getPlayProof(playIdx: number) {
        const root = this.boardTree.root;
        const proof = this.boardTree.createProof(playIdx);
        const pathElements = proof.siblings.map((sibling) => sibling[0]);
        const pathIndices = proof.pathIndices;
        const belowMove = this.getMoveAtIndex(playIdx + 7);
        const proofBelow = this.boardTree.createProof(playIdx + 7);
        const pathElementsBelow = proofBelow.siblings.map((sibling) => sibling[0]);
        const pathIndicesBelow = proofBelow.pathIndices;

        return {
            root,
            playedIndex: playIdx,
            playedMove: this.currentPlayer,
            pathElementsCurrentLeaf: pathElements,
            pathIndicesCurrentLeaf: pathIndices,
            belowLeafMove: belowMove,
            pathElementsBelowLeaf: pathElementsBelow,
            pathIndicesBelowLeaf: pathIndicesBelow
        }

    }

    play(playIdx: number, update = true, forcePlayer?: PlayerOne | PlayerTwo | undefined) {
        /**
         * Updates the board and the board tree with the play.
         * playIdx: index of the cell to play
         * move: player 1 or 2
         * returns: a proof for the play
         */
        const player = forcePlayer ? forcePlayer : this.currentPlayer;

        if (this.isValidMove(playIdx, player)) {

            // generate proof for play under current root            
            const playProof = this.getPlayProof(playIdx);

            // update board and current player. updates the board, the tree and player
            this.board[playIdx][1] = player;
            this.boardTree.update(playIdx, this.hashCell([playIdx, player]));
            const previousPlayer = this.currentPlayer;
            this.currentPlayer = player == 1 ? 2 : 1;

            // generate proof for updated root
            const newRoot = this.boardTree.root;
            const updatedProof = this.boardTree.createProof(playIdx);
            const pathElementsRootUpdate = updatedProof.siblings.map((sibling) => sibling[0]);

            if (!update) {
                // undo update done above.
                // resets board, tree leaf and player
                this.board[playIdx][1] = 0;
                this.boardTree.update(playIdx, this.hashCell([playIdx, 0]));
                this.currentPlayer = previousPlayer;
            }

            return {
                ...playProof,
                newRoot,
                pathElementsRootUpdate
            };
        }
        else {
            throw new Error("Invalid move");
        }
    }

    moveToStr(move: number) {
        if (move == 0) {
            return ".";
        } else if (move == 1) {
            return "X";
        } else {
            return "O";
        }
    }

    printBoard() {

        const boardStr = this.board.map((cell) => {
            return this.moveToStr(cell[1]);
        });

        console.log(boardStr.slice(0, 7).join(" | "));
        console.log(boardStr.slice(7, 14).join(" | "));
        console.log(boardStr.slice(14, 21).join(" | "));
        console.log(boardStr.slice(21, 28).join(" | "));
        console.log(boardStr.slice(28, 35).join(" | "));
        console.log(boardStr.slice(35, 42).join(" | "));
    }

    getMoveAtIndex(index: number) {
        if (index < 0) {
            throw new Error("Index can not be negative");
        }
        else if (index > 41) {
            return 1;
        }
        else {
            return this.board[index][1];
        }
    }

    hashCell(cell: Cell) {
        return poseidon(cell);
    }

    getCellHash(index: number) {
        return this.boardTree.leaves[index];
    }

    getBoardProof() {
        const root = this.boardTree.root;
        // we only need the board content, not the indices
        const board = this.board.filter((cell, i) => (i < 42)).map((cell) => cell[1]);
        const pathsElements = []; // array[42][6] 
        const pathsIndices = []; // array[42][6]
        for (let i = 0; i < 42; i++) {
            const proof = this.boardTree.createProof(i);
            pathsElements.push(proof.siblings.map((sibling) => sibling[0]));
            pathsIndices.push(proof.pathIndices);
        }
        return {
            root,
            board,
            pathsElements,
            pathsIndices
        }
    }

}

export const buildBoardTree = (board: BoardArray) => {
    // assert that the board has 42 cells
    if (board.length !== 42) {
        throw new Error("Invalid board");
    }
    const initLeaves = board.map((cell, i) => poseidon(cell));

    // add not empty cells to the board until length is 64
    let i = 42;
    while (i < 64) {
        initLeaves.push(poseidon([i, 1]));
        i++;
    }

    const tree = new IncrementalMerkleTree(poseidon, 6, initLeaves.slice(-1)[0], 2, initLeaves);
    return tree
}

export const formatProof = (playProof: PlayProof, format: 'agent' | 'player') => {
    // formatting the proof such that it cna be consumed by the circuit
    // by formatting, we mean renamiung the attribute of the play proof
    // that was generated by the agent or the player
    if (format == 'agent') {
        return {
            pathElementsCurrentLeafAgent: playProof.pathElementsCurrentLeaf,
            pathIndicesCurrentLeafAgent: playProof.pathIndicesCurrentLeaf,
            belowLeafAgent: playProof.belowLeafMove,
            pathElementsBelowLeafAgent: playProof.pathElementsBelowLeaf,
            pathIndicesBelowLeafAgent: playProof.pathIndicesBelowLeaf,
            updatedRootFromAgentPlay: playProof.newRoot,
            pathElementsUpdatedRootFromAgent: playProof.pathElementsRootUpdate,
        }
    } else {
        return {
            pathElementsCurrentLeafPlayer: playProof.pathElementsCurrentLeaf,
            pathIndicesCurrentLeafPlayer: playProof.pathIndicesCurrentLeaf,
            belowLeafPlayer: playProof.belowLeafMove,
            pathElementsBelowLeafPlayer: playProof.pathElementsBelowLeaf,
            pathIndicesBelowLeafPlayer: playProof.pathIndicesBelowLeaf,
            updatedRootFromPlayerPlay: playProof.newRoot,
            pathElementsUpdatedRootFromPlayer: playProof.pathElementsRootUpdate,
        }
    }
}

export const initEmptyGame = () => {
    return {
        board: [],
        pathElements: [],
        pathIndices: [],
        dense_weights: [],
        dense_bias: [],
        dense_1_weights: [],
        dense_1_bias: [],
        dense_2_weights: [],
        dense_2_bias: [],
        dense_3_weights: [],
        dense_3_bias: [],
        dense_4_weights: [],
        dense_4_bias: [],
        step_in: [],
        pathElementsCurrentLeafPlayer: [],
        pathIndicesCurrentLeafPlayer: [],
        belowLeafPlayer: [],
        pathElementsBelowLeafPlayer: [],
        pathIndicesBelowLeafPlayer: [],
        updatedRootFromPlayerPlay: [],
        pathElementsUpdatedRootFromPlayer: [],
        agentMoveRowHelper: [],
        playerPlayedIndex: [],
        pathElementsCurrentLeafAgent: [],
        pathIndicesCurrentLeafAgent: [],
        belowLeafAgent: [],
        pathElementsBelowLeafAgent: [],
        pathIndicesBelowLeafAgent: [],
        updatedRootFromAgentPlay: [],
        pathElementsUpdatedRootFromAgent: [],
        updatedBoard: [],
        updatedBoardPathElements: [],
        updatedBoardPathIndices: [],
        initialStepIn: [
            [
                "d1da8a9b8bcccb93",
                "2acecbc440686ac3",
                "94f8aaca0b9d154a",
                "1281ec87e2733a0e"
            ],
            0,
            0
        ]
    } as Game;
};

export const updateGameWithTurn = (game: Game, turn: Turn) => {
    // a turn has been played, we update the game object with the relevant 
    // turn data 
    Object.entries(turn).forEach(([key, value]) => {
        game[key as keyof Game].push(value);
    });
    return game;
}