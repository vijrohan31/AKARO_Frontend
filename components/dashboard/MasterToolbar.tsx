"use client"

import * as React from "react"
import { MagnifyingGlass, Plus } from "@phosphor-icons/react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface TabConfig {
  id: string
  label: string
  count?: number
}

interface MasterToolbarProps {
  tabs: TabConfig[]
  activeTab: string
  onTabChange: (id: any) => void
  searchTerm: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  actionLabel?: string
  actionIcon?: React.ElementType
  onActionClick?: () => void
  className?: string
}

export function MasterToolbar({
  tabs,
  activeTab,
  onTabChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search records...",
  actionLabel,
  actionIcon: ActionIcon = Plus,
  onActionClick,
  className,
}: MasterToolbarProps) {
  return (
    <div className={cn("w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 lg:gap-4 py-2 px-1", className)}>
      <div className="flex items-center gap-1 bg-slate-100/60 p-1 rounded-lg border border-slate-200/40 relative overflow-hidden order-2 lg:order-1 lg:w-auto w-full">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex-1 lg:flex-none px-2 py-1.5 lg:px-4 lg:py-2 text-[10px] lg:text-[12px] font-bold transition-all duration-300 whitespace-nowrap z-10 flex items-center justify-center lg:justify-start gap-1 lg:gap-2 cursor-pointer",
                isActive ? "text-white" : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-md"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="active-tab-bg"
                  className="absolute inset-0 bg-[#1447E6] rounded-md shadow-md shadow-blue-500/20"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-20 transition-colors duration-300">
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex items-center gap-2 order-1 lg:order-2 lg:w-auto w-full">
        <div className="relative flex-1 lg:w-64 xl:w-72 group">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
          <Input 
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-11 sm:h-10 border-slate-200 bg-white hover:bg-slate-50 focus:bg-white focus:ring-[4px] focus:ring-blue-50/50 rounded-md text-[16px] lg:text-[12px] font-medium transition-all shadow-sm border-opacity-60 w-full"
          />
        </div>

        {actionLabel && (
          <>
            <Button 
              onClick={onActionClick}
              className="hidden lg:flex bg-[#1447E6] hover:bg-[#1447E6]/90 text-white gap-2 px-6 h-11 rounded-md font-bold transition-all shadow-md shadow-blue-500/10 active:scale-[0.98] shrink-0 text-[12px] group/btn cursor-pointer"
            >
              <ActionIcon className="size-4 transition-transform group-hover/btn:scale-110" />
              <span>{actionLabel}</span>
            </Button>

            <Button 
              onClick={onActionClick}
              className="lg:hidden bg-[#1447E6] hover:bg-[#1447E6]/90 text-white shrink-0 size-11 rounded-md font-bold shadow-md shadow-blue-500/10 active:scale-[0.98] flex items-center justify-center p-0 cursor-pointer"
            >
              <ActionIcon className="size-5" />
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
