"use client"

import * as React from "react"
import useSWR from "swr"
import { UserPlus, ShieldUser as LucideShieldUser } from "lucide-react"
import {
  DotsThree,
  CircleNotch,
  CaretLeft,
  CaretRight,
  Eye,
  ShieldCheck,
  ShieldSlash,
  Trash,
  IdentificationCard,
  UserGear,
  Clock,
  Phone,
  CaretUp,
  CaretDown,
  CheckCircle,
  XCircle,
  PencilLine,
  User
} from "@phosphor-icons/react"
import { formatNumericOnly } from "@/lib/validation"
import { cn, getAvatarColor } from "@/lib/utils"
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { superAdminService, SuperAdminUser } from "@/lib/services/super-admin"
import { authApi, resolveImageUrl } from "@/lib/api"
import { useDashboard } from "@/components/dashboard/DashboardProvider"
import { useRouter } from "next/navigation"
import { MasterToolbar } from "@/components/dashboard/MasterToolbar"

interface SuperAdminClientProps {
  initialAdmins: SuperAdminUser[]
}

export default function SuperAdminClient({ initialAdmins }: SuperAdminClientProps) {
  const { userData, isLoading: isProfileLoading, admins: cachedAdmins, setAdmins } = useDashboard()
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
  const [statusFilter, setStatusFilter] = React.useState<"all" | "Active" | "Disabled">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)

  const isSuperAdmin = String(userData?.role || "").toLowerCase().includes("super_admin") || String(userData?.role || "").toLowerCase().includes("superadmin");

  const { data: admins, isLoading, mutate } = useSWR(userData && isSuperAdmin ? 'super-admins-list' : null, async () => {
    const [enabledRes, disabledRes] = await Promise.all([
      superAdminService.fetchEnabledSuperAdmins(),
      superAdminService.fetchDisabledSuperAdmins()
    ]);

    const combined = [...enabledRes.data, ...disabledRes.data]
    setAdmins(combined)
    return combined
  }, { 
    fallbackData: cachedAdmins || undefined,
    shouldRetryOnError: false
  })

  React.useEffect(() => {
    const width = window.innerWidth;
    if (width >= 2500) setItemsPerPage(12);
    else if (width >= 1500) setItemsPerPage(5);
    else if (width >= 768) setItemsPerPage(6);
    else setItemsPerPage(4);
  }, []);
  
  const [selectedAdmin, setSelectedAdmin] = React.useState<SuperAdminUser | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [editingAdmin, setEditingAdmin] = React.useState<any>(null)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const [isAdding, setIsAdding] = React.useState(false)
  const [newAdmin, setNewAdmin] = React.useState({ email: "", name: "", phone_number: "" })
  const [adminToToggle, setAdminToToggle] = React.useState<SuperAdminUser | null>(null)
  const [isToggling, setIsToggling] = React.useState(false)

  const filteredData = (admins || []).filter(admin => {
    const name = admin.name || ""
    const email = admin.email || ""
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          email.toLowerCase().includes(searchTerm.toLowerCase())
    const statusLabel = admin.isEnabled ? "Enabled" : "Disabled"
    const matchesStatus = statusFilter === "all" || statusLabel === statusFilter
    return matchesSearch && matchesStatus
  }).sort((a, b) => {
    const userEmail = userData?.email?.toLowerCase();
    if (userEmail) {
      if (a.email?.toLowerCase() === userEmail) return -1;
      if (b.email?.toLowerCase() === userEmail) return 1;
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, itemsPerPage]);

  const handleToggleStatus = async () => {
    if (!adminToToggle) return
    if (adminToToggle.isEnabled && adminToToggle.email === userData?.email) {
      toast.error("You cannot disable your own primary administrative account.")
      setAdminToToggle(null)
      return
    }

    setIsToggling(true)
    try {
      if (adminToToggle.isEnabled) {
        await superAdminService.disableSuperAdmin(adminToToggle.email)
      } else {
        await superAdminService.enableSuperAdmin(adminToToggle.email)
      }
      toast.success(`${adminToToggle.name || 'Admin'} status updated`)
      setAdminToToggle(null)
      mutate()
    } catch (error: any) {
      toast.error(error.message || "Action failed")
    } finally {
      setIsToggling(false)
    }
  }

  const handleAddSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      await superAdminService.addSuperAdmin({
        email: newAdmin.email.trim(),
        name: newAdmin.name.trim(),
        phone_number: formatNumericOnly(newAdmin.phone_number)
      })
      toast.success("Administrator added successfully")
      setIsAddModalOpen(false)
      setNewAdmin({ email: "", name: "", phone_number: "" })
      mutate()
    } catch (error: any) {
      toast.error(error.message || "Addition failed")
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAdmin) return
    setIsUpdating(true)
    try {
      await superAdminService.updateSuperAdmin({
        email: editingAdmin.email,
        name: editingAdmin.name,
        phone_number: formatNumericOnly(editingAdmin.phone_number)
      })
      toast.success("Administrator updated successfully")
      setIsEditModalOpen(false)
      mutate()
    } catch (error: any) {
      toast.error(error.message || "Update failed")
    } finally {
      setIsUpdating(false)
    }
  }

  const openEditModal = (admin: any) => {
    setEditingAdmin({
      ...admin,
      name: admin.name || "",
      email: admin.email || "",
      phone_number: admin.phone_number ? formatNumericOnly(String(admin.phone_number)) : "",
    })
    setIsEditModalOpen(true)
  }

  return (
    <div className="flex flex-col h-full gap-4 min-h-0 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 px-1">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-medium text-slate-700 tracking-tight leading-none font-heading">Super Admin</h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium mt-1.5 tracking-tight">Manage platform-level administrative access and monitoring.</p>
        </div>
      </div>

      <MasterToolbar 
        tabs={[
          { id: "all", label: "All" },
          { id: "Enabled", label: "Active" },
          { id: "Disabled", label: "Suspended" },
        ]}
        activeTab={statusFilter}
        onTabChange={(id) => setStatusFilter(id as any)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        actionLabel="Add Admin"
        actionIcon={LucideShieldUser}
        onActionClick={() => setIsAddModalOpen(true)}
      />

      <div className="h-fit max-h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-0">
          <div className="hidden md:block h-full">
            <Table className="border-collapse">
            <TableHeader className="bg-slate-50 sticky top-0 z-[40] shadow-sm">
              <TableRow className="hover:bg-transparent border-slate-200">
                <TableHead className="text-[13px] font-bold text-slate-600 pl-6 h-14 bg-slate-50 z-[40]">Administrator</TableHead>
                <TableHead className="text-[13px] font-bold text-slate-600 h-14 bg-slate-50 z-[40]">Email address</TableHead>
                <TableHead className="text-[13px] font-bold text-slate-600 pl-16 h-14 bg-slate-50 z-[40]">Status</TableHead>
                <TableHead className="text-right text-[13px] font-bold text-slate-600 pr-6 h-14 bg-slate-50 z-[40]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && !admins ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <CircleNotch className="h-6 w-6 animate-spin mx-auto text-primary/40" />
                  </TableCell>
                </TableRow>
              ) : paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <span className="text-sm font-medium text-slate-400">No administrators found.</span>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((admin, i) => (
                  <TableRow key={i} className="border-none hover:bg-slate-50/50 transition-colors group">
                    <TableCell className="pl-6 py-4">
                      <div className="flex items-center gap-4">
                        <PremiumAvatar 
                          src={resolveImageUrl(admin.profilePictureUrl) || authApi.fetchSuperAdminProfilePictureUrl(admin.email)}
                          name={admin.name || admin.email}
                          silent={true}
                          className="h-10 w-10 border border-slate-100 bg-white shadow-sm transition-transform group-hover:scale-105" 
                        />
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-700 text-[14px] font-sans tracking-tight leading-tight">{admin.name || "System Admin"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-[13px] text-slate-500 font-medium">{admin.email}</span>
                    </TableCell>
                    <TableCell className="py-4 pl-16">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 uppercase tracking-widest leading-none shadow-sm",
                        admin.isEnabled 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-slate-50 text-slate-500 border border-slate-200/60"
                      )}>
                        {admin.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      {admin.email !== userData?.email ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="ml-auto h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 hover:text-primary transition-all outline-none group/trigger cursor-pointer">
                            <DotsThree weight="bold" className="h-5 w-5 text-slate-400 group-hover/trigger:text-primary transition-colors" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-lg border-slate-200/60 shadow-xl p-1.5 font-sans">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1.5 text-center">Action</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-100" />
                              <DropdownMenuItem onClick={() => setSelectedAdmin(admin)} className="gap-2.5 text-xs font-semibold py-2 px-2 rounded-md focus:bg-slate-50 cursor-pointer">
                                <Eye weight="bold" className="size-4 text-slate-500" />
                                Full Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModal(admin)} className="gap-2.5 text-xs font-semibold py-2 px-2 rounded-md focus:bg-slate-50 cursor-pointer border-t border-slate-50 mt-1 pt-2.5">
                                <PencilLine weight="bold" className="size-4 text-blue-500" />
                                Edit Details
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-slate-100" />
                              <DropdownMenuItem onClick={() => setAdminToToggle(admin)} className={cn("gap-2.5 text-xs font-bold py-2 px-2 rounded-md focus:bg-slate-50 cursor-pointer", !admin.isEnabled ? "text-emerald-600" : "text-amber-600")}>
                                {!admin.isEnabled ? <ShieldCheck weight="bold" className="size-4" /> : <ShieldSlash weight="bold" className="size-4" />}
                                {!admin.isEnabled ? "Restore Access" : "Suspend Access"}
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <div className="flex justify-end pr-3">
                          <div className="flex items-center justify-center size-8 rounded-lg bg-blue-50/50 text-blue-600 border border-blue-100/50 shadow-sm transition-all hover:bg-blue-50 group/shield" title="Administrative Record Protected">
                            <ShieldCheck weight="bold" className="size-5" />
                          </div>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>

          <div className="block md:hidden divide-y divide-slate-100">
            {isLoading && !admins ? (
              <div className="p-12 text-center">
                <CircleNotch className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Admins...</span>
              </div>
            ) : paginatedData.length === 0 ? (
              <div className="p-12 text-center">
                <User className="size-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">No admins found.</p>
              </div>
            ) : (
              paginatedData.map((admin, i) => {
                const id = admin.email || i.toString();
                const isExpanded = expandedId === id;
                const status = admin.status || "Enabled";
                const isCurrentUser = admin.email === userData?.email;

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
                          src={resolveImageUrl(admin.profilePictureUrl) || authApi.fetchSuperAdminProfilePictureUrl(admin.email)}
                          name={admin.name || admin.email} 
                          silent={true}
                          className="size-10" 
                        />
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <p className="text-[14px] font-bold text-slate-800 tracking-tight truncate font-sans uppercase">{admin.name || "—"}</p>
                            {isCurrentUser && (
                              <span className="text-[8px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">You</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={cn(
                        "flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                        admin.isEnabled 
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                          : "bg-slate-50 text-slate-500 border-slate-100"
                      )}>
                        {admin.isEnabled ? "Enabled" : "Disabled"}
                      </span>
                    </button>


                    {isExpanded && (
                      <div className="px-5 pb-6 space-y-5 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Primary Email</p>
                            <p className="text-[13px] text-slate-700 font-medium truncate">{admin.email || "—"}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Mobile Contact</p>
                            <p className="text-[13px] text-slate-700 font-medium">{admin.phone_number || "—"}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                          {!isCurrentUser && (
                            <Button 
                              onClick={(e) => { e.stopPropagation(); setAdminToToggle(admin); }}
                              variant="outline" 
                              className={cn(
                               "flex-1 h-11 text-[11px] font-bold rounded-lg shadow-none transition-all cursor-pointer",
                                admin.isEnabled 
                                  ? "text-red-600 border-red-100 hover:bg-red-50" 
                                  : "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                              )}
                            >
                              {admin.isEnabled ? <XCircle className="size-3.5 mr-1.5" weight="bold" /> : <CheckCircle className="size-3.5 mr-1.5" weight="bold" />}
                              {admin.isEnabled ? "Suspend" : "Restore"}
                            </Button>
                          )}
                          <Button 
                            onClick={(e) => { e.stopPropagation(); setSelectedAdmin(admin); }}
                            variant="outline"
                            className="flex-1 h-11 text-[11px] font-bold rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none transition-all cursor-pointer"
                          >
                            <Eye className="size-3.5 mr-1.5" weight="bold" />
                            Profile
                          </Button>
                          {!isCurrentUser && (
                            <Button 
                              onClick={(e) => { e.stopPropagation(); openEditModal(admin); }}
                              variant="outline"
                              className="flex-1 h-11 text-[11px] font-bold rounded-2xl border-blue-100 text-blue-600 hover:bg-blue-50 shadow-none transition-all cursor-pointer"
                            >
                              <PencilLine className="size-3.5 mr-1.5" weight="bold" />
                              Edit
                            </Button>
                          )}
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
                disabled={currentPage === 1}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-5 transition-all outline-none bg-transparent border-none shadow-none cursor-pointer disabled:cursor-default"
              >
                <CaretLeft weight="bold" className="h-3.5 w-3.5" />
              </button>
              <div className="flex items-center px-1">
                <div className="flex items-center justify-center min-w-[32px] h-8 bg-blue-50 text-blue-600 font-bold border border-blue-100/50 shadow-sm rounded-lg text-[13px] px-2.5">
                  {currentPage}
                </div>
              </div>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-5 transition-all outline-none bg-transparent border-none shadow-none cursor-pointer disabled:cursor-default"
              >
                <CaretRight weight="bold" className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={(open) => !isAdding && setIsAddModalOpen(open)}>
        <DialogContent 
          onPointerDownOutside={(e) => isAdding && e.preventDefault()}
          onEscapeKeyDown={(e) => isAdding && e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton={isAdding}
          className={cn(
            "w-[94vw] sm:max-w-[450px] p-0 border-none shadow-2xl bg-white max-h-[88vh] overflow-y-auto no-scrollbar rounded-lg",
            isAdding && "[&>button]:hidden"
          )}
        >
          <DialogTitle className="sr-only">Add New Administrator</DialogTitle>
          <div className="p-8">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-[#1447E6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <LucideShieldUser size={24} strokeWidth={2.5} className="text-white" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-xl font-bold font-heading text-slate-800 tracking-tight">Add New Administrator</DialogTitle>
                  <p className="text-xs font-medium text-slate-500 mt-1">Configure platform-level administrative access.</p>
                </div>
              </div>
            </DialogHeader>

            <form id="add-admin-form" onSubmit={handleAddSuperAdmin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name <span className="text-red-500 ml-0.5">*</span></Label>
                <Input 
                  id="name" 
                  placeholder="Enter User Name" 
                  value={newAdmin.name} 
                  onChange={e => setNewAdmin({...newAdmin, name: e.target.value})} 
                  required 
                  maxLength={100}
                  className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email Address <span className="text-red-500 ml-0.5">*</span></Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter User Email" 
                  value={newAdmin.email} 
                  onChange={e => setNewAdmin({...newAdmin, email: e.target.value})} 
                  required 
                  maxLength={300}
                  className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex gap-0.5">Phone Number <span className="text-red-500">*</span></Label>
                <Input 
                  id="phone" 
                  placeholder="Enter phone number" 
                  value={newAdmin.phone_number} 
                  onChange={e => setNewAdmin({...newAdmin, phone_number: formatNumericOnly(e.target.value)})} 
                  required
                  maxLength={20}
                  className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium"
                />
              </div>
            </form>

            <div className="flex flex-col-reverse sm:flex-row-reverse items-center justify-start gap-3 mt-8 sm:mt-10">
              <Button 
                type="submit" 
                form="add-admin-form"
                disabled={isAdding} 
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-md bg-[#1447E6] hover:bg-[#1447E6]/90 text-white font-bold transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] text-[12px] cursor-pointer"
              >
                {isAdding && <CircleNotch className="animate-spin h-4 w-4 mr-2" />}
                Add Administrator
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

      <Dialog open={!!adminToToggle} onOpenChange={(open) => !isToggling && setAdminToToggle(null)}>
        <DialogContent 
          onPointerDownOutside={(e) => isToggling && e.preventDefault()}
          onEscapeKeyDown={(e) => isToggling && e.preventDefault()}
          hideCloseButton={isToggling}
          className="w-[94vw] sm:max-w-[400px] rounded-lg p-0 border-none shadow-2xl bg-white max-h-[88vh] overflow-y-auto no-scrollbar overflow-hidden"
        >
          <div className="p-6 sm:p-8 text-center">
            <DialogHeader className="items-center text-center">
              <div className={cn(
                "size-14 rounded-xl flex items-center justify-center mb-4 border shadow-sm",
                adminToToggle?.isEnabled ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
              )}>
                {adminToToggle?.isEnabled ? <ShieldSlash weight="bold" className="size-7" /> : <ShieldCheck weight="bold" className="size-7" />}
              </div>
              <DialogTitle className="text-xl font-bold font-heading text-slate-900 tracking-tight">
                {adminToToggle?.isEnabled ? "Suspend Access?" : "Restore Access?"}
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-slate-500 mt-2">
                Are you sure you want to {adminToToggle?.isEnabled ? "suspend" : "restore"} <span className="text-slate-900 font-bold">{adminToToggle?.name || adminToToggle?.email}</span>? This action will be logged.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 sm:gap-3 mt-8 sm:mt-10">
              <Button
                type="button"
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={cn(
                  "flex-1 h-10 rounded-lg text-white font-bold shadow-lg transition-all text-[11px] uppercase tracking-wider cursor-pointer",
                  adminToToggle?.isEnabled ? "bg-red-600 hover:bg-red-700 shadow-red-500/25" : "bg-[#1447E6] hover:bg-[#1447E6]/90 shadow-blue-500/25"
                )}
              >
                {isToggling ? <CircleNotch className="h-4 w-4 animate-spin" /> : (adminToToggle?.isEnabled ? "Suspend Access" : "Restore Access")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setAdminToToggle(null)}
                disabled={isToggling}
                className="flex-1 h-10 rounded-lg border-slate-200 text-slate-500 font-bold hover:bg-slate-50 transition-all text-[11px] uppercase tracking-wider cursor-pointer"
              >
                Keep Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={(open) => !isUpdating && setIsEditModalOpen(open)}>
        <DialogContent
          onPointerDownOutside={(e) => isUpdating && e.preventDefault()}
          onEscapeKeyDown={(e) => isUpdating && e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton={isUpdating}
          className={cn(
            "w-[94vw] sm:max-w-[450px] p-0 border-none shadow-2xl bg-white max-h-[88vh] overflow-y-auto no-scrollbar rounded-lg",
            isUpdating && "[&>button]:hidden"
          )}
        >
          <DialogTitle className="sr-only">Update Administrator Details</DialogTitle>
          <div className="p-8">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-[#1447E6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <LucideShieldUser size={24} strokeWidth={2.5} className="text-white" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-xl font-bold font-heading text-slate-800 tracking-tight">Update Administrator</DialogTitle>
                  <p className="text-xs font-medium text-slate-500 mt-1">Modify account details and platform access levels.</p>
                </div>
              </div>
            </DialogHeader>

            {editingAdmin && (
              <form id="edit-admin-form" onSubmit={handleEditAdmin} className="space-y-6">
                <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Full Name <span className="text-red-500 ml-0.5">*</span></Label>
                  <Input 
                    placeholder="Enter User Name" 
                    value={editingAdmin.name} 
                    onChange={e => setEditingAdmin({...editingAdmin, name: e.target.value})} 
                    required 
                    maxLength={100}
                    className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium"
                  />
                </div>
                <div className="space-y-2 text-left cursor-not-allowed">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-not-allowed">Email Address</Label>
                  <Input type="email" value={editingAdmin.email} disabled className="h-11 rounded-md border-slate-100 bg-slate-50 text-slate-600 font-medium cursor-not-allowed" />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="edit-phone" className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex gap-0.5">Phone Number <span className="text-red-500">*</span></Label>
                  <Input 
                    id="edit-phone"
                    placeholder="Enter phone number" 
                    value={editingAdmin.phone_number} 
                    onChange={e => setEditingAdmin({...editingAdmin, phone_number: formatNumericOnly(e.target.value)})} 
                    required
                    maxLength={20}
                    className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium"
                  />
                </div>
              </form>
            )}

            <div className="flex flex-col-reverse sm:flex-row-reverse items-center justify-start gap-3 mt-8 sm:mt-10">
              <Button 
                type="submit" 
                form="edit-admin-form" 
                disabled={isUpdating} 
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-md bg-[#1447E6] hover:bg-[#1447E6]/90 text-white font-bold shadow-md shadow-blue-500/10 transition-all active:scale-[0.98] text-[12px] cursor-pointer"
              >
                {isUpdating ? <CircleNotch className="animate-spin h-5 w-5 mr-2" /> : <PencilLine className="h-4 w-4 mr-2" />}
                Save changes
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditModalOpen(false)} 
                disabled={isUpdating}
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-md border-slate-200 bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all text-[12px] cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
 
      <Dialog open={!!selectedAdmin} onOpenChange={() => setSelectedAdmin(null)}>
        <DialogContent className="w-[94vw] sm:max-w-[750px] p-0 border-none shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar rounded-lg bg-white">
          <DialogTitle className="sr-only">Administrator Profile Details</DialogTitle>
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-[#1447E6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <IdentificationCard size={24} strokeWidth={2.5} className="text-white" />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-xl font-bold font-heading text-slate-800 tracking-tight">Super Administrator Profile</DialogTitle>
                  <p className="text-xs font-medium text-slate-400 mt-1">Platform-level administrative credentials and security status.</p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
              <div className="w-full md:w-auto flex flex-col items-center gap-3 shrink-0">
                <div className="relative group/logo size-32 sm:size-44 lg:size-52">
                  <div className="size-full border border-slate-100 rounded-lg sm:rounded-xl flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 relative overflow-hidden shadow-inner">
                    <PremiumAvatar 
                      src={resolveImageUrl(selectedAdmin?.profilePictureUrl) || (selectedAdmin?.email ? authApi.fetchSuperAdminProfilePictureUrl(selectedAdmin.email) : undefined)}
                      name={selectedAdmin?.name || selectedAdmin?.email}
                      className="size-full object-contain rounded-lg sm:rounded-xl hover:scale-110 transition-transform duration-300"
                      textSize="text-3xl sm:text-4xl"
                    />
                  </div>
                </div>
                <div className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest leading-none shadow-sm",
                  selectedAdmin?.isEnabled ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-200"
                )}>
                  {selectedAdmin?.isEnabled ? "Active Account" : "Suspended"}
                </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Full Name</Label>
                    <div className="h-11 flex items-center px-4 rounded-md bg-slate-50/50 border border-slate-100 text-[15px] font-medium text-slate-700 tracking-tight truncate cursor-not-allowed">
                      {selectedAdmin?.name || "System Administrator"}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Account Role</Label>
                    <div className="h-11 flex items-center px-4 rounded-md bg-slate-50/50 border border-slate-100 text-[15px] font-medium text-slate-700 tracking-tight gap-2 cursor-not-allowed">
                      Super Administrator
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Phone Number</Label>
                    <div className="h-11 flex items-center px-4 rounded-md bg-slate-50/50 border border-slate-100 text-[15px] font-medium text-slate-700 tracking-tight cursor-not-allowed">
                      {selectedAdmin?.phone_number || "—"}
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5 text-left">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Email Address</Label>
                    <div className="h-11 flex items-center px-4 rounded-md bg-slate-50/50 border border-slate-100 text-[15px] font-medium text-slate-700 tracking-tight truncate cursor-not-allowed">
                      {selectedAdmin?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-8 sm:mt-12">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSelectedAdmin(null)}
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-md border-slate-200 bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
