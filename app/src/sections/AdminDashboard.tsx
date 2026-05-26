import { useState, useMemo } from 'react';
import {
  Users,
  Scissors,
  CalendarCheck,
  Trash2,
  Plus,
  AlertTriangle,
  Lock,
  Sparkles,
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
  onAddStudent: (student: User) => void;
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
  onRemoveStudent,
  onResetData,
  onUpdateUser,
}: AdminDashboardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [generatedCreds, setGeneratedCreds] = useState<{
    username: string;
    password: string;
  } | null>(null);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const students = useMemo(
    () => users.filter((u) => u.role === 'student'),
    [users]
  );

  const stats = [
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'text-[#F26522]',
      bg: 'bg-[#FFF5F0]',
      border: 'border-[#FFCCB3]',
    },
    {
      label: 'Total Services',
      value: services.length,
      icon: Scissors,
      color: 'text-[#F26522]',
      bg: 'bg-[#FFF5F0]',
      border: 'border-[#FFCCB3]',
    },
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: CalendarCheck,
      color: 'text-[#F26522]',
      bg: 'bg-[#FFF5F0]',
      border: 'border-[#FFCCB3]',
    },
  ];

  // Password change handler
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

  const handleAddStudent = () => {
    const f = firstName.trim();
    const l = lastName.trim();
    if (!f || !l) {
      alert('Please enter both First and Last Name.');
      return;
    }
    const username = `${f.toLowerCase()}.${l.toLowerCase()}.${new Date().getFullYear()}`;
    const password = Math.random().toString(36).slice(-8);
    const student: User = {
      uid: `st_${Date.now()}`,
      role: 'student',
      name: `${f} ${l}`,
      username,
      password,
      isTemp: true,
      services_active: [],
    };
    onAddStudent(student);
    setGeneratedCreds({ username, password });
    setFirstName('');
    setLastName('');
    setShowAddModal(false);
    setShowCredentialsModal(true);
  };

  const handleRemove = (uid: string) => {
    onRemoveStudent(uid);
  };

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">Admin Dashboard</h2>
          <p className="text-gray-500 text-sm mt-1">Manage students and system settings</p>
        </div>
        <div className="flex gap-2">
          {/* Change Password Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPasswordModal(true)}
            className="text-[#F26522] border-[#FFCCB3] hover:bg-[#FFF5F0] hover:text-[#E55A1A] hover:border-[#FF9955] transition-all"
          >
            <Lock className="w-4 h-4 mr-1.5" />
            Change Password
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowResetDialog(true)}
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-all"
          >
            <AlertTriangle className="w-4 h-4 mr-1.5" />
            Reset System
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border ${stat.border} ${stat.bg} shadow-sm hover:shadow-md transition-shadow`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-700">
                {stat.label}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Student Management */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#FFF5F0] to-white">
          <CardTitle className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#F26522]" />
            Student Management
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-[#F26522] to-[#E55A1A] hover:from-[#E55A1A] hover:to-[#CC4D14] text-white shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Student
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b-[#FFCCB3]">
                  <TableHead className="text-[#1A1A1A] font-semibold">Name</TableHead>
                  <TableHead className="text-[#1A1A1A] font-semibold">Username</TableHead>
                  <TableHead className="text-[#1A1A1A] font-semibold">Active Services</TableHead>
                  <TableHead className="text-right text-[#1A1A1A] font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((s) => (
                    <TableRow key={s.uid} className="hover:bg-[#FFF5F0] transition-colors">
                      <TableCell className="font-medium text-[#1A1A1A]">
                        {s.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
                        {s.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-[#FFF5F0] text-[#F26522] border border-[#FFCCB3] hover:bg-[#FFE5D9]"
                        >
                          {(s.services_active || []).length} active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(s.uid)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 hover:scale-105 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-center py-8 text-gray-400 bg-[#FFF5F0] rounded-lg"
                    >
                      <Sparkles className="w-8 h-8 mx-auto mb-2 text-[#F26522]/50" />
                      No students found. Add your first student to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md border-0 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F26522] to-[#E55A1A] flex items-center justify-center mx-auto mb-2">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-[#1A1A1A] text-center">
              Add New Student
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Create a new student account with auto-generated credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm text-gray-700 mb-1 block font-medium">First Name</Label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                className="border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1 block font-medium">Last Name</Label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
                className="border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[#F26522] to-[#E55A1A] hover:from-[#E55A1A] hover:to-[#CC4D14] text-white shadow-sm hover:shadow-md transition-all"
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
        <DialogContent className="max-w-md text-center border-0 shadow-2xl">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F26522] to-[#E55A1A] flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-[#1A1A1A]">
              Student Account Created!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Save these credentials securely and share them with the student.
            </DialogDescription>
          </DialogHeader>
          {generatedCreds && (
            <div className="bg-gradient-to-br from-[#FFF5F0] to-[#FFE5D9] rounded-xl p-4 space-y-3 text-left my-4 border border-[#FFCCB3]">
              <div className="pb-3 border-b border-[#FFCCB3]/50">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Username
                </p>
                <p className="text-lg font-mono font-bold text-[#1A1A1A] bg-white px-3 py-2 rounded-lg border border-[#FFCCB3]">
                  {generatedCreds.username}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Temporary Password
                </p>
                <p className="text-lg font-mono font-bold text-[#F26522] bg-white px-3 py-2 rounded-lg border border-[#FFCCB3]">
                  {generatedCreds.password}
                </p>
              </div>
            </div>
          )}
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            ⚠️ Student should change password on first login
          </p>
          <Button
            onClick={() => setShowCredentialsModal(false)}
            className="w-full bg-gradient-to-r from-[#F26522] to-[#E55A1A] hover:from-[#E55A1A] hover:to-[#CC4D14] text-white font-semibold"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="border-0 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#1A1A1A]">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Reset System
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              This will permanently clear all data including students, bookings,
              and schedules. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onResetData();
                setShowResetDialog(false);
              }}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md border-0 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F26522] to-[#E55A1A] flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-[#1A1A1A] text-center">
              Change Admin Password
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Set a secure password for your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm text-gray-700 mb-1 block font-medium">
                New Password (min 6 characters)
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                className="border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors"
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1 block font-medium">
                Confirm Password
              </Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
                className="border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1 border-gray-300 hover:bg-gray-50"
              onClick={() => {
                setShowPasswordModal(false);
                setNewPassword('');
                setConfirmPassword('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-[#F26522] to-[#E55A1A] hover:from-[#E55A1A] hover:to-[#CC4D14] text-white shadow-sm hover:shadow-md transition-all"
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
