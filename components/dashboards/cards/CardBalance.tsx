import { Card, CardBody } from "@nextui-org/react";
import React from "react";
import { MoneyBag } from "../icons/MoneyBag";


export const CardBalance = () => {
  return (
    <Card className="xl:max-w-sm bg-default-50 rounded-xl shadow-md px-8 w-full">
      <CardBody className="py-5 overflow-hidden">
        <div className="flex gap-2.5">
          <MoneyBag />
          <div className="flex flex-col">
            <span className="text-white">Current Pool</span>
            <span className="text-white text-xs">Govenment funds for Education</span>
          </div>
        </div>
        <div className="flex gap-2.5 py-2 items-center">
          <span className="text-white text-xl font-semibold">$45,910</span>
          <span className="text-success text-xs">+ 4.5%</span>
        
        </div>
      </CardBody>
    </Card>
  );
};