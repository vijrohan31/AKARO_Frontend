"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { httpRequest } from "@/lib/http-client";

interface DashboardContextType {
  userData: Record<string, any> | null;
  isVerificationRequired: boolean;
  setVerificationRequired: (val: boolean) => void;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
  admins: any[] | null;
  setAdmins: (admins: any[]) => void;
  companies: any[] | null;
  setCompanies: (companies: any[]) => void;
  users: any[] | null;
  setUsers: (users: any[]) => void;
}

const DashboardContext = createContext<DashboardContextType>({
  userData: null,
  isVerificationRequired: false,
  setVerificationRequired: () => {},
  isLoading: true,
  refreshProfile: async () => {},
  admins: null,
  setAdmins: () => {},
  companies: null,
  setCompanies: () => {},
  users: null,
  setUsers: () => {},
});

export const DashboardProvider = ({ 
  children,
  initialUserData = null
}: { 
  children: React.ReactNode,
  initialUserData?: Record<string, any> | null
}) => {
  const [userData, setUserData] = useState<Record<string, any> | null>(initialUserData);
  const [isLoading, setIsLoading] = useState(!initialUserData);
  const [isVerificationRequired, setVerificationRequired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    triggerGlobalVerificationLock = setVerificationRequired;
  }, []);

  

  const fetchUserData = async () => {
    setIsLoading(true);
    try {
      const profileData = await authApi.fetchProfile() as any;
      if (profileData) {
        const role = String(profileData.role || "").toLowerCase();
        
        let avatarUrl = "/me.jpg";
        let companyLogoUrl = "/logo-blue.png"; 

        
        if (profileData.is_verified) {
          try {
            const avatarProbeUrl = (role.includes("super_admin") || role.includes("superadmin"))
              ? `/api/super_admin_master/fetch_super_admin_profile_picture?email=${encodeURIComponent(profileData.email)}`
              : `/api/fetch_profile_picture`;

            const avatarBlob = await httpRequest(avatarProbeUrl, { responseType: "blob", skipVerificationLock: true });
            if (avatarBlob instanceof Blob && avatarBlob.size > 0) {
              avatarUrl = URL.createObjectURL(avatarBlob);
            }
          } catch (e) {}

          try {
            const companyCode = profileData.company_data?.company_code || profileData.company_data?.code || profileData.company_data?.id;
            if (companyCode) {
              const logoBlob = await httpRequest(`/api/company_master/fetch_company_logo`, { responseType: "blob", skipVerificationLock: true });
              if (logoBlob instanceof Blob && logoBlob.size > 0) {
                companyLogoUrl = URL.createObjectURL(logoBlob);
              }
            }
          } catch (e) {}
        }

        setUserData(prev => {
          const isVerifiedNow = profileData.is_verified ?? prev?.is_verified ?? true;
          
          if (typeof window !== "undefined") {
            sessionStorage.setItem("akaro_verified_gate", isVerifiedNow ? "true" : "false");
          }
          
          return {
            ...profileData,
            is_verified: isVerifiedNow,
            name: profileData.name || profileData.first_name,
            email: profileData.email,
            avatar: avatarUrl,
            companyLogo: companyLogoUrl,
          };
        });
      } else {
        if (typeof window !== "undefined") {
          window.location.href = "/login?expired=true";
        }
      }
    } catch (error: any) {
      if (typeof window !== "undefined") {
        window.location.href = "/login?expired=true";
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!userData || !userData.email) {
      fetchUserData();
    } else {
      setIsLoading(false);
    }

    
    return () => {
      if (userData?.avatar && userData.avatar.startsWith("blob:")) {
        URL.revokeObjectURL(userData.avatar);
      }
      if (userData?.companyLogo && userData.companyLogo.startsWith("blob:")) {
        URL.revokeObjectURL(userData.companyLogo);
      }
    };
  }, []);

  const [admins, setAdmins] = useState<any[] | null>(null);
  const [companies, setCompanies] = useState<any[] | null>(null);
  const [users, setUsers] = useState<any[] | null>(null);

  return (
    <DashboardContext.Provider value={{ 
      userData, 
      isLoading, 
      refreshProfile: fetchUserData,
      isVerificationRequired,
      setVerificationRequired,
      admins,
      setAdmins,
      companies,
      setCompanies,
      users,
      setUsers
    }}>
      <div className={cn("dashboard-provider h-full w-full")}>
        {children}
      </div>
    </DashboardContext.Provider>
  );
};

export let triggerGlobalVerificationLock = (val: boolean) => {};

export const useDashboard = () => useContext(DashboardContext);
