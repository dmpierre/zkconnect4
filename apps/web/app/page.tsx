import { Button, Header } from "ui";
import { Board } from "lib";

export default function Page() {
  const board = new Board();
  board.printBoard();
  return (
    <>
      <Header text="Web" />
      <Button />
    </>
  );
}
