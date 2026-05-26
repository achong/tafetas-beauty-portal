import { useState, useMemo } from 'react';
import { Check, User as UserIcon, Calendar, Clock, CreditCard, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { Service, User, Booking } from '@/types';
import { CLINIC_TIME_SLOTS } from '@/hooks/useClinicData';
import type { ScheduleEntry } from '@/types';

interface BookingViewProps {
  services: Service[];
  users: User[];
  schedule: ScheduleEntry[];
  bookings: Booking[];
  onBook: (booking: Booking) => void;
  categories: Record<string, { name: string; price: number }[]>;
}

export function BookingView({ services, users, schedule, bookings, onBook, categories }: BookingViewProps) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const categoryList = useMemo(() => Object.keys(categories), [categories]);

  const filteredServices = useMemo(() => {
    if (!selectedCategory) return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [selectedCategory, services]);

  const selectedService = useMemo(
    () => services.find((s) => s.service_id === selectedServiceId) || null,
    [selectedServiceId, services]
  );

  const availableStudents = useMemo(() => {
    if (!selectedService) return [];
    return users.filter(
      (u) =>
        u.role === 'student' && (u.services_active || []).includes(selectedService.service_id)
    );
  }, [selectedService, users]);

  const bookedTimesForDate = useMemo(() => {
    if (!selectedDate || !selectedStudentId) return [];
    return bookings
      .filter((b) => b.student_id === selectedStudentId && b.date === selectedDate)
      .map((b) => b.time);
  }, [selectedDate, selectedStudentId, bookings]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedStudentId) return [];
    return schedule.filter(
      (s) =>
        s.student_id === selectedStudentId && s.date === selectedDate && s.is_open
    );
  }, [selectedDate, selectedStudentId, schedule]);

  const timeSlotStatus = useMemo(() => {
    const status: Record<string, 'available' | 'booked' | 'closed'> = {};
    CLINIC_TIME_SLOTS.forEach((t) => {
      if (bookedTimesForDate.includes(t)) {
        status[t] = 'booked';
      } else if (availableSlots.some((s) => s.time === t)) {
        status[t] = 'available';
      } else {
        status[t] = 'closed';
      }
    });
    return status;
  }, [bookedTimesForDate, availableSlots]);

  const handleServiceChange = (val: string) => {
    setSelectedServiceId(val);
    setSelectedStudentId('');
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setSelectedServiceId('');
    setSelectedStudentId('');
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleStudentSelect = (uid: string) => {
    setSelectedStudentId(uid);
    setSelectedDate('');
    setSelectedTime('');
  };

  const handleDateChange = (val: string) => {
    setSelectedDate(val);
    setSelectedTime('');
  };

  const handleTimeSelect = (t: string) => {
    setSelectedTime(t);
  };

  const handleConfirm = () => {
    if (!clientName.trim() || !clientEmail.trim()) return;
    const booking: Booking = {
      id: Date.now(),
      service: selectedService,
      student: selectedStudentId,
      date: selectedDate,
      time: selectedTime,
      client_name: clientName.trim(),
      client_email: clientEmail.trim(),
      client_phone: clientPhone.trim(),
      student_id: selectedStudentId,
    };
    onBook(booking);
    setConfirmedBooking(booking);
    setShowConfirm(true);
  };

  const handleCloseConfirm = () => {
    setShowConfirm(false);
    // Reset form
    setSelectedCategory('');
    setSelectedServiceId('');
    setSelectedStudentId('');
    setSelectedDate('');
    setSelectedTime('');
    setClientName('');
    setClientEmail('');
    setClientPhone('');
    setConfirmedBooking(null);
  };

  const minDate = new Date().toISOString().split('T')[0];

  const steps = [
    { label: 'Service', done: !!selectedServiceId },
    { label: 'Student', done: !!selectedStudentId },
    { label: 'Date', done: !!selectedDate },
    { label: 'Time', done: !!selectedTime },
  ];

  return (
    <div className="fade-in max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#FFF5F0] to-[#FFE5D9] rounded-2xl p-6 md:p-8 mb-8 border border-[#FFCCB3]">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#F26522] rounded-xl shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#1A1A1A] mb-2">
              Book Your Appointment
            </h2>
            <p className="text-gray-600">
              Select your service, choose a student, and pick a convenient time slot.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 md:p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 md:gap-3 shrink-0">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step.done
                    ? 'bg-[#F26522] text-white shadow-md'
                    : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                }`}
              >
                {step.done ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : i + 1}
              </div>
              <span
                className={`text-xs md:text-sm font-medium ${
                  step.done ? 'text-[#F26522] font-semibold' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-6 md:w-12 h-0.5 ${step.done ? 'bg-[#F26522]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Service Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Service Category
            </Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categoryList.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-semibold text-gray-700 mb-2 block">
              Specific Service
            </Label>
            <Select value={selectedServiceId} onValueChange={handleServiceChange}>
              <SelectTrigger className="w-full border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors">
                <SelectValue placeholder="Select a Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select a Service</SelectItem>
                {filteredServices.map((s) => (
                  <SelectItem key={s.service_id} value={s.service_id}>
                    <div className="flex justify-between items-center w-full">
                      <span>{s.name}</span>
                      <span className="font-bold text-[#F26522]">${s.price.toFixed(2)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Service Info */}
        {selectedService && (
          <div className="bg-gradient-to-r from-[#FFF5F0] to-[#FFE5D9] border-l-4 border-[#F26522] rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-[#F26522]/10 rounded-lg">
                  <Sparkles className="w-5 h-5 text-[#F26522]" />
                </div>
                <div>
                  <p className="text-[#1A1A1A] font-semibold text-lg">
                    {selectedService.name}
                  </p>
                  <p className="text-gray-600 text-sm">{selectedService.category}</p>
                </div>
              </div>
              <p className="text-[#F26522] text-2xl font-bold">
                ${selectedService.price.toFixed(2)}
              </p>
            </div>
            <p className="text-amber-700 text-sm mt-3 font-medium flex items-center gap-1.5 bg-amber-50/50 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              Payment is required at the clinic desk at the time of your appointment.
            </p>
          </div>
        )}

        {/* Student Selection */}
        {selectedService && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" />
              Select Student
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableStudents.length > 0 ? (
                availableStudents.map((s) => (
                  <label
                    key={s.uid}
                    className={`flex items-center p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                      selectedStudentId === s.uid
                        ? 'border-[#F26522] bg-[#FFF5F0] shadow-sm'
                        : 'border-gray-200 hover:border-[#F26522]/50 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="student"
                      value={s.uid}
                      checked={selectedStudentId === s.uid}
                      onChange={() => handleStudentSelect(s.uid)}
                      className="mr-3 w-4 h-4 text-[#F26522] border-gray-300 focus:ring-[#F26522]"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{s.name}</span>
                      <span className="text-xs text-gray-400 ml-2 font-mono">
                        @{s.username}
                      </span>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  No students currently offering this service.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Date Selection */}
        {selectedStudentId && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Select Date
            </Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={minDate}
              className="w-full md:w-64 border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors"
            />
          </div>
        )}

        {/* Time Slots */}
        {selectedDate && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Label className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              Available Time Slots
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {CLINIC_TIME_SLOTS.map((t) => {
                const status = timeSlotStatus[t];
                const isSelected = selectedTime === t;
                return (
                  <button
                    key={t}
                    onClick={() =>
                      status === 'available' && handleTimeSelect(t)
                    }
                    disabled={status !== 'available'}
                    className={`p-2.5 border-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'bg-[#F26522] text-white border-[#F26522] shadow-md transform scale-105'
                        : status === 'booked'
                        ? 'bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed opacity-70'
                        : status === 'available'
                        ? 'bg-white text-gray-700 border-gray-200 hover:border-[#F26522] hover:bg-[#FFF5F0] hover:text-[#F26522]'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    {t}
                    {status === 'booked' && (
                      <span className="block text-[10px] opacity-70 mt-0.5">Booked</span>
                    )}
                    {status === 'available' && !isSelected && (
                      <span className="block text-[10px] text-[#F26522] opacity-70 mt-0.5">Available</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Client Details */}
        {selectedTime && (
          <div className="border-t border-gray-200 pt-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-[#1A1A1A]">
              <CreditCard className="w-5 h-5 text-[#F26522]" />
              Your Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm text-gray-700 mb-1 block">Full Name *</Label>
                <Input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors"
                />
              </div>
              <div>
                <Label className="text-sm text-gray-700 mb-1 block">Email Address *</Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm text-gray-700 mb-1 block">Phone Number</Label>
                <Input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="border-gray-300 focus:border-[#F26522] focus:ring-[#F26522]/20 hover:border-[#F26522] transition-colors"
                />
              </div>
            </div>
            <Button
              onClick={handleConfirm}
              disabled={!clientName.trim() || !clientEmail.trim()}
              className="w-full bg-gradient-to-r from-[#F26522] to-[#E55A1A] hover:from-[#E55A1A] hover:to-[#CC4D14] text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              Confirm Booking
            </Button>
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md text-center border-0 shadow-2xl">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F26522] to-[#E55A1A] flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Check className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-[#1A1A1A]">
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Your appointment has been booked successfully.
            </DialogDescription>
          </DialogHeader>

          {confirmedBooking && (
            <div className="bg-gradient-to-br from-[#FFF5F0] to-[#FFE5D9] rounded-xl p-4 text-left text-sm space-y-3 my-4 border border-[#FFCCB3]">
              <div className="flex justify-between items-center pb-2 border-b border-[#FFCCB3]/50">
                <span className="font-medium text-gray-700">Service:</span>
                <span className="font-semibold text-[#1A1A1A]">{confirmedBooking.service?.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#FFCCB3]/50">
                <span className="font-medium text-gray-700">Date & Time:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {confirmedBooking.time} on {confirmedBooking.date}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-[#FFCCB3]/50">
                <span className="font-medium text-gray-700">Student:</span>
                <span className="font-semibold text-[#1A1A1A]">
                  {users.find((u) => u.uid === confirmedBooking.student_id)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-medium text-gray-700">Amount Due:</span>
                <span className="text-[#F26522] font-bold text-lg">
                  ${confirmedBooking.service?.price.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <p className="text-sm text-amber-700 font-medium mb-4 flex items-center justify-center gap-1.5 bg-amber-50 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            Payment is required at the clinic desk at the time of your appointment.
          </p>

          <Button
            onClick={handleCloseConfirm}
            className="w-full bg-gradient-to-r from-[#F26522] to-[#E55A1A] hover:from-[#E55A1A] hover:to-[#CC4D14] text-white font-semibold"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
