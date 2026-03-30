"use client"

import * as React from "react"
import {
  TrendUp,
  Pulse,
  ShieldCheck,
  Stack,
  Users,
  Clock,
  Download,
  Info,
  Calendar,
} from "@phosphor-icons/react"
import { motion } from "framer-motion"
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDashboard } from "@/components/dashboard/DashboardProvider"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

const chartData = [
  { name: "Mon", value: 400 },
  { name: "Tue", value: 300 },
  { name: "Wed", value: 500 },
  { name: "Thu", value: 280 },
  { name: "Fri", value: 590 },
  { name: "Sat", value: 320 },
  { name: "Sun", value: 480 },
]

export default function DashboardPage() {
  const { isLoading, userData } = useDashboard()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex flex-col gap-1">
          <Skeleton className="h-10 w-48 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full rounded-2xl" />)}
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
          <Skeleton className="lg:col-span-4 h-[350px] w-full rounded-2xl" />
          <Skeleton className="lg:col-span-3 h-[350px] w-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-6 min-h-0 overflow-hidden font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0 px-1 pt-2">
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-none font-heading flex items-center gap-2.5">
             Welcome back, 
             <span className="text-blue-600">
               {userData?.name?.split(' ')[0] || 'Vibhu'}
             </span>
             <motion.span 
               initial={{ rotate: 0 }}
               animate={{ rotate: [0, 20, 0] }}
               transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
               className="inline-block"
             >
               👋
             </motion.span>
          </h1>
          <p className="text-xs md:text-sm text-slate-500 font-medium tracking-tight mt-1 leading-relaxed max-w-xl">
            Manage and monitor your intelligence flow. Everything is synchronized and ready for your command.
          </p>
        </div>
      </div>
      <div className="flex-1" />
    </div>
  )
}
