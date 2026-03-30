"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import * as RPNI from "react-phone-number-input"
import flags from "react-phone-number-input/flags"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type PhoneInputProps = Omit<
  React.ComponentProps<"input">,
  "onChange" | "value" | "ref"
> &
  Omit<RPNI.Props<typeof RPNI.default>, "onChange"> & {
    onChange?: (value: RPNI.Value) => void
  }

const PhoneInput: React.ForwardRefExoticComponent<PhoneInputProps> =
  React.forwardRef<React.ElementRef<typeof RPNI.default>, PhoneInputProps>(
    ({ className, onChange, ...props }, ref) => {
      return (
        <RPNI.default
          ref={ref}
          className={cn("flex", className)}
          flagComponent={FlagComponent}
          countrySelectComponent={CountrySelect}
          inputComponent={InputComponent}
          smartCaret={false}
          /**
           * Handles the autofill behavior identification.
           * tel-national is standard for local numbers.
           */
          autoComplete="tel"
          onChange={(value) => onChange?.(value || ("" as RPNI.Value))}
          {...props}
        />
      )
    }
  )
PhoneInput.displayName = "PhoneInput"

const InputComponent = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => (
  <Input
    className={cn(
      "h-12 md:h-10 lg:h-12 rounded-e-xl rounded-s-none border-s-0 bg-white focus:border-[#3100be]", 
      className
    )}
    {...props}
    ref={ref}
  />
))
InputComponent.displayName = "InputComponent"

type CountrySelectOption = { label: string; value: RPNI.Country }

type CountrySelectProps = {
  disabled?: boolean
  value: RPNI.Country
  onChange: (value: RPNI.Country) => void
  options: CountrySelectOption[]
}

const CountrySelect = ({
  disabled,
  value,
  onChange,
  options,
}: CountrySelectProps) => {
  const handleSelect = React.useCallback(
    (country: RPNI.Country) => {
      onChange(country)
    },
    [onChange]
  )

  // Memoize options to avoid repeated expensive lookups during filter/render
  const memoizedOptions = React.useMemo(() => {
    return options
      .filter((x) => x.value)
      .map((option) => ({
        ...option,
        callingCode: RPNI.getCountryCallingCode(option.value),
      }));
  }, [options]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "flex h-12 md:h-10 lg:h-12 items-center justify-center gap-1.5 rounded-e-none rounded-s-xl border-e-0 pl-2 pr-1 focus-visible:z-10 bg-white border-slate-200 focus-visible:border-[#3100be] focus-visible:ring-0 active:scale-[0.98] transition-all",
            disabled && "cursor-not-allowed opacity-50"
          )}
          disabled={disabled}
        >
          <FlagComponent country={value} countryName={value} />
          <ChevronsUpDown
            className={cn(
              "h-4 w-4 shrink-0 opacity-50",
              disabled ? "hidden" : "opacity-100"
            )}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search country..." />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {memoizedOptions.map((option) => (
                <CommandItem
                  className="gap-2 cursor-pointer"
                  key={option.value}
                  onSelect={() => handleSelect(option.value)}
                >
                  <FlagComponent
                    country={option.value}
                    countryName={option.label}
                  />
                  <span className="flex-1 text-sm">{option.label}</span>
                  {option.value && (
                    <span className="text-foreground/50 text-sm">
                      {`+${option.callingCode}`}
                    </span>
                  )}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4 text-[#3100be]",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

const FlagComponent = ({ country, countryName }: RPNI.FlagProps) => {
  const Flag = flags[country]

  return (
    <div className="bg-foreground/5 flex h-5 w-9 shrink-0 overflow-hidden rounded-sm shadow-sm transition-all border border-slate-200">
      {Flag && (
        <div className="w-full h-full [&>svg]:!w-full [&>svg]:!h-full [&>svg]:!block [&>svg]:!object-cover">
          <Flag title={countryName} />
        </div>
      )}
    </div>
  )
}
FlagComponent.displayName = "FlagComponent"

export { PhoneInput }
