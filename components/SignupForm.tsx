import { motion, Variants } from "framer-motion"
import { ArrowRight, Upload, X, FileImage } from "lucide-react"
import Link from "next/link"
import React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { 
  EnvelopeSimple as PhosphorEnvelope,
  CheckCircle as PhosphorCheckCircle,
  WarningCircle as PhosphorWarningCircle
} from "@phosphor-icons/react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { PasswordField } from "@/components/auth/PasswordField"

import Lottie from "lottie-react"
import googleLottie from "@/public/GOOGLE FILE.json"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { PhoneInput } from "@/components/ui/phone-input"
import { type Value } from "react-phone-number-input"
import { authApi } from "@/lib/api"
import { toast } from "sonner"
import { validateEmail, validatePassword, validatePhone, formatNumericOnly } from "@/lib/validation"
import { getUniversalDefaultImage } from "@/lib/utils"

import { useRouter } from "next/navigation"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();


  
  const [step, setStep] = React.useState(1);
  const [email, setEmail] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phone, setPhone] = React.useState<Value | undefined>(undefined);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  
  const [companyName, setCompanyName] = React.useState("");
  const [companyWebsite, setCompanyWebsite] = React.useState("");
  const [industry, setIndustry] = React.useState("");
  const [companySize, setCompanySize] = React.useState("");
  const [logoFile, setLogoFile] = React.useState<File | null>(null);
  const [logoBase64, setLogoBase64] = React.useState<string | null>(null);
  const [logoName, setLogoName] = React.useState("");
  const [logoError, setLogoError] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const googleSignup = () => {
    window.location.href = "/api/google/start";
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Logo must be smaller than 2MB");
      return;
    }

    setLogoError("");
    setLogoName(file.name);
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoBase64(null);
    setLogoName("");
    setLogoError("");
  };
  
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

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




  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (step === 1) {
      if (!validateEmail(email)) {
        newErrors.email = "Please enter a valid business email.";
      }
      if (!agreed) {
        newErrors.agreed = "You must agree to the terms.";
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      setIsLoading(true);
      try {
        await authApi.checkBusinessEmail(email);
        setErrors({});
        setStep(2);
      } catch (error: any) {
        const errorMsg = "Email check failed. This account may already exist.";
        setErrors({ email: errorMsg });
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      const step2Errors: { [key: string]: string } = {};
      if (!firstName.trim()) step2Errors.firstName = "First name is required.";
      if (!lastName.trim()) step2Errors.lastName = "Last name is required.";
      if (!phone) step2Errors.phone = "Phone number is required.";
      else if (!validatePhone(String(phone || ""))) step2Errors.phone = "Enter a valid phone number.";
      if (!validatePassword(password)) {
        step2Errors.password = "Password must be at least 8 characters and include uppercase, lowercase, a digit, and a special character.";
      }
      if (password !== confirmPassword) step2Errors.confirmPassword = "Passwords do not match.";

      if (Object.keys(step2Errors).length > 0) {
        setErrors(step2Errors);
        return;
      }
      setErrors({});
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!companyName.trim()) newErrors.companyName = "Company name is required.";
    if (!companyWebsite.trim()) newErrors.companyWebsite = "Company website is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", `${firstName} ${lastName}`);
      formData.append("mobile_number", String(phone || ""));
      formData.append("email", email);
      formData.append("password", password);
      formData.append("company_name", companyName);
      formData.append("website", companyWebsite);
      formData.append("industry", industry);
      formData.append("company_size", companySize);
      if (logoFile) {
        formData.append("company_logo", logoFile);
      }

      const res = await authApi.signup(formData) as any;
      if (res.is_successful) {
        
        try {
          const loginRes = await authApi.login({ email, password }) as any;
          if (loginRes.is_successful) {
            
            if (typeof window !== "undefined") {
              sessionStorage.setItem("akaro_verified_gate", "false");
              localStorage.setItem("akaro_email_persistence", email);
            }
            toast.success("Account created! Redirecting to workspace...");
            router.replace("/dashboard");
            return;
          }
        } catch (loginErr) {
          
          console.error("Auto-login failed:", loginErr);
        }

        try {
          localStorage.setItem("akaro_email_persistence", email);
        } catch (e) {}
        
        setErrors({});
        router.replace("/login?signup_success=true");
      } else {
        setErrors({ credentials: res.message || "Something went wrong. Please try again." });
      }
    } catch (error: any) {
      setErrors({ credentials: error.message || "Signup failed. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className={cn("flex flex-col gap-2 md:gap-2 lg:gap-4 w-full", className)} 
      {...restProps}
    >


      <form className="mt-1 lg:mt-0" onSubmit={step === 3 ? handleSubmit : handleNextStep}>
        <div className="flex flex-col gap-3 md:gap-3 lg:gap-4">
          {step === 1 ? (
            <>


              <Field>
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email" className="text-slate-800 font-semibold text-xs lg:text-sm flex gap-0.5">Business Email <span className="text-red-500">*</span></Label>
                    <Input
                      id="email"
                      type="email"
                      disabled={isLoading}
                      placeholder="Enter email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: "" });
                      }}
                      className={cn(
                        "h-12 md:h-10 lg:h-11 xl:h-12 bg-white border-slate-200 focus:border-[#2563eb] transition-all shadow-none text-base md:text-sm font-medium w-full",
                        errors.email && "border-red-500 focus:border-red-500"
                      )}
                    autoComplete="email"
                    maxLength={300}
                    required
                  />
                   {errors.email && <p className="text-[10px] text-red-500 font-medium">{errors.email}</p>}
                </div>
              </Field>

              <div className="flex items-start space-x-2 py-2">
                <Checkbox 
                  id="terms" 
                  disabled={isLoading}
                  checked={agreed}
                  onCheckedChange={(checked) => setAgreed(checked as boolean)}
                  className={cn(
                    "mt-1 border-slate-300 transition-all shadow-none outline-none",
                    agreed && "!bg-[#2563eb] !text-white !border-[#2563eb]"
                  )}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-[11px] lg:text-sm text-slate-500 font-medium leading-normal"
                  >
                    I agree to Akaro's{" "}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button type="button" className="text-[#2563eb] hover:underline underline-offset-4 font-semibold inline-flex gap-1.5">
                          Privacy Policy & Terms
                        </button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Legal Agreements</DialogTitle>
                          <DialogDescription>
                            Please review our Privacy Policy and Terms of Use.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="max-h-[350px] overflow-y-auto text-sm text-slate-600 space-y-6 pr-4 custom-scrollbar">
                          <div>
                            <h4 className="font-bold text-slate-900 mb-2">Privacy Policy</h4>
                            <div className="space-y-3">
                              <p>Welcome to Akaro. Your privacy is important to us.</p>
                              <p>We collect information to provide better services to all our users. This includes things like your name and contact details.</p>
                              <p>We use the information we collect to provide, maintain, protect and improve our services, and to develop new ones.</p>
                              <p>Your data is secured using industry-standard encryption and security protocols.</p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-slate-100">
                            <h4 className="font-bold text-slate-900 mb-2">Terms of Use</h4>
                            <div className="space-y-3">
                              <p>By using Akaro, you agree to these terms.</p>
                              <p>You must follow any policies made available to you within the Services.</p>
                              <p>Don’t misuse our Services. For example, don’t interfere with our Services or try to access them using a method other than the interface and the instructions that we provide.</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </label>
                </div>
              </div>

              <Field className="pt-2">
                <motion.div 
                  whileHover={{ y: -2, scale: 1.01 }} 
                  initial="initial"
                  whileTap={{ scale: 0.985 }}
                >
                  <Button 
                    type="submit" 
                    disabled={!agreed || !email || isLoading}
                    className="w-full h-12 md:h-10 lg:h-11 xl:h-12 bg-[#021a42] hover:bg-[#021a42]/90 text-white rounded-xl text-xs lg:text-sm font-bold transition-all active:scale-[0.99] cursor-pointer border-none shadow-none"
                  >
                    {isLoading ? "Verifying email..." : "Create a Free Trial Account"}
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
                    onClick={() => googleSignup()}
                    className="w-full h-12 md:h-10 lg:h-11 xl:h-12 rounded-xl lg:rounded-2xl border-slate-200/60 bg-slate-200/40 hover:bg-white transition-all flex items-center justify-center gap-1 text-slate-800 font-medium shadow-none group px-8 cursor-pointer"
                  >
                    <div className="h-8 w-8 lg:h-12 lg:w-12 transition-all">
                      <Lottie 
                        animationData={googleLottie} 
                        loop={true} 
                        className="w-full h-full scale-[1.5] lg:scale-150"
                      />
                    </div>
                    <span className="text-xs lg:text-sm">{isLoading ? "Processing..." : "Sign up with Google"}</span>
                  </Button>
                </motion.div>
              </Field>

              <FieldSeparator className="py-1 md:py-2 text-[10px] lg:text-[11px] font-bold text-slate-300">
                Already have an account?
              </FieldSeparator>

              <Field>
                <Link href="/login" className="w-full cursor-pointer">
                  <motion.div
                    whileHover={{ y: -2, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                  >
                    <Button variant="outline" className="w-full h-12 md:h-10 lg:h-11 xl:h-12 border-slate-200/60 bg-slate-200/40 hover:bg-white text-slate-800 font-medium rounded-xl text-xs lg:text-sm transition-all active:scale-[0.99] cursor-pointer">
                      Sign In
                    </Button>
                  </motion.div>
                </Link>
              </Field>
            </>
          ) : step === 2 ? (
            <>
              <div className="flex items-center gap-3 mb-4 -ml-1">
                <button 
                  type="button" 
                  disabled={isLoading}
                  onClick={() => setStep(1)}
                  className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-900 group"
                  aria-label="Go back"
                >
                  <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Step 2 of 3</span>
                  <p className="text-xs font-semibold text-slate-700">Personal Details</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Business Email</span>
                  <span className="text-sm font-semibold text-slate-700">{email}</span>
                </div>
                <button 
                  type="button" 
                  disabled={isLoading}
                  onClick={() => setStep(1)}
                  className="text-[10px] font-bold text-[#2563eb] hover:underline uppercase tracking-wider"
                >
                  Change
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-4">
                <Field>
                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="first-name" className="text-slate-800 font-semibold text-xs lg:text-sm flex items-center flex-wrap gap-x-1 ml-1">
                       First Name <span className="text-red-500">*</span>
                       <span className="text-slate-400 font-normal text-[10px] whitespace-nowrap">(Max 50)</span>
                     </Label>
                    <Input 
                      id="first-name" 
                      disabled={isLoading}
                      placeholder="Enter First Name" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={cn(
                        "h-12 md:h-10 lg:h-11 xl:h-12 bg-white border-slate-200 focus:border-[#3100be] transition-all shadow-none text-base md:text-sm font-medium w-full",
                        errors.firstName && "border-red-500"
                      )} 
                      maxLength={50}
                      required 
                    />
                  </div>
                </Field>
                <Field>
                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="last-name" className="text-slate-800 font-semibold text-xs lg:text-sm flex items-center flex-wrap gap-x-1 ml-1">
                       Last Name <span className="text-red-500">*</span>
                       <span className="text-slate-400 font-normal text-[10px] whitespace-nowrap">(Max 50)</span>
                     </Label>
                    <Input 
                      id="last-name" 
                      disabled={isLoading}
                      placeholder="Enter Last Name" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={cn(
                        "h-12 md:h-10 lg:h-11 xl:h-12 bg-white border-slate-200 focus:border-[#3100be] transition-all shadow-none text-base md:text-sm font-medium w-full",
                        errors.lastName && "border-red-500"
                      )} 
                      maxLength={50}
                      required 
                    />
                  </div>
                </Field>
              </div>

              <Field>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone" className="text-slate-800 font-semibold text-xs lg:text-sm flex gap-0.5 ml-1">Phone Number <span className="text-red-500">*</span></Label>
                  <PhoneInput 
                    id="phone" 
                    disabled={isLoading}
                    placeholder="Enter phone number" 
                    value={phone}
                    onChange={(value) => {
                      setPhone(value);
                      if (errors.phone) setErrors({ ...errors, phone: "" });
                    }}
                    defaultCountry="US"
                    className={cn(
                      "transition-all",
                      errors.phone && "[&>input]:border-red-500"
                    )} 
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-medium">{errors.phone}</p>}
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-4">
                <Field>
                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="password-2" className="text-slate-800 font-semibold text-xs lg:text-sm flex items-center flex-wrap gap-x-1 ml-1">
                       Password <span className="text-red-500">*</span>
                       <span className="text-slate-400 font-normal text-[10px] whitespace-nowrap">(Max 30)</span>
                     </Label>
                    <PasswordField 
                      id="password-2" 
                      disabled={isLoading}
                      placeholder="Enter password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={cn(
                        "h-12 md:h-10 lg:h-11 xl:h-12 bg-white border-slate-200 focus:border-[#3100be] transition-all shadow-none text-base md:text-sm font-medium w-full",
                        errors.password && "border-red-500"
                      )} 
                      maxLength={30}
                      required 
                    />
                  </div>
                </Field>
                <Field>
                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="confirm-password-2" className="text-slate-800 font-semibold text-xs lg:text-sm flex items-center flex-wrap gap-x-1 ml-1">
                       Confirm Password <span className="text-red-500">*</span>
                       <span className="text-slate-400 font-normal text-[10px] whitespace-nowrap">(Max 30)</span>
                     </Label>
                    <PasswordField 
                      id="confirm-password-2" 
                      disabled={isLoading}
                      placeholder="Confirm password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={cn(
                        "h-12 md:h-10 lg:h-11 xl:h-12 bg-white border-slate-200 focus:border-[#3100be] transition-all shadow-none text-base md:text-sm font-medium w-full",
                        errors.confirmPassword && "border-red-500"
                      )} 
                      maxLength={30}
                      required 
                    />
                  </div>
                </Field>
              </div>
              {(errors.password || errors.confirmPassword) && (
                <p className="text-[10px] text-red-500 font-medium -mt-2">
                  {errors.password || errors.confirmPassword}
                </p>
              )}

              <Field className="pt-2">
                <motion.div 
                  whileHover={{ y: -2, scale: 1.01 }} 
                  initial="initial"
                  whileTap={{ scale: 0.985 }}
                >
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 md:h-10 lg:h-11 xl:h-12 bg-[#021a42] hover:bg-[#021a42]/90 text-white rounded-xl text-xs lg:text-sm font-bold transition-all active:scale-[0.99] cursor-pointer border-none shadow-none"
                  >
                    {isLoading ? "Saving details..." : "Continue"}
                  </Button>
                </motion.div>
              </Field>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4 -ml-1">
                <button 
                  type="button" 
                  disabled={isLoading}
                  onClick={() => setStep(2)}
                  className="p-1.5 rounded-full hover:bg-slate-200 transition-colors text-slate-500 hover:text-slate-900 group"
                  aria-label="Go back"
                >
                  <ArrowRight className="h-4 w-4 rotate-180 transition-transform group-hover:-translate-x-0.5" />
                </button>
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Step 3 of 3</span>
                  <p className="text-xs font-semibold text-slate-700">Company Information</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-4 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Business Email</span>
                  <span className="text-sm font-semibold text-slate-700">{email}</span>
                </div>
              </div>

              <Field>
                <div className="flex flex-col gap-1.5">
                   <Label htmlFor="company-name" className="text-slate-800 font-semibold text-xs lg:text-sm flex items-center flex-wrap gap-x-1 ml-1">
                     Company Name <span className="text-red-500">*</span>
                     <span className="text-slate-400 font-normal text-[10px] whitespace-nowrap">(Max 200)</span>
                   </Label>
                  <Input 
                    id="company-name" 
                    disabled={isLoading}
                    placeholder="Enter company name" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className={cn(
                      "h-12 md:h-10 lg:h-11 xl:h-12 bg-white border-slate-200 focus:border-[#3100be] transition-all shadow-none text-base md:text-sm font-medium w-full",
                      errors.companyName && "border-red-500"
                    )} 
                    maxLength={200}
                    required 
                  />
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="company-logo" className="text-slate-800 font-semibold text-xs lg:text-sm flex gap-0.5 ml-1">Company Logo (Optional)</Label>
                  <div className="relative group/upload">
                    <input 
                      type="file" 
                      id="company-logo" 
                      disabled={isLoading}
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className={cn(
                      "h-12 md:h-10 lg:h-12 bg-white border-2 border-dashed border-slate-200 rounded-xl px-4 flex items-center gap-3 transition-all",
                      logoError ? "border-red-300 bg-red-50/30" : "group-hover/upload:border-[#3100be]/40 group-hover/upload:bg-slate-50/50"
                    )}>
                      <div className="size-6 lg:size-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                        {logoBase64 ? (
                          <img src={logoBase64} alt="Preview" className="size-full object-contain rounded-lg p-0.5" />
                        ) : (
                          <FileImage className="size-4 lg:size-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs lg:text-sm font-medium text-slate-600 truncate">
                          {logoName || "Upload company logo (Max 2MB)"}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-2">
                        {logoName ? (
                          <button 
                            type="button" 
                            onClick={(e) => { e.preventDefault(); removeLogo(); }}
                            className="p-1 hover:bg-slate-200 rounded-full transition-colors relative z-20"
                          >
                            <X className="size-3 lg:size-4 text-slate-500" />
                          </button>
                        ) : (
                          <Upload className="size-3 lg:size-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  {logoError && <p className="text-[10px] text-red-500 font-medium">{logoError}</p>}
                </div>
              </Field>

              <Field>
                <div className="flex flex-col gap-1.5">
                   <Label htmlFor="company-website" className="text-slate-800 font-semibold text-xs lg:text-sm flex items-center flex-wrap gap-x-1 ml-1">
                     Company Website <span className="text-red-500">*</span>
                     <span className="text-slate-400 font-normal text-[10px] whitespace-nowrap">(Max 1000)</span>
                   </Label>
                  <Input 
                    id="company-website" 
                    disabled={isLoading}
                    placeholder="Enter company website" 
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    className={cn(
                      "h-12 md:h-10 lg:h-12 bg-white border-slate-200 focus:border-[#3100be] transition-all shadow-none text-base md:text-sm font-medium w-full",
                      errors.companyWebsite && "border-red-500"
                    )} 
                     maxLength={1000}
                   />
                   {companyWebsite.length >= 1000 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                </div>
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-4">
                <Field>
                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="industry" className="text-slate-800 font-semibold text-xs lg:text-sm flex items-center flex-wrap gap-x-1 ml-1">
                       Industry
                       <span className="text-slate-400 font-normal text-[10px] whitespace-nowrap">(Max 100)</span>
                     </Label>
                    <Input 
                      id="industry" 
                      disabled={isLoading}
                      placeholder="Enter industry" 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className={cn(
                        "h-12 md:h-10 lg:h-12 bg-white border-slate-200 focus:border-[#3100be] transition-all shadow-none text-base md:text-sm font-medium w-full",
                        errors.industry && "border-red-500"
                      )} 
                       maxLength={100}
                     />
                     {industry.length >= 100 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                  </div>
                </Field>
                <Field>
                  <div className="flex flex-col gap-1.5">
                     <Label htmlFor="company-size" className="text-slate-800 font-semibold text-xs lg:text-sm flex items-center flex-wrap gap-x-1 ml-1">
                       Company Size
                       <span className="text-slate-400 font-normal text-[10px] whitespace-nowrap">(Max 100)</span>
                     </Label>
                    <Input 
                    id="company-size" 
                    disabled={isLoading}
                    placeholder="Enter company size" 
                    value={companySize}
                    onChange={(e) => {
                      const value = formatNumericOnly(e.target.value);
                      setCompanySize(value);
                      if (errors.companySize) setErrors({ ...errors, companySize: "" });
                    }}
                    className={cn(
                      "h-12 md:h-10 lg:h-12 bg-white border-slate-200 focus:border-[#2563eb] transition-all shadow-none text-base md:text-sm font-medium w-full",
                      errors.companySize && "border-red-500"
                    )} 
                    maxLength={100}
                  />
                  {companySize.length >= 100 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                  </div>
                </Field>
              </div>

              {errors.credentials && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200 mb-2">
                  <div className="h-4 w-4 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[10px] font-bold">!</span>
                  </div>
                  <span className="text-xs text-red-600 font-semibold">{errors.credentials}</span>
                </div>
              )}

              <Field className="pt-2">
                <motion.div 
                  whileHover={{ y: -2, scale: 1.01 }} 
                  initial="initial"
                  whileTap={{ scale: 0.985 }}
                >
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full h-12 md:h-10 lg:h-14 bg-[#021a42] hover:bg-[#021a42]/90 text-white rounded-xl text-xs lg:text-sm font-bold transition-all active:scale-[0.99] cursor-pointer border-none shadow-none"
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </motion.div>
              </Field>
            </>
          )}
        </div>
      </form>

      <div className="pt-2 border-t border-slate-100 mt-1">
        <p className="text-center text-[9px] lg:text-[10px] text-slate-400 font-medium leading-tight">
          By clicking continue, you agree to our <Link href="#" className="text-slate-900 underline">Terms</Link> and <Link href="#" className="text-slate-900 underline">Privacy Policy</Link>.
        </p>
      </div>


    </motion.div>
  )
}
