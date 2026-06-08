import { useState, useMemo } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import {
  Users,
  Scissors,
  CalendarCheck,
  Trash2,
  Plus,
  AlertTriangle,
  Lock,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { User, Service, Booking } from '@/types';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  services: Service[];
  bookings: Booking[];
  onAddStudent: (student: User) => Promise<void>; // ✅ Added Promise<void>
  onAddAdmin: (admin: User) => Promise<void>;     // ✅ Added Promise<void>
  onRemoveStudent: (uid: string) => void;
  onResetData: () => void;
  onUpdateUser: (user: User) => void;
}

export function AdminDashboard({
  currentUser,
  users,
  services,
  bookings,
  onAddStudent,
  onAddAdmin,
  onRemoveStudent,
  onResetData,
  onUpdateUser,
}: AdminDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState<{
    username: string;
    password: string;
  } | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const students = useMemo(
    () => users.filter((u) => u.role === 'student'),
    [users]
  );

  const admins = useMemo(
    () => users.filter((u) => u.role === 'admin'),
    [users]
  );

  const stats = [
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
    },
    {
      label: 'Total Services',
      value: services.length,
      icon: Scissors,
    },
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: CalendarCheck,
    },
  ];

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    onUpdateUser({ ...currentUser, password: newPassword, isTemp: false });
    setShowPasswordModal(false);
    setNewPassword('');
    setConfirmPassword('');
    alert('Password updated successfully');
  };

  const handleAddStudent = async () => {
    const f = firstName.trim();
    const l = lastName.trim();
    const email = studentEmail.trim().toLowerCase();
    
    if (!f || !l) {
      alert('Please enter both First and Last Name.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert('Please enter a valid email address (e.g., student@gmail.com)');
      return;
    }

    const password = Math.random().toString(36).slice(-8);

    const student: User = {
      uid: `st_${Date.now()}`,
      role: 'student',
      name: `${f} ${l}`,
      username: email,
      email: email,
      password: password,
      isTemp: true,
      services_active: [],
    };

    try {
      // ✅ WAIT for the creation to finish!
      await onAddStudent(student);
      
      // Only show credentials if it was successful
      setGeneratedCreds({ username: email, password });
      setFirstName('');
      setLastName('');
      setStudentEmail('');
      setShowAddModal(false);
      setShowCredentialsModal(true);
    } catch (error) {
      console.error('Failed to add student:', error);
    }
  };

  const handleAddAdmin = () => {
    const name = `${firstName.trim()} ${lastName.trim()}`;
    const email = adminEmail.trim().toLowerCase();
    const password = adminPassword.trim();
    
    if (!firstName.trim() || !lastName.trim()) {
      alert('Please enter both First and Last Name.');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      alert('Please enter a valid email address');
      return;
    }

    if (!password || password.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    const admin: User = {
      uid: `admin_${Date.now()}`,
      role: 'admin',
      name: name,
      username: email,
      email: email,
      password: password,
      isTemp: false,
      services_active: [],
    };

    onAddAdmin(admin);
    setGeneratedCreds({ username: email, password });
    setFirstName('');
    setLastName('');
    setAdminEmail('');
    setAdminPassword('');
    setShowAddAdminModal(false);
    setShowCredentialsModal(true);
  };

  const handleResetStudentPassword = async (studentEmail: string) => {
    if (!confirm(`Send password reset email to ${studentEmail}?`)) {
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, studentEmail);
      alert(`Password reset email sent to ${studentEmail}`);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      if (error.code === 'auth/user-not-found') {
        alert('No account found for this email address');
      } else if (error.code === 'auth/too-many-requests') {
        alert('Too many reset requests. Please try again later');
      } else {
        alert('Failed to send password reset email. Check console for details.');
      }
    }
  };

  const handleRemove = (uid: string) => {
    onRemoveStudent(uid);
  };

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage students, admins and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            className="border-border text-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Lock className="w-4 h-4 mr-1.5" />
            Change Password
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="border-red-900/50 text-red-500 hover:bg-red-950/50 hover:text-red-400"
          >
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            Reset System
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Management */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Admin Management
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddAdminModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Admin
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Email</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length > 0 ? (
                  admins.map((admin) => (
                    <TableRow key={admin.uid} className="border-border hover:bg-accent/50">
                      <TableCell className="font-medium text-foreground">
                        {admin.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {admin.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-green-500/10 text-green-500 border-green-500/20"
                        >
                          Active
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No admins found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Student Management */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Student Management
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Student
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Email</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Active Services</TableHead>
                  <TableHead className="text-right text-muted-foreground font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((s) => (
                    <TableRow key={s.uid} className="border-border hover:bg-accent/50">
                      <TableCell className="font-medium text-foreground">
                        {s.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">
                        {s.email || s.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                        >
                          {(s.services_active || []).length} active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResetStudentPassword(s.email || s.username)}
                            className="border-blue-900/50 text-blue-500 hover:bg-blue-950/50 hover:text-blue-400"
                            title="Send password reset email"
                          >
                            <Lock className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemove(s.uid)}
                            className="text-red-500 hover:text-red-400 hover:bg-red-950/50"
                            title="Delete student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg"
                    >
                      <Scissors className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                      No students found. Add your first student to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Admin Modal */}
      <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Add New Admin
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new admin account with custom credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm text-foreground mb-1 block">First Name</Label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              />
            </div>
            <div>
              <Label className="text-sm text-foreground mb-1 block">Last Name</Label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              />
            </div>
            <div>
              <Label className="text-sm text-foreground mb-1 block">Email Address</Label>
              <Input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@example.com"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              />
            </div>
            <div>
              <Label className="text-sm text-foreground mb-1 block">Password (min 6 characters)</Label>
              <Input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-accent"
              onClick={() => setShowAddAdminModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleAddAdmin}
            >
              Create Admin
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Add New Student
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new student account. They will log in with their email address.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm text-foreground mb-1 block">First Name</Label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              />
            </div>
            <div>
              <Label className="text-sm text-foreground mb-1 block">Email Address</Label>
              <Input
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="student@example.com"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              />
            </div>
            <div>
              <Label className="text-sm text-foreground mb-1 block">Last Name</Label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-accent"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleAddStudent}
            >
              Create Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog
        open={showCredentialsModal}
        onOpenChange={setShowCredentialsModal}
      >
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground text-center">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Account Created!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Save these credentials securely and share them with the user.
            </DialogDescription>
          </DialogHeader>
          {generatedCreds && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-left my-4 border border-border">
              <div className="pb-3 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Login Email
                </p>
                <p className="text-lg font-mono font-bold text-foreground bg-background px-3 py-2 rounded-lg border border-border mt-1">
                  {generatedCreds.username}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
                  Password
                </p>
                <p className="text-lg font-mono font-bold text-primary bg-background px-3 py-2 rounded-lg border border-border mt-1">
                  {generatedCreds.password}
                </p>
              </div>
            </div>
          )}
          <Button
            onClick={() => setShowCredentialsModal(false)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Reset System
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This will permanently clear all data including students, bookings,
              and schedules. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onResetData();
                setShowResetDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground text-center">
              Change Admin Password
            </DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">
              Set a secure password for your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm text-foreground mb-1 block">
                New Password (min 6 characters)
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
              />
            </div>
            <div>
              <Label className="text-sm text-foreground mb-1 block">
                Confirm Password
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-border text-foreground hover:bg-accent"
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleChangePassword}
            >
              Update Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}