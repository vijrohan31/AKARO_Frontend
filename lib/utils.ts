import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getAvatarColor(seed: string) {
  const colors = [
    "bg-[#4285F4]",
    "bg-[#DB4437]",
    "bg-[#F4B400]",
    "bg-[#0F9D58]",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-slate-700",
    "bg-emerald-600",
    "bg-teal-600",
    "bg-cyan-600",
    "bg-rose-500",
  ];
  
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export async function getUniversalDefaultImage(): Promise<File> {
  try {
    const response = await fetch("/me.jpg");
    const blob = await response.blob();
    return new File([blob], "me.jpg", { type: "image/jpeg" });
  } catch (error) {
    console.error("Failed to fetch default image:", error);
    // Return an empty file as a last resort to prevent crash
    return new File([], "me.jpg", { type: "image/jpeg" });
  }
}
