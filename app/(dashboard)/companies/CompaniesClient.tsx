"use client"

import * as React from "react"
import useSWR from "swr"
import { Building2, Upload } from "lucide-react"
import {
  DotsThree,
  Envelope,
  Phone,
  ArrowSquareOut,
  CircleNotch,
  CaretLeft,
  CaretRight,
  Eye,
  Warning,
  CheckCircle,
  XCircle,
  Plus,
  UserGear,
  ShieldCheck,
  Clock,
  CaretUp,
  CaretDown,
  PencilLine
} from "@phosphor-icons/react"
import { formatNumericOnly } from "@/lib/validation"
import { cn, getAvatarColor, getUniversalDefaultImage } from "@/lib/utils"
import { PremiumAvatar } from "@/components/dashboard/PremiumAvatar"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { authApi, resolveImageUrl } from "@/lib/api"
import { MasterToolbar } from "@/components/dashboard/MasterToolbar"
import { useDashboard } from "@/components/dashboard/DashboardProvider"
import { useRouter } from "next/navigation"

interface CompaniesClientProps {
  initialCompanies: any[]
}

const extractData = (res: any) => {
  const data = Array.isArray(res)
    ? res
    : (res.user_data || res.data || res.result || res.companies || []);
  return Array.isArray(data) ? data : [];
}

export default function CompaniesClient({ initialCompanies }: CompaniesClientProps) {
  const { userData, isLoading: isProfileLoading, companies: cachedCompanies, setCompanies } = useDashboard()
  const router = useRouter()

  React.useEffect(() => {
    if (!isProfileLoading && userData) {
      const userRole = String(userData.role || "").toLowerCase();
      const isSuperAdmin = userRole.includes("super_admin") || userRole.includes("superadmin");
      if (!isSuperAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [userData, isProfileLoading, router]);
  const [searchTerm, setSearchTerm] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<"all" | "Enabled" | "Disabled">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)

  const isSuperAdmin = String(userData?.role || "").toLowerCase().includes("super_admin") || String(userData?.role || "").toLowerCase().includes("superadmin");

  const { data: companies, isLoading, mutate } = useSWR(userData && isSuperAdmin ? 'companies-master-list' : null, async () => {
    const response = await authApi.fetchCompanies();
    const data = extractData(response);
    
    const mappedData = data.map((item: any) => {
      const code = item.company_code || item.code || item.id || item._id || item.uuid || item.company_id;
      let logo = item.company_logo || item.logo || item.logo_url || item.company_logo_url;
      if (!logo || (!logo.startsWith('http') && !logo.startsWith('data:') && !logo.startsWith('/api/'))) {
        logo = authApi.fetchCompanyLogoUrl(item.email || item.company_email || item.owner_email);
      }
      
      const rawStatus = String(item.status || "").toLowerCase();
      const isSuspended = 
        item.is_disabled === true || 
        item.is_disabled === "true" ||
        item.is_enabled === false || 
        item.is_enabled === "false" || 
        item.is_active === false || 
        item.is_active === "false" ||
        rawStatus === "disabled" || 
        rawStatus === "suspended" || 
        rawStatus === "false";

      return {
        ...item,
        company_code: code,
        company_logo: logo,
        status: isSuspended ? "Disabled" : "Enabled"
      };
    });

    setCompanies(mappedData)
    return mappedData
  }, { 
    fallbackData: cachedCompanies || undefined,
  })

  const [expandedId, setExpandedId] = React.useState<string | null>(null);
 
  React.useEffect(() => {
    const width = window.innerWidth;
    if (width >= 2500) setItemsPerPage(12);
    else if (width >= 1500) setItemsPerPage(5);
    else if (width >= 1024) setItemsPerPage(6);
    else if (width >= 768) setItemsPerPage(8);
    else setItemsPerPage(5);
  }, []);

  const [selectedCompany, setSelectedCompany] = React.useState<any>(null)
  const [companyToToggle, setCompanyToToggle] = React.useState<any>(null)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isAdding, setIsAdding] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [isToggling, setIsToggling] = React.useState(false)

  const [newCompany, setNewCompany] = React.useState({
    name: "",
    mobile_number: "",
    email: "",
    company_name: "",
    website: "",
    industry: "",
    company_size: "",
  })

  const [editingCompany, setEditingCompany] = React.useState<any>(null)

  const filteredData = (companies || []).filter(c => {
    const matchesSearch = Object.values(c).some(val => 
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter === "all" || (c.status || "Enabled") === statusFilter;
    return matchesSearch && matchesStatus;
  });

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const [logoFile, setLogoFile] = React.useState<File | null>(null)
  const [logoPreview, setLogoPreview] = React.useState<string | null>(null)
  const [logoName, setLogoName] = React.useState("")

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be smaller than 2MB");
      return;
    }
    setLogoName(file.name);
    setLogoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const formData = new FormData();
      Object.entries(newCompany).forEach(([key, value]) => formData.append(key, value));
      if (logoFile) {
        formData.append("company_logo", logoFile);
      } else {
        // Brute Force: Always send an image
        const defaultImg = await getUniversalDefaultImage();
        formData.append("company_logo", defaultImg);
      }

      await authApi.addCompany(formData);
      toast.success("Company added successfully");
      setIsAddModalOpen(false);
      setNewCompany({
        name: "", mobile_number: "", email: "", company_name: "",
        website: "", industry: "", company_size: "",
      });
      setLogoFile(null);
      setLogoPreview(null);
      setLogoName("");
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to add company");
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditCompany = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCompany) return
    setIsUpdating(true)

    const code = editingCompany.company_code || editingCompany.code || editingCompany.id || editingCompany._id || editingCompany.uuid || editingCompany.company_id;

    if (!code) {
      toast.error("Invalid company code. Please refresh.")
      setIsUpdating(false)
      return
    }

    try {
      const formData = new FormData();
      formData.append("company_code", code);
      
      formData.append("legal_name", editingCompany.company_name);
      formData.append("company_name", editingCompany.company_name);
      
      formData.append("name", editingCompany.name);
      formData.append("email", editingCompany.email);
      
      formData.append("phone_number", formatNumericOnly(editingCompany.mobile_number));
      formData.append("mobile_number", formatNumericOnly(editingCompany.mobile_number));
      
      formData.append("website", editingCompany.website);
      formData.append("industry", editingCompany.industry);
      
      formData.append("employee_limit", editingCompany.company_size);
      formData.append("company_size", editingCompany.company_size);
      
      formData.append("billing", "free");
      formData.append("country", "India");
      
      if (logoFile) {
        formData.append("company_logo", logoFile);
      } else if (!logoPreview || logoPreview.includes("none") || logoPreview.includes("null")) {
        // Brute Force: If logo is missing or was removed, upload me.jpg
        const defaultImg = await getUniversalDefaultImage();
        formData.append("company_logo", defaultImg);
      }

      await authApi.updateCompany(formData)
      toast.success("Company updated successfully")
      setIsEditModalOpen(false)
      mutate()
    } catch (error: any) {
      toast.error(error.message || "Update failed")
    } finally {
      setIsUpdating(false)
    }
  }

  const openEditModal = (company: any) => {
    setEditingCompany({
      ...company,
      name: company.name || "",
      email: company.email || "",
      mobile_number: company.mobile_number ? formatNumericOnly(company.mobile_number) : "",
      company_name: company.company_name || "",
      website: company.website || "",
      industry: company.industry || "",
      company_size: company.company_size || company.employee_limit || "",
    })
    
    setLogoFile(null)
    setLogoName("")
    setLogoPreview(null)

    const existingLogo = company.logo || company.company_logo;
    if (existingLogo && typeof existingLogo === "string" && existingLogo.trim() !== "" && !existingLogo.toLowerCase().includes("none") && !existingLogo.toLowerCase().includes("null")) {
      setLogoPreview(resolveImageUrl(existingLogo));
      setLogoName("Existing Logo");
    }
    
    setIsEditModalOpen(true)
  }

  const handleRemoveLogo = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLogoFile(null);
    setLogoPreview(null);
    setLogoName("");
  };

  const handleOpenAddModal = () => {
    setNewCompany({
      name: "",
      email: "",
      mobile_number: "",
      company_name: "",
      website: "",
      industry: "",
      company_size: "",
    });
    setLogoFile(null);
    setLogoPreview(null);
    setLogoName("");
    setIsAddModalOpen(true);
  };

  const handleToggleStatus = async () => {
    if (!companyToToggle) return;
    setIsToggling(true);
    try {
      const email = companyToToggle.email || companyToToggle.account_manager_email;
      const code = companyToToggle.company_code || companyToToggle.code || companyToToggle.id || companyToToggle._id || companyToToggle.uuid || companyToToggle.company_id;

      if (!email || !code) {
        toast.error("Required data missing for toggle. Please refresh.");
        setIsToggling(false);
        return;
      }

      if ((companyToToggle.status || "Enabled") === "Enabled") {
        await authApi.disableCompany(code);
      } else {
        await authApi.enableCompany(code);
      }
      toast.success(`${companyToToggle.company_name} status updated`);
      setCompanyToToggle(null);
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle company status");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 px-1">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-medium text-slate-700 tracking-tight leading-none font-heading">Company Master</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1.5 tracking-tight">Manage all organizations and their access protocols.</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent 
          onPointerDownOutside={(e) => isAdding && e.preventDefault()}
          onEscapeKeyDown={(e) => isAdding && e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton={isAdding}
          className="w-[94vw] sm:max-w-[850px] p-0 border-none shadow-2xl bg-white max-h-[88vh] overflow-y-auto no-scrollbar rounded-lg transition-all"
        >
          <DialogTitle className="sr-only">Add New Company</DialogTitle>
          <div className="p-5 sm:p-8">
            <DialogHeader className="mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="size-10 sm:size-12 bg-[#1447E6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Building2 size={20} strokeWidth={2.5} className="text-white sm:hidden" />
                  <Building2 size={24} strokeWidth={2.5} className="text-white hidden sm:block" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-slate-800 tracking-tight">Add New Company</DialogTitle>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1">Initialize a new workspace with full data parity.</p>
                </div>
              </div>
            </DialogHeader>

            <form id="add-company-form" onSubmit={handleAddCompany} className="flex flex-col md:flex-row gap-6 sm:gap-8">
              <div className="flex flex-col items-center gap-3 sm:gap-4 shrink-0">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-full text-left">Company Logo</Label>
                <div className="relative group/logo size-32 sm:size-44 lg:size-52">
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                  <div className="size-full border-2 border-dashed border-slate-200 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50/50 group-hover/logo:bg-white group-hover/logo:border-blue-200 transition-all relative overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} className="size-full object-contain" />
                    ) : (
                      <div className="flex flex-col items-center gap-2 sm:gap-2.5 text-slate-300">
                        <Upload size={28} strokeWidth={1.5} className="sm:hidden" />
                        <Upload size={40} strokeWidth={1.5} className="hidden sm:block" />
                        <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-tight text-center">Click to upload</span>
                      </div>
                    )}
                  </div>
                </div>
                {logoPreview && (
                  <button 
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest px-4 py-2 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                  >
                    Remove Image
                  </button>
                )}
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight text-center max-w-[140px] sm:max-w-[160px]">
                  SVG, PNG or JPG (Max 2MB)
                </p>
              </div>
              <div className="flex-1 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                      Account Manager <span className="text-red-500 ml-0.5">*</span>
                      <span className="text-slate-400 font-normal normal-case ml-1">(Max 100)</span>
                    </Label>
                    <Input
                      value={newCompany.name}
                      onChange={e => setNewCompany({...newCompany, name: e.target.value})}
                      required
                      maxLength={100}
                      className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium"
                    />
                    {newCompany.name.length >= 100 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                  </div>
                   <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                      Company Size
                      <span className="text-slate-400 font-normal normal-case ml-1">(Max 100)</span>
                    </Label>
                    <Input value={newCompany.company_size} onChange={e => setNewCompany({...newCompany, company_size: formatNumericOnly(e.target.value)})} placeholder="e.g. 51-200" maxLength={100} className="h-11 rounded-md border-slate-200" />
                    {newCompany.company_size.length >= 100 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                      Mobile Number <span className="text-red-500 ml-0.5">*</span>
                      <span className="text-slate-400 font-normal normal-case ml-1">(Max 20)</span>
                    </Label>
                    <Input
                      value={newCompany.mobile_number}
                      onChange={e => setNewCompany({...newCompany, mobile_number: formatNumericOnly(e.target.value)})}
                      required
                      maxLength={20}
                      className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium"
                    />
                    {newCompany.mobile_number.length >= 20 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                      Company Name <span className="text-red-500 ml-0.5">*</span>
                      <span className="text-slate-400 font-normal normal-case ml-1">(Max 200)</span>
                    </Label>
                    <Input value={newCompany.company_name} onChange={e => setNewCompany({...newCompany, company_name: e.target.value})} placeholder="Enter Company Name" maxLength={200} required className="h-11 rounded-md border-slate-200" />
                    {newCompany.company_name.length >= 200 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                      Website URL <span className="text-red-500 ml-0.5">*</span>
                      <span className="text-slate-400 font-normal normal-case ml-1">(Max 1000)</span>
                    </Label>
                    <Input
                      value={newCompany.website}
                      onChange={e => setNewCompany({...newCompany, website: e.target.value})}
                      required
                      className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium"
                    />
                    {newCompany.website.length >= 1000 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                      Industry Sector
                      <span className="text-slate-400 font-normal normal-case ml-1">(Max 100)</span>
                    </Label>
                    <Input value={newCompany.industry} onChange={e => setNewCompany({...newCompany, industry: e.target.value})} placeholder="e.g. Technology" maxLength={100} className="h-11 rounded-md border-slate-200" />
                    {newCompany.industry.length >= 100 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                  </div>
                  <div className="sm:col-span-2 space-y-1.5 text-left">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                      Email Address <span className="text-red-500 ml-0.5">*</span>
                      <span className="text-slate-400 font-normal normal-case ml-1">(Max 300)</span>
                    </Label>
                    <Input
                      type="email"
                      value={newCompany.email}
                      onChange={e => setNewCompany({...newCompany, email: e.target.value})}
                      required
                      maxLength={300}
                      className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium"
                    />
                    {newCompany.email.length >= 300 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                  </div>
                </div>
              </div>
            </form>

            <div className="flex flex-col-reverse sm:flex-row-reverse items-center justify-start gap-3 mt-8 sm:mt-12">
              <Button 
                type="submit" 
                form="add-company-form" 
                disabled={isAdding} 
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-md bg-[#1447E6] hover:bg-[#1447E6]/90 text-white font-bold shadow-md shadow-blue-500/10 transition-all active:scale-[0.98] text-[12px] gap-2 cursor-pointer"
              >
                {isAdding ? <CircleNotch className="animate-spin h-5 w-5" /> : "Add Company"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddModalOpen(false)} 
                disabled={isAdding}
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-md border-slate-200 bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all text-[12px] cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>
        <Dialog open={isEditModalOpen} onOpenChange={(open) => !isUpdating && setIsEditModalOpen(open)}>
        <DialogContent 
          onOpenAutoFocus={(e) => e.preventDefault()}
          onPointerDownOutside={(e) => isUpdating && e.preventDefault()}
          onEscapeKeyDown={(e) => isUpdating && e.preventDefault()}
          hideCloseButton={isUpdating}
          className="w-[94vw] sm:max-w-[850px] p-0 border-none shadow-2xl bg-white max-h-[88vh] overflow-y-auto no-scrollbar rounded-lg transition-all"
        >
          <DialogTitle className="sr-only">Update Company Details</DialogTitle>
          <div className="p-5 sm:p-8">
            <DialogHeader className="mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="size-10 sm:size-12 bg-[#1447E6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Building2 size={20} strokeWidth={2.5} className="text-white sm:hidden" />
                  <Building2 size={24} strokeWidth={2.5} className="text-white hidden sm:block" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-slate-800 tracking-tight">Update Company</DialogTitle>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1">Modify account details and workspace configurations.</p>
                </div>
              </div>
            </DialogHeader>

            {editingCompany && (
              <form id="edit-company-form" onSubmit={handleEditCompany} className="flex flex-col md:flex-row gap-6 sm:gap-8">
                <div className="flex flex-col items-center gap-3 sm:gap-4 shrink-0">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-full text-left">Company Logo</Label>
                  <div className="relative group/logo size-32 sm:size-44 lg:size-52">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="size-full border-2 border-dashed border-slate-200 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50/50 group-hover/logo:bg-white group-hover/logo:border-blue-200 transition-all relative overflow-hidden">
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          className="size-full object-contain rounded-xl sm:rounded-2xl" 
                          onError={() => {
                            setLogoPreview(null);
                            setLogoName("");
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 sm:gap-2.5 text-slate-300">
                          <Upload size={28} strokeWidth={1.5} className="sm:hidden" />
                          <Upload size={40} strokeWidth={1.5} className="hidden sm:block" />
                          <span className="text-[12px] sm:text-[13px] font-bold uppercase tracking-tight text-center">Click to upload image</span>
                        </div>
                      )}
                    </div>
                  </div>
                  {logoPreview && (
                    <button 
                      type="button"
                      onClick={handleRemoveLogo}
                      className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest px-4 py-2 rounded-md hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Remove Image
                    </button>
                  )}
                  <p className="text-[9px] font-medium text-slate-400 uppercase tracking-tight text-center max-w-[140px] sm:max-w-[160px]">
                    SVG, PNG or JPG (Max 2MB)
                  </p>
                </div>

                <div className="flex-1 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                        Account Manager <span className="text-red-500 ml-0.5">*</span>
                        <span className="text-slate-400 font-normal normal-case ml-1">(Max 100)</span>
                      </Label>
                      <Input value={editingCompany.name} onChange={e => setEditingCompany({...editingCompany, name: e.target.value})} placeholder="Enter User Name" maxLength={100} required className="h-11 rounded-md border-slate-200" />
                      {editingCompany.name.length >= 100 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                        Company Size
                        <span className="text-slate-400 font-normal normal-case ml-1">(Max 100)</span>
                      </Label>
                      <Input value={editingCompany.company_size} onChange={e => setEditingCompany({...editingCompany, company_size: formatNumericOnly(e.target.value)})} placeholder="e.g. 51-200" maxLength={100} className="h-11 rounded-md border-slate-200" />
                      {editingCompany.company_size.length >= 100 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                        Mobile Number <span className="text-red-500 ml-0.5">*</span>
                        <span className="text-slate-400 font-normal normal-case ml-1">(Max 20)</span>
                      </Label>
                      <Input value={editingCompany.mobile_number} onChange={e => setEditingCompany({...editingCompany, mobile_number: formatNumericOnly(e.target.value)})} placeholder="Enter phone number" maxLength={20} required className="h-11 rounded-md border-slate-200" />
                      {editingCompany.mobile_number.length >= 20 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                        Company Name <span className="text-red-500 ml-0.5">*</span>
                        <span className="text-slate-400 font-normal normal-case ml-1">(Max 200)</span>
                      </Label>
                      <Input value={editingCompany.company_name} onChange={e => setEditingCompany({...editingCompany, company_name: e.target.value})} placeholder="Enter Company Name" maxLength={200} required className="h-11 rounded-md border-slate-200" />
                      {editingCompany.company_name.length >= 200 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                        Website URL <span className="text-red-500 ml-0.5">*</span>
                        <span className="text-slate-400 font-normal normal-case ml-1">(Max 1000)</span>
                      </Label>
                      <Input value={editingCompany.website} onChange={e => setEditingCompany({...editingCompany, website: e.target.value})} placeholder="https://company.com" maxLength={1000} required className="h-11 rounded-md border-slate-200" />
                      {editingCompany.website.length >= 1000 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                    </div>
                    <div className="space-y-1.5 text-left">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center flex-wrap gap-x-1">
                        Industry Sector
                        <span className="text-slate-400 font-normal normal-case ml-1">(Max 100)</span>
                      </Label>
                      <Input value={editingCompany.industry} onChange={e => setEditingCompany({...editingCompany, industry: e.target.value})} placeholder="e.g. Technology" maxLength={100} className="h-11 rounded-md border-slate-200" />
                      {editingCompany.industry.length >= 100 && <p className="text-[10px] text-red-500 font-semibold mt-1">Limit reached</p>}
                    </div>
                    <div className="sm:col-span-2 space-y-1.5 text-left cursor-not-allowed">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-not-allowed">Email Address</Label>
                      <Input type="email" value={editingCompany.email} disabled className="h-11 rounded-md border-slate-100 bg-slate-50 text-slate-600 font-medium cursor-not-allowed" />
                    </div>
                  </div>
                </div>
              </form>
            )}

            <div className="flex flex-col-reverse sm:flex-row-reverse items-center justify-start gap-3 mt-8 sm:mt-12">
              <Button 
                type="submit" 
                form="edit-company-form" 
                disabled={isUpdating} 
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-lg bg-[#1447E6] hover:bg-[#1447E6]/90 text-white font-bold shadow-md shadow-blue-500/10 transition-all active:scale-[0.98] text-[12px] gap-2 cursor-pointer"
              >
                {isUpdating ? <CircleNotch className="animate-spin h-5 w-5" /> : <><PencilLine className="h-4 w-4" /><span>Update workspace</span></>}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)} 
                disabled={isUpdating}
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-lg border-slate-200 bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all text-[12px] cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
        </Dialog>
      </div>

      <MasterToolbar 
        tabs={[
          { id: "all", label: "All", count: filteredData.length },
          { id: "Enabled", label: "Active", count: (companies || []).filter(c => c.status === "Enabled" || !c.status).length },
          { id: "Disabled", label: "Suspended", count: (companies || []).filter(c => c.status === "Disabled").length },
        ]}
        activeTab={statusFilter}
        onTabChange={(id) => setStatusFilter(id as any)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actionLabel="Add Company"
        actionIcon={Building2}
        onActionClick={handleOpenAddModal}
      />

      <div className="h-fit max-h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-0">
          <div className="hidden md:block h-full">
            <Table className="border-collapse">
            <TableHeader className="bg-slate-50 sticky top-0 z-[40] shadow-sm">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="text-[13px] font-bold text-slate-600 pl-6 h-14 bg-slate-50 z-[40]">Company information</TableHead>
                <TableHead className="text-[13px] font-bold text-slate-600 px-4 h-14 bg-slate-50 z-[40]">Company Size</TableHead>
                <TableHead className="text-[13px] font-bold text-slate-600 hidden md:table-cell pl-12 h-14 bg-slate-50 z-[40]">Owner</TableHead>
                <TableHead className="text-[13px] font-bold text-slate-600 pl-16 h-14 bg-slate-50 z-[40]">Status</TableHead>
                <TableHead className="text-right text-[13px] font-bold text-slate-600 pr-6 h-14 bg-slate-50 z-[40]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !companies ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-slate-400">
                    <CircleNotch className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/40" />
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-slate-400">Loading Data...</span>
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Building2 className="size-10 text-slate-200" />
                       <span className="text-sm font-medium text-slate-400">No organizations found matching your criteria.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((c, i) => (
                  <TableRow key={c.company_code || i} className="border-none hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-4">
                        <PremiumAvatar
                          src={resolveImageUrl(c.company_logo || c.logo) || (c.email ? authApi.fetchCompanyLogoUrl(c.email) : undefined)}
                          name={c.company_name}
                          silent={true}
                          className="h-10 w-10 border border-slate-100 bg-white shadow-sm transition-transform group-hover:scale-105"
                        />
                        <span className="font-medium text-slate-700 text-[14px] font-sans tracking-tight">{c.company_name || c.name || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-4">
                      <span className="text-[13px] text-slate-500 font-medium">{c.email || "—"}</span>
                    </TableCell>
                     <TableCell className="text-[13px] text-slate-700 font-medium py-4 hidden md:table-cell pl-12">
                       {c.name || "—"}
                     </TableCell>
                    <TableCell className="py-4 pl-16">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 uppercase tracking-widest leading-none shadow-sm",
                        (c.status || "Enabled") === "Enabled" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-slate-50 text-slate-500 border border-slate-200/60"
                      )}>
                        {c.status || "Enabled"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-3 lg:py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="ml-auto h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 hover:text-primary transition-all outline-none group/trigger cursor-pointer">
                          <DotsThree weight="bold" className="h-5 w-5 text-slate-400 group-hover/trigger:text-primary transition-colors" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52 rounded-lg border-slate-200/60 shadow-xl p-1.5 font-sans">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1.5 text-center">Action</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem onClick={() => setSelectedCompany(c)} className="gap-2.5 text-xs font-semibold py-2 px-2 rounded-md focus:bg-slate-50 cursor-pointer">
                              <Eye weight="bold" className="size-4 text-slate-500" />
                              View Full Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditModal(c)} className="gap-2.5 text-xs font-semibold py-2 px-2 rounded-md focus:bg-slate-50 cursor-pointer border-t border-slate-50 mt-1 pt-2.5">
                              <PencilLine weight="bold" className="size-4 text-blue-500" />
                              Edit Company
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-dashed border-slate-100" />
                            <DropdownMenuItem onClick={() => setCompanyToToggle(c)} className={cn("gap-2.5 text-xs font-bold py-2 px-2 rounded-md focus:bg-slate-50 cursor-pointer", (c.status || "Enabled") === "Enabled" ? "text-red-600" : "text-emerald-600")}>
                              {(c.status || "Enabled") === "Enabled" ? <XCircle weight="bold" className="size-4" /> : <CheckCircle weight="bold" className="size-4" />}
                              {(c.status || "Enabled") === "Enabled" ? "Suspend Company" : "Restore Access"}
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          <div className="block md:hidden divide-y divide-slate-100">
            {isLoading && !companies ? (
              <div className="p-12 text-center">
                <CircleNotch className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Companies...</span>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="p-12 text-center">
                 <Building2 className="size-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">No organizations found.</p>
              </div>
            ) : (
              paginatedData.map((c, i) => {
                const id = c.company_code || i.toString();
                const isExpanded = expandedId === id;
                const status = c.status || "Enabled";
                const email = c.email || "";

                return (
                  <div key={id} className="group transition-all">
                    <button 
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className={cn(
                        "w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left cursor-pointer",
                        isExpanded && "bg-slate-50/80"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
                        <PremiumAvatar 
                          src={c.company_logo} 
                          name={c.company_name} 
                          silent={true}
                          className="size-10" 
                        />
                        <div className="min-w-0 pr-2">
                           <p className="text-[14px] font-bold text-slate-800 tracking-tight truncate font-sans uppercase">{c.company_name || "—"}</p>
                        </div>
                      </div>
                      <span className={cn(
                        "flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                        status === "Enabled" 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-slate-50 text-slate-500 border-slate-100"
                      )}>
                        {status}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-6 space-y-5 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Company Size</p>
                            <p className="text-[13px] text-slate-700 font-medium truncate">{c.email || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Owner</p>
                            <p className="text-[13px] text-slate-700 font-medium">{c.name || "—"}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-2">
                          <Button 
                            onClick={() => setCompanyToToggle(c)}
                            variant="outline" 
                            className={cn(
                              "flex-1 h-10 text-[11px] font-bold rounded-xl shadow-none transition-all min-w-[100px] cursor-pointer",
                              status === "Enabled" 
                                ? "text-red-600 border-red-100 hover:bg-red-50" 
                                : "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                            )}
                          >
                            {status === "Enabled" ? <XCircle className="size-3.5 mr-1.5" weight="bold" /> : <CheckCircle className="size-3.5 mr-1.5" weight="bold" />}
                            {status === "Enabled" ? "Suspend" : "Activate"}
                          </Button>
                          <Button 
                            onClick={() => setSelectedCompany(c)}
                            variant="outline"
                            className="flex-1 h-10 text-[11px] font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none transition-all min-w-[80px] cursor-pointer"
                          >
                            <Eye className="size-3.5 mr-1.5" weight="bold" />
                            Profile
                          </Button>
                          <Button 
                            onClick={(e) => { e.stopPropagation(); openEditModal(c); }}
                            variant="outline"
                            className="flex-1 h-10 text-[11px] font-bold rounded-xl border-blue-100 text-blue-600 hover:bg-blue-50 shadow-none transition-all min-w-[80px] cursor-pointer"
                          >
                            <PencilLine className="size-3.5 mr-1.5" weight="bold" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-between px-6 py-2 border-t border-slate-50 bg-transparent mt-auto">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-medium text-slate-400 tracking-tight">
              Showing <span className="text-slate-600 font-normal text-[12px]">{Math.min(filteredData.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredData.length, currentPage * itemsPerPage)}</span> of <span className="text-slate-600 font-normal text-[12px]">{filteredData.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[13px] font-medium text-slate-400 tracking-tight whitespace-nowrap">Show row</span>
              <Select value={itemsPerPage.toString()} onValueChange={(v) => { setItemsPerPage(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="h-8 w-auto min-w-[40px] px-2 text-[10.5px] font-normal border border-slate-200 bg-slate-50/50 hover:bg-slate-100 hover:text-blue-600 transition-all focus:ring-0 rounded-lg shadow-sm gap-1.5 justify-center cursor-pointer">
                  <SelectValue>{Math.min(itemsPerPage, filteredData.length)}</SelectValue>
                </SelectTrigger>
                <SelectContent className="rounded-lg border-slate-200 shadow-xl min-w-[60px]">
                  {[5, 10, 12, 20, 50, 100].map(val => (
                    <SelectItem key={val} value={val.toString()} className="text-[12px] font-normal py-1.5 rounded-lg focus:bg-blue-50 focus:text-blue-600 cursor-pointer">{val}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-5 transition-all outline-none bg-transparent border-none shadow-none cursor-pointer disabled:cursor-default"
              >
                <CaretLeft weight="bold" className="h-3.5 w-3.5" />
              </button>            <div className="flex items-center px-1">
              <div className="flex items-center justify-center min-w-[32px] h-8 bg-blue-50 text-blue-600 font-bold border border-blue-100/50 shadow-sm rounded-lg text-[13px] px-2.5">
                {currentPage}
              </div>
            </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0 || isLoading}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-5 transition-all outline-none bg-transparent border-none shadow-none cursor-pointer disabled:cursor-default"
              >
                <CaretRight weight="bold" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={!!selectedCompany} onOpenChange={(open) => !open && setSelectedCompany(null)}>
        <DialogContent className="w-[94vw] sm:max-w-[750px] p-0 border-none shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar rounded-lg bg-white">
          <DialogTitle className="sr-only">Company Profile Details</DialogTitle>
          <div className="p-5 sm:p-8">
            <DialogHeader className="mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="size-10 sm:size-12 bg-[#1447E6]/10 rounded-xl flex items-center justify-center shadow-sm">
                  <Building2 size={24} strokeWidth={2.5} className="text-[#1447E6]" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-slate-800 tracking-tight">Company Profile</DialogTitle>
                  <p className="text-[10px] sm:text-xs font-medium text-slate-500 mt-0.5 sm:mt-1">Detailed overview of the workspace and account configurations.</p>
                </div>
              </div>
            </DialogHeader>

            {selectedCompany && (
              <div className="flex flex-col md:flex-row gap-6 sm:gap-8">
                <div className="flex flex-col items-center gap-4 shrink-0">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 w-full text-left">Company Logo</Label>
                  <div className="relative size-32 sm:size-44 lg:size-52">
                    <div className="size-full border border-slate-100 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 relative overflow-hidden shadow-inner">
                      <PremiumAvatar 
                        src={resolveImageUrl(selectedCompany?.company_logo || selectedCompany?.logo) || (selectedCompany?.email ? authApi.fetchCompanyLogoUrl(selectedCompany.email) : undefined)} 
                        name={selectedCompany?.company_name}
                        silent={true}
                        className="size-full object-contain rounded-2xl sm:rounded-3xl hover:scale-110 transition-transform duration-300"
                        textSize="text-3xl sm:text-4xl"
                      />
                    </div>
                  </div>
                  <div className="mt-2 flex flex-col items-center gap-1.5">
                    <span className={cn(
                      "text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest",
                      (selectedCompany?.status || "Enabled") === "Enabled" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-100"
                    )}>
                      {selectedCompany?.status || "Enabled"}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 cursor-not-allowed">
                      <p className="text-[12px] font-medium text-slate-400 ml-1">Account Manager</p>
                      <p className="text-[15px] font-medium text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 cursor-not-allowed">{selectedCompany?.name || "—"}</p>
                    </div>
                    <div className="space-y-1.5 cursor-not-allowed">
                      <p className="text-[12px] font-medium text-slate-400 ml-1">Company Size</p>
                      <p className="text-[15px] font-medium text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 cursor-not-allowed">{selectedCompany?.company_size || "10-50 Experts"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5 cursor-not-allowed">
                      <p className="text-[12px] font-medium text-slate-400 ml-1">Mobile Number</p>
                      <p className="text-[15px] font-medium text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 cursor-not-allowed">{selectedCompany?.mobile_number || "—"}</p>
                    </div>
                    <div className="space-y-1.5 cursor-not-allowed">
                      <p className="text-[12px] font-medium text-slate-400 ml-1">Company Name</p>
                      <p className="text-[15px] font-medium text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 cursor-not-allowed">{selectedCompany?.company_name || "—"}</p>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[12px] font-medium text-slate-400 ml-1">Website URL</p>
                      <div className="flex items-center gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                        <ArrowSquareOut weight="bold" className="size-3.5 text-blue-500" />
                        <p className="text-[15px] font-medium text-[#1447E6] truncate hover:underline cursor-pointer" onClick={() => window.open(selectedCompany?.website?.startsWith('http') ? selectedCompany.website : `https://${selectedCompany.website}`, '_blank')}>
                          {selectedCompany?.website?.replace(/^https?:\/\//, '') || "—"}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5 cursor-not-allowed">
                      <p className="text-[12px] font-medium text-slate-400 ml-1">Industry Sector</p>
                      <p className="text-[15px] font-medium text-slate-700 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 cursor-not-allowed">{selectedCompany?.industry || "—"}</p>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5 cursor-not-allowed">
                      <p className="text-[12px] font-medium text-slate-400 ml-1">Contact Email Address</p>
                      <div className="flex items-center gap-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50 cursor-not-allowed">
                        <Envelope weight="bold" className="size-3.5 text-slate-400 cursor-not-allowed" />
                        <p className="text-[15px] font-medium text-slate-700 truncate cursor-not-allowed">{selectedCompany?.email || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-8 sm:mt-12">
              <Button 
                onClick={() => setSelectedCompany(null)}
                variant="outline"
                className="w-full sm:w-auto px-12 h-11 rounded-lg border-slate-200 bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all text-[12px] cursor-pointer"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!companyToToggle} onOpenChange={(open) => !isToggling && setCompanyToToggle(null)}>
        <DialogContent 
          onPointerDownOutside={(e) => isToggling && e.preventDefault()}
          onEscapeKeyDown={(e) => isToggling && e.preventDefault()}
          hideCloseButton={isToggling}
          className="w-[94vw] sm:max-w-[400px] p-8 text-center rounded-xl border-slate-200/60 shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar bg-white overflow-hidden"
        >
          <div className={cn("mx-auto size-14 rounded-xl flex items-center justify-center mb-6 shadow-sm border", (companyToToggle?.status || "Enabled") === "Enabled" ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100")}>
            <Warning weight="bold" className="size-7" />
          </div>
          <DialogHeader className="flex flex-col items-center text-center space-y-2">
            <DialogTitle className="text-xl font-bold font-heading text-slate-800 tracking-tight">Security Confirmation</DialogTitle>
            <DialogDescription className="text-[13px] text-slate-500 font-medium leading-relaxed max-w-[280px]">
              Are you sure you want to {(companyToToggle?.status || "Enabled") === "Enabled" ? "suspend" : "activate"} <span className="text-slate-900 font-bold">{companyToToggle?.company_name}</span>? This action will be logged.
            </DialogDescription>
          </DialogHeader>
           <div className="flex flex-col gap-3 mt-10 px-1 sm:px-0">
             <Button 
               onClick={handleToggleStatus} 
               className={cn(
                 "w-full h-12 sm:h-10 text-[13px] sm:text-[11px] font-bold text-white rounded-xl sm:rounded-lg shadow-lg transition-all active:scale-[0.98] uppercase tracking-wide cursor-pointer", 
                 (companyToToggle?.status || "Enabled") === "Enabled" ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-[#1447E6] hover:bg-[#1447E6]/90 shadow-blue-500/20"
               )}
             >
               Confirm Action
             </Button>
             <Button 
               variant="outline" 
               onClick={() => setCompanyToToggle(null)} 
               disabled={isToggling}
               className="w-full h-12 sm:h-10 text-[13px] sm:text-[11px] font-bold rounded-xl sm:rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wide cursor-pointer"
             >
               Cancel
             </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
