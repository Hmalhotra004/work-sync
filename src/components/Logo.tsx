"use client";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";
import Image from "next/image";
import Link from "next/link";

interface Props {
  textClassName?: ClassValue;
  imgClassName?: ClassValue;
  width?: number;
  height?: number;
}

const Logo = ({
  imgClassName,
  height = 40,
  textClassName,
  width = 40,
}: Props) => {
  return (
    <Link href={"/"}>
      <div className="flex items-center gap-x-2">
        <Image
          src={"/logo.svg"}
          width={width ?? 40}
          height={height ?? 40}
          alt="logo"
          className={cn(imgClassName)}
        />
        <h1
          className={cn(
            "tracking-wide font-semibold text-[22px]",
            textClassName
          )}
        >
          WorkSync
        </h1>
      </div>
    </Link>
  );
};

export default Logo;
