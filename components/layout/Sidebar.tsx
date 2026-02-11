"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderOpen,
  Map as MapIcon,
  TrafficCone,
  Route,
  Construction,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react"

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Areas", href: "/projects/proj_001/area", icon: MapIcon },
  { label: "Signal Optimization", href: "/projects/proj_001/signal-optimization", icon: TrafficCone },
  { label: "Lane Planning", href: "/projects/proj_001/lane-planning", icon: Route },
  { label: "Road Generation", href: "/projects/proj_001/road-generation", icon: Construction },
  { label: "Results & Exports", href: "/projects/proj_001/results", icon: FileText },
  { label: "Settings", href: "#", icon: Settings },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false)
  const pathname = usePathname()
  
  // Extract project ID if we are in a project context
  // pathname format: /projects/[id]/[section]
  const segments = pathname.split('/')
  const projectId = segments[1] === 'projects' && segments[2] ? segments[2] : undefined
  const isProjectContext = !!projectId

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Projects", href: "/projects", icon: FolderOpen },
    { 
       label: "Areas", 
       href: isProjectContext ? `/projects/${projectId}/area` : "/projects", 
       icon: MapIcon,
       disabled: !isProjectContext
    },
    { 
       label: "Signal Optimization", 
       href: isProjectContext ? `/projects/${projectId}/signal-optimization` : "/projects", 
       icon: TrafficCone,
       disabled: !isProjectContext
    },
    { 
       label: "Lane Planning", 
       href: isProjectContext ? `/projects/${projectId}/lane-planning` : "/projects", 
       icon: Route,
       disabled: !isProjectContext
    },
    { 
       label: "Road Generation", 
       href: isProjectContext ? `/projects/${projectId}/road-generation` : "/projects", 
       icon: Construction,
       disabled: !isProjectContext
    },
    { 
       label: "Results & Exports", 
       href: isProjectContext ? `/projects/${projectId}/results` : "/projects", 
       icon: FileText,
       disabled: !isProjectContext
    },
    { label: "Settings", href: "#", icon: Settings },
  ]

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-border bg-card transition-all duration-300 h-screen sticky top-0 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-4">
        {!collapsed && (
          <span className="font-semibold text-lg tracking-tight truncate">
            SmartRoadOptimization
          </span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "ml-auto p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors",
            collapsed && "mx-auto ml-auto" 
          )}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors group relative",
                isActive 
                  ? "bg-primary/5 text-primary font-medium" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                item.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent text-muted-foreground"
              )}
              onClick={(e) => {
                 if (item.disabled) e.preventDefault()
              }}
            >
              <item.icon size={20} className={cn("shrink-0", isActive && "text-primary")} />
              
              {!collapsed && (
                <span className="truncate opacity-100 transition-opacity duration-300">
                  {item.label}
                </span>
              )}
              
              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-md border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* <div className="p-4 border-t border-border">
        <button
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm text-destructive hover:bg-destructive/10 transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div> */}
    </aside>
  )
}
