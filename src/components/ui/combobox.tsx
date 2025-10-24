"use client";

import MemberAvatar from "@/components/member/MemberAvatar";
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
}

export function Combobox({ options, placeholder, onChange, value }: Props) {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find((op) => op.value === value);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          size="lg"
          aria-expanded={open}
          className={cn(
            "w-full justify-between font-normal",
            !value && "text-muted-foreground"
          )}
        >
          {selectedOption ? (
            <div className="flex items-center gap-2">
              <MemberAvatar
                name={selectedOption.label}
                image={selectedOption.image ?? undefined}
                className="size-6"
              />
              {selectedOption.label}
            </div>
          ) : (
            `Select an ${placeholder}...`
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
                  <MemberAvatar
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
