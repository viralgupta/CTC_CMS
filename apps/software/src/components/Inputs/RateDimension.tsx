import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createItemType } from "@type/api/item";

interface RateDimensionProps {
  onValueChange: (value: string) => void;
  defaultValue?: string;
}

const RateDimension: React.FC<RateDimensionProps> = ({ onValueChange, defaultValue }) => {
  const ItemCategoryType = createItemType.shape.rate_dimension;
  const options = ItemCategoryType.options;
  return (
    <Select onValueChange={(v: string) => onValueChange(v)}>
      <SelectTrigger>
        <SelectValue placeholder={defaultValue ? defaultValue : "Select Rate Dimension"} />
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
