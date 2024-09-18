import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createItemType } from "../../../../../packages/types/api/item";

interface RateDimensionProps {
  onValueChange: (value: string) => void;
}

const RateDimension: React.FC<RateDimensionProps> = ({ onValueChange }) => {
  const ItemCategoryType = createItemType.shape.rate_dimension;
  const options = ItemCategoryType.options;
  return (
    <Select onValueChange={(v: string) => onValueChange(v)}>
      <SelectTrigger>
        <SelectValue placeholder="Select Rate Dimension" />
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

export default RateDimension;
