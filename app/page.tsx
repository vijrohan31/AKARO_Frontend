"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-pulse text-slate-400 font-medium">Entering Akaro...</div>
    </main>
  );
}
