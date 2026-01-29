"use client";

import * as React from "react";
import { Check, ChevronsUpDown, PlusCircle, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface CreatorProfile {
  id: string;
  name: string;
  username: string;
  image: string | null;
}

interface CreatorSwitcherProps {
  items: CreatorProfile[];
  className?: string;
}

export function CreatorSwitcher({ items, className }: CreatorSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  // Determine selected creator based on URL param or default to first item
  const selectedCreatorId = searchParams.get("profileId") || items[0]?.id;

  const selectedCreator = React.useMemo(() =>
    items.find((item) => item.id === selectedCreatorId) || items[0],
    [items, selectedCreatorId]
  );

  const onCreatorSelect = (creator: CreatorProfile) => {
    setOpen(false);
    // Push new route with search param
    const params = new URLSearchParams(searchParams.toString());
    params.set("profileId", creator.id);
    router.push(`/dashboard?${params.toString()}`);
  };

  if (!items.length) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a creator account"
          className={cn("w-[200px] justify-between", className)}
        >
          <Avatar className="mr-2 h-5 w-5">
            <AvatarImage
              src={selectedCreator?.image || ""}
              alt={selectedCreator?.name}
              className="grayscale"
            />
            <AvatarFallback>
              {selectedCreator?.name?.charAt(0) || "C"}
            </AvatarFallback>
          </Avatar>
          <span className="truncate">{selectedCreator?.name || "Select Creator"}</span>
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search account..." />
            <CommandEmpty>No account found.</CommandEmpty>
            <CommandGroup heading="Creator Accounts">
              {items.map((creator) => (
                <CommandItem
                  key={creator.id}
                  onSelect={() => onCreatorSelect(creator)}
                  className="text-sm"
                >
                  <Avatar className="mr-2 h-5 w-5">
                    <AvatarImage
                      src={creator.image || ""}
                      alt={creator.name}
                      className="grayscale"
                    />
                    <AvatarFallback>
                      {creator.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  {creator.name}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      selectedCreator?.id === creator.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              <CommandItem onSelect={() => {
                setOpen(false);
                router.push("/creators"); // Assuming this is the registration page
              }}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create New
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
