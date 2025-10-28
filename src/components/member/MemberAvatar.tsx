import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import Image from "next/image";

interface Props {
  image?: string;
  name: string;
  className?: ClassValue;
  fallbackClassName?: ClassValue;
}

const MemberAvatar = ({ name, className, image, fallbackClassName }: Props) => {
  if (image) {
    return (
      <div
        className={cn(
          "size-5 relative rounded-full overflow-hidden",
          className
        )}
      >
        <Image
          src={image}
          alt="logo"
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <Avatar
      className={cn(
        "size-5 transition border border-border-300 rounded-full",
        className
      )}
    >
      <AvatarFallback
        className={cn(
          "bg-background-200 font-medium text-foreground-500 flex items-center justify-center",
          fallbackClassName
        )}
      >
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};

export default MemberAvatar;
