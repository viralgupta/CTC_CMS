import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SelectDriverSizeOfVehicle = ({
  onChange,
  value
}: {
  onChange: (val: string) => void;
  value: string;
}) => {
  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Vehicle Type" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="rickshaw">Rickshaw</SelectItem>
        <SelectItem value="tempo">Tempo</SelectItem>
        <SelectItem value="chota-hathi">Chota Hathi</SelectItem>
        <SelectItem value="tata">Tata</SelectItem>
        <SelectItem value="truck">Truck</SelectItem>
      </SelectContent>
    </Select>
  );
};