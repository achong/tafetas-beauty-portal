import { useState, useMemo } from 'react';
import {
  Users,
  Scissors,
  CalendarCheck,
  Trash2,
  Plus,
  AlertTriangle,
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

Lock
import {
  Users, Scissors, CalendarCheck, Trash2, Plus, AlertTriangle, Lock // ✅ Add Lock
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;        // ✅ Add this
  users: User[];
  services: Service[];
  bookings: Booking[];
  onAddStudent: (student: User) => void;
  onRemoveStudent: (uid: string) => void;
  onResetData: () => void;
  onUpdateUser: (user: User) => void; // ✅ Add this
}

export function AdminDashboard({
  currentUser, // ✅ Add this
  users,
  services,
  bookings,
  onAddStudent,
  onRemoveStudent,
  onResetData,
  onUpdateUser, // ✅ Add this
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

  const [showPasswordModal, setShowPasswordModal] = useState(false);
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

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

  const students = useMemo(
    () => users.filter((u) => u.role === 'student'),
    [users]
  );

  const stats = [
    {
      label: 'Total Students',
      value: students.length,
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Total Services',
      value: services.length,
      icon: Scissors,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Total Bookings',
      value: bookings.length,
      icon: CalendarCheck,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ];

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
  <h2 className="text-2xl font-bold text-gray-900">Admin Dashboard</h2>
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowPasswordModal(true)}
      className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
    >
      <Lock className="w-4 h-4 mr-1.5" />
      Change Password
    </Button>
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowResetDialog(true)}
      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
    >
      <AlertTriangle className="w-4 h-4 mr-1.5" />
      Reset System
    </Button>
  </div>
</div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.label}
              </CardTitle>
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
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
      <Card className="border-gray-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Student Management
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setShowAddModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Student
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Active Services</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((s) => (
                    <TableRow key={s.uid}>
                      <TableCell className="font-medium text-gray-900">
                        {s.name}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-gray-500">
                        {s.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="bg-purple-100 text-purple-700 hover:bg-purple-100"
                        >
                          {(s.services_active || []).length} active
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(s.uid)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
                      className="text-center py-8 text-gray-400"
                    >
                      No students found.
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Add New Student
            </DialogTitle>
            <DialogDescription>
              Create a new student account with auto-generated credentials.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label className="text-sm text-gray-700 mb-1 block">First Name</Label>
              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              />
            </div>
            <div>
              <Label className="text-sm text-gray-700 mb-1 block">Last Name</Label>
              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()}
              />
            </div>
          </div>
          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
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
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Users className="w-7 h-7 text-green-600" />
            </div>
            <DialogTitle className="text-lg font-bold text-gray-900">
              Student Account Created!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Save these credentials securely and share them with the student.
            </DialogDescription>
          </DialogHeader>
          {generatedCreds && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-left my-4">
              <div>
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Username
                </p>
                <p className="text-lg font-mono font-bold text-gray-900">
                  {generatedCreds.username}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider">
                  Temporary Password
                </p>
                <p className="text-lg font-mono font-bold text-red-600">
                  {generatedCreds.password}
                </p>
              </div>
            </div>
          )}
          <Button
            onClick={() => setShowCredentialsModal(false)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Reset System
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently clear all data including students, bookings,
              and schedules. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
  <DialogContent className="max-w-md">
    <DialogHeader>
      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
        <Lock className="w-6 h-6 text-blue-600" />
      </div>
      <DialogTitle className="text-lg font-bold text-gray-900 text-center">
        Change Admin Password
      </DialogTitle>
      <DialogDescription className="text-center text-gray-500">
        Set a secure password for your account.
      </DialogDescription>
    </DialogHeader>
    <div className="space-y-4 pt-2">
      <div>
        <Label className="text-sm text-gray-700 mb-1 block">New Password (min 6 characters)</Label>
        <Input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="New Password"
          onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
        />
      </div>
      <div>
        <Label className="text-sm text-gray-700 mb-1 block">Confirm Password</Label>
        <Input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()}
        />
      </div>
    </div>
    <div className="flex gap-3 mt-2">
      <Button variant="outline" className="flex-1" onClick={() => { setShowPasswordModal(false); setNewPassword(''); setConfirmPassword(''); }}>
        Cancel
      </Button>
      <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleChangePassword}>
        Update Password
      </Button>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
}
