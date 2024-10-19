import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import { MoneyBag } from "../icons/MoneyBag";

class Props {
  title: string;
  description: string;
  amount: number;
  percentage: number | undefined;
}


export const CardBalance = (props: Props) => {
  return (
    <Card className="xl:max-w-sm bg-default-50 rounded-xl shadow-md px-8 w-full">
      <CardBody className="py-5 overflow-hidden">
        <div className="flex gap-2.5">
          <MoneyBag />
          <div className="flex flex-col">
            <span className="text-white">{props.title}</span>
            <span className="text-white text-xs">{props.description}</span>
          </div>
        </div>
        <div className="flex gap-2.5 py-2 items-center">
          <span className="text-white text-xl font-semibold">{props.amount}</span>
          {(!!props.percentage && props.percentage > 0) && (
            <span className="text-success text-xs">+ {props.percentage}%</span>
          )}
        </div>
      </CardBody>
    </Card>
  );
};