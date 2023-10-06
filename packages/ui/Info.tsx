import * as React from "react";

export const Info = ({ text, className }: { text: string, className: string }) => {
  return <div className={className}>{text}</div>;
};
