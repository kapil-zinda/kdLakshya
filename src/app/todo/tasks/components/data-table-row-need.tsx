import { useTask } from "@/context/task-context";
import {  needs } from "../data/data";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  // SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@radix-ui/react-select";
import { Check } from "lucide-react";

export function DataTableRowNeed({ row }: any) {
  const { updateTask } = useTask();

  const need = needs.find(
    (need) => need.value === row.getValue("need")
  );

  if (!need) {
    return null;
  }

  const handleNeed = (selectedValue: string) => {
    updateTask(row.original.id, { need: selectedValue });
  };

  return (
    <div className="flex items-center">
      <Select
        value={need.value}
        onValueChange={handleNeed}
        defaultValue={need.value}
      >
        <SelectTrigger className="flex w-full items-center gap-2 rounded-md px-3 py-2 outline-none">
          <need.icon />
          <SelectValue>{need.label}</SelectValue>
        </SelectTrigger>
        <SelectContent
          position="popper"
          className="relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
        >
          {needs.map((need: any, index: number) => (
            <SelectItem
              key={index}
              value={need.value}
              className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                <SelectItemIndicator>
                  <Check className="h-4 w-4" />
                </SelectItemIndicator>
              </span>
              <div className="flex gap-2 items-center">
                <need.icon /> {need.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}