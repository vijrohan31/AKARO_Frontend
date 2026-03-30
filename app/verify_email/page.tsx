"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle,
  CircleNotch,
  Warning
} from "@phosphor-icons/react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);
  const hasVerified = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    if (hasVerified.current) return;
    hasVerified.current = true;

    const verifyEmail = async () => {
      try {
        await new Promise(r => setTimeout(r, 1000));
        
        const res = await fetch(`/api/company_master/verify_email?token=${encodeURIComponent(token)}`, {
          credentials: "include",
          cache: "no-store", 
        });

        const data = await res.json();
        if (res.ok && data.is_successful !== false) {
          
          if (typeof window !== "undefined") {
            sessionStorage.setItem("akaro_verified_gate", "true");
          }
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || data.detail || "This verification link is no longer valid or has already been used.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Unable to connect to the server. Please check your connection.");
      }
    };

    verifyEmail();
  }, [token]);

  useEffect(() => {
    if (status === "success") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            window.location.href = "/dashboard";
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  const handleResend = async () => {
    toast.error("Please try logging in again to request a new link.");
  };

  return (
    <div className="min-h-[100dvh] w-full flex flex-col items-center justify-center bg-[#fcfcfd] px-4 font-sans py-8">
      <div className="absolute top-8 left-8">
        <Image
          src="/logo-akaro-dark-blue.png"
          alt="Akaro AI"
          width={150}
          height={45}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[480px] flex flex-col items-center text-center"
      >
        <AnimatePresence mode="wait">
          {status === "loading" ? (
            <motion.div
              key="loading-icon"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-10"
            >
              <div className="size-20 rounded-3xl bg-blue-50 flex items-center justify-center relative shadow-sm border border-blue-100/50">
                <CircleNotch weight="bold" className="size-10 text-blue-600 animate-spin" />
              </div>
            </motion.div>
          ) : status === "success" ? (
            <motion.div
              key="success-icon"
              initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="mb-10 text-[#2563eb]"
            >
              <div className="size-24 rounded-[32px] bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-500/30">
                <CheckCircle weight="fill" className="size-14 text-white" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="error-icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-10 text-rose-500"
            >
              <div className="size-24 rounded-[32px] bg-rose-50 flex items-center justify-center border border-rose-100 shadow-sm">
                <Warning weight="fill" className="size-14 text-rose-500" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-4">
          <h1 className={cn(
            "text-2xl md:text-3xl font-bold tracking-tight transition-colors duration-500",
            status === "success" ? "text-slate-900" : "text-slate-400"
          )}>
            {status === "loading" ? "Activating workspace..." : 
             status === "success" ? "Account Verified" : 
             "Link Expired"}
          </h1>

          <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-[360px] mx-auto">
            {status === "loading" ? "We're almost done setting up your secure environment. Hang tight." : 
             status === "success" ? "Everything checks out! Your email is verified. Please click below to head into your dashboard." :
             message || "This verification link is no longer valid or has already been used."}
          </p>
        </div>

        <div className="mt-12 w-full flex flex-col items-center gap-6">
          {status === "success" ? (
            <>
              <Button 
                onClick={() => window.location.href = "/dashboard"}
                className="h-14 px-12 bg-[#2563eb] hover:bg-blue-700 text-white rounded-2xl font-bold text-base shadow-xl shadow-blue-600/20 transition-all active:scale-[0.98] cursor-pointer"
              >
                Launch Dashboard
              </Button>
              <p className="text-slate-400 text-sm font-medium">
                Redirecting in <span className="text-blue-600 font-bold tabular-nums">{countdown}s</span>
              </p>
            </>
          ) : status === "error" ? (
            <div className="flex flex-col gap-4 w-full px-8">
               <Button 
                onClick={() => window.location.href = "/login"}
                className="h-14 bg-[#0f172a] text-white rounded-2xl font-bold text-base shadow-xl shadow-slate-900/10 active:scale-[0.98] cursor-pointer"
              >
                Back to Login
              </Button>
              <button 
                onClick={handleResend}
                className="text-slate-400 font-bold text-sm hover:text-blue-600 transition-all cursor-pointer"
              >
                Request a new link
              </button>
            </div>
          ) : null}
        </div>

        <div className="mt-24 text-slate-300 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em]">
          © {new Date().getFullYear()} Akaro AI • Verified System
        </div>
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
          <CircleNotch weight="bold" className="w-10 h-10 text-blue-600 animate-spin" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
