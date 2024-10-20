import { User, Tooltip, Chip } from "@nextui-org/react";
import React from "react";
import { users } from "./data";
import { EyeIcon } from "../icons/table/eye-icon";
import { EditIcon } from "../icons/table/edit-icon";
import { DeleteIcon } from "../icons/table/delete-icon";
import Image from "next/image";

interface Props {
  user: (typeof users)[number];
  columnKey: string | React.Key;
}

export const RenderCell = ({ user, columnKey }: Props) => {
  // @ts-expect-error columnKey type
  const cellValue = user[columnKey];
  switch (columnKey) {
    case "name":
      return (
        <div className="flex">
          <div className="pr-4 flex flex-col justify-center">
            <Image src={"https://i.pravatar.cc/150?u=a04258114e29026702d"} alt={cellValue.name} width={40} height={40} className="rounded-full"/>
          </div>
          
          <div>
            <p>{cellValue}</p>
            <p>{user.email}</p>
          </div>
        </div>
      );
    case "role":
      return (
        <div>
          <div>
            <span>{cellValue}</span>
          </div>
        </div>
      );
    case "status":
      return (
        <Chip
          size="sm"
          variant="flat"
          color={
            cellValue === "active" || cellValue === "approved"
              ? "success"
              : cellValue === "paused"
              ? "danger"
              : "warning"
          }
        >
          <span className="capitalize text-xs">{cellValue}</span>
        </Chip>
      );

    case "actions":
      return (
        <div className="flex items-center justify-center gap-4 ">
          <div>
            <Tooltip content="Details">
              <button onClick={() => console.log("View user", user.id)}>
                <EyeIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          </div>
          <div>
            <Tooltip content="Edit user" color="secondary">
              <button onClick={() => console.log("Edit user", user.id)}>
                <EditIcon size={20} fill="#979797" />
              </button>
            </Tooltip>
          </div>
          <div>
            <Tooltip
              content="Delete user"
              color="danger"
              onClick={() => console.log("Delete user", user.id)}
            >
              <button>
                <DeleteIcon size={20} fill="#FF0080" />
              </button>
            </Tooltip>
          </div>
        </div>
      );
    default:
      return cellValue;
  }
};