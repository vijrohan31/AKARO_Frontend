"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { 
  User, 
  Camera, 
  ShieldCheck, 
  Loader2, 
  PencilLine,
  Phone,
  Mail,
  UserCheck,
  Building,
  ArrowLeft,
  LockKeyhole,
  Key,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn, getAvatarColor, getUniversalDefaultImage } from "@/lib/utils"
import { PremiumAvatar } from "@/components/dashboard/PremiumAvatar"
import { authApi } from "@/lib/api"
import { ImageCropper } from "@/components/dashboard/ImageCropper"
import { toast } from "sonner"
import { useDashboard } from "@/components/dashboard/DashboardProvider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import Link from "next/link"

export default function ProfilePage() {
  const { userData, isLoading: isLoadingProfile, refreshProfile } = useDashboard()
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileName, setProfileName] = useState("")
  const [profilePhone, setProfilePhone] = useState("")
  const [profileCompanyName, setProfileCompanyName] = useState("")
  const [profileWebsite, setProfileWebsite] = useState("")
  
  const [isPersonalExpanded, setIsPersonalExpanded] = useState(true)
  const [isCompanyExpanded, setIsCompanyExpanded] = useState(false)
  const [profileIndustry, setProfileIndustry] = useState("")
  const [profileCompanySize, setProfileCompanySize] = useState("")
  const [profileCompanyManager, setProfileCompanyManager] = useState("")
  const [profileCompanyEmail, setProfileCompanyEmail] = useState("")
  const [profileCompanyPhone, setProfileCompanyPhone] = useState("")
  const [activeTab, setActiveTab] = useState<"personal" | "company">("personal")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [imageToCrop, setImageToCrop] = useState<string | null>(null)
  const [isCropperOpen, setIsCropperOpen] = useState(false)
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false)
  const [isUploadingCompanyLogo, setIsUploadingCompanyLogo] = useState(false)
  const [isRemoveCompanyLogoDialogOpen, setIsRemoveCompanyLogoDialogOpen] = useState(false)
  const [photoNonce, setPhotoNonce] = useState(Date.now())
  const [companyLogoNonce, setCompanyLogoNonce] = useState(Date.now())
  const [activeImageType, setActiveImageType] = useState<"user" | "company">("user")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const companyLogoInputRef = useRef<HTMLInputElement>(null)

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showOldPassword, setShowOldPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    if (userData) {
      setProfileName(userData.name || "")
      setProfilePhone(userData.phone_number || userData.mobile_number || userData.company_data?.mobile_number || "")
      setProfileCompanyName(userData.company_name || userData.company_data?.company_name || "")
      setProfileWebsite(userData.website || userData.company_data?.website || "")
      setProfileIndustry(userData.industry || userData.company_data?.industry || "")
      setProfileCompanySize(userData.company_size || userData.company_data?.company_size || "")
      setProfileCompanyManager(userData.company_data?.name || "")
      setProfileCompanyEmail(userData.company_data?.email || "")
      setProfileCompanyPhone(userData.company_data?.mobile_number || "")
    }
  }, [userData])

  const userRole = String(userData?.role || "User").toLowerCase().trim();
  const isSuperAdmin = userRole.includes("super_admin") || userRole.includes("superadmin");
  const isCompanyOwner = userRole === "company_owner";
  const isBrowse = userRole === "browse" || userRole === "browsers" || userRole === "browser";
  const isMember = userRole === "member" || userRole === "members";
  const isReadOnly = isBrowse || isMember || userRole === "user" || userRole === "users" || userRole === "admin" || userRole === "admins";
  const roleDisplay = userRole.replace(/_/g, ' ');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640 && isCompanyOwner) {
      setIsPersonalExpanded(false);
      setIsCompanyExpanded(false);
    }
  }, [isCompanyOwner]);

  const handleUpdateProfile = async (e?: React.BaseSyntheticEvent) => {
    if (e) e.preventDefault();
    if (!userData) return;
    
    setIsUpdatingProfile(true);
    try {
      if (isSuperAdmin) {
        const formData = new FormData();
        formData.append("email", userData.email);
        formData.append("name", profileName);
        formData.append("phone_number", profilePhone);
        
        // Brute Force: Ensure image is sent if missing
        if (!userData.avatar && !userData.profile_picture) {
          const defaultImg = await getUniversalDefaultImage();
          formData.append("profile_picture", defaultImg);
        }

        await authApi.updateSuperAdmin(formData as any);
      } else {
        const formData = new FormData();
        formData.append("name", profileCompanyManager);
        formData.append("email", profileCompanyEmail);
        formData.append("mobile_number", profileCompanyPhone);
        formData.append("phone_number", profileCompanyPhone);
        
        formData.append("company_name", profileCompanyName);
        formData.append("legal_name", profileCompanyName);
        formData.append("website", profileWebsite);
        formData.append("industry", profileIndustry);
        formData.append("company_size", profileCompanySize);
        formData.append("employee_limit", profileCompanySize);
        formData.append("billing", "free");
        formData.append("country", "India");
        
        const companyCode = userData.company_data?.company_code || userData.company_data?.code || userData.company_data?.id;
        if (companyCode) {
          formData.append("company_code", companyCode);
        }

        // Brute Force: Ensure image is sent if missing
        if (!userData.company_data?.logo && !userData.company_data?.company_logo) {
          const defaultImg = await getUniversalDefaultImage();
          formData.append("company_logo", defaultImg);
        }

        await authApi.updateCompanyProfile(formData);
      }
      
      toast.success("Profile updated successfully!");
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        old_password: oldPassword,
        new_password: newPassword,
      });
      toast.success("Password changed successfully!");
      setIsChangePasswordOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "user" | "company" = "user") => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setActiveImageType(type);
    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setIsCropperOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    const isCompany = activeImageType === "company";
    if (isCompany) {
      setIsUploadingCompanyLogo(true);
    } else {
      setIsUploadingPhoto(true);
    }

    try {
      const formData = new FormData();
      if (isCompany) {
        formData.append("company_logo", croppedBlob, "company_logo.jpg");
        const companyCode = userData?.company_data?.company_code || userData?.company_data?.code || userData?.company_data?.id;
        if (companyCode) {
          formData.append("company_code", companyCode);
        }
        formData.append("name", profileCompanyManager);
        formData.append("email", profileCompanyEmail);
        formData.append("mobile_number", profileCompanyPhone);
        formData.append("phone_number", profileCompanyPhone);
        formData.append("company_name", profileCompanyName);
        formData.append("legal_name", profileCompanyName);
        formData.append("company_size", profileCompanySize);
        formData.append("employee_limit", profileCompanySize);
        formData.append("billing", "free");
        formData.append("country", "India");
        formData.append("website", profileWebsite);
        formData.append("industry", profileIndustry);
      } else {
        formData.append("profile_picture", croppedBlob, "profile_picture.jpg");
      }
      
      const endpoint = isCompany ? "/api/company_master/update_company_profile" : "/api/update_profile_picture";
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (res.ok) {
        await new Promise(resolve => setTimeout(resolve, 500));
        await refreshProfile();
        if (isCompany) {
          setCompanyLogoNonce(Date.now());
          toast.success("Company logo updated successfully!");
        } else {
          setPhotoNonce(Date.now());
          toast.success("Profile photo updated successfully!");
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || `Failed to update ${isCompany ? "company logo" : "profile photo"}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setIsUploadingPhoto(false);
      setIsUploadingCompanyLogo(false);
      setIsCropperOpen(false);
      setImageToCrop(null);
    }
  };

  const handleRemovePhoto = async () => {
    setIsRemoveDialogOpen(false);
    
    setIsUploadingPhoto(true);
    try {
      const res = await fetch("/api/delete_profile_picture", {
        method: "DELETE",
        credentials: "include",
      });
      
      if (res.ok) {
        await refreshProfile();
        setPhotoNonce(Date.now());
        toast.success("Profile photo removed successfully!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to remove profile photo");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to remove photo");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemoveCompanyLogo = async () => {
    setIsRemoveCompanyLogoDialogOpen(false);
    setIsUploadingCompanyLogo(true);
    try {
      const formData = new FormData();
      const companyCode = userData?.company_data?.company_code || userData?.company_data?.code || userData?.company_data?.id;
      if (companyCode) {
        formData.append("company_code", companyCode);
      }
      
      formData.append("name", profileCompanyManager);
      formData.append("email", profileCompanyEmail);
      formData.append("mobile_number", profileCompanyPhone);
      formData.append("company_name", profileCompanyName);
      
      formData.append("website", profileWebsite);
      formData.append("industry", profileIndustry);
      formData.append("company_size", profileCompanySize);
      
      formData.append("company_logo", "");
      
      const res = await fetch("/api/company_master/update_company_profile", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      
      if (res.ok) {
        await refreshProfile();
        setCompanyLogoNonce(Date.now());
        toast.success("Company logo removed successfully!");
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.message || "Failed to remove company logo");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to remove logo");
    } finally {
      setIsUploadingCompanyLogo(false);
    }
  };

  if (isLoadingProfile || !userData) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-blue-600" strokeWidth={2.5} />
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Syncing Profile Persistence...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className={cn(
      "h-full animate-in fade-in duration-500",
      isCompanyOwner ? "max-w-[1100px] mx-auto pb-4 px-4 sm:px-0" : "flex flex-col bg-white pb-2"
    )}>
      {isCompanyOwner ? (
        <div className="flex flex-col gap-2 px-1 mb-2">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-none font-heading pt-2">Profile</h1>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200/60 relative overflow-hidden w-full sm:w-auto self-end">
            {[
              { id: "personal", label: "Personal", icon: UserCheck },
              { id: "company", label: "Business", icon: Building }
            ].map((tab) => {
              const isActive = activeTab === tab.id
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "personal" | "company")}
                  className={cn(
                    "relative flex-1 sm:flex-none px-5 py-2.5 text-[12px] font-bold transition-all duration-300 whitespace-nowrap z-10 flex items-center justify-center gap-2 rounded-md min-w-[120px] cursor-pointer",
                    isActive ? "text-white" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="profile-tab-bg"
                      className="absolute inset-0 bg-[#1447E6] rounded-md shadow-lg shadow-blue-500/25"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <Icon size={15} className="relative z-20" />
                  <span className="relative z-20">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="relative px-4 sm:px-6 lg:px-8 mt-1 sm:mt-2">
          <div 
            className="h-20 sm:h-30 lg:h-40 w-full bg-slate-100 bg-cover bg-center rounded-2xl shadow-sm border border-slate-200/50 relative overflow-hidden transition-all duration-500"
            style={{ backgroundImage: "url('/header.jpg')" }}
          >
            <div className="absolute inset-0 bg-black/5" />
          </div>

          <div className="flex flex-col items-center px-6 sm:px-12 lg:px-20 -mt-16 sm:-mt-22 lg:-mt-26 z-10 transition-all duration-500 w-full max-w-7xl mx-auto">
            <div className="flex flex-col items-center gap-1.5 sm:gap-2.5 w-full">
              
              <div 
                className="relative group cursor-pointer" 
                onClick={() => fileInputRef.current?.click()}
              >
                <PremiumAvatar 
                  src={userData.avatar} 
                  name={userData.name}
                  isSquare={true}
                  className="size-20 sm:size-32 lg:size-40 border-4 border-white shadow-xl bg-white rounded-xl transition-all group-hover:scale-[1.02]" 
                  style={{ fontSize: '2.5rem' }}
                />
                <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <Camera size={24} className="text-white" />
                </div>
                {isUploadingPhoto && (
                  <div className="absolute inset-0 bg-white/60 rounded-xl flex items-center justify-center z-30">
                    <Loader2 size={32} className="text-blue-600 animate-spin" strokeWidth={2.5} />
                  </div>
                )}
              </div>

              
              <div className="flex flex-col items-center gap-1.5 min-w-0">
                <Badge variant="outline" className="w-fit bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase tracking-widest text-[8px] px-2.5 py-0.5 rounded-full shadow-sm">
                  {roleDisplay}
                </Badge>
              </div>

              
              <div className="flex items-center gap-10 sm:gap-6 lg:gap-8 pb-0 sm:pb-2 shrink-0">
                <button 
                  onClick={() => setIsRemoveDialogOpen(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-red-500 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer group/btn"
                >
                  <Trash2 size={13} className="text-slate-300 group-hover/btn:text-red-400 transition-colors" />
                  Remove
                </button>
                <button 
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="flex items-center gap-1.5 text-slate-400 hover:text-emerald-600 transition-all text-[10px] font-bold uppercase tracking-widest cursor-pointer group/btn"
                >
                  <Key size={13} className="text-slate-300 group-hover/btn:text-emerald-500 transition-colors" />
                  Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      <div className={cn(
        "space-y-1 px-4 2xl:px-8",
        !isCompanyOwner && "max-w-[750px] 3xl:max-w-[950px] mx-auto w-full mt-0 pb-0"
      )}>
        <div className={cn(
          "overflow-hidden",
          isCompanyOwner ? "bg-white rounded-xl border border-slate-200/60 shadow-sm" : ""
        )}>
          <AnimatePresence mode="wait" initial={false}>
            {(!isCompanyOwner || activeTab === "personal") && (
              <motion.div
                key="personal"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className={cn(isCompanyOwner && "bg-white")}
              >
                
                {isCompanyOwner && (
                  <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/30">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                      
                      <div className="flex items-center gap-4 sm:gap-5">
                        <div 
                          className="relative group cursor-pointer shrink-0" 
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <PremiumAvatar 
                            src={userData.avatar} 
                            name={userData.name}
                            isSquare={true}
                            className="size-18 sm:size-22 border-2 border-white shadow-md bg-white rounded-lg transition-all group-hover:scale-[1.02]" 
                            style={{ fontSize: '1.5rem' }}
                          />
                          <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                            <Camera size={18} className="text-white" />
                          </div>
                          {isUploadingPhoto && (
                            <div className="absolute inset-0 bg-white/60 rounded-lg flex items-center justify-center z-30">
                              <Loader2 size={22} className="text-blue-600 animate-spin" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight truncate">{userData.name}</h2>
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 font-bold uppercase tracking-widest text-[8px] px-2 py-0.5 text-blue-600">
                              {roleDisplay}
                            </Badge>
                          </div>
                          <p className="text-[13px] font-medium text-slate-600 truncate flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400" />
                            {userData.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setIsRemoveDialogOpen(true)}
                          className="h-9 rounded-lg border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 px-3.5 shadow-sm hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <Trash2 size={13} strokeWidth={2.5} />
                          Remove
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => setIsChangePasswordOpen(true)}
                          className="h-9 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 px-4 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] cursor-pointer"
                        >
                          <Key size={13} strokeWidth={2.5} />
                          Password
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                
                <div className={cn(
                  "p-3 sm:p-4",
                  !isCompanyOwner && "p-0"
                )}>
                  <div className={cn(
                    "grid gap-3",
                    isCompanyOwner ? "grid-cols-1" : "grid-cols-1"
                  )}>
                    
                    <div className={cn(
                      "flex items-start gap-2.5 sm:gap-3 p-2 sm:p-2.5 transition-all group/field",
                      isCompanyOwner ? "rounded-lg border bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-100 cursor-not-allowed" : "rounded-xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 cursor-not-allowed"
                    )}>
                      <div className={cn(
                        "size-7 sm:size-8 lg:size-10 rounded-lg border flex items-center justify-center text-slate-400 shrink-0 shadow-sm transition-colors group-hover/field:text-blue-500 cursor-not-allowed",
                        isCompanyOwner ? "bg-white border-slate-100" : "bg-slate-50 border-slate-100"
                      )}>
                        <User size={18} />
                      </div>
                      <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                        <Label className="text-[11px] sm:text-[12px] font-medium text-slate-500 ml-1">Full Name</Label>
                        <p className="text-[14px] sm:text-[15px] font-medium text-slate-700 truncate">{profileName}</p>
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-start gap-3 p-2.5 transition-all group/field cursor-not-allowed",
                      isCompanyOwner 
                        ? "rounded-lg border bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-100" 
                        : "rounded-xl border border-slate-100 bg-white shadow-sm hover:border-slate-200"
                    )}>
                      <div className={cn(
                        "size-7 sm:size-8 lg:size-10 rounded-lg border flex items-center justify-center text-slate-400 shrink-0 shadow-sm transition-colors group-hover/field:text-blue-500 cursor-not-allowed",
                        isCompanyOwner ? "bg-white border-slate-100" : "bg-slate-50 border-slate-100"
                      )}>
                        <Mail size={18} />
                      </div>
                      <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                        <Label className="text-[11px] sm:text-[12px] font-medium text-slate-500 ml-1 flex items-center gap-1.5">
                          Email Address
                        </Label>
                        <p className="text-[14px] sm:text-[15px] font-medium text-slate-700 truncate">{userData.email}</p>
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-start gap-2.5 sm:gap-3 p-2 sm:p-2.5 transition-all group/field",
                      isCompanyOwner ? "rounded-lg border bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-100 cursor-not-allowed" : "rounded-xl border border-slate-100 bg-white shadow-sm hover:border-slate-200 cursor-not-allowed"
                    )}>
                      <div className={cn(
                        "size-8 lg:size-10 rounded-lg border flex items-center justify-center text-slate-400 shrink-0 shadow-sm transition-colors group-hover/field:text-blue-500",
                        isCompanyOwner ? "bg-white border-slate-100" : "bg-slate-50 border-slate-100"
                      )}>
                        <Phone size={18} />
                      </div>
                      <div className="flex-1 space-y-0.5 sm:space-y-1 min-w-0">
                        <Label className="text-[11px] sm:text-[12px] font-medium text-slate-500 ml-1">Phone Number</Label>
                        <p className="text-[14px] sm:text-[15px] font-medium text-slate-700 truncate">{profilePhone || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {isCompanyOwner && activeTab === "company" && (
              <motion.div
                key="company"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="w-full"
              >
                
                <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
                    <div className="flex items-center gap-4 sm:gap-5">
                      <div 
                        className="relative group cursor-pointer shrink-0" 
                        onClick={() => companyLogoInputRef.current?.click()}
                      >
                        <PremiumAvatar 
                          src={userData.companyLogo} 
                          name={profileCompanyName || "Company"}
                          isSquare={true}
                          className="size-18 sm:size-22 border-2 border-white shadow-md bg-white rounded-lg transition-all group-hover:scale-[1.02]" 
                          style={{ fontSize: '1.5rem' }}
                        />
                        <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                          <Camera size={18} className="text-white" />
                        </div>
                        {isUploadingCompanyLogo && (
                          <div className="absolute inset-0 bg-white/60 rounded-lg flex items-center justify-center z-30">
                            <Loader2 size={22} className="text-blue-600 animate-spin" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="text-lg sm:text-xl font-bold font-heading text-slate-900 tracking-tight truncate">{profileCompanyName || "Company"}</h2>
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase tracking-widest text-[8px] px-2 py-0.5">
                            Active
                          </Badge>
                        </div>
                        <p className="text-[13px] font-medium text-slate-600 truncate flex items-center gap-1.5">
                          <Building size={12} className="text-slate-400" />
                          {profileIndustry || "Business Profile"}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsRemoveCompanyLogoDialogOpen(true)}
                        className="h-9 rounded-lg border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 px-3.5 shadow-sm hover:bg-red-50 hover:border-red-100 hover:text-red-500 transition-all active:scale-[0.98] cursor-pointer"
                      >
                        <Trash2 size={13} strokeWidth={2.5} />
                        Remove
                      </Button>
                      {!isReadOnly && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleUpdateProfile()}
                          disabled={isUpdatingProfile}
                          className="h-9 rounded-lg bg-[#1447E6] hover:bg-[#1447E6]/90 text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 px-4 shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] cursor-pointer"
                        >
                          {isUpdatingProfile ? <Loader2 size={13} className="animate-spin" /> : <PencilLine size={13} strokeWidth={2.5} />}
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                
                <div className="p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className={cn(
                      "flex items-center gap-3 p-2 rounded-xl border transition-all group/field",
                      isReadOnly ? "bg-slate-50/30 border-slate-100 opacity-80 cursor-not-allowed" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-200"
                    )}>
                      <div className={cn("size-7 rounded-lg bg-white border flex items-center justify-center text-slate-400 transition-all shrink-0 shadow-sm", !isReadOnly && "group-hover/field:text-blue-500 group-hover/field:border-blue-50")}>
                        <Building size={14} />
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <Label htmlFor="company-name" className="text-[12px] font-medium text-slate-500 ml-1">
                          Company Name <span className="text-red-500">*</span>
                        </Label>
                        <Input id="company-name" value={profileCompanyName} onChange={(e) => setProfileCompanyName(e.target.value)} placeholder="Enter company name" disabled={isReadOnly} className={cn("h-6 p-0 border-none bg-transparent focus-visible:ring-0 font-medium text-[15px] placeholder:text-slate-300", isReadOnly ? "text-slate-500 cursor-not-allowed" : "text-slate-900")} />
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 p-2 rounded-xl border transition-all group/field",
                      isReadOnly ? "bg-slate-50/30 border-slate-100 opacity-80 cursor-not-allowed" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-200"
                    )}>
                      <div className={cn("size-7 rounded-lg bg-white border flex items-center justify-center text-slate-400 transition-all shrink-0 shadow-sm", !isReadOnly && "group-hover/field:text-blue-500 group-hover/field:border-blue-50")}>
                        <Phone size={14} />
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <Label htmlFor="company-phone" className="text-[10px] font-medium text-slate-500 ml-1">
                          Business Phone <span className="text-red-500">*</span>
                        </Label>
                        <Input id="company-phone" value={profileCompanyPhone} onChange={(e) => setProfileCompanyPhone(e.target.value)} placeholder="+1 (555) 000-0000" disabled={isReadOnly} className={cn("h-6 p-0 border-none bg-transparent focus-visible:ring-0 font-medium text-[15px] placeholder:text-slate-300", isReadOnly ? "text-slate-500 cursor-not-allowed" : "text-slate-900")} maxLength={20} />
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 p-2 rounded-xl border transition-all group/field",
                      isReadOnly ? "bg-slate-50/30 border-slate-100 opacity-80 cursor-not-allowed" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-200"
                    )}>
                      <div className={cn("size-7 rounded-lg bg-white border flex items-center justify-center text-slate-400 transition-all shrink-0 shadow-sm", !isReadOnly && "group-hover/field:text-blue-500 group-hover/field:border-blue-50")}>
                        <Building size={14} />
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <Label htmlFor="website" className="text-[12px] font-medium text-slate-500 ml-1">
                          Website URL <span className="text-red-500">*</span>
                        </Label>
                        <Input id="website" value={profileWebsite} onChange={(e) => setProfileWebsite(e.target.value)} placeholder="https://company.com" disabled={isReadOnly} className={cn("h-6 p-0 border-none bg-transparent focus-visible:ring-0 font-medium text-[15px] placeholder:text-slate-300", isReadOnly ? "text-slate-500 cursor-not-allowed" : "text-slate-900")} />
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 p-2 rounded-xl border transition-all group/field",
                      isReadOnly ? "bg-slate-50/30 border-slate-100 opacity-80 cursor-not-allowed" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-200"
                    )}>
                      <div className={cn("size-7 rounded-lg bg-white border flex items-center justify-center text-slate-400 transition-all shrink-0 shadow-sm", !isReadOnly && "group-hover/field:text-blue-500 group-hover/field:border-blue-50")}>
                        <UserCheck size={14} />
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <Label htmlFor="company-manager" className="text-[12px] font-medium text-slate-500 ml-1">
                          Account Manager <span className="text-red-500">*</span>
                        </Label>
                        <Input id="company-manager" value={profileCompanyManager} onChange={(e) => setProfileCompanyManager(e.target.value)} placeholder="Contact Person" disabled={isReadOnly} className={cn("h-6 p-0 border-none bg-transparent focus-visible:ring-0 font-medium text-[15px] placeholder:text-slate-300", isReadOnly ? "text-slate-500 cursor-not-allowed" : "text-slate-900")} maxLength={100} />
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 p-2 rounded-xl border transition-all group/field",
                      isReadOnly ? "bg-slate-50/30 border-slate-100 opacity-80 cursor-not-allowed" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-200"
                    )}>
                      <div className={cn("size-7 rounded-lg bg-white border flex items-center justify-center text-slate-400 transition-all shrink-0 shadow-sm", !isReadOnly && "group-hover/field:text-blue-500 group-hover/field:border-blue-50")}>
                        <Building size={14} />
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <Label htmlFor="industry" className="text-[12px] font-medium text-slate-500 ml-1">Industry</Label>
                        <Input id="industry" value={profileIndustry} onChange={(e) => setProfileIndustry(e.target.value)} placeholder="e.g. Technology" disabled={isReadOnly} className={cn("h-6 p-0 border-none bg-transparent focus-visible:ring-0 font-medium text-[15px] placeholder:text-slate-300", isReadOnly ? "text-slate-500 cursor-not-allowed" : "text-slate-900")} />
                      </div>
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 p-2 rounded-xl border transition-all group/field",
                      isReadOnly ? "bg-slate-50/30 border-slate-100 opacity-80 cursor-not-allowed" : "bg-slate-50/50 border-slate-100 hover:bg-white hover:border-blue-200"
                    )}>
                      <div className={cn("size-7 rounded-lg bg-white border flex items-center justify-center text-slate-400 transition-all shrink-0 shadow-sm", !isReadOnly && "group-hover/field:text-blue-500 group-hover/field:border-blue-50")}>
                        <User size={14} />
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <Label htmlFor="company-size" className="text-[12px] font-medium text-slate-500 ml-1">Company Size</Label>
                        <Input id="company-size" value={profileCompanySize} onChange={(e) => setProfileCompanySize(e.target.value)} placeholder="e.g. 11-50" disabled={isReadOnly} className={cn("h-6 p-0 border-none bg-transparent focus-visible:ring-0 font-medium text-[15px] placeholder:text-slate-300", isReadOnly ? "text-slate-500 cursor-not-allowed" : "text-slate-900")} />
                      </div>
                    </div>

                    <div className={cn("flex items-center gap-3 p-2 rounded-xl border transition-all group/field sm:col-span-2 cursor-not-allowed", "bg-slate-50/50 border-slate-100")}>
                      <div className="size-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 transition-all shrink-0 shadow-sm cursor-not-allowed">
                        <Mail size={14} />
                      </div>
                      <div className="flex-1 space-y-0.5 min-w-0">
                        <Label htmlFor="company-email" className="text-[12px] font-medium text-slate-500 ml-1">
                          Business Email <span className="text-red-500">*</span>
                        </Label>
                        <p className="text-[15px] font-medium text-slate-700 truncate">{profileCompanyEmail || "business@company.com"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>


      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={handlePhotoUpload} 
      />

      <input 
        type="file" 
        ref={companyLogoInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => handlePhotoUpload(e, "company")} 
      />

      {imageToCrop && (
        <ImageCropper
          image={imageToCrop || ""}
          open={isCropperOpen}
          onClose={() => {
            setIsCropperOpen(false);
            setImageToCrop(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}

      <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <DialogContent className="w-[94vw] sm:max-w-[450px] p-0 border-none shadow-2xl bg-white rounded-xl max-h-[88vh] overflow-y-auto no-scrollbar overflow-hidden">
           <div className="p-8">
              <DialogHeader className="mb-8">
                <div className="flex items-center gap-4">
                  <div className="size-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                    <LockKeyhole size={24} strokeWidth={2.5} />
                  </div>
                  <div className="text-left">
                    <DialogTitle className="text-xl font-bold font-heading text-slate-800 tracking-tight">Security Update</DialogTitle>
                    <p className="text-xs font-medium text-slate-500 mt-1">Change your account password to stay secure.</p>
                  </div>
                </div>
              </DialogHeader>

              <form onSubmit={handleChangePassword} className="space-y-6">
                 <div className="space-y-2">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Current Password</Label>
                    <div className="relative">
                       <Input 
                        type={showOldPassword ? "text" : "password"} 
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder="Enter password" 
                        required
                        maxLength={30}
                        className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-2xl pr-10"
                      />
                      <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                        {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">New Password</Label>
                    <div className="relative">
                       <Input 
                        type={showNewPassword ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter password" 
                        required
                        maxLength={30}
                        className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-2xl pr-10"
                      />
                      <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Confirm New Password</Label>
                    <div className="relative">
                       <Input 
                        type={showConfirmPassword ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm password" 
                        required
                        maxLength={30}
                        className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-2xl pr-10"
                      />
                      <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                 </div>

                 <div className="pt-4 flex items-center gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsChangePasswordOpen(false)}
                      className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-500 font-bold tracking-wide uppercase text-[11px]"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isChangingPassword}
                      className="flex-1 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold tracking-wide uppercase text-[11px] shadow-lg shadow-emerald-500/20"
                    >
                      {isChangingPassword ? <Loader2 size={16} className="animate-spin" /> : "Update Password"}
                    </Button>
                  </div>
              </form>
           </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="w-[94vw] sm:max-w-[400px] rounded-xl p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="p-8">
            <DialogHeader className="items-center text-center">
              <div className="size-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-100 shadow-sm">
                <User size={28} />
              </div>
              <DialogTitle className="text-xl font-bold font-heading text-slate-900 tracking-tight">Remove Photo?</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
                This will delete your current profile picture. You can upload a new one at any time.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 sm:gap-3 mt-8 sm:mt-10">
              <Button
                type="button"
                onClick={handleRemovePhoto}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/25 transition-all text-[11px] uppercase tracking-wider"
              >
                Permanently Remove
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRemoveDialogOpen(false)}
                className="flex-1 h-10 rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all text-[11px] uppercase tracking-wider"
              >
                Keep Photo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isRemoveCompanyLogoDialogOpen} onOpenChange={setIsRemoveCompanyLogoDialogOpen}>
        <DialogContent className="w-[94vw] sm:max-w-[400px] rounded-xl p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="p-8">
            <DialogHeader className="items-center text-center">
              <div className="size-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-4 border border-red-100 shadow-sm">
                <Building size={28} />
              </div>
              <DialogTitle className="text-xl font-bold font-heading text-slate-900 tracking-tight">Remove Company Logo?</DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
                This will delete your current company logo. You can upload a new one at any time.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 sm:gap-3 mt-8 sm:mt-10">
              <Button
                type="button"
                onClick={handleRemoveCompanyLogo}
                className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-500/25 transition-all text-[11px] uppercase tracking-wider"
              >
                Permanently Remove
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRemoveCompanyLogoDialogOpen(false)}
                className="flex-1 h-10 rounded-xl border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all text-[11px] uppercase tracking-wider"
              >
                Keep Logo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
