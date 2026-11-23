// app/src/sections/AdminDashboard.tsx
import { useState, useMemo } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import {
  Users,
  Scissors,
  CalendarCheck,
  Trash2,
  Plus,
  AlertTriangle,
  Lock,
  UserPlus,
  Upload,
  Loader2,
  FileText,
  CheckCircle,
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
import Papa, { ParseResult } from 'papaparse';
import { FormRenderer } from '@/components/FormRenderer';
import { SERVICE_FORMS } from '@/data/forms';
import type { User, Service, Booking, Form, FormSubmission, FormResponse } from '@/types';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  services: Service[];
  bookings: Booking[];
  onAddStudent: (student: User) => Promise<void>;
  onAddAdmin: (admin: User) => Promise<void>;
  onRemoveStudent: (uid: string) => void;
  onResetData: () => void;
  onUpdateUser: (user: User) => void;
  onBulkAddStudents: (students: {firstName: string, lastName: string, email: string, password?: string}[]) => Promise<{success: number, failed: number, errors: string[]}>;
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
  onBulkAddStudents,
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
  const [generatedCreds, setGeneratedCreds] = useState<{ username: string; password: string } | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, status: '' });
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkResults, setBulkResults] = useState<{success: number, failed: number, errors: string[]} | null>(null);

  // ✅ NEW: Assessor Grading State
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [gradingBooking, setGradingBooking] = useState<Booking | null>(null);
  const [gradingForm, setGradingForm] = useState<Form | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<FormSubmission | null>(null);

  const students = useMemo(() => users.filter((u) => u.role === 'student'), [users]);
  const admins = useMemo(() => users.filter((u) => u.role === 'admin'), [users]);

  const stats = [
    { label: 'Total Students', value: students.length, icon: Users },
    { label: 'Total Services', value: services.length, icon: Scissors },
    { label: 'Total Bookings', value: bookings.length, icon: CalendarCheck },
  ];

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) { alert('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { alert('Passwords do not match'); return; }
    onUpdateUser({ ...currentUser, password: newPassword, isTemp: false });
    setShowPasswordModal(false);
    setNewPassword(''); setConfirmPassword('');
    alert('Password updated successfully');
  };

  const handleAddStudent = async () => {
    const f = firstName.trim();
    const l = lastName.trim();
    const email = studentEmail.trim().toLowerCase();
    if (!f || !l) { alert('Please enter both First and Last Name.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) { alert('Please enter a valid email address'); return; }

    const password = Math.random().toString(36).slice(-8);
    const student: User = {
      uid: `st_${Date.now()}`, role: 'student', name: `${f} ${l}`, username: email, email, password, isTemp: true, services_active: [],
    };

    try {
      await onAddStudent(student);
      setGeneratedCreds({ username: email, password });
      setFirstName(''); setLastName(''); setStudentEmail('');
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
    if (!firstName.trim() || !lastName.trim()) { alert('Please enter both First and Last Name.'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) { alert('Please enter a valid email address'); return; }
    if (!password || password.length < 6) { alert('Password must be at least 6 characters'); return; }

    const admin: User = {
      uid: `admin_${Date.now()}`, role: 'admin', name, username: email, email, password, isTemp: false, services_active: [],
    };

    onAddAdmin(admin);
    setGeneratedCreds({ username: email, password });
    setFirstName(''); setLastName(''); setAdminEmail(''); setAdminPassword('');
    setShowAddAdminModal(false);
    setShowCredentialsModal(true);
  };

  const handleResetStudentPassword = async (studentEmail: string) => {
    if (!confirm(`Send password reset email to ${studentEmail}?`)) return;
    try {
      await sendPasswordResetEmail(auth, studentEmail);
      alert(`Password reset email sent to ${studentEmail}`);
    } catch (error: any) {
      console.error('Error sending reset email:', error);
      alert('Failed to send password reset email.');
    }
  };

  const handleRemove = (uid: string) => {
    onRemoveStudent(uid);
  };

  const handleBulkUpload = async () => {
    if (!bulkFile) return alert('Please select a CSV file first.');
    setIsBulkUploading(true);
    setBulkProgress({ current: 0, total: 0, status: 'Parsing CSV...' });
    setBulkResults(null);

    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: ParseResult<any>) => {
        const studentsData = results.data as any[];
        if (studentsData.length === 0) {
          alert('CSV file is empty or invalid.');
          setIsBulkUploading(false);
          return;
        }

        setBulkProgress({ current: 0, total: studentsData.length, status: 'Starting upload...' });
        const formattedStudents = studentsData.map((row: any) => ({
          firstName: row.firstName?.trim() || '',
          lastName: row.lastName?.trim() || '',
          email: row.email?.trim().toLowerCase() || '',
          password: row.password?.trim() || undefined
        })).filter((s: any) => s.email);

        setBulkProgress(prev => ({ ...prev, total: formattedStudents.length }));

        try {
          const results = await onBulkAddStudents(formattedStudents);
          setBulkResults(results);
          setBulkProgress(prev => ({ ...prev, current: formattedStudents.length, status: 'Complete!' }));
        } catch (error) {
          console.error('Bulk upload failed:', error);
          alert('Bulk upload failed.');
        } finally {
          setIsBulkUploading(false);
        }
      },
      error: (err: Error) => {
        alert('Error parsing CSV: ' + err.message);
        setIsBulkUploading(false);
      }
    });
  };

  // ✅ NEW: Assessor Grading Functions
  const handleOpenGrading = async (booking: Booking) => {
    setGradingBooking(booking);
    const form = SERVICE_FORMS.find(f => f.service_id === booking.service?.service_id || f.service_id === 'all');
    setGradingForm(form || null);

    const q = query(collection(db, 'form_submissions'), where('booking_id', '==', booking.id.toString()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const submissionData = querySnapshot.docs[0].data() as FormSubmission;
      submissionData.id = querySnapshot.docs[0].id;
      setGradingSubmission(submissionData);
    } else {
      setGradingSubmission(null);
    }
    setShowGradingModal(true);
  };

  const handleGradingSubmit = async (responses: FormResponse[]) => {
    if (!gradingSubmission?.id) {
      alert('No form submission found for this booking yet.');
      return;
    }
    try {
      await updateDoc(doc(db, 'form_submissions', gradingSubmission.id), {
        assessor_responses: responses
      });
      alert('Assessor grading saved successfully!');
      setShowGradingModal(false);
    } catch (error) {
      console.error('Error saving grading:', error);
      alert('Error saving grading.');
    }
  };

  return (
    <div className="fade-in space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
          <p className="text-muted-foreground text-sm mt-1">Manage students, admins, bookings and system settings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)} className="border-border text-foreground hover:bg-accent hover:text-accent-foreground">
            <Lock className="w-4 h-4 mr-1.5" /> Change Password
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowResetDialog(true)} className="border-red-900/50 text-red-500 hover:bg-red-950/50 hover:text-red-400">
            <AlertTriangle className="w-4 h-4 mr-1.5" /> Reset System
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
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

      {/* ✅ NEW: Assessor Grading Section */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" /> Assessor Grading
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Client</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Service</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Student</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Date & Time</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Grading Status</TableHead>
                  <TableHead className="text-right text-muted-foreground font-medium">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.length > 0 ? bookings.map((b) => {
                  // In a real app, you'd check if assessor_responses exists for this booking
                  const isGraded = false; // Placeholder logic
                  return (
                    <TableRow key={b.id} className="border-border hover:bg-accent/50">
                      <TableCell className="font-medium text-foreground">{b.client_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.service?.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{users.find(u => u.uid === b.student_id)?.name || 'Unknown'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{b.date} at {b.time}</TableCell>
                      <TableCell>
                        <Badge variant={isGraded ? "default" : "outline"} className={isGraded ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}>
                          {isGraded ? "Graded" : "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => handleOpenGrading(b)} className="border-primary/50 text-primary hover:bg-primary/10">
                          <FileText className="w-4 h-4 mr-1.5" /> Grade
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                }) : (
                  <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No bookings found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Admin Management */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between border-b border-border bg-card">
          <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Admin Management
          </CardTitle>
          <Button size="sm" onClick={() => setShowAddAdminModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Plus className="w-4 h-4 mr-1.5" /> Add Admin
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
                {admins.length > 0 ? admins.map((admin) => (
                  <TableRow key={admin.uid} className="border-border hover:bg-accent/50">
                    <TableCell className="font-medium text-foreground">{admin.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{admin.email}</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge></TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No admins found.</TableCell></TableRow>
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
            <Users className="w-5 h-5 text-primary" /> Student Management
          </CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowBulkModal(true)} className="border-primary/50 text-primary hover:bg-primary/10">
              <Upload className="w-4 h-4 mr-1.5" /> Bulk Upload CSV
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4 mr-1.5" /> Add Student
            </Button>
          </div>
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
                {students.length > 0 ? students.map((s) => (
                  <TableRow key={s.uid} className="border-border hover:bg-accent/50">
                    <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1">{s.email || s.username}</TableCell>
                    <TableCell><Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">{(s.services_active || []).length} active</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleResetStudentPassword(s.email || s.username)} className="border-blue-900/50 text-blue-500 hover:bg-blue-950/50 hover:text-blue-400" title="Send password reset email">
                          <Lock className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRemove(s.uid)} className="text-red-500 hover:text-red-400 hover:bg-red-950/50" title="Delete student">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
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
            <DialogTitle className="text-lg font-bold text-foreground">Add New Admin</DialogTitle>
            <DialogDescription className="text-muted-foreground">Create a new admin account with custom credentials.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label className="text-sm text-foreground mb-1 block">First Name</Label><Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="bg-background border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()} /></div>
            <div><Label className="text-sm text-foreground mb-1 block">Last Name</Label><Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="bg-background border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()} /></div>
            <div><Label className="text-sm text-foreground mb-1 block">Email Address</Label><Input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} placeholder="admin@example.com" className="bg-background border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()} /></div>
            <div><Label className="text-sm text-foreground mb-1 block">Password (min 6 characters)</Label><Input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Enter password" className="bg-background border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === 'Enter' && handleAddAdmin()} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 border-border text-foreground hover:bg-accent" onClick={() => setShowAddAdminModal(false)}>Cancel</Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleAddAdmin}>Create Admin</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Student Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Add New Student</DialogTitle>
            <DialogDescription className="text-muted-foreground">Create a new student account. They will log in with their email address.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label className="text-sm text-foreground mb-1 block">First Name</Label><Input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First Name" className="bg-background border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()} /></div>
            <div><Label className="text-sm text-foreground mb-1 block">Last Name</Label><Input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last Name" className="bg-background border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()} /></div>
            <div><Label className="text-sm text-foreground mb-1 block">Email Address</Label><Input type="email" value={studentEmail} onChange={(e) => setStudentEmail(e.target.value)} placeholder="student@example.com" className="bg-background border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === 'Enter' && handleAddStudent()} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 border-border text-foreground hover:bg-accent" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleAddStudent}>Create Account</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credentials Modal */}
      <Dialog open={showCredentialsModal} onOpenChange={setShowCredentialsModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground text-center">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">Account Created!</DialogTitle>
            <DialogDescription className="text-muted-foreground">Save these credentials securely and share them with the user.</DialogDescription>
          </DialogHeader>
          {generatedCreds && (
            <div className="bg-muted/50 rounded-xl p-4 space-y-3 text-left my-4 border border-border">
              <div className="pb-3 border-b border-border">
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Login Email</p>
                <p className="text-lg font-mono font-bold text-foreground bg-background px-3 py-2 rounded-lg border border-border mt-1">{generatedCreds.username}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Password</p>
                <p className="text-lg font-mono font-bold text-primary bg-background px-3 py-2 rounded-lg border border-border mt-1">{generatedCreds.password}</p>
              </div>
            </div>
          )}
          <Button onClick={() => setShowCredentialsModal(false)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold">Done</Button>
        </DialogContent>
      </Dialog>

      {/* Reset Confirmation */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-card border-border text-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground"><AlertTriangle className="w-5 h-5 text-red-500" /> Reset System</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">This will permanently clear all data including students, bookings, and schedules. This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-border text-foreground hover:bg-accent">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { onResetData(); setShowResetDialog(false); }} className="bg-red-600 hover:bg-red-700 text-white">Reset Everything</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground text-center">Change Admin Password</DialogTitle>
            <DialogDescription className="text-center text-muted-foreground">Set a secure password for your account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label className="text-sm text-foreground mb-1 block">New Password (min 6 characters)</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New Password" className="bg-background border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()} /></div>
            <div><Label className="text-sm text-foreground mb-1 block">Confirm Password</Label><Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" className="bg-background border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === 'Enter' && handleChangePassword()} /></div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 border-border text-foreground hover:bg-accent" onClick={() => { setShowPasswordModal(false); setNewPassword(''); setConfirmPassword(''); }}>Cancel</Button>
            <Button className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleChangePassword}>Update Password</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Upload Modal */}
      <Dialog open={showBulkModal} onOpenChange={setShowBulkModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <FileText className="w-5 h-5 text-primary" /> Bulk Upload Students
            </DialogTitle>
            <DialogDescription>
              Upload a CSV file with columns: <strong>firstName, lastName, email, password</strong> (password is optional, a secure one will be generated if omitted).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input type="file" accept=".csv" onChange={(e) => setBulkFile(e.target.files?.[0] || null)} disabled={isBulkUploading} className="cursor-pointer" />
            {bulkProgress.total > 0 && (
              <div className="space-y-2 bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between text-sm font-medium">
                  <span>{bulkProgress.status}</span>
                  <span>{bulkProgress.current} / {bulkProgress.total}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div className="bg-primary h-3 rounded-full transition-all duration-500" style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}></div>
                </div>
              </div>
            )}
            {bulkResults && !isBulkUploading && (
              <div className={`p-3 border rounded-lg text-sm ${bulkResults.failed === 0 ? 'bg-green-500/10 border-green-500/20 text-green-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'}`}>
                ✅ Successfully created {bulkResults.success} students. Password setup emails have been sent!
                {bulkResults.failed > 0 && <><br/>⚠️ {bulkResults.failed} failed. Check console for details.</>}
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setShowBulkModal(false); setBulkFile(null); setBulkProgress({ current: 0, total: 0, status: '' }); setBulkResults(null); }} disabled={isBulkUploading} className="flex-1">Cancel</Button>
            <Button onClick={handleBulkUpload} disabled={!bulkFile || isBulkUploading} className="flex-1 bg-primary hover:bg-primary/90">
              {isBulkUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : 'Start Upload'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ✅ NEW: Assessor Grading Modal */}
      <Dialog open={showGradingModal} onOpenChange={setShowGradingModal}>
        <DialogContent className="sm:max-w-3xl bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Assessor Grading: {gradingBooking?.client_name} - {gradingBooking?.service?.name}
            </DialogTitle>
            <DialogDescription>
              {gradingBooking?.date} at {gradingBooking?.time} | Student: {users.find(u => u.uid === gradingBooking?.student_id)?.name}
            </DialogDescription>
          </DialogHeader>
          {gradingForm && gradingSubmission ? (
            <div className="py-4">
              <FormRenderer 
                form={gradingForm} 
                formSection="assessor"
                initialValues={
                  (gradingSubmission.assessor_responses || []).reduce((acc: any, curr: any) => ({...acc, [curr.field_id]: curr.value}), {})
                }
                onSubmit={handleGradingSubmit} 
                onCancel={() => setShowGradingModal(false)} 
              />
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p>No form submission found for this booking yet. The student must complete their sections first.</p>
              <Button variant="outline" className="mt-4" onClick={() => setShowGradingModal(false)}>Close</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}