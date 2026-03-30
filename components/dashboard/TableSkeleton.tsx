import React from "react"
import { cn } from "@/lib/utils"

export function TableSkeleton() {
  return (
    <div className="flex flex-col h-full gap-4 animate-pulse px-1">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 px-1">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-slate-200 rounded-lg" />
          <div className="h-4 w-64 bg-slate-100 rounded-lg" />
        </div>
        <div className="h-10 w-32 bg-slate-200 rounded-xl hidden sm:block" />
      </div>

      <div className="w-full flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2 px-1">
        <div className="h-10 w-full lg:w-64 bg-slate-100 rounded-xl" />
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="h-10 flex-1 lg:w-72 bg-slate-100 rounded-xl" />
          <div className="h-10 w-32 bg-slate-200 rounded-xl hidden sm:block" />
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-4">
        <div className="h-12 bg-slate-50 border-b border-slate-100" />
        <div className="flex-1 p-0">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50">
              <div className="size-10 rounded-full bg-slate-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-slate-100 rounded" />
                <div className="h-3 w-1/3 bg-slate-50 rounded" />
              </div>
              <div className="h-6 w-20 bg-slate-100 rounded-full hidden md:block" />
              <div className="h-8 w-8 bg-slate-50 rounded-lg ml-auto" />
            </div>
          ))}
        </div>
        
        <div className="h-12 bg-white border-t border-slate-50 mt-auto flex items-center justify-between px-6">
          <div className="h-4 w-32 bg-slate-100 rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map(i => <div key={i} className="size-8 bg-slate-100 rounded-lg" />)}
          </div>
        </div>
      </div>
    </div>
  )
}
