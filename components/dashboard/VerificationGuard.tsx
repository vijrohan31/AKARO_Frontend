"use client";

import React from "react";
import { useDashboard } from "./DashboardProvider";
import { motion, AnimatePresence } from "framer-motion";
import { EnvelopeSimple as PhosphorEnvelope, WarningCircle as PhosphorWarningCircle, ArrowClockwise, PaperPlaneTilt, CircleNotch } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { authService } from "@/lib/services/auth";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function VerificationGuard({ children }: { children: React.ReactNode }) {
  const { userData, isLoading, refreshProfile } = useDashboard();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState<number>(0);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const TIMER_DURATION = 60;

  React.useEffect(() => {
    const savedEndTime = localStorage.getItem("akaro_resend_end_time");
    if (savedEndTime) {
      const remaining = Math.round((parseInt(savedEndTime) - Date.now()) / 1000);
      if (remaining > 0) {
        setTimeLeft(remaining);
      } else {
        localStorage.removeItem("akaro_resend_end_time");
      }
    }
  }, []);

  React.useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          localStorage.removeItem("akaro_resend_end_time");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const isVerifiedMemo = (typeof window !== "undefined" && sessionStorage.getItem("akaro_verified_gate") === "true");
  const isVerified = userData?.is_verified ?? isVerifiedMemo;
  
  
  const isLocked = mounted && !isLoading && !isVerified;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const handleResend = async () => {
    if (timeLeft > 0) return;
    
    const emailToUse = userData?.email || localStorage.getItem("akaro_email_persistence");
    if (!emailToUse) {
      toast.error("Account email not found. Please log in again.");
      return;
    }
    
    setIsResending(true);
    try {
      await authService.resendVerificationEmail(emailToUse);
      toast.success("Verification link dispatched!");
      const endTime = Date.now() + TIMER_DURATION * 1000;
      localStorage.setItem("akaro_resend_end_time", endTime.toString());
      setTimeLeft(TIMER_DURATION);
    } catch (error: any) {
      toast.error(error.message || "Failed to resend link");
    } finally {
      setIsResending(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }
      window.location.href = "/login";
    } catch (e) {
      window.location.href = "/login";
    }
  };

  
  if (isLoading || !mounted) {
    return (
      <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center">
        <motion.div animate={{ scale: [0.95, 1, 0.95], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}>
          <Image src="/logo-akaro-dark-blue.png" alt="Akaro" width={140} height={40} priority />
        </motion.div>
        <div className="mt-8 w-12 h-[2px] bg-slate-100 rounded-full overflow-hidden relative">
          <motion.div className="absolute inset-y-0 left-0 bg-blue-600 w-1/3" animate={{ left: ["-100%", "100%"] }} transition={{ duration: 1.5, repeat: Infinity }} />
        </div>
      </div>
    );
  }

  
  if (isLocked) {
    return (
      <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-[20px] z-[9999] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-[44px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] w-full max-w-[420px] p-10 pt-12 text-center relative border border-white"
        >
          
          <div className="mb-10 flex justify-center">
            <Image src="/logo-akaro-dark-blue.png" alt="Akaro" width={110} height={32} />
          </div>

          
          <div className="mb-8 relative mx-auto size-20">
            <div className="size-full bg-blue-50/80 rounded-3xl flex items-center justify-center border border-blue-100/50">
              <PhosphorEnvelope className="size-10 text-blue-600" weight="duotone" />
            </div>
            <div className="absolute -top-1 -right-1 size-6 bg-amber-500 rounded-full border-[3px] border-white flex items-center justify-center shadow-lg">
              <span className="text-white text-[10px] font-black">!</span>
            </div>
          </div>

          
          <h2 className="text-[26px] font-bold text-slate-900 mb-3 tracking-tight">Full Access Pending</h2>
          <p className="text-slate-500 text-[14px] leading-relaxed mb-10 px-4">
            Your account is nearly ready! Please verify your email to unlock your workspace.
          </p>

          
          <div className="grid grid-cols-2 gap-3 mb-8">
            <Button 
              onClick={handleRefresh}
              disabled={isRefreshing}
              variant="outline"
              className="h-[58px] bg-slate-50/50 border-slate-100 rounded-2xl flex flex-col gap-0 items-center justify-center hover:bg-slate-100 group transition-all"
            >
              {isRefreshing ? (
                <CircleNotch className="size-4 animate-spin text-blue-600" />
              ) : (
                <div className="flex items-center gap-2">
                  <ArrowClockwise className="size-4 text-slate-900" weight="bold" />
                  <span className="text-[11px] font-bold tracking-widest text-slate-900">SYNC</span>
                </div>
              )}
            </Button>

            <Button 
              onClick={handleResend}
              disabled={isResending || isRefreshing || timeLeft > 0}
              variant="outline"
              className={cn(
                "h-[58px] rounded-2xl flex flex-col gap-0 items-center justify-center transition-all group",
                timeLeft > 0 
                  ? "bg-slate-50/50 border-slate-100 text-slate-300" 
                  : "bg-slate-50/50 border-slate-100 text-slate-900 hover:bg-slate-100"
              )}
            >
              {isResending ? (
                <CircleNotch className="size-4 animate-spin text-blue-600" />
              ) : timeLeft > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="relative size-4 -rotate-90">
                    <svg className="size-full">
                      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-100" />
                      <motion.circle 
                        cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="2" 
                        strokeDasharray={44}
                        initial={{ strokeDashoffset: 44 }}
                        animate={{ strokeDashoffset: 44 - (44 * (timeLeft / TIMER_DURATION)) }}
                        className="text-blue-600" 
                      />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold tracking-widest">
                    00:{timeLeft.toString().padStart(2, '0')}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <PaperPlaneTilt className="size-4 text-slate-900 group-hover:translate-x-0.5 transition-transform" weight="bold" />
                  <span className="text-[11px] font-bold tracking-widest">RESEND</span>
                </div>
              )}
            </Button>
          </div>

          
          <div className="space-y-6">
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Check your inbox and spam folder for the link.
            </p>
            
            <button 
              onClick={handleLogout}
              className="group flex flex-col items-center mx-auto pb-2"
            >
              <span className="text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                Use a different account? <span className="text-blue-600/70 underline underline-offset-2">Logout verification</span>
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

    
  return <>{children}</>;
}

