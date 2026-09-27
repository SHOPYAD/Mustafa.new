"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(({ dir = "rtl", className, ...props }, ref) => (
  <TabsPrimitive.Root
    ref={ref}
    dir={dir}
    className={cn("w-full", className)}
    {...props}
  />
))
Tabs.displayName = TabsPrimitive.Root.displayName

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const scrollRef = React.useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = React.useState(false)
  const [canScrollRight, setCanScrollRight] = React.useState(false)

  const isDragging = React.useRef(false)
  const startX = React.useRef(0)
  const startScrollLeft = React.useRef(0)

  const updateScrollState = React.useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const maxScroll = scrollWidth - clientWidth
    if (maxScroll <= 4) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    const abs = Math.abs(scrollLeft)
    // Support RTL and LTR across all browsers
    setCanScrollLeft(abs < maxScroll - 4 || scrollLeft > 4)
    setCanScrollRight(abs > 4 || scrollLeft < maxScroll - 4)
  }, [])

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    const ro = new ResizeObserver(() => updateScrollState())
    ro.observe(el)
    if (el.firstElementChild) ro.observe(el.firstElementChild)
    window.addEventListener("resize", updateScrollState)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", updateScrollState)
    }
  }, [updateScrollState])

  const slide = (direction: "left" | "right") => {
    const el = scrollRef.current
    if (!el) return
    const amount = 240
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    })
    setTimeout(updateScrollState, 280)
  }

  const handleWheel = (e: React.WheelEvent) => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollWidth > el.clientWidth) {
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      el.scrollLeft += delta
      updateScrollState()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current
    if (!el) return
    isDragging.current = true
    startX.current = e.pageX
    startScrollLeft.current = el.scrollLeft
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return
    const diff = e.pageX - startX.current
    scrollRef.current.scrollLeft = startScrollLeft.current - diff
    updateScrollState()
  }

  const handleMouseUp = () => {
    isDragging.current = false
  }

  return (
    <div className="relative group/tabs flex items-center w-full min-w-0" dir="rtl">
      {canScrollRight && (
        <button
          type="button"
          onClick={() => slide("right")}
          aria-label="تمرير التبويبات لليمين"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-card/95 border border-border shadow-lg text-foreground hover:bg-muted hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="h-4 w-4 text-foreground stroke-current" />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateScrollState}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden select-none cursor-grab active:cursor-grabbing"
      >
        <TabsPrimitive.List
          ref={ref}
          className={cn(
            "inline-flex min-w-full w-max items-center justify-start flex-nowrap gap-1.5 p-1 rounded-2xl bg-muted/60 border border-border text-muted-foreground shrink-0",
            className
          )}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => slide("left")}
          aria-label="تمرير التبويبات لليسار"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-card/95 border border-border shadow-lg text-foreground hover:bg-muted hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 text-foreground stroke-current" />
        </button>
      )}
    </div>
  )
})
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap shrink-0 rounded-xl px-4 py-2 text-xs sm:text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
