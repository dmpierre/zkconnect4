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