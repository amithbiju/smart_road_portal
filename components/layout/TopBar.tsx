"use client"

import { usePathname } from "next/navigation"
import { Bell, User, Search } from "lucide-react"
import { ProjectSelector } from "@/components/layout/ProjectSelector"

export function TopBar() {
  const pathname = usePathname()
  
  // Format pathname for breadcrumb (simple version)
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumb = segments.length > 0 
    ? segments.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(" / ")
    : "Dashboard"

  return (
    <header className="h-16 border-b border-border bg-card px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <ProjectSelector />
        <div className="h-4 w-px bg-border mx-2" />
        <span className="font-medium text-foreground hidden sm:block">{breadcrumb}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input 
                type="text" 
                placeholder="Search projects..." 
                className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-4 text-sm outline-none focus:ring-1 focus:ring-ring transition-all"
            />
        </div>

        {/* <button className="relative p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" />
        </button>

        <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground border border-input">
          <User size={16} />
        </div> */}
      </div>
    </header>
  )
}
