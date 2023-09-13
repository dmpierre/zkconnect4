"use client";

import { BoardDisplay } from "ui";
import { Board } from "lib";
import { useState } from "react";
import 'ui/styles.css';

export default function Page() {
  const [board, setboard] = useState(new Board());
  const [movecounts, setmovecounts] = useState(0);

  
  return (
    <>
      <div className="flex justify-center">
        <BoardDisplay movecounts={movecounts} setmovecounts={setmovecounts} setboard={setboard} board={board} />
      </div>
    </>
  );
}
