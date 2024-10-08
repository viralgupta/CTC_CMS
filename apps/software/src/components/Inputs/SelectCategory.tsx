import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createItemType } from "@type/api/item";

interface SelectCategoryProps {
  className?: string;
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

const SelectCategory: React.FC<SelectCategoryProps> = ({ className, onValueChange, defaultValue }) => {
  const ItemCategoryType = createItemType.shape.category;
  const options = ItemCategoryType.options;
  return (
    <Select onValueChange={(v: string) => onValueChange(v)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={defaultValue ? defaultValue : "Select Category"} />
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
