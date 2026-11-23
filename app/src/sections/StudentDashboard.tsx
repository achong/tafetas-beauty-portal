// app/src/sections/StudentDashboard.tsx
import { useState, useMemo, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  AlertTriangle,
  Sparkles,
  Check,
  X,
  Calendar,
  XCircle,
  Save,
  RotateCcw,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, getDocs, updateDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FormRenderer } from '@/components/FormRenderer';
import { SERVICE_FORMS } from '@/data/forms';
import type { User, Service, ScheduleEntry, Booking, Form, FormResponse, FormSubmission } from '@/types';
import { CLINIC_TIME_SLOTS } from '@/hooks/useClinicData';

interface StudentDashboardProps {
  currentUser: User;
  services: Service[];
  schedule: ScheduleEntry[];
  bookings: Booking[];
  categories: Record<string, { name: string; price: number }[]>;
  onUpdateUser: (user: User) => void;
  onUpdateSchedule: (schedule: ScheduleEntry[]) => void;
}

export function StudentDashboard({
  currentUser,
  services,
  schedule,
  bookings,
  categories,
  onUpdateUser,
  onUpdateSchedule,
}: StudentDashboardProps) {
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [draftSchedule, setDraftSchedule] = useState<ScheduleEntry[] | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // ✅ NEW: Form Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeFormSection, setActiveFormSection] = useState<'therapist_pre' | 'therapist_post'>('therapist_pre');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [activeForm, setActiveForm] = useState<Form | null>(null);
  const [existingSubmission, setExistingSubmission] = useState<FormSubmission | null>(null);

  const categoryList = useMemo(() => Object.keys(categories), [categories]);
  const monthName = useMemo(() => new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' }), [calendarYear, calendarMonth]);
  const daysInMonth = useMemo(() => new Date(calendarYear, calendarMonth + 1, 0).getDate(), [calendarYear, calendarMonth]);
  const startDay = useMemo(() => new Date(calendarYear, calendarMonth, 1).getDay(), [calendarYear, calendarMonth]);

  const activeSchedule = draftSchedule || schedule;
  const scheduleForUser = useMemo(() => activeSchedule.filter((s) => s.student_id === currentUser.uid), [activeSchedule, currentUser.uid]);
  const bookingsForUser = useMemo(() => bookings.filter((b) => b.student_id === currentUser.uid), [bookings, currentUser.uid]);

  const hasUnsavedChanges = useMemo(() => {
    if (!draftSchedule) return false;
    return JSON.stringify(draftSchedule) !== JSON.stringify(schedule);
  }, [draftSchedule, schedule]);

  const handleCancelBooking = async (booking: Booking) => {
    if (!confirm(`Are you sure you want to cancel the appointment with ${booking.client_name} on ${booking.date} at ${booking.time}?`)) return;
    try {
      if (booking.id) {
        await updateDoc(doc(db, 'bookings', booking.id.toString()), { status: 'cancelled_by_student' });
      }
      alert('Appointment cancelled.');
      window.location.reload();
    } catch (error) {
      alert('Failed to cancel appointment.');
    }
  };

  const changeMonth = (delta: number) => {
    let newMonth = calendarMonth + delta;
    let newYear = calendarYear;
    if (newMonth > 11) { newMonth = 0; newYear++; } 
    else if (newMonth < 0) { newMonth = 11; newYear--; }
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const toggleService = (serviceId: string, active: boolean) => {
    const current = currentUser.services_active || [];
    let updated: string[];
    if (active) { updated = current.includes(serviceId) ? current : [...current, serviceId]; } 
    else { updated = current.filter((id) => id !== serviceId); }
    onUpdateUser({ ...currentUser, services_active: updated });
  };

  const getDateStatus = (ds: string) => {
    const daySchedule = scheduleForUser.filter((s) => s.date === ds);
    const hasOpen = daySchedule.some((s) => s.is_open);
    const dayBookings = bookingsForUser.filter((b) => b.date === ds);
    return { hasOpen, bookingCount: dayBookings.length };
  };

  const handleDateClick = (ds: string) => setSelectedDate(ds);

  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return CLINIC_TIME_SLOTS.map((t) => {
      const entry = scheduleForUser.find((s) => s.date === selectedDate && s.time === t);
      const isBooked = bookingsForUser.some((b) => b.date === selectedDate && b.time === t);
      return { time: t, isOpen: entry?.is_open ?? false, isBooked };
    });
  }, [selectedDate, scheduleForUser, bookingsForUser]);

  const toggleSlot = (time: string) => {
    if (!selectedDate) return;
    const currentSchedule = draftSchedule || [...schedule];
    const all = [...currentSchedule];
    const idx = all.findIndex((s) => s.student_id === currentUser.uid && s.date === selectedDate && s.time === time);
    if (idx >= 0) { all[idx] = { ...all[idx], is_open: !all[idx].is_open }; } 
    else { all.push({ student_id: currentUser.uid, date: selectedDate, time, is_open: true }); }
    setDraftSchedule(all);
  };

  const toggleAllSlots = (mode: 'open' | 'closed') => {
    if (!selectedDate) return;
    const currentSchedule = draftSchedule || [...schedule];
    const all = [...currentSchedule];
    const bookedTimes = bookingsForUser.filter((b) => b.date === selectedDate).map((b) => b.time);
    CLINIC_TIME_SLOTS.forEach((t) => {
      if (bookedTimes.includes(t)) return;
      const idx = all.findIndex((s) => s.student_id === currentUser.uid && s.date === selectedDate && s.time === t);
      if (mode === 'open') {
        if (idx < 0) { all.push({ student_id: currentUser.uid, date: selectedDate, time: t, is_open: true }); } 
        else { all[idx] = { ...all[idx], is_open: true }; }
      } else { if (idx >= 0) { all[idx] = { ...all[idx], is_open: false }; } }
    });
    setDraftSchedule(all);
  };

  const handleSaveSchedule = async () => {
    if (!draftSchedule) return;
    try {
      await onUpdateSchedule(draftSchedule);
      setDraftSchedule(null);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    } catch (error) { alert('Failed to save schedule.'); }
  };

  const handleDiscardChanges = () => { if (confirm('Discard all unsaved changes?')) setDraftSchedule(null); };

  const handleChangePassword = () => {
    if (!newPassword || newPassword.length < 6) { alert('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { alert('Passwords do not match'); return; }
    onUpdateUser({ ...currentUser, password: newPassword, isTemp: false });
    setShowPasswordModal(false);
    setNewPassword(''); setConfirmPassword('');
    alert('Password updated successfully');
  };

  // ✅ NEW: Open Form Modal
  const handleOpenForm = async (booking: Booking, section: 'therapist_pre' | 'therapist_post') => {
    setActiveBooking(booking);
    setActiveFormSection(section);
    
    // Find the form for this service
    const form = SERVICE_FORMS.find(f => f.service_id === booking.service?.service_id || f.service_id === 'all');
    setActiveForm(form || null);

    // Fetch existing submission from Firestore
    const q = query(collection(db, 'form_submissions'), where('booking_id', '==', booking.id.toString()));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const submissionData = querySnapshot.docs[0].data() as FormSubmission;
      submissionData.id = querySnapshot.docs[0].id;
      setExistingSubmission(submissionData);
    } else {
      setExistingSubmission(null);
    }
    
    setShowFormModal(true);
  };

  // ✅ NEW: Save Form Section
  const handleFormSubmit = async (responses: FormResponse[]) => {
    if (!activeForm || !activeBooking || !existingSubmission?.id) return;

    try {
      const updateData: any = {};
      if (activeFormSection === 'therapist_pre') updateData.therapist_pre_responses = responses;
      if (activeFormSection === 'therapist_post') updateData.therapist_post_responses = responses;

      await updateDoc(doc(db, 'form_submissions', existingSubmission.id), updateData);
      alert(`${activeFormSection === 'therapist_pre' ? 'Pre-Service' : 'Post-Service'} plan saved successfully!`);
      setShowFormModal(false);
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving form. Please try again.');
    }
  };

  const upcomingBookings = bookingsForUser.filter(
    (b) => b.status !== 'cancelled_by_student' && b.date >= new Date().toISOString().split('T')[0]
  );

  return (
    <div className="fade-in space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Welcome, {currentUser.name}!</h2>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your services, availability, and appointments</p>
        </div>
        {currentUser.isTemp && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 px-3 py-1.5 cursor-pointer hover:bg-amber-500/20" onClick={() => setShowPasswordModal(true)}>
            <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Temporary Password — Change Now
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Management */}
        <Card className="bg-card border-border text-card-foreground">
          <CardHeader className="border-b border-border bg-card"><CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Manage Active Services</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {categoryList.map((cat) => (
                <div key={cat}>
                  <h4 className="text-sm font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1.5 rounded-lg mb-2">{cat}</h4>
                  <div className="space-y-1">
                    {services.filter((s) => s.category === cat).map((s) => {
                      const isActive = (currentUser.services_active || []).includes(s.service_id);
                      return (
                        <label key={s.service_id} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${isActive ? 'border-primary/50 bg-primary/10 text-foreground' : 'border-border bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>
                          <div><span className="text-sm font-medium">{s.name}</span><span className="text-xs text-primary ml-2 font-semibold">${s.price.toFixed(2)}</span></div>
                          <Switch checked={isActive} onCheckedChange={(checked) => toggleService(s.service_id, checked)} className="data-[state=checked]:bg-primary" />
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Calendar & Availability */}
        <Card className="bg-card border-border text-card-foreground">
          <CardHeader className="border-b border-border bg-card"><CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2"><Lock className="w-5 h-5 text-primary" /> Set Availability</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="icon" onClick={() => changeMonth(-1)} className="hover:bg-accent text-foreground"><ChevronLeft className="w-5 h-5" /></Button>
              <span className="font-semibold text-foreground">{monthName}</span>
              <Button variant="ghost" size="icon" onClick={() => changeMonth(1)} className="hover:bg-accent text-foreground"><ChevronRight className="w-5 h-5" /></Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-1">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (<div key={d} className="text-center text-xs font-semibold text-muted-foreground py-1">{d}</div>))}</div>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => (<div key={`empty-${i}`} />))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const ds = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const { hasOpen, bookingCount } = getDateStatus(ds);
                const isSelected = selectedDate === ds;
                const isToday = ds === new Date().toISOString().split('T')[0];
                return (
                  <button key={day} onClick={() => handleDateClick(ds)} className={`relative p-2 border text-center rounded-lg text-sm transition-all hover:scale-105 ${isSelected ? 'bg-primary text-primary-foreground border-primary shadow-md' : isToday ? 'border-primary bg-primary/10 text-primary font-bold' : hasOpen ? 'bg-accent/50 border-primary/30 text-foreground font-medium' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'}`}>
                    {day}
                    {bookingCount > 0 && (<span className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${isSelected ? 'bg-primary-foreground' : 'bg-primary'}`} />)}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-accent/50 border border-primary/30" /><span>Available</span></div>
              <div className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-primary/10 border border-primary" /><span>Today</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-primary" /><span>Has Booking</span></div>
            </div>
            {selectedDate && (
              <div className="mt-6 border-t border-border pt-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Slots for <span className="text-primary">{selectedDate}</span></p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="text-xs h-7 border-green-500/30 text-green-500 hover:bg-green-500/10" onClick={() => toggleAllSlots('open')}><Check className="w-3 h-3 mr-1" /> Open All</Button>
                    <Button variant="outline" size="sm" className="text-xs h-7 border-red-500/30 text-red-500 hover:bg-red-500/10" onClick={() => toggleAllSlots('closed')}><X className="w-3 h-3 mr-1" /> Close All</Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedDateSlots.map(({ time, isOpen, isBooked }) => (
                    <button key={time} onClick={() => !isBooked && toggleSlot(time)} disabled={isBooked} className={`p-2 border rounded-lg text-xs font-semibold transition-all ${isBooked ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 cursor-not-allowed opacity-70' : isOpen ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/90 shadow-sm' : 'bg-muted/30 border-border text-muted-foreground hover:bg-muted/50'}`}>
                      {time}{isBooked && <span className="block text-[10px] opacity-80 mt-0.5">Booked</span>}{!isBooked && <span className="block text-[10px] opacity-80 mt-0.5">{isOpen ? 'Open' : 'Closed'}</span>}
                    </button>
                  ))}
                </div>
                {hasUnsavedChanges && (
                  <div className="mt-6 space-y-3 animate-in fade-in slide-in-from-bottom-2">
                    <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" /><p className="text-sm text-amber-500 font-medium">You have unsaved changes</p></div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveSchedule} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"><Save className="w-4 h-4 mr-2" /> Save Schedule</Button>
                      <Button onClick={handleDiscardChanges} variant="outline" className="border-border text-foreground hover:bg-accent"><RotateCcw className="w-4 h-4 mr-2" /> Discard</Button>
                    </div>
                  </div>
                )}
                {showSaveSuccess && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg animate-in fade-in slide-in-from-bottom-2"><div className="flex items-center gap-2 text-green-500"><Check className="w-4 h-4" /><p className="text-sm font-medium">Schedule saved successfully!</p></div></div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ✅ UPDATED: Upcoming Appointments with Form Buttons */}
      <Card className="bg-card border-border text-card-foreground">
        <CardHeader className="border-b border-border bg-card"><CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> Upcoming Appointments</CardTitle></CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <p className="text-muted-foreground text-sm py-8 text-center">You have no upcoming appointments scheduled.</p>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking) => (
                <div key={booking.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-xl bg-muted/20 gap-4">
                  <div>
                    <p className="font-semibold text-foreground text-lg">{booking.client_name}</p>
                    <p className="text-sm text-muted-foreground"><span className="font-medium text-primary">{booking.service?.name || 'Salon Service'}</span> {' • '}{booking.date} at {booking.time}</p>
                    <p className="text-xs text-muted-foreground mt-1">Contact: {booking.client_email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenForm(booking, 'therapist_pre')} className="border-blue-500/30 text-blue-500 hover:bg-blue-500/10">
                      <FileText className="w-4 h-4 mr-2" /> Pre-Service Plan
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenForm(booking, 'therapist_post')} className="border-green-500/30 text-green-500 hover:bg-green-500/10">
                      <FileText className="w-4 h-4 mr-2" /> Post-Service Eval
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleCancelBooking(booking)} className="bg-red-600 hover:bg-red-700">
                      <XCircle className="w-4 h-4 mr-2" /> Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-md bg-card border-border text-foreground">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-2"><Lock className="w-6 h-6 text-primary" /></div>
            <DialogTitle className="text-lg font-bold text-foreground text-center">Change Password</DialogTitle>
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

      {/* ✅ NEW: Therapist Form Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-3xl bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {activeBooking?.client_name} - {activeBooking?.service?.name}
            </DialogTitle>
            <DialogDescription>
              {activeBooking?.date} at {activeBooking?.time}
            </DialogDescription>
          </DialogHeader>
          {activeForm && (
            <div className="py-4">
              <FormRenderer 
                form={activeForm} 
                formSection={activeFormSection}
                initialValues={
                  activeFormSection === 'therapist_pre' 
                    ? (existingSubmission?.therapist_pre_responses || []).reduce((acc: any, curr: any) => ({...acc, [curr.field_id]: curr.value}), {})
                    : (existingSubmission?.therapist_post_responses || []).reduce((acc: any, curr: any) => ({...acc, [curr.field_id]: curr.value}), {})
                }
                onSubmit={handleFormSubmit} 
                onCancel={() => setShowFormModal(false)} 
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}