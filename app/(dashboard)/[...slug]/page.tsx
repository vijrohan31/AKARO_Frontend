"use client";

import React from 'react'
import { LayoutDashboard } from 'lucide-react'
import Link from 'next/link'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

function ComingSoonContent({ params }: { params: Promise<{ slug: string[] }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { slug } = React.use(params);

  useEffect(() => {
    const slugLower = slug?.join('/').toLowerCase();
    if (slugLower === 'verify_email' || slugLower === 'verify-email') {
      const token = searchParams.get('token');
      router.replace(token ? `/verify_email?token=${token}` : '/verify_email');
    }
  }, [slug, router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="size-20 bg-blue-50/50 rounded-2xl flex items-center justify-center mb-6">
        <LayoutDashboard className="size-10 text-blue-600 animate-pulse" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Feature Coming Soon</h1>
      <p className="text-slate-500 max-w-md mx-auto mb-8 text-lg leading-relaxed">
        We're currently building this section to provide you with the best experience. Stay tuned for updates!
      </p>
      <Link 
        href="/dashboard" 
        className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200/50 active:scale-95"
      >
        Back to Dashboard
      </Link>
    </div>
  )
}

export default function ComingSoonPage(props: any) {
  return (
    <Suspense fallback={null}>
      <ComingSoonContent {...props} />
    </Suspense>
  )
}
