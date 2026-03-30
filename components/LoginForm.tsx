import { motion, Variants } from "framer-motion"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordField } from "@/components/auth/PasswordField"
import { validateEmail, validatePassword } from "@/lib/validation"

import { authApi } from "@/lib/api"
import { toast } from "sonner"
import Lottie from "lottie-react"
import googleLottie from "@/public/GOOGLE FILE.json"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  EnvelopeSimple as PhosphorEnvelope,
  CheckCircle as PhosphorCheckCircle,
} from "@phosphor-icons/react"



export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {


  const { 
    onDrag, 
    onDragStart, 
    onDragEnd, 
    onAnimationStart, 
    searchParams, 
    params,
    ...restProps 
  } = props as any;

  const arrowVariants: Variants = {
    initial: { x: 0 },
    hover: { x: 5, transition: { type: "spring", stiffness: 400, damping: 10 } },
  }


  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");


  const [isLoading, setIsLoading] = React.useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = React.useState(false);
  const [countdown, setCountdown] = React.useState(4);
  const searchParamsHook = useSearchParams();

  const loginWithGoogle = () => {
    window.location.href = "/api/google/start";
  };

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const error = params.get("error");
      if (error) {
        const errorMsg = error === "unsuccessful" 
          ? "Account not found. Please sign up first." 
          : error === "access_denied"
          ? "Sign in was cancelled."
          : `Google login error: ${error}`;
        toast.error(errorMsg);
      }

      if (params.get("signup_success") === "true") {
        setShowSuccessDialog(true);
      }
    }
  }, []);

  React.useEffect(() => {
    if (showSuccessDialog) {
      setCountdown(4);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setShowSuccessDialog(false);
            if (typeof window !== "undefined") {
              const url = new URL(window.location.href);
              url.searchParams.delete("signup_success");
              window.history.replaceState({}, "", url.pathname);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showSuccessDialog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!validateEmail(email)) newErrors.email = "Please enter a valid email.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const res = await authApi.login({ email, password }) as any;
      if (res.is_successful) {
        try {
          localStorage.setItem("akaro_email_persistence", email);
        } catch (e) {}
        
        toast.success("Login successful!");
        window.location.href = "/dashboard";
      } else {
        setErrors({ credentials: res.message || "Something went wrong. Please try again." });
      }
    } catch (error: any) {
      setErrors({ credentials: "Email or password is wrong" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className={cn("flex flex-col gap-2 md:gap-1 lg:gap-6 w-full", className)} 
      {...restProps}
    >

      
      <form className="mt-1 lg:mt-0" onSubmit={handleSubmit}>
        <FieldGroup className="gap-3 md:gap-3 lg:gap-4">


          <Field className="gap-1.5">
            <FieldLabel htmlFor="email" className="text-slate-800 font-semibold text-xs lg:text-sm">Business Email</FieldLabel>
            <Input
              id="email"
              type="email"
              disabled={isLoading}
              placeholder="Enter email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email || errors.credentials) setErrors({ ...errors, email: "", credentials: "" });
              }}
              className={cn(
                "h-12 md:h-10 lg:h-11 xl:h-12 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none text-base md:text-sm font-medium w-full",
                errors.email && "border-red-500"
              )}
              autoComplete="email"
              maxLength={300}
              required
            />
            {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>}
          </Field>
          <Field className="gap-1.5">
                <FieldLabel htmlFor="password" className="text-slate-800 font-semibold text-xs lg:text-sm">Password</FieldLabel>
            <PasswordField 
              id="password" 
              disabled={isLoading}
              placeholder="Enter password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password || errors.credentials) setErrors({ ...errors, password: "", credentials: "" });
              }}
              className={cn(
                "h-12 md:h-10 lg:h-11 xl:h-12 bg-slate-50/50 border-slate-200/60 focus:bg-white transition-all shadow-none text-base md:text-sm font-medium w-full",
                errors.password && "border-red-500"
              )}
              autoComplete="current-password"
              maxLength={30}
              required 
            />
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-[#021a42] hover:text-[#021a42]/80 transition-colors inline-block w-fit px-1 mt-1"
            >
              Forgot Password?
            </Link>
            {errors.password && <p className="text-[10px] text-red-500 font-medium px-1 mt-1">{errors.password}</p>}
          </Field>
          
          {errors.credentials && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[10px] font-bold">!</span>
              </div>
              <span className="text-xs text-red-600 font-semibold">{errors.credentials}</span>
            </div>
          )}

          <Field className="pt-0.5">
            <motion.div 
              whileHover={{ y: -2, scale: 1.01 }}
              initial="initial"
              whileTap={{ scale: 0.985 }}
            >
              <Button type="submit" disabled={isLoading} className="w-full h-12 md:h-10 lg:h-11 xl:h-12 bg-[#021a42] hover:bg-[#021a42]/90 text-white rounded-xl text-base lg:text-sm font-semibold transition-all active:scale-[0.99] group flex items-center justify-center cursor-pointer border-none shadow-none">
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </motion.div>

          </Field>

          <FieldSeparator className="py-1 md:py-2 text-[10px] lg:text-[11px] font-bold text-slate-300">
            Or
          </FieldSeparator>

          <Field>
            <motion.div 
              whileHover={{ y: -2, scale: 1.01 }} 
              initial="initial"
              whileTap={{ scale: 0.985 }}
            >
              <Button 
                variant="outline" 
                type="button" 
                disabled={isLoading}
                onClick={() => loginWithGoogle()}
                className="w-full h-12 md:h-10 lg:h-11 xl:h-12 rounded-xl lg:rounded-2xl border-slate-200/60 bg-slate-200/40 hover:bg-white transition-all flex items-center justify-center gap-1 text-slate-800 font-medium shadow-none group px-8 cursor-pointer"
              >
                <div className="h-8 w-8 lg:h-12 lg:w-12 transition-all">
                  <Lottie 
                    animationData={googleLottie} 
                    loop={true} 
                    className="w-full h-full scale-[1.5] lg:scale-150"
                  />
                </div>
                <span className="text-xs lg:text-sm">Sign in with Google</span>
              </Button>
            </motion.div>
          </Field>

          <FieldSeparator className="py-1 md:py-2 text-[10px] lg:text-[11px] font-bold text-slate-300">
            Already have an account?
          </FieldSeparator>

          <Field>
            <Link href="/signup" className="w-full cursor-pointer">
              <motion.div
                whileHover={{ y: -2, scale: 1.01 }}
                whileTap={{ scale: 0.985 }}
              >
                <Button variant="outline" className="w-full h-12 md:h-10 lg:h-12 border-slate-200/60 bg-slate-200/40 hover:bg-white text-slate-800 font-medium rounded-xl text-xs lg:text-sm transition-all active:scale-[0.99] cursor-pointer">
                  Start a Free Trial
                </Button>
              </motion.div>
            </Link>
          </Field>
        </FieldGroup>
      </form>

      <div className="pt-2 border-t border-slate-100 mt-1">
        <p className="text-center text-[9px] lg:text-[10px] text-slate-400 font-medium leading-tight">
          By clicking continue, you agree to our <Link href="#" className="text-slate-900 underline">Terms</Link> and <Link href="#" className="text-slate-900 underline">Privacy Policy</Link>.
        </p>
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="w-[94vw] sm:max-w-[480px] p-0 border-none bg-transparent shadow-none overflow-visible [&>button]:hidden">
          <DialogHeader className="sr-only">
            <DialogTitle>Verification Email Sent</DialogTitle>
            <DialogDescription>
              We've sent a verification link to your email address.
            </DialogDescription>
          </DialogHeader>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-[0_32px_80px_-16px_rgba(0,0,0,0.18)] border border-slate-100 p-8 sm:p-10 md:p-12 text-center flex flex-col items-center relative overflow-hidden"
          >
            <div className="mb-6 sm:mb-8 relative z-10 px-4">
              <Image
                src="/logo-akaro-dark-blue.png"
                alt="Akaro AI"
                width={120}
                height={35}
                className="object-contain sm:w-[130px] sm:h-[28px]"
                priority
              />
            </div>

            <div className="space-y-4 sm:space-y-6 md:space-y-7 flex flex-col items-center w-full relative z-10">
              <div className="space-y-2">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Check your Email</h2>
                <p className="text-slate-500 text-xs sm:text-sm md:text-base font-medium leading-relaxed max-w-[280px] sm:max-w-[320px] mx-auto">
                  A verification link has been sent to your account. Please verify to continue.
                </p>
              </div>

              <div className="my-4 sm:my-6 md:my-8 relative scale-90 sm:scale-110 md:scale-125">
                {/* Timer Spinner Ring */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg className="w-[90px] h-[90px] sm:w-[104px] sm:h-[104px] -rotate-90">
                    <circle
                      cx="45"
                      cy="45"
                      r="42"
                      className="stroke-slate-100 fill-none"
                      strokeWidth="3"
                      style={{ cx: "50%", cy: "50%" }}
                    />
                    <motion.circle
                      cx="50%"
                      cy="50%"
                      r="42"
                      className="stroke-blue-600 fill-none"
                      strokeWidth="3"
                      strokeDasharray="264"
                      initial={{ strokeDashoffset: 0 }}
                      animate={{ strokeDashoffset: 264 }}
                      transition={{ duration: 4, ease: "linear" }}
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                
                <div className="w-[70px] h-[70px] sm:w-[84px] sm:h-[84px] rounded-2xl sm:rounded-[26px] bg-blue-50/50 flex items-center justify-center relative shadow-sm border border-blue-100/50 mx-auto">
                  <div className="relative">
                    <PhosphorEnvelope className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" weight="duotone" />
                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-emerald-500 border-[2px] sm:border-[3px] border-white flex items-center justify-center shadow-md">
                      <PhosphorCheckCircle weight="fill" className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full pt-2 mt-2" />

              <Button 
                onClick={() => setShowSuccessDialog(false)}
                className="w-full h-11 sm:h-12 md:h-14 bg-[#2563eb] hover:bg-blue-700 text-white rounded-xl font-bold text-xs sm:text-sm md:text-base shadow-xl shadow-blue-600/15 transition-all active:scale-[0.98] mt-2"
              >
                Redirecting to login in {countdown}s...
              </Button>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
