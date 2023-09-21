import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";

export type Empty = 0;
export type PlayerOne = 1;
export type PlayerTwo = 2;
type Bottom = 42;
type PlayerMove = Empty | PlayerOne | PlayerTwo;
type BottomCell = [Bottom, Bottom]; // cells that are used for building perfect binary tree.
export type Cell = [number, PlayerMove] | BottomCell;
export type BoardArray = number[][];
export type BoardTree = IncrementalMerkleTree;
export type PlayProof = {
    root: any,
    playedIndex: number,
    playedMove: PlayerOne | PlayerTwo,
    pathElementsCurrentLeaf: any[],
    pathIndicesCurrentLeaf: number[],
    belowLeafMove: number,
    pathElementsBelowLeaf: any[],
    pathIndicesBelowLeaf: number[],
    newRoot: any,
    pathElementsRootUpdate: any[],
}
export type MerklePath = [number, number, number, number, number, number];

export interface Game {
    dense_weights: string[][],
    dense_bias: string[][],
    dense_1_weights: string[][],
    dense_1_bias: string[][],
    dense_2_weights: string[][],
    dense_2_bias: string[][],
    dense_3_weights: string[][],
    dense_3_bias: string[][],
    dense_4_weights: string[][],
    dense_4_bias: string[][],
    playerPlayedIndex: number[],
    step_in: [number, number, number][],
    board: BoardArray[],
    pathElements: MerklePath[][],
    pathIndices: MerklePath[][],
    pathElementsCurrentLeafPlayer: MerklePath[],
    pathIndicesCurrentLeafPlayer: MerklePath[],
    belowLeafPlayer: number[],
    pathElementsBelowLeafPlayer: MerklePath[],
    pathIndicesBelowLeafPlayer: MerklePath[],
    updatedRootFromPlayerPlay: number[],
    pathElementsUpdatedRootFromPlayer: MerklePath[],
    pathElementsCurrentLeafAgent: MerklePath[],
    pathIndicesCurrentLeafAgent: MerklePath[],
    belowLeafAgent: number[],
    pathElementsBelowLeafAgent: MerklePath[],
    pathIndicesBelowLeafAgent: MerklePath[],
    updatedRootFromAgentPlay: number[],
    pathElementsUpdatedRootFromAgent: MerklePath[],
    agentMoveRowHelper: number[],
    updatedBoard: BoardArray[],
    updatedBoardPathElements: MerklePath[][],
    updatedBoardPathIndices: MerklePath[][],
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
}

export interface Turn {
    dense_weights: string[],
    dense_bias: string[],
    dense_1_weights: string[],
    dense_1_bias: string[],
    dense_2_weights: string[],
    dense_2_bias: string[],
    dense_3_weights: string[],
    dense_3_bias: string[],
    dense_4_weights: string[],
    dense_4_bias: string[],
    playerPlayedIndex: number,
    step_in: [number, number, number],
    board: BoardArray,
    pathElements: MerklePath[],
    pathIndices: MerklePath[],
    pathElementsCurrentLeafPlayer: MerklePath,
    pathIndicesCurrentLeafPlayer: MerklePath,
    belowLeafPlayer: number,
    pathElementsBelowLeafPlayer: MerklePath,
    pathIndicesBelowLeafPlayer: MerklePath,
    updatedRootFromPlayerPlay: number,
    pathElementsUpdatedRootFromPlayer: MerklePath,
    pathElementsCurrentLeafAgent: MerklePath,
    pathIndicesCurrentLeafAgent: MerklePath,
    belowLeafAgent: number,
    pathElementsBelowLeafAgent: MerklePath,
    pathIndicesBelowLeafAgent: MerklePath,
    updatedRootFromAgentPlay: number,
    pathElementsUpdatedRootFromAgent: MerklePath,
    agentMoveRowHelper: number,
    updatedBoard: BoardArray,
    updatedBoardPathElements: MerklePath[],
    updatedBoardPathIndices: MerklePath[],
}