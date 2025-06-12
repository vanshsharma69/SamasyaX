"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Shield, Moon, Sun, Bell, Lock, Database, Download } from "lucide-react"

interface SettingsViewProps {
  user: {
    id: string
    email: string
    role: "Admin" | "Developer"
  }
}

export function SettingsView({ user }: SettingsViewProps) {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [emailUpdates, setEmailUpdates] = useState(false)
  const [autoSave, setAutoSave] = useState(true)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match")
      return
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setUpdating(true)
    setError("")

    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/users/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        setSuccess("Password updated successfully!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        const data = await response.json()
        setError(data.message || "Failed to update password")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const exportData = async () => {
    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${API_URL}/api/export/user-data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `bug-logger-data-${new Date().toISOString().split("T")[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        setSuccess("Data exported successfully!")
      } else {
        setError("Failed to export data")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and application preferences</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <AlertDescription className="text-green-800 dark:text-green-200">{success}</AlertDescription>
        </Alert>
      )}

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details and role information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Email Address</Label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant={user.role === "Admin" ? "default" : "secondary"}>
              {user.role === "Admin" && <Shield className="h-3 w-3 mr-1" />}
              {user.role}
            </Badge>
          </div>
          <Separator />
          <div>
            <Label className="text-sm font-medium">User ID</Label>
            <p className="text-sm text-muted-foreground font-mono">{user.id}</p>
          </div>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {theme === "dark" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Appearance
          </CardTitle>
          <CardDescription>Customize the look and feel of the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground">Choose your preferred theme</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>
                <Sun className="h-4 w-4 mr-1" />
                Light
              </Button>
              <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
                <Moon className="h-4 w-4 mr-1" />
                Dark
              </Button>
              <Button variant={theme === "system" ? "default" : "outline"} size="sm" onClick={() => setTheme("system")}>
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications for new issues and updates</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Email Updates</Label>
              <p className="text-sm text-muted-foreground">Get email notifications for important updates</p>
            </div>
            <Switch checked={emailUpdates} onCheckedChange={setEmailUpdates} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Auto-save</Label>
              <p className="text-sm text-muted-foreground">Automatically save your work</p>
            </div>
            <Switch checked={autoSave} onCheckedChange={setAutoSave} />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security
          </CardTitle>
          <CardDescription>Manage your account security settings</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="Enter your current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter your new password"
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your new password"
                minLength={6}
              />
            </div>
            <Button type="submit" disabled={updating}>
              {updating ? "Updating..." : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Export your data and manage your information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Export Data</Label>
              <p className="text-sm text-muted-foreground">Download all your data in JSON format</p>
            </div>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
