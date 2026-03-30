"use client"

import * as React from "react"
import { Users as LucideUsers, UserPlus } from "lucide-react"
import {
  Users,
  Plus,
  DotsThree,
  CircleNotch,
  CaretLeft,
  CaretRight,
  Eye,
  Warning,
  CheckCircle,
  XCircle,
  PencilLine,
  ShieldCheck,
  Envelope,
  Phone,
} from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
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
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import useSWR from "swr"

interface UsersClientProps {
  initialUsers: any[]
}

export default function UsersClient({ initialUsers }: UsersClientProps) {
  const { userData, isLoading: isProfileLoading, users: cachedUsers, setUsers } = useDashboard()
  const router = useRouter()

  React.useEffect(() => {
    if (!isProfileLoading && userData) {
      const userRole = String(userData.role || "").toLowerCase();
      const isSuperAdmin = userRole.includes("super_admin") || userRole.includes("superadmin");
      if (isSuperAdmin) {
        router.replace("/dashboard");
      }
    }
  }, [userData, isProfileLoading, router]);

  const [searchTerm, setSearchTerm] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState<"all" | "admin" | "member" | "browse">("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [itemsPerPage, setItemsPerPage] = React.useState(10)

  const isSuperAdmin = String(userData?.role || "").toLowerCase().includes("super_admin") || String(userData?.role || "").toLowerCase().includes("superadmin");

  const { data: users, isLoading, mutate } = useSWR(userData && !isSuperAdmin ? 'users-list' : null, async () => {
    const data = await authApi.fetchUsers();
    setUsers(data);
    return data;
  }, { 
    fallbackData: cachedUsers || undefined,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    shouldRetryOnError: false
  })

  React.useEffect(() => {
    const width = window.innerWidth;
    if (width >= 2500) setItemsPerPage(12);
    else if (width >= 1500) setItemsPerPage(5);
    else if (width >= 1024) setItemsPerPage(6);
    else if (width >= 768) setItemsPerPage(8);
    else setItemsPerPage(5);
  }, []);

  const [selectedUser, setSelectedUser] = React.useState<any>(null)
  const [userToToggle, setUserToToggle] = React.useState<any>(null)
  const [isToggling, setIsToggling] = React.useState(false)

  const handleToggleStatus = async () => {
    if (!userToToggle) return;
    setIsToggling(true);
    try {
      const isCurrentlyEnabled = (userToToggle.status || "Enabled") === "Enabled";
      if (isCurrentlyEnabled) {
        await authApi.disableUser(userToToggle.email);
      } else {
        await authApi.enableUser(userToToggle.email);
      }
      toast.success(`${userToToggle.name || 'User'} status updated`);
      setUserToToggle(null);
      mutate();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setIsToggling(false);
    }
  };

  const filteredData = (users || []).filter(e => {
    const name = e.name || ""
    const email = e.email || ""
    const currentRole = e.role || e.user_role || e.access_level || "member";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || 
                        (String(currentRole).toLowerCase() === String(roleFilter).toLowerCase());
    return matchesSearch && matchesRole;
  }).sort((a, b) => {
    const userEmail = userData?.email?.toLowerCase();
    if (userEmail) {
      if (a.email?.toLowerCase() === userEmail) return -1;
      if (b.email?.toLowerCase() === userEmail) return 1;
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, itemsPerPage]);

  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = React.useState(false)
  const [isAdding, setIsAdding] = React.useState(false)
  const [newUser, setNewUser] = React.useState<{
    email: string;
    name: string;
    phone_number: string;
    role: string;
  }>({
    email: "",
    name: "",
    phone_number: "",
    role: "member"
  })
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [editingUser, setEditingUser] = React.useState<any>(null)

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    try {
      await authApi.addUser({
        email: newUser.email.trim(),
        name: newUser.name.trim(),
        phone_number: formatNumericOnly(newUser.phone_number),
        role: newUser.role
      })
      toast.success("User added successfully")
      setIsAddModalOpen(false)
      setNewUser({ email: "", name: "", phone_number: "", role: "member" })
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Failed to add user")
    } finally {
      setIsAdding(false)
    }
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setIsUpdating(true)
    try {
      await authApi.updateUser({
        email: editingUser.email,
        name: editingUser.name,
        phone_number: formatNumericOnly(editingUser.phone_number),
        role: editingUser.role
      })
      toast.success("User updated successfully")
      setIsEditModalOpen(false)
      mutate()
    } catch (err: any) {
      toast.error(err.message || "Update failed")
    } finally {
      setIsUpdating(false)
    }
  }

  const openEditModal = (user: any) => {
    setEditingUser({
      ...user,
      role: String(user.role || user.user_role || user.access_level || "member").toLowerCase()
    })
    setIsEditModalOpen(true)
  }

  return (
    <>
      <div className="flex flex-col h-full gap-4 min-h-0 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 px-1">
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-medium text-slate-700 tracking-tight leading-none font-heading">Users</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium mt-1.5 tracking-tight">Manage your workforce and organizational roles.</p>
          </div>
        </div>

        <MasterToolbar 
          tabs={[
            { id: "all", label: "All", count: filteredData.length },
            { id: "admin", label: "Admins", count: (users || []).filter(e => {
                const r = String(e.role || e.user_role || e.access_level || "").toLowerCase();
                return r === "admin";
              }).length },
            { id: "member", label: "Members", count: (users || []).filter(e => {
                const r = String(e.role || e.user_role || e.access_level || "").toLowerCase();
                return r === "member" || !r;
              }).length },
            { id: "browse", label: "Browse", count: (users || []).filter(e => {
                const r = String(e.role || e.user_role || e.access_level || "").toLowerCase();
                return r === "browse";
              }).length },
          ]}
          activeTab={roleFilter}
          onTabChange={(id) => setRoleFilter(id as any)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          actionLabel="Add User"
          actionIcon={LucideUsers}
          onActionClick={() => setIsAddModalOpen(true)}
        />

        <div className="h-fit max-h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto no-scrollbar relative min-h-0">
            <div className="hidden md:block h-full">
              <Table className="border-collapse">
              <TableHeader className="bg-slate-50 sticky top-0 z-[40] shadow-sm">
                <TableRow className="hover:bg-transparent border-slate-200">
                  <TableHead className="text-[13px] font-bold text-slate-600 pl-6 h-14 bg-slate-50 z-[40]">User</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-600 px-4 h-14 bg-slate-50 z-[40]">Email address</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-600 pl-12 h-14 bg-slate-50 z-[40]">Role</TableHead>
                  <TableHead className="text-[13px] font-bold text-slate-600 pl-16 h-14 bg-slate-50 z-[40]">Status</TableHead>
                  <TableHead className="text-right text-[13px] font-bold text-slate-600 pr-6 transition-all h-14 bg-slate-50 z-[40]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && !users?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center text-slate-400">
                      <CircleNotch className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/40" />
                      <span className="text-[11px] font-semibold uppercase tracking-widest">Loading Users...</span>
                    </TableCell>
                  </TableRow>
                ) : paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-64 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                         <Users className="size-10 text-slate-200" />
                         <span className="text-sm font-medium text-slate-400">No users found matching your criteria.</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((e, i) => (
                    <TableRow key={e.email || i} className="border-none hover:bg-slate-50/50 transition-colors group">
                      <TableCell className="pl-6 py-4">
                        <div className="flex items-center gap-4">
                          <PremiumAvatar
                            src={resolveImageUrl(e.avatar || undefined) || (e.email ? authApi.fetchUserProfilePictureUrl(e.email) : undefined)}
                            name={e.name}
                            silent={true}
                            className="h-10 w-10 border border-slate-100 bg-white shadow-sm transition-transform group-hover:scale-105"
                          />
                          <span className="font-medium text-slate-700 text-[14px] font-sans tracking-tight">
                            {e.name || "—"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <span className="text-[13px] text-slate-500 font-medium font-sans">{e.email || "—"}</span>
                      </TableCell>
                      <TableCell className="text-[13px] text-slate-700 font-medium py-4 pl-12">
                        {(() => {
                          const r = String(e.role || e.user_role || e.access_level || "").toLowerCase();
                          if (!r) return <span className="text-slate-300 italic">No Role Assigned</span>;
                          return r.charAt(0).toUpperCase() + r.slice(1);
                        })()}
                      </TableCell>
                      <TableCell className="py-4 pl-16">
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold transition-all duration-300 uppercase tracking-widest leading-none shadow-sm",
                          (e.status || "Enabled") === "Enabled"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-slate-50 text-slate-500 border border-slate-200/60"
                        )}>
                          {e.status || "Enabled"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right pr-6 py-3 lg:py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="ml-auto h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 hover:text-primary transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/20 cursor-pointer">
                            <DotsThree weight="bold" className="h-5 w-5 text-slate-400" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-52 rounded-lg border-slate-200/60 shadow-xl p-1.5 font-sans">
                            <DropdownMenuGroup>
                              <DropdownMenuLabel className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 px-2 py-1.5 text-center">Action</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-slate-100" />
                              <DropdownMenuItem onClick={() => setSelectedUser(e)} className="gap-2.5 text-xs font-semibold py-2 px-2 rounded-md focus:bg-slate-50 cursor-pointer">
                                <Eye weight="bold" className="size-4 text-slate-500" />
                                View Full Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditModal(e)} className="gap-2.5 text-xs font-semibold py-2 px-2 rounded-md focus:bg-slate-50 cursor-pointer border-t border-slate-50 mt-1 pt-2.5">
                                <PencilLine weight="bold" className="size-4 text-blue-500" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-dashed border-slate-100" />
                              <DropdownMenuItem onClick={() => setUserToToggle(e)} className={cn("gap-2.5 text-xs font-bold py-2 px-2 rounded-md focus:bg-slate-50 cursor-pointer", (e.status || "Enabled") === "Enabled" ? "text-red-600" : "text-emerald-600")}>
                                {(e.status || "Enabled") === "Enabled" ? <XCircle weight="bold" className="size-4" /> : <CheckCircle weight="bold" className="size-4" />}
                                {(e.status || "Enabled") === "Enabled" ? "Suspend Access" : "Activate Access"}
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
              {isLoading && !users?.length ? (
                <div className="p-12 text-center">
                  <CircleNotch className="h-6 w-6 animate-spin mx-auto mb-2 text-primary/40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Users...</span>
                </div>
              ) : paginatedData.length === 0 ? (
                <div className="p-12 text-center">
                   <Users className="size-10 text-slate-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-slate-400">No users found.</p>
                </div>
              ) : (
                paginatedData.map((e, i) => {
                  const id = e.email || i.toString();
                  const isExpanded = expandedId === id;
                  const status = e.status || "Enabled";
                  const role = String(e.role || e.user_role || e.access_level || "").toLowerCase() || "Member";

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
                            src={resolveImageUrl(e.avatar || undefined) || (e.email ? authApi.fetchUserProfilePictureUrl(e.email) : undefined)}
                            name={e.name}
                            silent={true}
                            className="size-10"
                          />
                          <div className="min-w-0 pr-2">
                             <p className="text-[14px] font-bold text-slate-800 tracking-tight truncate font-sans uppercase">{e.name || "—"}</p>
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

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="px-5 pb-6 space-y-5">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Email Address</p>
                                  <p className="text-[13px] text-slate-700 font-medium truncate">{e.email || "—"}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Role</p>
                                  <p className="text-[13px] text-slate-700 font-medium capitalize">{role}</p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-2">
                                <Button
                                  onClick={() => setUserToToggle(e)}
                                  variant="outline"
                                  className={cn(
                                    "flex-1 h-10 text-[11px] font-bold rounded-lg shadow-none transition-all min-w-[100px] cursor-pointer",
                                    status === "Enabled"
                                      ? "text-red-600 border-red-100 hover:bg-red-50"
                                      : "text-emerald-600 border-emerald-100 hover:bg-emerald-50"
                                  )}
                                >
                                  {status === "Enabled" ? <XCircle className="size-3.5 mr-1.5" weight="bold" /> : <CheckCircle className="size-3.5 mr-1.5" weight="bold" />}
                                  {status === "Enabled" ? "Suspend" : "Activate"}
                                </Button>
                                <Button
                                  onClick={() => setSelectedUser(e)}
                                  variant="outline"
                                  className="flex-1 h-10 text-[11px] font-bold rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none transition-all min-w-[80px] cursor-pointer"
                                >
                                  <Eye className="size-3.5 mr-1.5" weight="bold" />
                                  Profile
                                </Button>
                                <Button
                                  onClick={(ev) => { ev.stopPropagation(); openEditModal(e); }}
                                  variant="outline"
                                  className="flex-1 h-10 text-[11px] font-bold rounded-lg border-blue-100 text-blue-600 hover:bg-blue-50 shadow-none transition-all min-w-[80px] cursor-pointer"
                                >
                                  <PencilLine className="size-3.5 mr-1.5" weight="bold" />
                                  Edit
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="w-[94vw] sm:max-w-[750px] p-0 border-none shadow-2xl max-h-[88vh] overflow-y-auto no-scrollbar rounded-lg">
          <DialogTitle className="sr-only">User Profile Details</DialogTitle>
          <div className="p-6 sm:p-8">
            <DialogHeader className="mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-[#1447E6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                  <LucideUsers size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-xl font-bold font-heading text-slate-800 tracking-tight">User Profile</DialogTitle>
                  <p className="text-xs font-medium text-slate-400 mt-1">Detailed overview of the team member and account configurations.</p>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start">
              <div className="w-full md:w-auto flex flex-col items-center gap-3 shrink-0">
                <div className="relative group/logo size-32 sm:size-44 lg:size-52">
                  <div className="size-full border border-slate-100 rounded-md sm:rounded-lg flex flex-col items-center justify-center p-3 sm:p-4 bg-slate-50 relative overflow-hidden shadow-inner">
                    <PremiumAvatar
                      src={resolveImageUrl(selectedUser?.avatar || undefined) || (selectedUser?.email ? authApi.fetchUserProfilePictureUrl(selectedUser.email) : undefined)}
                      name={selectedUser?.name}
                      silent={true}
                      isSquare={true}
                      className="size-full object-contain rounded-lg sm:rounded-xl hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                </div>
                <div className={cn(
                  "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest leading-none shadow-sm",
                  (selectedUser?.status || "Enabled") === "Enabled" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-50 text-slate-500 border border-slate-200"
                )}>
                  {(selectedUser?.status || "Enabled") === "Enabled" ? "Active Account" : "Suspended"}
                </div>
              </div>

              <div className="flex-1 w-full space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="space-y-1.5 text-left cursor-not-allowed">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Full Name</Label>
                    <div className="h-11 flex items-center px-4 rounded-md bg-slate-50/50 border border-slate-100 text-[15px] font-medium text-slate-700 tracking-tight truncate cursor-not-allowed">
                      {selectedUser?.name || "—"}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left cursor-not-allowed">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Account Role</Label>
                    <div className="h-11 flex items-center px-4 rounded-md bg-slate-50/50 border border-slate-100 text-[15px] font-medium text-slate-700 tracking-tight gap-2 cursor-not-allowed uppercase tracking-wider text-[10px] font-bold">
                      {(() => {
                        const r = String(selectedUser?.role || selectedUser?.user_role || "Member").toLowerCase();
                        return r.charAt(0).toUpperCase() + r.slice(1);
                      })()}
                    </div>
                  </div>
                  <div className="space-y-1.5 text-left cursor-not-allowed">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Phone Number</Label>
                    <div className="h-11 flex items-center px-4 rounded-md bg-slate-50/50 border border-slate-100 text-[15px] font-medium text-slate-700 tracking-tight cursor-not-allowed">
                      {selectedUser?.phone_number || "—"}
                    </div>
                  </div>
                  <div className="sm:col-span-2 space-y-1.5 text-left cursor-not-allowed">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Email Address</Label>
                    <div className="h-11 flex items-center px-4 rounded-md bg-slate-50/50 border border-slate-100 text-[15px] font-medium text-slate-700 tracking-tight truncate gap-2 cursor-not-allowed">
                      <Envelope weight="bold" className="size-4 text-slate-400" />
                      {selectedUser?.email || "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-8 sm:mt-12">
              <Button
                variant="outline"
                onClick={() => setSelectedUser(null)}
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-md border-slate-200 bg-slate-50 text-slate-500 font-bold hover:bg-slate-100 transition-all text-xs uppercase tracking-wider cursor-pointer"
              >
                Close Profile
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!userToToggle} onOpenChange={(open) => !isToggling && setUserToToggle(null)}>
        <DialogContent
          onPointerDownOutside={(e) => isToggling && e.preventDefault()}
          onEscapeKeyDown={(e) => isToggling && e.preventDefault()}
          hideCloseButton={isToggling}
          className="w-[94vw] sm:max-w-[400px] rounded-lg p-0 border-none shadow-2xl bg-white max-h-[88vh] overflow-y-auto no-scrollbar overflow-hidden"
        >
          <DialogTitle className="sr-only">Confirm User Status Change</DialogTitle>
          <div className="p-8">
            <div className={cn(
              "mx-auto size-16 rounded-xl flex items-center justify-center mb-6 shadow-md border",
              (userToToggle?.status || "Enabled") === "Enabled" ? "bg-red-50 text-red-600 border-red-100" : "bg-emerald-50 text-emerald-600 border-emerald-100"
            )}>
              <Warning weight="bold" className="size-8" />
            </div>
            <DialogHeader className="flex flex-col items-center">
              <DialogTitle className="text-xl font-bold font-heading text-slate-900 tracking-tight">Access Confirmation</DialogTitle>
              <DialogDescription className="text-[13px] font-medium text-slate-500 mt-2 leading-relaxed max-w-[280px]">
                You are about to {(userToToggle?.status || "Enabled") === "Enabled" ? "deactivate" : "reactivate"} <span className="text-slate-900 font-bold">{userToToggle?.name}'s</span> platform access.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-3 mt-10 px-1 sm:px-0">
              <Button
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={cn(
                  "w-full sm:flex-[1.5] h-12 sm:h-10 text-[13px] sm:text-[11px] font-bold text-white rounded-md sm:rounded-md shadow-lg transition-all active:scale-[0.98] uppercase tracking-wide cursor-pointer",
                  (userToToggle?.status || "Enabled") === "Enabled" ? "bg-red-600 hover:bg-red-700 shadow-red-500/25" : "bg-[#1447E6] hover:bg-[#1447E6]/90 shadow-blue-500/25"
                )}
              >
                Confirm Action
              </Button>
              <Button
                variant="outline"
                onClick={() => setUserToToggle(null)}
                disabled={isToggling}
                className="w-full sm:flex-1 h-12 sm:h-10 text-[13px] sm:text-[11px] font-bold rounded-md sm:rounded-lg border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all uppercase tracking-wide cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddModalOpen} onOpenChange={(open) => !isAdding && setIsAddModalOpen(open)}>
        <DialogContent
          onPointerDownOutside={(e) => isAdding && e.preventDefault()}
          onEscapeKeyDown={(e) => isAdding && e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          hideCloseButton={isAdding}
          className="w-[94vw] sm:max-w-[750px] p-0 border-none shadow-2xl bg-white max-h-[88vh] overflow-y-auto no-scrollbar rounded-lg"
        >
          <DialogTitle className="sr-only">Add New User Profile</DialogTitle>
          <div className="p-8">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-[#1447E6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                  <UserPlus size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-xl font-bold font-heading text-slate-800 tracking-tight">Add New User</DialogTitle>
                  <p className="text-xs font-medium text-slate-500 mt-1">Configure global user access and account preferences.</p>
                </div>
              </div>
            </DialogHeader>

            <form id="add-user-form" onSubmit={handleAddUser} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                <div className="space-y-2 text-left">
                  <Label htmlFor="name" className="text-[12px] font-medium text-slate-400 ml-1">Full Name <span className="text-red-500 ml-0.5">*</span></Label>
                  <Input
                    id="name"
                    placeholder="Enter User Name"
                    value={newUser.name}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    required
                    maxLength={100}
                    className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium text-[15px] text-slate-700"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="email" className="text-[12px] font-medium text-slate-400 ml-1">Email Address <span className="text-red-500 ml-0.5">*</span></Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter User Email"
                    value={newUser.email}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    required
                    maxLength={300}
                    className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium text-[15px] text-slate-700"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label htmlFor="phone" className="text-[12px] font-medium text-slate-400 ml-1">Phone Number <span className="text-red-500 ml-0.5">*</span></Label>
                  <Input
                    id="phone"
                    placeholder="Enter phone number"
                    value={newUser.phone_number}
                    onChange={e => setNewUser({...newUser, phone_number: formatNumericOnly(e.target.value)})}
                    required
                    maxLength={20}
                    className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium text-[15px] text-slate-700"
                  />
                </div>
                <div className="col-span-1 sm:col-span-2 space-y-2">
                  <Label className="text-[12px] font-medium text-slate-400 ml-1 px-1">Assign Role</Label>
                  <div className="flex bg-slate-100/50 p-1 rounded-lg border border-slate-200/40 relative h-11">
                    {["admin", "member", "browse"].map((role) => {
                       const isActive = newUser.role === role;
                       return (
                          <button
                             key={role}
                             type="button"
                             onClick={() => setNewUser(prev => ({ ...prev, role }))}
                             className={cn(
                                "relative flex-1 text-[10px] font-bold transition-all duration-300 z-10 uppercase tracking-widest cursor-pointer",
                                isActive ? "text-white" : "text-slate-400 hover:text-slate-600"
                             )}
                          >
                             {isActive && (
                                <motion.div
                                   layoutId="role-bg-add"
                                   className="absolute inset-0 bg-[#1447E6] rounded-md shadow-sm shadow-blue-500/10"
                                   transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                />
                             )}
                             <span className="relative z-20">{role}</span>
                          </button>
                       );
                    })}
                  </div>
                </div>
              </div>
            </form>

            <div className="flex flex-col-reverse sm:flex-row-reverse items-center justify-start gap-3 mt-10">
              <Button
                type="submit"
                form="add-user-form"
                disabled={isAdding}
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-md bg-[#1447E6] hover:bg-[#1447E6]/90 text-white font-bold transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] text-[12px] cursor-pointer"
              >
                {isAdding && <CircleNotch className="animate-spin h-4 w-4 mr-2" />}
                Add User
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
          onPointerDownOutside={(e) => isUpdating && e.preventDefault()}
          onEscapeKeyDown={(e) => isUpdating && e.preventDefault()}
          hideCloseButton={isUpdating}
          className="w-[94vw] sm:max-w-[750px] p-0 border-none shadow-2xl bg-white max-h-[88vh] overflow-y-auto no-scrollbar rounded-lg"
        >
          <DialogTitle className="sr-only">Edit User Profile</DialogTitle>
          <div className="p-8">
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-4">
                <div className="size-12 bg-[#1447E6] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
                  <PencilLine size={24} strokeWidth={2.5} />
                </div>
                <div className="text-left">
                  <DialogTitle className="text-xl font-bold font-heading text-slate-800 tracking-tight">Edit User Profile</DialogTitle>
                  <p className="text-xs font-medium text-slate-500 mt-1">Update user details and access level.</p>
                </div>
              </div>
            </DialogHeader>

            {editingUser && (
              <form id="edit-user-form" onSubmit={handleEditUser} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-8">
                  <div className="space-y-2 text-left">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Full Name <span className="text-red-500 ml-0.5">*</span></Label>
                    <Input
                      placeholder="Enter User Name"
                      value={editingUser.name}
                      onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                      required
                      maxLength={100}
                      className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium text-[15px] text-slate-700"
                    />
                  </div>
                  <div className="space-y-2 text-left cursor-not-allowed">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1 cursor-not-allowed">Email Address</Label>
                    <Input
                      type="email"
                      value={editingUser.email}
                      disabled
                      className="h-11 rounded-md border-slate-100 bg-slate-50 text-slate-600 font-medium cursor-not-allowed text-[15px]"
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1">Phone Number <span className="text-red-500 ml-0.5">*</span></Label>
                    <Input
                      placeholder="Enter phone number"
                      value={editingUser.phone_number}
                      onChange={e => setEditingUser({...editingUser, phone_number: formatNumericOnly(e.target.value)})}
                      required
                      maxLength={20}
                      className="h-11 rounded-md border-slate-200 focus:border-blue-600 shadow-none transition-all font-medium text-[15px] text-slate-700"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 space-y-2">
                    <Label className="text-[12px] font-medium text-slate-400 ml-1 px-1">Account Role</Label>
                    <div className="flex bg-slate-100/50 p-1 rounded-lg border border-slate-200/40 relative h-11">
                      {["admin", "member", "browse"].map((role) => {
                          const isActive = editingUser.role === role;
                          return (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setEditingUser((prev: any) => ({ ...prev, role }))}
                                className={cn(
                                  "relative flex-1 text-[10px] font-bold transition-all duration-300 z-10 uppercase tracking-widest cursor-pointer",
                                  isActive ? "text-white" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {isActive && (
                                  <motion.div
                                      layoutId="role-bg-edit"
                                      className="absolute inset-0 bg-[#1447E6] rounded-md shadow-sm shadow-blue-500/10"
                                      transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                                  />
                                )}
                                <span className="relative z-20">{role}</span>
                            </button>
                          );
                      })}
                    </div>
                  </div>
                </div>
              </form>
            )}

            <div className="flex flex-col-reverse sm:flex-row-reverse items-center justify-start gap-3 mt-10">
              <Button
                type="submit"
                form="edit-user-form"
                disabled={isUpdating}
                className="w-full sm:w-auto px-12 h-11 min-h-[44px] shrink-0 rounded-md bg-[#1447E6] hover:bg-[#1447E6]/90 text-white font-bold transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] text-[12px] cursor-pointer"
              >
                {isUpdating ? <CircleNotch className="animate-spin h-4 w-4 mr-2" /> : <PencilLine className="h-4 w-4 mr-2" />}
                Save Changes
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
    
  </>
  )
}
