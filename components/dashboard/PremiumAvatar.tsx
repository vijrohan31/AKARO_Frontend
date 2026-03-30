"use client"

import * as React from "react"
import { useState } from "react"
import { cn, getAvatarColor } from "@/lib/utils"

const globalLoadedUrls = new Set<string>()
const globalFailedUrls = new Set<string>()

interface PremiumAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  name?: string
  alt?: string
  fallbackIcon?: React.ReactNode
  isSquare?: boolean
  textSize?: string
  silent?: boolean
}

export function PremiumAvatar({ 
  src, 
  name = "User", 
  alt, 
  className,
  fallbackIcon,
  isSquare = false,
  textSize = "text-[12px]",
  silent = false,
  ...props 
}: PremiumAvatarProps) {
  const safeName = name || "User"
  
  const [isPreviouslyLoaded, setIsPreviouslyLoaded] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isError, setIsError] = useState(false)
  const imgRef = React.useRef<HTMLImageElement>(null)
  
  const showImage = (isLoaded || isPreviouslyLoaded) && !isError && !!src

  React.useEffect(() => {
    if (!src || globalFailedUrls.has(src)) {
      setIsError(true)
      setIsLoaded(false)
      return
    }

    // Silent Probe: Only for the list views where we want to avoid 404 in console
    if (silent && !globalLoadedUrls.has(src)) {
      const probeImage = async () => {
        try {
          const res = await fetch(src, { method: 'GET', credentials: 'include' });
          if (res.ok && res.status !== 404) {
            handleLoad();
          } else {
            handleError();
          }
        } catch (e) {
          handleError();
        }
      };
      probeImage();
      return;
    }

    setIsError(false)
    
    const inMemory = globalLoadedUrls.has(src)
    setIsPreviouslyLoaded(inMemory)
    setIsLoaded(inMemory)

    if (imgRef.current?.complete) {
      handleLoad()
    }
  }, [src, silent])

  const handleLoad = () => {
    if (src) globalLoadedUrls.add(src)
    setIsLoaded(true)
    setIsError(false)
  }

  const handleError = () => {
    if (src) {
      globalLoadedUrls.delete(src)
      globalFailedUrls.add(src)
    }
    setIsError(true)
    setIsLoaded(false)
  }

  const initials = safeName
    .trim()
    .split(/[\s_-]+/)
    .map(part => part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "?"

  const colorClass = getAvatarColor(safeName)

  return (
    <div 
      className={cn(
        "relative overflow-hidden shrink-0 flex items-center justify-center select-none shadow-sm",
        isSquare ? "rounded-[10px]" : "rounded-full",
        className
      )}
      {...props}
    >
      <div className={cn("absolute inset-0 transition-opacity duration-700", colorClass)} />

      <div 
        className={cn(
          "relative z-10 flex items-center justify-center text-white font-bold transition-all ease-in-out",
          isPreviouslyLoaded ? "duration-0" : "duration-500",
          showImage ? "opacity-0 scale-90" : "opacity-100 scale-100",
          textSize
        )}
        style={{ 
          letterSpacing: "-0.02em",
          lineHeight: "1"
        }}
      >
        {fallbackIcon || initials}
      </div>

      {src && !isError && (
        <img
          ref={imgRef}
          src={src}
          alt={alt || safeName}
          className={cn(
            "absolute inset-0 h-full w-full object-cover z-20 transition-opacity ease-in-out",
            isPreviouslyLoaded ? "duration-0" : "duration-700",
            showImage ? "opacity-100" : "opacity-0"
          )}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}
