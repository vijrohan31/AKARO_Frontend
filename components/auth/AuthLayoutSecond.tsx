"use client";

import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const founders = [
  {
    id: 1,
    name: "Alex Rivera",
    designation: "CEO & Founder",
    image: "/avatars/1.png",
  },
  {
    id: 2,
    name: "Sarah Chen",
    designation: "CTO",
    image: "/avatars/2.png",
  },
  {
    id: 3,
    name: "Marcus Thorne",
    designation: "Lead Designer",
    image: "/avatars/3.png",
  },
  {
    id: 4,
    name: "Elena Vance",
    designation: "Software Architect",
    image: "/avatars/4.png",
  },
  {
    id: 5,
    name: "David Park",
    designation: "Operations",
    image: "/avatars/5.png",
  },
];

import { GuestGuard } from "@/components/auth/GuestGuard";

export default function AuthLayoutSecond({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isSignup = pathname === "/signup";

  return (
    <GuestGuard>
      <div className={cn(
        "flex flex-col min-h-[100dvh] lg:h-[100dvh] w-full overflow-y-auto lg:overflow-hidden bg-white selection:bg-[#3100be]/10 relative font-sans",
        isSignup ? "md:flex-row" : "md:flex-row-reverse"
      )}>
        
        <div className="absolute inset-0 z-0 text-white">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#1f6fd6_0%,#0f4fa8_100%)] opacity-100"></div>
          <div className="absolute inset-0 z-[1] opacity-[0.4] mix-blend-overlay pointer-events-none" 
               style={{ backgroundImage: `url("/noise.svg")` }}></div>

          <div className="absolute inset-0 z-[2] opacity-[0.1]" 
               style={{ 
                 backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                 backgroundSize: '24px 24px' 
               }}></div>
          <div className="absolute inset-0 z-[3] opacity-[0.05]" 
               style={{ 
                 backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`, 
                 backgroundSize: '80px 80px' 
               }}></div>
        </div>

        <div className="hidden md:flex flex-col justify-center items-center md:w-1/2 p-12 xl:p-20 relative z-10 shrink-0">
          <div className="max-w-md text-center">
            <div className="flex flex-col items-center gap-0 mb-0">
              <div className="relative aspect-[4/1] w-32 lg:w-40 transition-transform duration-500 origin-bottom -mb-2 lg:-mb-4">
                <Image 
                  src="/logo-white.png" 
                  alt="Akaro Platform" 
                  width={160}
                  height={40}
                  className="w-full h-full object-contain"
                  priority
                />
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 mb-8">
              <div className="flex flex-row items-center justify-center w-full">
                {founders.map((founder) => (
                  <div key={founder.id} className="-mr-4 relative">
                    <Image
                      src={founder.image}
                      alt={founder.name}
                      width={40}
                      height={40}
                      className="h-10 w-10 rounded-full border-2 border-white object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white/90 tracking-[0.1em] uppercase shadow-sm w-fit mx-auto">
                Trusted by Sales & Revenue Teams
              </div>
            </div>
            <h1 className="text-xl xl:text-2xl font-bold leading-tight tracking-tight text-white mb-6 xl:mb-8 font-[family-name:var(--font-analogue)] flex flex-wrap items-center justify-center gap-x-3 text-center">
              <span>Answer RFPs and Security</span>
              <span className="relative inline-block py-1">
                <span className="relative text-white font-[family-name:var(--font-analogue)] italic text-2xl xl:text-3xl font-medium tracking-tight drop-shadow-sm">
                  Questionnaires in Minutes
                </span>
                <svg 
                  className="absolute -bottom-1 -left-1 w-[105%] h-3 text-white/40 pointer-events-none" 
                  viewBox="0 0 200 20" 
                  fill="none" 
                  preserveAspectRatio="none"
                >
                  <path 
                    d="M5 10C60 15 140 3 195 12" 
                    stroke="currentColor" 
                    strokeWidth="4.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="text-gray-300 text-base xl:text-lg leading-relaxed font-medium">
              Akaro centralizes scattered knowledge so teams can respond to RFPs and questionnaires faster with accurate, reusable answers.
            </p>
          </div>
        </div>

        <div className={cn(
          "flex-1 flex flex-col items-center justify-center p-0 py-2 sm:p-6 md:py-4 md:px-12 relative z-10 pt-2 sm:pt-6 md:pt-4 px-3 sm:px-6 md:w-1/2 md:bg-slate-100 overflow-hidden md:min-h-0",
          isSignup ? "md:shadow-[-20px_0_50px_rgba(0,0,0,0.1)]" : "md:shadow-[20px_0_50px_rgba(0,0,0,0.1)]"
        )}>
          <div className="flex flex-col items-center my-auto w-full">

            <div className="w-full max-w-[480px] bg-slate-100 md:bg-transparent rounded-[24px] md:rounded-none px-4 py-2 sm:p-6 lg:p-8 xl:p-12 min-h-0 md:min-h-0 flex flex-col justify-center shadow-none border border-slate-200/50 md:border-none relative overflow-hidden group">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent md:hidden"></div>
              

              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="relative w-12 sm:w-14 md:w-16 mb-4 sm:mb-6 mt-2 transition-transform duration-300 hover:scale-105">
                  <Image 
                    src="/logo-blue.png" 
                    alt="Akaro Platform" 
                    width={64}
                    height={64}
                    className="w-full h-auto object-contain"
                    priority
                  />
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>

      </div>
    </GuestGuard>
  );
}
