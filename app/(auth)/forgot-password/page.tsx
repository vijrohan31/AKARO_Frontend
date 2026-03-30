"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowRight, ArrowLeft, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { OTPInput } from "@/components/auth/OTPInput";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"email" | "otp" | "reset" | "success">("email");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const arrowVariants: Variants = {
    initial: { x: 0 },
    hover: { x: 5, transition: { type: "spring", stiffness: 400, damping: 10 } },
  }

  const jumpVariants: Variants = {
    initial: { x: 0 },
    animate: { x: [0, 4, 0], transition: { repeat: Infinity, duration: 1.5, ease: "easeInOut" } },
  }

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      toast.success("Reset code sent to your email!");
      setStep("otp");
    } catch (error: any) {
      toast.error(error.message || "Failed to send reset code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authApi.verifyOtp(email, otp);
      setStep("reset");
    } catch (error: any) {
      toast.error(error.message || "Invalid or expired code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.updatePassword({ email, new_password: newPassword });
      toast.success("Password updated successfully!");
      setStep("success");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {step === "email" && (
          <motion.div 
            key="email-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8 lg:gap-6"
          >
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-center mb-6 lg:mb-8"
            >
            <h2 className="text-lg lg:text-3xl font-semibold text-slate-900 tracking-tight">Forgot Password?</h2>
            <p className="text-slate-500 mt-1 lg:mt-2 text-[11px] lg:text-sm leading-snug">
              Enter your email and we&apos;ll send a secure code to your inbox so you can get back to Akaro
            </p>
          </motion.div>

            <form onSubmit={handleSendReset} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-800 font-medium text-xs uppercase tracking-wider">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com" 
                    className="pl-12 h-12 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none"
                    required 
                  />
                </div>
              </div>

              <motion.div 
                whileHover={{ y: -2, scale: 1.01 }} 
                initial="initial"
                whileTap={{ scale: 0.985 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#021a42] hover:bg-[#021a42]/90 text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.99] group flex items-center justify-center border-none shadow-none" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </motion.div>

              <p className="text-center mt-6 text-sm text-slate-500 pt-4">
                Remembered your password? <Link href="/login" className="font-semibold text-slate-900 hover:underline underline-offset-4">Back to login</Link>
              </p>
            </form>
          </motion.div>
        )}

        {step === "otp" && (
          <motion.div 
            key="otp-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Verify Code</h2>
              <p className="text-slate-500 mt-2">Enter the 6-digit code sent to your email.</p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-8 lg:space-y-6">
              <div className="flex justify-center">
                 <OTPInput length={6} value={otp} onChange={setOtp} />
              </div>

              <div className="space-y-4">
                <motion.div 
                  whileHover={{ y: -2, scale: 1.01 }} 
                  initial="initial"
                  whileTap={{ scale: 0.985 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full h-10 lg:h-12 bg-[#021a42] hover:bg-[#021a42]/90 text-white rounded-xl text-xs lg:text-sm font-semibold transition-all active:scale-[0.99] group flex items-center justify-center border-none shadow-none" 
                    disabled={otp.length !== 6 || isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Reset"}
                  </Button>
                </motion.div>

                <div className="text-center">
                  <p className="text-xs text-slate-400 font-medium">
                    Didn&apos;t receive the code?{" "}
                    <button 
                      type="button" 
                      onClick={handleSendReset} 
                      className="text-slate-900 font-bold hover:underline underline-offset-4"
                      disabled={isLoading}
                    >
                      Resend now
                    </button>
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={() => setStep("email")}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors"
              >
                Change email
              </button>
            </form>
          </motion.div>
        )}

        {step === "reset" && (
          <motion.div 
            key="reset-step"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-8"
          >
            <div className="text-center">
              <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Set New Password</h2>
              <p className="text-slate-500 mt-2">Choose a secure password for your account.</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-slate-800 font-medium text-xs uppercase tracking-wider">New Password</Label>
                <div className="relative">
                  <Input 
                    type={showPassword ? "text" : "password"} 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password" 
                    className="h-12 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none pr-10"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-800 font-medium text-xs uppercase tracking-wider">Confirm Password</Label>
                <div className="relative">
                  <Input 
                    type={showConfirmPassword ? "text" : "password"} 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password" 
                    className="h-12 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none pr-10"
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <motion.div 
                whileHover={{ y: -2, scale: 1.01 }} 
                initial="initial"
                whileTap={{ scale: 0.985 }}
              >
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-[#021a42] hover:bg-[#021a42]/90 text-white rounded-xl text-sm font-semibold transition-all active:scale-[0.99] group flex items-center justify-center border-none shadow-none" 
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </motion.div>
            </form>
          </motion.div>
        )}

        {step === "success" && (
          <motion.div 
            key="success-step"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-emerald-100"
            >
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </motion.div>
            <h2 className="text-3xl font-semibold text-slate-900 tracking-tight">Password Reset</h2>
            <p className="text-slate-500 mt-2 mb-10">
              Your verification was successful. You can now set a new password.
            </p>
            <Link href="/login" className="w-full block">
              <motion.div whileHover={{ y: -2, scale: 1.01 }} initial="initial" whileTap={{ scale: 0.985 }}>
                <Button className="w-full h-10 lg:h-12 bg-[#021a42] hover:bg-[#021a42]/90 text-white rounded-xl text-xs lg:text-sm font-semibold transition-all active:scale-[0.99] flex items-center justify-center border-none shadow-none">
                  Back to Sign In
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
