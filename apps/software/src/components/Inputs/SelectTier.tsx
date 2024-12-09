import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllTiers } from "@/hooks/tier";
import { Skeleton } from "../ui/skeleton";

interface SelectCategoryProps {
  className?: string;
  onValueChange: (value: number) => void;
  defaultValue?: number;
}

const SelectTier: React.FC<SelectCategoryProps> = ({ className, onValueChange, defaultValue }) => {
  const { tiers, loading } = useAllTiers();
  return (
    <Select onValueChange={(v: string) => onValueChange(Number(v))}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={defaultValue ? tiers.find(tier => tier.id === defaultValue)?.name ?? "Tier Name Not Found" : "Select Tier"} />
      </SelectTrigger>
      <SelectContent>
        {loading ? <Skeleton className="w-full h-44"/> : tiers.map((tier) => (
          <SelectItem key={tier.id} value={tier.id.toString()}>
            {tier.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default SelectTier;
