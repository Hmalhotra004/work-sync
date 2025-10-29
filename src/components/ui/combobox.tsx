"use client";

import { Button } from "@/components/ui/button";
import { ChevronsUpDownIcon } from "lucide-react";
import { useState } from "react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

type OptionType = {
  value: string;
  label: string;
  image: string | null;
};

interface Props {
  options: OptionType[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled: boolean;
  Avatar: React.ComponentType<{
    name: string;
    image?: string;
    className?: ClassValue;
    fallbackClassName?: ClassValue;
  }>;
}

export function Combobox({
  options,
  placeholder,
  onChange,
  value,
  Avatar,
  disabled,
}: Props) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((op) => op.value === value);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger
        asChild
        disabled={disabled}
      >
        <Button
          variant="outline"
          role="combobox"
          size="lg"
          aria-expanded={open}
          className={cn(
            "justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {selectedOption ? (
            <div className="flex items-center gap-2">
              <Avatar
                name={selectedOption.label}
                image={selectedOption.image ?? undefined}
                className="size-6"
              />
              {selectedOption.label}
            </div>
          ) : (
            `Select ${placeholder}...`
          )}
          <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[225px] p-0">
        <Command>
          <CommandInput placeholder={`Search ${placeholder}`} />
          <CommandList>
            <CommandEmpty>No {placeholder?.toLowerCase()} found.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  onSelect={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                >
                  <Avatar
                    name={option.label}
                    image={option.image ?? undefined}
                    className="size-6"
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
