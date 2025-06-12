"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Home, FolderOpen, Users, Settings, Bug, Shield, Moon, Sun, Menu, X, Eye } from "lucide-react"
import { useTheme } from "next-themes"

interface User {
  id: string
  email: string
  role: "Admin" | "Developer" | "Client"
}

interface SidebarProps {
  user: User
  currentView: string
  onViewChange: (view: string) => void
  onLogout: () => void
}

export function Sidebar({ user, currentView, onViewChange, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { theme, setTheme } = useTheme()

  // Collapse sidebar on mobile by default
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true)
    }
  }, [])

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, roles: ["Admin", "Developer", "Client"] },
    { id: "projects", label: "Projects", icon: FolderOpen, roles: ["Admin", "Developer", "Client"] },
    { id: "issues", label: "All Issues", icon: Bug, roles: ["Admin", "Developer", "Client"] },
    { id: "users", label: "User Management", icon: Users, roles: ["Admin"] },
    { id: "settings", label: "Settings", icon: Settings, roles: ["Admin", "Developer", "Client"] },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user.role))

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Admin":
        return "default"
      case "Developer":
        return "secondary"
      case "Client":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Admin":
        return <Shield className="h-3 w-3 mr-1" />
      case "Client":
        return <Eye className="h-3 w-3 mr-1" />
      default:
        return null
    }
  }

  return (
    <div
      className={`border-r transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      } flex flex-col h-screen bg-white dark:bg-gray-900`}
    >
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-800">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <Bug className="h-6 w-6 text-primary text-red-700" />
              <h1 className="font-bold text-lg text-red-600 dark:text-green-400 ">SamasyaX</h1>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 dark:bg-yellow-400 dark:text-white rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
            {user.email.charAt(0).toUpperCase()}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <div className="flex items-center gap-1">
                <Badge variant={getRoleBadgeVariant(user.role)} className="text-xs bg-blue-500 hover:bg-blue-600 hover:cursor-pointer dark:hover:bg-blue-400 text-white">
                  {getRoleIcon(user.role)}
                  {user.role}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {filteredMenuItems.map((item) => (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${isCollapsed ? "px-2" : ""}`}
              onClick={() => onViewChange(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {!isCollapsed && <span className="ml-2">{item.label}</span>}
            </Button>
          ))}
        </div>
      </nav>

      <Separator className="dark:bg-gray-800" />

      {/* Theme Toggle & Logout */}
      <div className="p-4 space-y-2">
        <Button
          variant="ghost"
          className={`w-full justify-start hover:bg-blue-300 dark:hover:bg-blue-900 ${isCollapsed ? "px-2" : ""}`}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          {!isCollapsed && <span className="ml-2">Toggle Theme</span>}
        </Button>

        <Button
          variant="outline"
          className={`w-full justify-start hover:bg-blue-300 dark:hover:bg-blue-900 ${isCollapsed ? "px-2" : ""}`}
          onClick={onLogout}
        >
          <Settings className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  )
}
