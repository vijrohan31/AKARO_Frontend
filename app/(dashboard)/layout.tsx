import { cookies } from "next/headers"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { DashboardBreadcrumb } from "@/components/dashboard/dashboard-breadcrumb"
import { MagnifyingGlass, Bell } from "@phosphor-icons/react/dist/ssr"
import { DashboardProvider } from "@/components/dashboard/DashboardProvider"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

import { TooltipProvider } from "@/components/ui/tooltip"
import { SWRProvider } from "@/components/dashboard/SWRProvider"
import { VerificationGuard } from "@/components/dashboard/VerificationGuard"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true"

  return (
    <TooltipProvider delay={0}>
      <SWRProvider>
        <DashboardProvider initialUserData={null}>
          <div className="dashboard-theme contents">
            <VerificationGuard>
              <SidebarProvider defaultOpen={defaultOpen}>
                <AppSidebar />
                <SidebarInset className="bg-[#f8fafc] flex flex-col h-[100dvh] overflow-hidden">
                  <header className="flex h-14 lg:h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 font-sans">
                    <div className="flex items-center gap-2">
                      <SidebarTrigger className="-ml-1 text-slate-400 hover:text-primary transition-colors focus-visible:ring-0" />
                      <DashboardBreadcrumb />
                    </div>
    
                    <div className="flex items-center gap-3">
                      <div className="hidden md:flex items-center gap-2 bg-slate-100/50 hover:bg-slate-100 border border-slate-200/40 rounded-xl px-3 py-1.5 md:w-32 lg:w-64 group focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
                        <MagnifyingGlass className="size-4 text-slate-400 group-focus-within:text-blue-600" />
                        <input 
                          type="text" 
                          placeholder="Quick search..." 
                          className="bg-transparent border-none outline-none text-[13px] text-slate-600 placeholder:text-slate-400 w-full font-medium"
                        />
                      </div>
                      <button className="relative p-2 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-full transition-all">
                        <Bell className="size-5" />
                        <span className="absolute top-2.5 right-2.5 size-1.5 bg-blue-600 rounded-full border border-white"></span>
                      </button>
                    </div>
                  </header>
                  <main className="flex-1 flex flex-col p-4 lg:p-6 no-scrollbar min-h-0 w-full relative overflow-hidden">
                      {children}
                  </main>
                </SidebarInset>
              </SidebarProvider>
            </VerificationGuard>
          </div>
        </DashboardProvider>
      </SWRProvider>
    </TooltipProvider>
  )
}
