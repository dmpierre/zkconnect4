"use client";

import { Button, Header } from "ui";
import { Board } from "lib";
import { useState } from "react";
import './globals.css';

export default function Page() {
  const [board, setboard] = useState(new Board());

  return (
    <>
      <Header text="Web" />
      <Button />
    </>
  );
}
