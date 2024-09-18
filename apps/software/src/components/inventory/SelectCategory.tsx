import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createItemType } from "../../../../../packages/types/api/item";

interface SelectCategoryProps {
  onValueChange: (value: string) => void;
}

const SelectCategory: React.FC<SelectCategoryProps> = ({ onValueChange }) => {
  const ItemCategoryType = createItemType.shape.category;
  const options = ItemCategoryType.options;
  return (
    <Select onValueChange={(v: string) => onValueChange(v)}>
      <SelectTrigger>
        <SelectValue placeholder="Select Category" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {option.toUpperCase()}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectCategory;
