"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FolderOpen, Bug, Users, CheckCircle, Clock, AlertTriangle, TrendingUp } from "lucide-react"

interface User {
  id: string
  email: string
  role: "Admin" | "Developer"
  assignedProjects?: string[]
}

interface DashboardStats {
  totalProjects: number
  totalIssues: number
  openIssues: number
  inProgressIssues: number
  doneIssues: number
  totalUsers: number
  recentActivity: any[]
}

interface DashboardProps {
  user: User
}

export function Dashboard({ user }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalIssues: 0,
    openIssues: 0,
    inProgressIssues: 0,
    doneIssues: 0,
    totalUsers: 0,
    recentActivity: [],
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const API_URL = process.env.NEXT_PUBLIC_API_URL

      const response = await fetch(`${API_URL}/api/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err)
    } finally {
      setLoading(false)
    }
  }

  const getIssueProgress = () => {
    if (stats.totalIssues === 0) return 0
    return Math.round((stats.doneIssues / stats.totalIssues) * 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.email}! Here's your project overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {user.role === "Admin" ? "All projects" : "Assigned to you"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalIssues}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.openIssues}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.doneIssues}</div>
            <p className="text-xs text-muted-foreground">Issues resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Issue Progress</CardTitle>
            <CardDescription>Overall completion rate</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span>{getIssueProgress()}%</span>
              </div>
              <Progress value={getIssueProgress()} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.openIssues}</div>
                <div className="text-xs text-muted-foreground">To Do</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.inProgressIssues}</div>
                <div className="text-xs text-muted-foreground">In Progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.doneIssues}</div>
                <div className="text-xs text-muted-foreground">Done</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>System overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Users</span>
              </div>
              <Badge variant="secondary">{stats.totalUsers}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Your Role</span>
              </div>
              <Badge variant={user.role === "Admin" ? "default" : "secondary"}>{user.role}</Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Active Projects</span>
              </div>
              <Badge variant="outline">{stats.totalProjects}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
