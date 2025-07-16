"use client"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import { 
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Menu items with custom SVG icons
const menuItems = [
  {
    title: "Assistant",
    href: "/assistant",
    iconOutline: "/square-asterisk-outline.svg",
    iconFilled: "/square-asterisk-filled.svg",
  },
  {
    title: "Vault",
    href: "/vault",
    iconOutline: "/folder-vault-outline.svg",
    iconFilled: "/folder-vault-filled.svg",
  },
]

export function AppSidebar() {
  const { state, toggleSidebar } = useSidebar()
  const router = useRouter()
  const pathname = usePathname()
  const [isAvatarHovered, setIsAvatarHovered] = useState(false)
  
  // Determine the selected item based on current path
  const getSelectedItem = () => {
    const currentItem = menuItems.find(item => item.href === pathname)
    return currentItem?.title || "Assistant"
  }
  
  const selectedItem = getSelectedItem()
  
  // Reset hover state when sidebar state changes
  useEffect(() => {
    setIsAvatarHovered(false)
  }, [state])

  const handleNavigation = (href: string) => {
    router.push(href)
  }
  
  return (
    <Sidebar collapsible="icon" className="relative border-r border-neutral-200" style={{ backgroundColor: 'white' }}>
      <SidebarHeader className={cn(
        "p-0 relative bg-white",
        state === "collapsed" && "group"
      )}>
        {/* Paul Weiss logo/avatar */}
        <div className={cn(
          "flex items-center h-14 transition-colors bg-white",
          state === "expanded" ? "px-[10px] gap-2" : "px-[6px] justify-center"
        )}>
          <div className="flex items-center gap-0.5 min-w-0 flex-1">
            <button 
              onClick={state === "collapsed" ? toggleSidebar : undefined}
              onMouseEnter={() => state === "collapsed" && setIsAvatarHovered(true)}
              onMouseLeave={() => state === "collapsed" && setIsAvatarHovered(false)}
              className={cn(
                "flex-shrink-0 w-[36px] h-[36px] rounded-md transition-colors flex items-center justify-center relative",
                state === "collapsed" ? "hover:bg-neutral-100" : "hover:bg-neutral-100"
              )}
            >
              {state === "collapsed" && isAvatarHovered ? (
                <PanelLeft className="w-4 h-4 text-neutral-700" />
              ) : (
                <Image
                  src="/PW-icon logo.png"
                  alt="Paul Weiss"
                  width={20}
                  height={20}
                  className="rounded-[4px]"
                />
              )}
              {state === "collapsed" && isAvatarHovered && (
                <div className="absolute left-full ml-2 bg-neutral-900 text-white rounded-md px-2 py-1 shadow-md whitespace-nowrap">
                  <span className="text-xs">
                    Expand sidebar
                  </span>
                </div>
              )}
            </button>
            {state === "expanded" && (
              <span className="text-sm font-medium text-neutral-900 truncate min-w-0">
                Paul, Weiss, Rifkind, Wharton & Garrison LLP
              </span>
            )}
          </div>
          {state === "expanded" && (
            <button
              onClick={toggleSidebar}
              className="flex-shrink-0 w-[36px] h-[36px] rounded-md hover:bg-neutral-100 transition-colors flex items-center justify-center"
            >
              <PanelLeft className="w-4 h-4 text-neutral-600" />
            </button>
          )}
        </div>
      </SidebarHeader>
      
      <SidebarContent className="bg-white">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className={cn(
              "gap-1 py-2",
              state === "expanded" ? "px-[10px]" : "px-[6px]"
            )}>
              {menuItems.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    tooltip={state === "collapsed" ? item.title : undefined}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "w-full justify-start gap-[6px] text-sm rounded-md transition-colors",
                      state === "expanded" ? "px-3 h-[36px]" : "p-0 w-[36px] h-[36px] min-w-[36px] min-h-[36px] flex items-center justify-center",
                      selectedItem === item.title ? "bg-neutral-200 hover:bg-neutral-200" : "hover:bg-neutral-100"
                    )}
                  >
                    <Image
                      src={selectedItem === item.title ? item.iconFilled : item.iconOutline}
                      alt={item.title}
                      width={16}
                      height={16}
                      className="flex-shrink-0"
                    />
                    {state === "expanded" && (
                      <span className="text-neutral-700">{item.title}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
} 