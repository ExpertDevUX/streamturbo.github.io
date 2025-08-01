import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@/contexts/translation-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Settings, Shield, Users, Database, Activity, Edit, Trash2, Key, Save, FileText, BarChart3, AlertTriangle, Download, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";
import Breadcrumb from "@/components/breadcrumb";
import Navigation from "@/components/navigation";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";

export default function AdminSettings() {
  const [authSettings, setAuthSettings] = useState({
    googleClientId: "",
    googleClientSecret: "",
    facebookAppId: "",
    facebookAppSecret: "",
  });
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: platformInfo } = useQuery({
    queryKey: ["/api/admin/platform-info"],
  });

  const { data: currentAuthSettings } = useQuery({
    queryKey: ["/api/admin/auth-settings"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const { data: analytics, refetch: refetchAnalytics } = useQuery({
    queryKey: ["/api/admin/reports/analytics"],
  });

  const { data: logs, refetch: refetchLogs } = useQuery({
    queryKey: ["/api/admin/reports/logs"],
  });

  const { data: userActivity } = useQuery({
    queryKey: ["/api/admin/reports/user-activity"],
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<User> }) => {
      const res = await apiRequest("PUT", `/api/admin/users/${id}`, updates);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      toast({
        title: "User Updated",
        description: "User information has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/users/${id}`);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      const res = await apiRequest("POST", `/api/admin/users/${id}/reset-password`, { newPassword: password });
      return await res.json();
    },
    onSuccess: () => {
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedUser(null);
      toast({
        title: "Password Reset",
        description: "User password has been successfully reset.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditUser = (user: User) => {
    setEditingUser({ ...user });
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      updateUserMutation.mutate({
        id: editingUser.id,
        updates: {
          firstName: editingUser.firstName,
          lastName: editingUser.lastName,
          email: editingUser.email,
          username: editingUser.username,
          role: editingUser.role,
          bio: editingUser.bio,
        },
      });
    }
  };

  const handleDeleteUser = (user: User) => {
    deleteUserMutation.mutate(user.id);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setIsPasswordDialogOpen(true);
  };

  const handlePasswordReset = () => {
    if (selectedUser && newPassword.length >= 6) {
      resetPasswordMutation.mutate({
        id: selectedUser.id,
        password: newPassword,
      });
    }
  };

  // Calculate growth percentages
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return "New";
    const growth = ((current - previous) / previous) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const reportData = [
    { 
      metric: "Total Users", 
      value: analytics?.totalUsers || 0, 
      change: analytics?.userGrowth ? calculateGrowth(analytics.userGrowth.thisMonth, analytics.userGrowth.lastMonth) : "+0%" 
    },
    { metric: "Active Streams", value: analytics?.activeStreams || 0, change: "+8%" },
    { metric: "Total Views", value: analytics?.totalViews ? analytics.totalViews.toLocaleString() : "0", change: "+15%" },
    { metric: "Revenue", value: analytics?.revenue ? `$${analytics.revenue.toLocaleString()}` : "$0", change: "+22%" },
  ];

  // PDF Export Functions
  const exportAnalyticsToPDF = async () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('StreamVibe Analytics Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Analytics Summary
      const analyticsData = reportData.map(item => [
        item.metric || 'N/A', 
        (item.value || 0).toString(), 
        item.change || 'N/A'
      ]);
      
      (doc as any).autoTable({
        head: [['Metric', 'Value', 'Change']],
        body: analyticsData,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
      });
      
      // Stream Statistics
      if (analytics?.streamStats) {
        const streamData = [
          ['Average Duration', `${(analytics.streamStats.avgDuration || 0).toFixed(1)} minutes`],
          ['Average Viewers', (analytics.streamStats.avgViewers || 0).toString()],
          ['Peak Concurrent', (analytics.streamStats.peakConcurrent || 0).toString()]
        ];
        
        (doc as any).autoTable({
          head: [['Stream Metric', 'Value']],
          body: streamData,
          startY: (doc as any).lastAutoTable?.finalY + 20 || 100,
          theme: 'grid',
          headStyles: { fillColor: [139, 92, 246] }
        });
      }
      
      doc.save('streamvibe-analytics-report.pdf');
      
      toast({
        title: "Report Exported",
        description: "Analytics report has been exported to PDF successfully.",
      });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export Failed",
        description: `There was an error exporting the PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const exportLogsToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('StreamVibe System Logs', 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Logs Table
      const logsData = (logs || []).map((log: any) => [
        new Date(log.timestamp).toLocaleString(),
        log.level,
        log.message.length > 50 ? log.message.substring(0, 50) + '...' : log.message,
        log.user
      ]);
      
      (doc as any).autoTable({
        head: [['Timestamp', 'Level', 'Message', 'User']],
        body: logsData,
        startY: 40,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [139, 92, 246] },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 20 },
          2: { cellWidth: 80 },
          3: { cellWidth: 40 }
        }
      });
      
      doc.save('streamvibe-logs-report.pdf');
      
      toast({
        title: "Logs Exported",
        description: "System logs have been exported to PDF successfully.",
      });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the logs PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const exportUserActivityToPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(20);
      doc.text('StreamVibe User Activity Report', 20, 20);
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
      
      // Daily Active Users
      if (userActivity?.dailyActiveUsers) {
        const dauData = userActivity.dailyActiveUsers.map((item: any) => [
          item.date, 
          item.users.toString()
        ]);
        
        (doc as any).autoTable({
          head: [['Date', 'Active Users']],
          body: dauData,
          startY: 40,
          theme: 'grid',
          headStyles: { fillColor: [139, 92, 246] }
        });
      }
      
      // Top Streamers
      if (userActivity?.topStreamers && userActivity.topStreamers.length > 0) {
        const streamersData = userActivity.topStreamers.map((streamer: any) => [
          streamer.username,
          streamer.viewCount.toString(),
          streamer.followers.toString()
        ]);
        
        (doc as any).autoTable({
          head: [['Username', 'View Count', 'Followers']],
          body: streamersData,
          startY: (doc as any).lastAutoTable.finalY + 20,
          theme: 'grid',
          headStyles: { fillColor: [139, 92, 246] }
        });
      }
      
      // Category Breakdown
      if (userActivity?.categoryBreakdown) {
        const categoryData = userActivity.categoryBreakdown.map((cat: any) => [
          cat.category,
          `${cat.percentage}%`
        ]);
        
        (doc as any).autoTable({
          head: [['Category', 'Percentage']],
          body: categoryData,
          startY: (doc as any).lastAutoTable.finalY + 20,
          theme: 'grid',
          headStyles: { fillColor: [139, 92, 246] }
        });
      }
      
      doc.save('streamvibe-user-activity-report.pdf');
      
      toast({
        title: "User Activity Exported",
        description: "User activity report has been exported to PDF successfully.",
      });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the user activity PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      
      <div className="container mx-auto p-6">
        <Breadcrumb 
          items={[
            { label: "Home", href: "/" },
            { label: "Admin Settings" }
          ]}
        />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('Admin Settings')}</h1>
          <p className="text-muted-foreground">Configure your StreamVibe platform settings</p>
        </div>

        <Tabs defaultValue="authentication" className="space-y-6">
          <TabsList className="grid grid-cols-6 w-fit bg-muted">
            <TabsTrigger value="authentication" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Authentication
            </TabsTrigger>
            <TabsTrigger value="platform" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              {t('Platform Settings')}
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('User Management')}
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {t('Reports & Analytics')}
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t('System Logs')}
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System
            </TabsTrigger>
          </TabsList>

          <TabsContent value="authentication" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Authentication Providers</CardTitle>
                <CardDescription>
                  Configure OAuth providers for user authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Google OAuth */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-900">G</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Google OAuth</h3>
                        <p className="text-sm text-muted-foreground">Allow users to sign in with Google</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Not Configured</Badge>
                      <Switch disabled />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pl-11">
                    <div className="space-y-2">
                      <Label htmlFor="googleClientId">Client ID</Label>
                      <Input
                        id="googleClientId"
                        placeholder="Enter Google Client ID"
                        value={authSettings.googleClientId}
                        onChange={(e) => setAuthSettings(prev => ({ ...prev, googleClientId: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="googleClientSecret">Client Secret</Label>
                      <Input
                        id="googleClientSecret"
                        type="password"
                        placeholder="Enter Google Client Secret"
                        value={authSettings.googleClientSecret}
                        onChange={(e) => setAuthSettings(prev => ({ ...prev, googleClientSecret: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Facebook OAuth */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                        <span className="text-sm font-bold text-white">f</span>
                      </div>
                      <div>
                        <h3 className="font-medium">Facebook OAuth</h3>
                        <p className="text-sm text-muted-foreground">Allow users to sign in with Facebook</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Not Configured</Badge>
                      <Switch disabled />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pl-11">
                    <div className="space-y-2">
                      <Label htmlFor="facebookAppId">App ID</Label>
                      <Input
                        id="facebookAppId"
                        placeholder="Enter Facebook App ID"
                        value={authSettings.facebookAppId}
                        onChange={(e) => setAuthSettings(prev => ({ ...prev, facebookAppId: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebookAppSecret">App Secret</Label>
                      <Input
                        id="facebookAppSecret"
                        type="password"
                        placeholder="Enter Facebook App Secret"
                        value={authSettings.facebookAppSecret}
                        onChange={(e) => setAuthSettings(prev => ({ ...prev, facebookAppSecret: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button className="bg-primary hover:bg-primary/90">
                    Save Authentication Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="platform" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Platform Information</CardTitle>
                <CardDescription>
                  Current platform configuration and features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Platform Name</Label>
                    <p className="font-medium">{platformInfo?.name || 'StreamVibe'}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Version</Label>
                    <p className="font-medium">{platformInfo?.version || '1.0.0'}</p>
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm text-muted-foreground mb-2 block">Enabled Features</Label>
                  <div className="flex flex-wrap gap-2">
                    {platformInfo?.features?.map((feature: string) => (
                      <Badge key={feature} variant="secondary">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">User Management</CardTitle>
                <CardDescription>
                  Manage user accounts and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        {users?.length || 0} total users
                      </p>
                    </div>
                    
                    <div className="border border-border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users?.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                                    {user.firstName?.[0] || user.username?.[0] || 'U'}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {user.firstName && user.lastName 
                                        ? `${user.firstName} ${user.lastName}`
                                        : user.username
                                      }
                                    </p>
                                    <p className="text-sm text-muted-foreground">@{user.username}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{user.email || 'No email'}</TableCell>
                              <TableCell>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {user.role || 'user'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleResetPassword(user)}
                                  >
                                    <Key className="w-4 h-4" />
                                  </Button>
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={user.role === 'admin'}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete user "{user.username}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction 
                                          onClick={() => handleDeleteUser(user)}
                                          className="bg-destructive hover:bg-destructive/90"
                                        >
                                          Delete
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{t('Live Analytics Dashboard')}</h2>
              <div className="flex gap-2">
                <Button onClick={() => refetchAnalytics()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('Refresh Data')}
                </Button>
                <Button onClick={exportAnalyticsToPDF} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t('Export PDF')}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {reportData.map((item) => (
                <Card key={item.metric} className="bg-card border-border">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{item.metric}</p>
                        <p className="text-2xl font-bold">{item.value}</p>
                      </div>
                      <div className={`text-sm font-medium ${item.change.startsWith('+') ? 'text-green-600' : item.change.startsWith('-') ? 'text-red-600' : 'text-yellow-600'}`}>
                        {item.change}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Activity Chart */}
            {userActivity?.dailyActiveUsers && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Daily Active Users (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={userActivity.dailyActiveUsers}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="users" 
                          stroke="#8b5cf6" 
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              {userActivity?.categoryBreakdown && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Stream Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userActivity.categoryBreakdown}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ category, percentage }) => `${category} ${percentage}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="percentage"
                          >
                            {userActivity.categoryBreakdown.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Top Streamers */}
              {userActivity?.topStreamers && (
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground">Top Streamers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={userActivity.topStreamers}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="username" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="viewCount" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Export Reports</CardTitle>
                <CardDescription>
                  Generate and download detailed reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={exportAnalyticsToPDF} variant="outline" className="h-20 flex-col">
                    <BarChart3 className="h-6 w-6 mb-2" />
                    Analytics Report
                  </Button>
                  <Button onClick={exportUserActivityToPDF} variant="outline" className="h-20 flex-col">
                    <Activity className="h-6 w-6 mb-2" />
                    User Activity Report
                  </Button>
                  <Button onClick={exportLogsToPDF} variant="outline" className="h-20 flex-col">
                    <FileText className="h-6 w-6 mb-2" />
                    System Logs Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Live System Logs</CardTitle>
                <CardDescription>
                  Real-time monitoring of system events and application logs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Select defaultValue="all">
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          <SelectItem value="error">Error</SelectItem>
                          <SelectItem value="warn">Warning</SelectItem>
                          <SelectItem value="info">Info</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={() => refetchLogs()} variant="outline" size="sm">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                      </Button>
                    </div>
                    <Button onClick={exportLogsToPDF} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export Logs
                    </Button>
                  </div>
                  
                  <div className="border border-border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Timestamp</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>User</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs?.map((log: any, index: number) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {new Date(log.timestamp).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  log.level === 'ERROR' ? 'destructive' : 
                                  log.level === 'WARN' ? 'secondary' : 'default'
                                }
                              >
                                {log.level}
                              </Badge>
                            </TableCell>
                            <TableCell>{log.message}</TableCell>
                            <TableCell className="font-mono text-sm">{log.user}</TableCell>
                          </TableRow>
                        ))}
                        {(!logs || logs.length === 0) && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              No logs available. Check system status or try refreshing.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Log Statistics */}
                  {logs && logs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                      <Card className="bg-card border-border">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">
                              {logs.filter((log: any) => log.level === 'INFO').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Info</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card border-border">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                              {logs.filter((log: any) => log.level === 'WARN').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Warnings</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card border-border">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600">
                              {logs.filter((log: any) => log.level === 'ERROR').length}
                            </p>
                            <p className="text-sm text-muted-foreground">Errors</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="bg-card border-border">
                        <CardContent className="p-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">
                              {logs.length}
                            </p>
                            <p className="text-sm text-muted-foreground">Total Logs</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">System Status</CardTitle>
                <CardDescription>
                  Monitor system health and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">RTMP Server</Label>
                    <Badge className="bg-green-600">Running</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">WebSocket Server</Label>
                    <Badge className="bg-green-600">Connected</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Database</Label>
                    <Badge className="bg-green-600">Connected</Badge>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Authentication</Label>
                    <Badge className="bg-yellow-600">Partial</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editingUser.firstName || ""}
                    onChange={(e) => setEditingUser(prev => ({ ...prev!, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editingUser.lastName || ""}
                    onChange={(e) => setEditingUser(prev => ({ ...prev!, lastName: e.target.value }))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editingUser.email || ""}
                  onChange={(e) => setEditingUser(prev => ({ ...prev!, email: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={editingUser.username || ""}
                  onChange={(e) => setEditingUser(prev => ({ ...prev!, username: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={editingUser.role || "user"} onValueChange={(value) => setEditingUser(prev => ({ ...prev!, role: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="moderator">Moderator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  value={editingUser.bio || ""}
                  onChange={(e) => setEditingUser(prev => ({ ...prev!, bio: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveUser} disabled={updateUserMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handlePasswordReset} 
                disabled={resetPasswordMutation.isPending || newPassword.length < 6}
              >
                <Key className="w-4 h-4 mr-2" />
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}