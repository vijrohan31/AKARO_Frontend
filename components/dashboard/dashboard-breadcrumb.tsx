"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import Link from "next/link"

const routeMap: Record<string, string> = {
  "/dashboard": "Overview",
  "/super-admin": "Super Admin",
  "/companies": "Company Master",
  "/users": "Users",
  "/settings/users": "Users",
  "/logs": "Audit Logs",
  "/settings": "Settings",
  "/billing": "Billing",
  "/profile": "Profile",
}

export function DashboardBreadcrumb() {
  const pathname = usePathname()
  
  const segments = pathname.split("/").filter(Boolean)
  
  return (
    <Breadcrumb className="hidden sm:block ml-2">
      <BreadcrumbList>
        <BreadcrumbItem>
          <Link href="/dashboard" className="text-slate-500 hover:text-slate-900 transition-colors">
            Dashboard
          </Link>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const path = `/${segments.slice(0, index + 1).join("/")}`
          const isLast = index === segments.length - 1
          const label = routeMap[path] || segment.charAt(0).toUpperCase() + segment.slice(1)
          
          if (path === "/dashboard" && index === 0) return null

          return (
            <React.Fragment key={path}>
              <BreadcrumbSeparator className="text-slate-300" />
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="text-slate-600 font-normal tracking-tight">
                    {label}
                  </BreadcrumbPage>
                ) : (
                  <Link href={path} className="text-slate-500 hover:text-slate-900 transition-colors">
                    {label}
                  </Link>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
