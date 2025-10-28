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

const ProjectAvatar = ({
  name,
  className,
  image,
  fallbackClassName,
}: Props) => {
  if (image) {
    return (
      <div
        className={cn("size-8 relative rounded-md overflow-hidden", className)}
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
    <Avatar className={cn("size-8 rounded-md", className)}>
      <AvatarFallback
        className={cn(
          "text-white bg-blue-600 font-semibold text-base uppercase rounded-md",
          fallbackClassName
        )}
      >
        {name[0]}
      </AvatarFallback>
    </Avatar>
  );
};

export default ProjectAvatar;
