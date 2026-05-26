import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  AlertTriangle,
  Sparkles,
  Check,
  X,
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
import type { User, Service, ScheduleEntry, Booking } from '@/types';
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

  const categoryList = useMemo(() => Object.keys(categories), [categories]);

  const monthName = useMemo(
    () => new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long', year: 'numeric' }),
    [calendarYear, calendarMonth]
  );

  const daysInMonth = useMemo(
    () => new Date(calendarYear, calendarMonth + 1, 0).getDate(),
    [calendarYear, calendarMonth]
  );

  const startDay = useMemo(
    () => new Date(calendarYear, calendarMonth, 1).getDay(),
    [calendarYear, calendarMonth]
  );

  const scheduleForUser = useMemo(
    () => schedule.filter((s) => s.student_id === currentUser.uid),
    [schedule, currentUser.uid]
  );

  const bookingsForUser = useMemo(
    () => bookings.filter((b) => b.student_id === currentUser.uid),
    [bookings, currentUser.uid]
  );

  const changeMonth = (delta: number) => {
    let newMonth = calendarMonth + delta;
    let newYear = calendarYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    setCalendarMonth(newMonth);
    setCalendarYear(newYear);
  };

  const toggleService = (serviceId: string, active: boolean) => {
    const current = currentUser.services_active || [];
    let updated: string[];
    if (active) {
      updated = current.includes(serviceId) ? current : [...current, serviceId];
    } else {
      updated = current.filter((id) => id !== serviceId);
    }
    onUpdateUser({ ...currentUser, services_active: updated });
  };

  const getDateStatus = (ds: string) => {
    const daySchedule = scheduleForUser.filter((s) => s.date === ds);
    const hasOpen = daySchedule.some((s) => s.is_open);
    const dayBookings = bookingsForUser.filter((b) => b.date === ds);
    return { hasOpen, bookingCount: dayBookings.length };
  };

  const handleDateClick = (ds: string) => {
    setSelectedDate(ds);
  };

  const selectedDateSlots = useMemo(() => {
    if (!selectedDate) return [];
    return CLINIC_TIME_SLOTS.map((t) => {
      const entry = scheduleForUser.find(
        (s) => s.date === selectedDate && s.time === t
      );
      const isBooked = bookingsForUser.some(
        (b) => b.date === selectedDate && b.time === t
      );
      return { time: t, isOpen: entry?.is_open ?? false, isBooked };
    });
  }, [selectedDate, scheduleForUser, bookingsForUser]);

  const toggleSlot = (time: string) => {
    if (!selectedDate) return;
    const all = [...schedule];
    const idx = all.findIndex(
      (s) =>
        s.student_id === currentUser.uid &&
        s.date === selectedDate &&
        s.time === time
    );
    if (idx >= 0) {
      all[idx] = { ...all[idx], is_open: !all[idx].is_open };
    } else {
      all.push({
        student_id: currentUser.uid,
        date: selectedDate,
        time,
        is_open: true,
      });
    }
    onUpdateSchedule(all);
  };

  const toggleAllSlots = (mode: 'open' | 'closed') => {
    if (!selectedDate) return;
    const all = [...schedule];
    const bookedTimes = bookingsForUser
      .filter((b) => b.date === selectedDate)
      .map((b) => b.time);

    CLINIC_TIME_SLOTS.forEach((t) => {
      if (bookedTimes.includes(t)) return;
      const idx = all.findIndex(
        (s) =>
          s.student_id === currentUser.uid &&
          s.date === selectedDate &&
          s.time === t
      );
      if (mode === 'open') {
        if (idx < 0) {
          all.push({
            student_id: currentUser.uid,
            date: selectedDate,
            time: t,
            is_open: true,
          });
        } else {
          all[idx] = { ...all[idx], is_open: true };
        }
      } else {
        if (idx >= 0) {
          all[idx] = { ...all[idx], is_open: false };
        }
      }
    });
    onUpdateSchedule(all);
  };

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

  return (
    <div className="fade-in space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1A1A1A]">
            Welcome, {currentUser.name}!
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your services and availability
          </p>
        </div>
        {currentUser.isTemp && (
          <Badge
            variant="outline"
            className="bg-[#FFF5F0] text-[#F26522] border-[#FFCCB3] px-3 py-1.5 cursor-pointer hover:bg-[#FFE5D9] hover:border-[#FF9955] transition-all"
            onClick={() => setShowPasswordModal(true)}
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1" />
            Temporary Password — Change Now
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Management */}
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#FFF5F0] to-white border-b border-[#FFCCB3]">
            <CardTitle className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#F26522]" />
              Manage Active Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {categoryList.map((cat) => (
                <div key={cat}>
                  <h4 className="text-sm font-bold text-[#F26522] bg-[#FFF5F0] border border-[#FFCCB3] px-3 py-1.5 rounded-lg mb-2">
                    {cat}
                  </h4>
                  <div className="space-y-1">
                    {services
                      .filter((s) => s.category === cat)
                      .map((s) => {
                        const isActive = (
                          currentUser.services_active || []
                        ).includes(s.service_id);
                        return (
                          <label
                            key={s.service_id}
                            className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${
                              isActive
                                ? 'border-[#F26522] bg-[#FFF5F0] shadow-sm'
                                : 'border-gray-200 hover:border-[#F26522]/50 hover:bg-gray-50'
                            }`}
                          >
                            <div>
                              <span className="text-sm text-[#1A1A1A] font-medium">
                                {s.name}
                              </span>
                              <span className="text-xs text-[#F26522] ml-2 font-semibold">
                                ${s.price.toFixed(2)}
                              </span>
                            </div>
                            <Switch
                              checked={isActive}
                              onCheckedChange={(checked) =>
                                toggleService(s.service_id, checked)
                              }
                              className="data-[state=checked]:bg-[#F26522]"
                            />
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
        <Card className="border-gray-200 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#FFF5F0] to-white border-b border-[#FFCCB3]">
            <CardTitle className="text-lg font-semibold text-[#1A1A1A] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#F26522]" />
              Set Availability
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(-1)}
                className="hover:bg-[#FFF5F0] text-[#F26522] hover:text-[#E55A1A]"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <span className="font-semibold text-[#1A1A1A]">{monthName}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(1)}
                className="hover:bg-[#FFF5F0] text-[#F26522] hover:text-[#E55A1A]"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div
                  key={d}
                  className="text-center text-xs font-semibold text-gray-500 py-1"
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: startDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const ds = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const { hasOpen, bookingCount } = getDateStatus(ds);
                const isSelected = selectedDate === ds;
                const isToday =
                  ds === new Date().toISOString().split('T')[0];

                return (
                  <button
                    key={day}
                    onClick={() => handleDateClick(ds)}
                    className={`relative p-2 border text-center rounded-lg text-sm transition-all hover:scale-105 ${
                      isSelected
                        ? 'bg-[#F26522] text-white border-[#F26522] shadow-md'
                        : isToday
                        ? 'border-[#F26522] bg-[#FFF5F0] text-[#F26522] font-bold'
                        : hasOpen
                        ? 'bg-[#FFF5F0] border-[#FFCCB3] text-[#F26522] font-medium'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-[#FFF5F0] hover:border-[#FFCCB3]'
                    }`}
                  >
                    {day}
                    {bookingCount > 0 && (
                      <span
                        className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-[#F26522]'
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#FFF5F0] border border-[#FFCCB3]" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#FFF5F0] border border-[#F26522]" />
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-[#F26522]" />
                <span>Has Booking</span>
              </div>
            </div>

            {/* Slot Management */}
            {selectedDate && (
              <div className="mt-6 border-t border-gray-200 pt-4 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-[#1A1A1A]">
                    Slots for{' '}
                    <span className="text-[#F26522]">{selectedDate}</span>
                  </p>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-[#FFCCB3] text-[#F26522] hover:bg-[#FFF5F0] hover:border-[#FF9955]"
                      onClick={() => toggleAllSlots('open')}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Open All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 border-gray-300 text-gray-600 hover:bg-gray-50"
                      onClick={() => toggleAllSlots('closed')}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Close All
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {selectedDateSlots.map(({ time, isOpen, isBooked }) => (
                    <button
                      key={time}
                      onClick={() => !isBooked && toggleSlot(time)}
                      disabled={isBooked}
                      className={`p-2.5 border rounded-lg text-xs font-semibold transition-all ${
                        isBooked
                          ? 'bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed opacity-70'
                          : isOpen
                          ? 'bg-[#F26522] text-white border-[#F26522] hover:bg-[#E55A1A] shadow-sm'
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-[#FFF5F0] hover:border-[#FFCCB3]'
                      }`}
                    >
                      {time}
                      {isBooked && (
                        <span className="block text-[10px] opacity-80 mt-0.5">
                          Booked
                        </span>
                      )}
                      {!isBooked && (
                        <span className="block text-[10px] opacity-80 mt-0.5">
                          {isOpen ? 'Open' : 'Closed'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="max-w-md border-0 shadow-2xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F26522] to-[#E55A1A] flex items-center justify-center mx-auto mb-2">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-[#1A1A1A] text-center">
              Change Password
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
