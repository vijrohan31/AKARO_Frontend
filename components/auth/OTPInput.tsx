import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  onComplete?: () => void;
}

export function OTPInput({ length = 6, value, onChange, onComplete }: OTPInputProps) {
  const [internalValues, setInternalValues] = useState<string[]>(Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const valArray = value.split("").slice(0, length);
    const newVals = Array(length).fill("");
    valArray.forEach((char, index) => {
      newVals[index] = char;
    });
    setInternalValues(newVals);
  }, [value, length]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    
    if (!/^\d*$/.test(val)) return;

    const newValues = [...internalValues];
    newValues[index] = val.slice(-1);

    const merged = newValues.join("");
    onChange(merged);

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (merged.length === length && onComplete) {
      onComplete();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !internalValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, length).replace(/\D/g, "");
    
    if (pastedData) {
      const newVals = Array(length).fill("");
      pastedData.split("").forEach((char, i) => {
        newVals[i] = char;
      });
      onChange(pastedData);
      
      const nextFocusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-between">
      {internalValues.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl text-slate-900 outline-none transition-all",
            "focus-visible:ring-2 focus-visible:ring-[#0a0a0b] focus-visible:border-transparent",
            "placeholder:text-slate-300 sm:w-14 sm:h-16"
          )}
          placeholder="0"
        />
      ))}
    </div>
  );
}
