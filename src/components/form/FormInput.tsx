"use client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon, LucideProps } from "lucide-react";
import { InputHTMLAttributes, useState } from "react";
import { FieldValues } from "react-hook-form";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  field: FieldValues;
  isPassword?: boolean;
  Icon?: React.ComponentType<LucideProps>;
}

const FormInput = ({ field, isPassword, Icon, type, ...props }: Props) => {
  const [show, setShow] = useState(false);

  return (
    <div>
      {Icon && <Icon className="size-6" />}

      <Input
        className={cn(!!Icon && "ml-4")}
        type={show ? "text" : type}
        {...field}
        {...props}
      />

      {isPassword && (
        <div
          className="cursor-pointer"
          onClick={() => setShow((prev) => !prev)}
        >
          {show ? (
            <EyeIcon className="text-gray-500 size-5" />
          ) : (
            <EyeOffIcon className="text-gray-500 size-5" />
          )}
        </div>
      )}
    </div>
  );
};

export default FormInput;
