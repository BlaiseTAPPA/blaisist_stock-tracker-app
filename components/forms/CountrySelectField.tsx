"use client";

import { useState } from "react";
import { Controller, type FieldValues } from "react-hook-form";
import type { CountrySelectFieldProps } from "@/types/forms";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import countryList from "react-select-country-list";

// Country options are static: compute them once per module, not per render.
const countries = countryList().getData();

const FlagImage = ({ countryCode }: { countryCode: string }) => (
  <img
    src={`https://flagcdn.com/20x15/${countryCode.toLowerCase()}.png`}
    alt={countryCode}
    width={20}
    height={15}
    className="inline-block"
  />
);

const CountrySelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild className="w-full">
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="country-select-trigger w-full justify-between"
        >
          {value ? (
            <span className="flex items-center gap-2">
              <FlagImage countryCode={value} />
              <span>{countries.find((c) => c.value === value)?.label}</span>
            </span>
          ) : (
            "Select your country..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full border-gray-600 !bg-gray-800 p-0" align="start">
        <Command className="border-gray-600 bg-gray-800">
          <CommandInput placeholder="Search countries..." className="country-select-input" />
          <CommandEmpty className="country-select-empty">No country found.</CommandEmpty>
          <CommandList className="scrollbar-hide-default max-h-60 bg-gray-800">
            <CommandGroup className="bg-gray-800">
              {countries.map((country) => (
                <CommandItem
                  key={country.value}
                  value={`${country.label} ${country.value}`}
                  onSelect={() => {
                    onChange(country.value);
                    setOpen(false);
                  }}
                  className="country-select-item !bg-gray-800 aria-selected:!bg-gray-600 data-[selected=true]:!bg-gray-600"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 text-yellow-500",
                      value === country.value ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="flex items-center gap-2">
                    <FlagImage countryCode={country.value} />
                    <span>{country.label}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export const CountrySelectField = <TFieldValues extends FieldValues>({
  name,
  label,
  control,
  error,
  required = false,
}: CountrySelectFieldProps<TFieldValues>) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="form-label">
        {label}
      </Label>
      <Controller
        name={name}
        control={control}
        rules={{
          required: required ? `Please select ${label.toLowerCase()}` : false,
        }}
        render={({ field }) => <CountrySelect value={field.value} onChange={field.onChange} />}
      />
      {error && <p className="text-sm text-red-500">{error.message}</p>}
      <p className="text-xs text-gray-500">Helps us show market data and news relevant to you.</p>
    </div>
  );
};
