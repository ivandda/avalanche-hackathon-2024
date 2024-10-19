import React from "react";

interface Props {
  color?: string;
}

export const MoneyBag = ({ color = "white" }: Props) => {
  return (
    <img
      src="/money-bag.svg"
      alt="Money Bag"
      width={24}
      height={24}
      style={{ fill: color }}
    />
  );
};