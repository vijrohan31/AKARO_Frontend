"use client"

import * as React from "react"
import { 
  LayoutDashboard,
  ShieldCheck,
  ShieldUser,
  Building2,
  Users,
  UserCircle,
  History,
  Settings,
  HelpCircle,
  Search,
  Plus,
  Camera,
  LogOut,
  BadgeCheck,
  CreditCard,
  Bell,
  Sparkles,
  Activity,
  ChevronUp,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  Loader2,
  Briefcase,
  ListTodo,
  Database,
  Puzzle,
  LineChart,
  Bot,
  Layers,
  BarChart3,
  AppWindow,
  FileCode,
  Globe,
  Upload,
  UserPlus,
  ShieldAlert,
  BellRing
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn, getAvatarColor } from "@/lib/utils"
import { PremiumAvatar } from "@/components/dashboard/PremiumAvatar"
import { handleLogout } from "@/lib/auth-utils"
import { authApi, resolveImageUrl } from "@/lib/api"
import { ImageCropper } from "@/components/dashboard/ImageCropper"
import { useState, useRef, useEffect } from "react"
import { toast } from "sonner"
import { useDashboard } from "@/components/dashboard/DashboardProvider"

import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenuAction,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const data = {
  user: {
    name: "John Admin",
    email: "john@akaro.ai",
    avatar: "/avatars/1.png",
  },
  teams: [
    {
      name: "Akaro Enterprise",
      logo: Activity,
      plan: "Enterprise",
    },
    {
      name: "Security Labs",
      logo: ShieldCheck,
      plan: "Pro",
    },
  ],
  navMain: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: "Administration",
      items: [
        {
          title: "Super Admin",
          url: "/super-admin",
          icon: ShieldUser,
        },
        {
          title: "Company Master",
          url: "/companies",
          icon: Building2,
        },
      ],
    },
  ],
  navNonAdmin: [
    {
      title: "Overview",
      items: [
        { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
        { title: "AI Teammate", url: "/ai-teammate", icon: Sparkles },
        { title: "Projects", url: "/projects", icon: Briefcase },
        { title: "Tasks", url: "/tasks", icon: ListTodo },
        {
          title: "Repository",
          url: "/repository",
          icon: Database,
          items: [
            { title: "Websites", url: "/repository/websites", icon: Globe },
            { title: "Upload Documents", url: "/repository/documents", icon: Upload },
          ],
        },
        {
          title: "Connectors",
          url: "/connectors",
          icon: Puzzle,
          items: [
            { title: "All Integrations", url: "/connectors/all", icon: Layers },
            { title: "Enabled Integrations", url: "/connectors/enabled", icon: ShieldCheck },
          ],
        },
        {
          title: "Analytics",
          url: "/analytics",
          icon: BarChart3,
          items: [
            { title: "Usage Logs", url: "/analytics/usage", icon: History },
            { title: "Insights", url: "/analytics/insights", icon: Sparkles },
          ],
        },
        {
          title: "Settings",
          url: "/settings",
          icon: Settings,
          items: [
            { title: "Profile & Subscriptions", url: "/settings/profile", icon: UserCircle },
            { title: "Users", url: "/settings/users", icon: Users },
            { title: "Teams", url: "/settings/teams", icon: UserPlus },
            { title: "Security", url: "/settings/security", icon: ShieldAlert },
            { title: "Notifications", url: "/settings/notifications", icon: BellRing },
          ],
        },
        { title: "Support", url: "/support", icon: HelpCircle },
      ],
    },
  ],
  navSecondary: [] as any[],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const { state, toggleSidebar, setOpenMobile, isMobile } = useSidebar()
  const { userData, isLoading: isLoadingProfile, refreshProfile } = useDashboard()
  const router = useRouter()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])


  const userRole = String(userData?.role || "").toLowerCase();
  const isSuperAdmin = userRole.includes("super_admin") || userRole.includes("superadmin");
  const currentNav = isSuperAdmin ? data.navMain : data.navNonAdmin;

  const filteredNav = currentNav.map(group => ({
    ...group,
    items: group.items.filter(item => {
      if (!userData) return false;
      if (isSuperAdmin) {
        return item.url !== "/settings/users";
      }
      return true;
    })
  })).filter(group => group.items.length > 0);

  if (isLoadingProfile || !userData || !mounted) {
    return (
      <Sidebar collapsible="icon" className="border-r-0" {...props}>
        <div className="flex flex-1 items-center justify-center">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50/50">
            <Loader2 className="size-5 animate-spin text-blue-600" />
          </div>
        </div>
      </Sidebar>
    );
  }

  return (
    <Sidebar 
      collapsible="icon" 
      className="!bg-white border-r border-slate-200/50 cursor-pointer group-data-[state=expanded]:cursor-default transition-all duration-300 shadow-[2px_0_12px_rgba(0,0,0,0.02)]" 
      onClick={() => state === "collapsed" && toggleSidebar()}
      {...props}
    >
      <SidebarHeader 
        className={cn(
          "p-0 mb-0 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center",
          state === "collapsed" ? "h-20 pt-[10px] px-0" : "h-16 px-2"
        )}
      >
        <SidebarMenu className="group-data-[collapsible=icon]:items-center h-full">
          <SidebarMenuItem className="group-data-[collapsible=icon]:w-full h-full flex items-center justify-center">
            <SidebarMenuButton
              size="lg"
              className={cn(
                "cursor-default hover:bg-transparent px-0 py-0 h-full w-full",
                state === "collapsed" ? "justify-center" : "justify-start"
              )}
              onClick={(e) => state === "collapsed" && e.stopPropagation()}
            >
              <div className={cn(
                "flex w-full items-center h-full transition-all duration-300",
                state === "collapsed" ? "justify-center" : "justify-start pl-10 lg:pl-13"
              )}>
                {state === "collapsed" && !isMobile ? (
                  <img 
                    src="/New%20logo/New%20logo/blue.png" 
                    alt="Akaro Icon" 
                    className="size-5 lg:size-6 object-contain" 
                  />
                ) : (
                  <img 
                    src="/logo-akaro-dark-blue.png" 
                    alt="Akaro Full" 
                    className="h-10 lg:h-12 w-auto object-contain transition-all" 
                  />
                )}
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

        <SidebarContent>
          {filteredNav.map((group, index) => (
            <SidebarGroup key={group.title} className={cn("group-data-[collapsible=icon]:mb-4 px-2", index === 0 ? "pt-2" : "pt-4 pb-0")}>
              {!(isSuperAdmin === false && group.title === "Overview") && (
                <SidebarGroupLabel className="text-[10px] lg:text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400/80 h-8 mt-2 px-3 mb-1">
                  {group.title}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="gap-1">
                  {group.items.map((item: any) => (
                    <Collapsible
                      key={item.title}
                      defaultOpen={item.isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger 
                          render={(triggerProps) => (
                            <SidebarMenuButton
                              {...triggerProps}
                              isActive={pathname.startsWith(item.url)}
                              size="lg"
                              className={cn(
                                "h-10 lg:h-11 px-3 rounded-lg transition-all duration-200 gap-3 font-semibold relative mb-1",
                                "group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center",
                                (pathname.startsWith(item.url))
                                  ? (state === "collapsed" ? "text-blue-600 bg-transparent border-transparent" : "bg-blue-100/60 text-blue-600 border border-blue-200/50")
                                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50/50"
                              )}
                              tooltip={item.title}
                              render={(buttonProps) => (
                                <div 
                                  {...buttonProps} 
                                  className={cn(buttonProps.className, "flex items-center w-full h-full justify-center cursor-pointer")}
                                >
                                  {item.items ? (
                                    <div className="flex items-center gap-3 w-full h-full group-data-[collapsible=icon]:justify-center">
                                      <item.icon className={cn(
                                        "shrink-0 transition-all duration-200 transition-colors",
                                        state === "collapsed" ? "size-5 lg:size-6" : "size-[16px] lg:size-[18px]",
                                        (pathname.startsWith(item.url)) ? "text-blue-600 stroke-[2.5px]" : "text-slate-400 group-hover/menu-item:text-blue-600 stroke-[2px]"
                                      )} />
                                      <span className="group-data-[collapsible=icon]:hidden truncate text-[13px] lg:text-sm font-semibold tracking-tight">{item.title}</span>
                                      <ChevronRight className={cn(
                                        "ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 size-4 text-slate-400 group-data-[collapsible=icon]:hidden",
                                      )} />
                                    </div>
                                  ) : (
                                    <Link 
                                      href={item.url} 
                                      className="flex items-center group-data-[collapsible=icon]:justify-center gap-3 w-full h-full"
                                      onClick={(e) => {
                                        if (state === "collapsed") e.stopPropagation();
                                        setOpenMobile(false);
                                      }}
                                    >
                                      <item.icon className={cn(
                                        "shrink-0 transition-all duration-200 transition-colors",
                                        state === "collapsed" ? "size-5 lg:size-6" : "size-[16px] lg:size-[18px]",
                                        pathname === item.url ? "text-blue-600 stroke-[2.5px]" : "text-slate-400 group-hover/menu-item:text-blue-600 stroke-[2px]"
                                      )} />
                                      <span className="group-data-[collapsible=icon]:hidden truncate text-[13px] lg:text-sm font-semibold tracking-tight">{item.title}</span>
                                    </Link>
                                  )}
                                </div>
                              )}
                            />
                          )}
                        />
                        {item.items && (
                          <CollapsibleContent>
                            <SidebarMenuSub className="ml-9 border-l border-slate-200">
                              {item.items.map((subItem: any) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton 
                                    isActive={pathname === subItem.url}
                                    className={cn(
                                      "px-4 py-2 hover:bg-slate-50 transition-all text-slate-500 hover:text-blue-600 font-medium text-[13px]",
                                      pathname === subItem.url && "text-blue-600 font-bold bg-blue-50/30"
                                    )}
                                    render={(subProps) => (
                                      <Link 
                                        {...subProps}
                                        href={subItem.url} 
                                        onClick={(e) => {
                                          if (state === "collapsed") e.stopPropagation();
                                          setOpenMobile(false);
                                        }}
                                        className={cn(subProps.className, "flex items-center w-full h-full")}
                                      >
                                        <span>{subItem.title}</span>
                                      </Link>
                                    )}
                                  />
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </SidebarMenuItem>
                    </Collapsible>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
          <div className="flex-1" />

          <SidebarGroup className="mt-auto">
            <SidebarGroupContent>
              <SidebarMenu>
                {data.navSecondary.map((item) => (
                  <SidebarMenuItem key={item.title} className="group/menu-item">
                    <SidebarMenuButton 
                      size="lg"
                      className="group-data-[collapsible=icon]:hover:ring-2 group-data-[collapsible=icon]:hover:ring-blue-100/50"
                      render={(buttonProps) => (
                        <Link 
                          {...buttonProps} 
                          href={item.url} 
                          className="flex items-center w-full h-full group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 gap-3"
                          onClick={(e) => {
                            if (state === "collapsed") e.stopPropagation();
                            setOpenMobile(false);
                            buttonProps.onClick?.(e);
                          }}
                        >
                          <div className="flex size-8 items-center justify-center shrink-0 group-data-[collapsible=icon]:size-12">
                            <item.icon size={18} strokeWidth={2} className="text-slate-400 group-hover/menu-item:text-blue-600 transition-colors flex-none" />
                          </div>
                          <span className="font-medium text-slate-500 group-data-[collapsible=icon]:hidden">{item.title}</span>
                        </Link>
                      )} 
                      tooltip={item.title} 
                    />
                    {item.items?.length ? (
                      <SidebarMenuSub className="group-data-[collapsible=icon]:hidden">
                        {item.items.map((subItem: any) => (
                           <SidebarMenuSubItem key={subItem.title}>
                             <SidebarMenuSubButton render={(subProps) => (
                               <Link {...subProps} href={subItem.url} className="text-slate-500 hover:text-blue-600 transition-colors text-[13px] 2xl:text-sm font-medium" onClick={() => setOpenMobile(false)}>
                                 {subItem.title}
                               </Link>
                             )} />
                           </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

      <SidebarFooter className="p-2 border-t border-slate-200/50 mt-auto bg-white/40">
        <DropdownMenu>
          <DropdownMenuTrigger render={(triggerProps) => (
            <button 
              {...triggerProps}
              type="button"
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-all duration-200 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0 w-full outline-none text-left cursor-pointer"
            >
              <div className="relative h-8 w-8 shrink-0 transition-all duration-300">
                <PremiumAvatar 
                  src={userData.avatar} 
                  name={userData.name}
                  className="h-8 w-8 border border-slate-200/60 shadow-sm" 
                  style={{ fontSize: '10px' }}
                />
              </div>
              <div className="flex flex-1 items-center justify-between min-w-0 group-data-[collapsible=icon]:hidden">
                <div className="flex flex-col truncate">
                  <span className="truncate font-bold text-slate-800 text-[12.5px] tracking-tight leading-none mb-1">
                    {userData.name}
                  </span>
                  <span className="truncate text-[10px] font-medium text-slate-400 uppercase tracking-widest leading-none">
                    {String(userData.role || "Admin").replace(/_/g, ' ')}
                  </span>
                </div>
                <ChevronsUpDown className="text-slate-400 shrink-0 ml-1 size-[12px] lg:size-[14px]" />
              </div>
            </button>
          )} />
          <DropdownMenuContent
            className="w-56 rounded-xl shadow-2xl border border-slate-200/60 transition-all"
            side="top"
            align="start"
            sideOffset={12}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <PremiumAvatar 
                        src="/api/fetch_profile_picture" 
                        name={userData.name}
                        className="h-8 w-8" 
                        style={{ fontSize: '10px' }}
                      />
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {userData.name}
                        </span>
                        <span className="truncate text-xs">
                          {userData.email}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="p-0 focus:bg-transparent">
                    <Link 
                      href="/profile" 
                      onClick={() => setOpenMobile(false)}
                      className="flex items-center gap-2 p-2 w-full focus:bg-slate-50 cursor-pointer text-slate-700 outline-none rounded-md"
                    >
                      <BadgeCheck size={16} strokeWidth={2} className="text-slate-500" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="gap-2 p-2 focus:bg-slate-50 cursor-pointer text-slate-700">
                    <Bell size={16} strokeWidth={2} className="text-slate-500" />
                    Notifications
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-500 hover:text-red-600 focus:text-red-600 gap-2 cursor-pointer outline-none"
                  onClick={handleLogout}
                >
                  <LogOut size={16} strokeWidth={2.5} />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
