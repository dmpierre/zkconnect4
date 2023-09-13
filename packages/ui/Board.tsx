import * as React from "react";
import { Board } from "lib";

interface BoardDisplayProps {
    board: Board;
    setboard: React.Dispatch<React.SetStateAction<Board>>;
    setmovecounts: React.Dispatch<React.SetStateAction<number>>;
    movecounts: number;
}

export const BoardDisplay: React.FC<BoardDisplayProps> = ({ board, setboard, setmovecounts, movecounts }) => {
    return (
        <div className="bg-slate-200 border-teal-700 border-2 grid grid-rows-6 px-4 py-4 rounded-lg grid-cols-7 gap-x-10 gap-y-4">
            {
                board.board.map((cell, i) => {
                    const color = cell[1] === 0 ? "bg-stone-50" : cell[1] === 1 ? "bg-yellow-200" : "bg-red-200";
                    const hover = cell[1] === 0 ? "hover:bg-stone-200" : "";
                    const cursor = board.isValidMove(i, board.currentPlayer, false) ? "cursor-pointer" : "";
                    return (
                        <div onClick={
                            () => {
                                board.play(i)
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