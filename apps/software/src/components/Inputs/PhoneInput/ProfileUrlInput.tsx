import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, CircleUserRound } from "lucide-react";
import { useState } from "react";

type ProfileUrlInputProps = {
  value?: string;
  removePhoto: () => void;
};

const ProfileUrlInput = ({ value, removePhoto }: ProfileUrlInputProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Avatar className="relative">
        <AvatarImage src={value} />
        <AvatarFallback>
          <CircleUserRound className="w-full h-full stroke-muted-foreground" />
        </AvatarFallback>
        {isHovered && value && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
            onClick={removePhoto}
          >
            <Trash2 className="text-white w-6 h-6" />
          </div>
        )}
      </Avatar>
    </div>
  );
};

export default ProfileUrlInput;
