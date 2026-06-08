import { useState, useMemo } from 'react';
import { Check, User as UserIcon, Calendar, Clock, CreditCard, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FormRenderer } from '@/components/FormRenderer';
import { SERVICE_FORMS } from '@/data/forms';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Service, User, Booking, Form, FormResponse } from '@/types';
import type { ScheduleEntry } from '@/types';

// Defined directly to avoid import path issues
const CLINIC_TIME_SLOTS = [
  '9:00', '9:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00',
];

interface BookingViewProps {
  currentUser: User | null;
  services: Service[];
  users: User[];
  schedule: ScheduleEntry[];
  bookings: Booking[];
  onBook: (booking: Booking) => void;
  categories: Record<string, { name: string; price: number }[]>;
}

export function BookingView({ 
  currentUser,
  services, 
  users, 
  schedule, 
  bookings, 
  onBook, 
  categories 
}: BookingViewProps) {
  // Use "all" instead of "" to comply with Radix UI Select requirements
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedServiceId, setSelectedServiceId] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  
  // Form modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<Booking | null>(null);
  const [activeForm, setActiveForm] = useState<Form | null>(null);

  const categoryList = useMemo(() => {
    if (!categories) return [];
    return Object.keys(categories);
  }, [categories]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    if (selectedCategory === 'all') return services;
    return services.filter((s) => s.category === selectedCategory);
  }, [selectedCategory, services]);

  const selectedService = useMemo(
    () => selectedServiceId === 'all' ? null : (services?.find((s) => s.service_id === selectedServiceId) || null),
    [selectedServiceId, services]
  );

  const availableStudents = useMemo(() => {
    if (!selectedService || !users) return [];
    return users.filter(
      (u) => u.role === 'student' && (u.services_active || []).includes(selectedService.service_id)
    );
  }, [selectedService, users]);

  const bookedTimesForDate = useMemo(() => {
    if (!selectedDate || !selectedStudentId || !bookings) return [];
    return bookings
      .filter((b) => b.student_id === selectedStudentId && b.date === selectedDate)
      .map((b) => b.time);
  }, [selectedDate, selectedStudentId, bookings]);

  const availableSlots = useMemo(() => {
    if (!selectedDate || !selectedStudentId || !schedule) return [];
    return schedule.filter(
      (s) => s.student_id === selectedStudentId && s.date === selectedDate && s.is_open
    );
  }, [selectedDate, selectedStudentId, schedule]);

  // Get unique available dates for the selected student
  const availableDates = useMemo(() => {
    if (!selectedStudentId || !schedule) return [];
    const today = new Date().toISOString().split('T')[0];
    
    const dates = schedule
      .filter((s) => s.student_id === selectedStudentId && s.date >= today && s.is_open)
      .map((s) => s.date);
      
    // Return unique dates, sorted chronologically
    return [...new Set(dates)].sort();
  }, [selectedStudentId, schedule]);

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
    setSelectedServiceId('all');
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

  // Helper function to actually save the booking
  const saveBooking = (bookingData: Booking) => {
    // Call the onBook prop passed from App.tsx (which handles Firestore + local state)
    onBook(bookingData);
    
    setConfirmedBooking(bookingData);
    setShowConfirm(true);
    setShowFormModal(false);
    setPendingBooking(null);
    setActiveForm(null);
  };

  // Handle form submission
  const handleFormSubmit = async (responses: FormResponse[]) => {
    if (!activeForm || !pendingBooking) return;

    try {
      // 1. Save the form submission to Firestore
      await addDoc(collection(db, 'form_submissions'), {
        form_id: activeForm.form_id,
        client_uid: currentUser?.uid || `guest_${Date.now()}`, // Use guest ID if not logged in
        client_name: pendingBooking.client_name || currentUser?.name || 'Guest', // Use the name they typed in the booking form!
        booking_id: pendingBooking.id || 'pending',
        responses,
        submitted_at: new Date().toISOString(),
        is_signed: true
      });

      // 2. Now that the form is saved, complete the booking
      await saveBooking(pendingBooking);
      
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Error saving paperwork. Please try again.');
    }
  };

  const handleConfirm = () => {
    if (!clientName.trim() || !clientEmail.trim() || !selectedService) return;
    
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

    // Check if there is a form for this specific service
    const requiredForm = SERVICE_FORMS.find(f => f.service_id === selectedService.service_id);

    if (requiredForm) {
      // If a form exists and user is logged in, pause and show the form
      setActiveForm(requiredForm);
      setPendingBooking(booking);
      setShowFormModal(true);
    } else {
      // No form needed (or not logged in), save directly
      saveBooking(booking);
    }
  };

  const handleCloseConfirm = () => {
    setShowConfirm(false);
    setSelectedCategory('all');
    setSelectedServiceId('all');
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
    { label: 'Service', done: selectedServiceId !== 'all' },
    { label: 'Student', done: !!selectedStudentId },
    { label: 'Date', done: !!selectedDate },
    { label: 'Time', done: !!selectedTime },
  ];

  return (
    <div className="fade-in max-w-5xl mx-auto">
      {/* Hero Section */}
      <div className="bg-muted/30 rounded-2xl p-6 md:p-8 mb-8 border border-border">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary rounded-xl shadow-lg">
            <Calendar className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              Book Your Appointment
            </h2>
            <p className="text-muted-foreground">
              Select your service, choose a student, and pick a convenient time slot.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-md border border-border p-6 md:p-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 md:gap-4 mb-8 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 md:gap-3 shrink-0">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step.done
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground border border-border'
                }`}
              >
                {step.done ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : i + 1}
              </div>
              <span
                className={`text-xs md:text-sm font-medium ${
                  step.done ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div className={`w-6 md:w-12 h-0.5 ${step.done ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Service Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-sm font-semibold text-foreground mb-2 block">
              Service Category
            </Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full bg-background border-border focus:ring-primary">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Categories</SelectItem>
                {categoryList.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm font-semibold text-foreground mb-2 block">
              Specific Service
            </Label>
            <Select value={selectedServiceId} onValueChange={handleServiceChange}>
              <SelectTrigger className="w-full bg-background border-border focus:ring-primary">
                <SelectValue placeholder="Select a Service" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Select a Service</SelectItem>
                {filteredServices.map((s) => (
                  <SelectItem key={s.service_id} value={s.service_id}>
                    <div className="flex justify-between items-center w-full gap-4">
                      <span className="truncate">{s.name}</span>
                      <span className="font-bold text-primary shrink-0">${s.price.toFixed(2)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Service Info */}
        {selectedService && (
          <div className="bg-primary/10 border-l-4 border-primary rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-foreground font-semibold text-lg">
                    {selectedService.name}
                  </p>
                  <p className="text-muted-foreground text-sm">{selectedService.category}</p>
                </div>
              </div>
              <p className="text-primary text-2xl font-bold">
                ${selectedService.price.toFixed(2)}
              </p>
            </div>
            <p className="text-amber-500 text-sm mt-3 font-medium flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              Payment is required at the clinic desk at the time of your appointment.
            </p>
          </div>
        )}

        {/* Student Selection */}
        {selectedService && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
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
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border hover:border-primary/50 hover:bg-muted/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="student"
                      value={s.uid}
                      checked={selectedStudentId === s.uid}
                      onChange={() => handleStudentSelect(s.uid)}
                      className="mr-3 w-4 h-4 text-primary border-border focus:ring-primary"
                    />
                    <div>
                      <span className="font-medium text-foreground">{s.name}</span>
                      <span className="text-xs text-muted-foreground ml-2 font-mono">
                        @{s.username}
                      </span>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center gap-2">
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
            <Label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Select Available Date
            </Label>
            
            {availableDates.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableDates.map((date) => {
                  const isSelected = selectedDate === date;
                  const dateObj = new Date(date);
                  // Fix timezone offset issue for accurate day display
                  const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000;
                  const adjustedDateObj = new Date(dateObj.getTime() + userTimezoneOffset);
                  
                  const dayName = adjustedDateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = adjustedDateObj.getDate();
                  const monthName = adjustedDateObj.toLocaleDateString('en-US', { month: 'short' });

                  return (
                    <button
                      key={date}
                      onClick={() => handleDateChange(date)}
                      className={`p-3 border-2 rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary shadow-md transform scale-105'
                          : 'bg-background text-foreground border-border hover:border-primary hover:bg-primary/10'
                      }`}
                    >
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {dayName}
                      </div>
                      <div className="text-xl font-bold leading-tight my-0.5">
                        {dayNum}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                        {monthName}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                <p className="text-sm text-red-500">
                  No available dates found for this student. Please select a different student.
                </p>
              </div>
            )}
          </div>
        )}
        
        {/* Time Slots */}
        {selectedDate && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Label className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
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
                    onClick={() => status === 'available' && handleTimeSelect(t)}
                    disabled={status !== 'available'}
                    className={`p-2.5 border-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary shadow-md transform scale-105'
                        : status === 'booked'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 cursor-not-allowed opacity-70'
                        : status === 'available'
                        ? 'bg-background text-foreground border-border hover:border-primary hover:bg-primary/10'
                        : 'bg-muted/50 text-muted-foreground border-border cursor-not-allowed'
                    }`}
                  >
                    {t}
                    {status === 'booked' && (
                      <span className="block text-[10px] opacity-70 mt-0.5">Booked</span>
                    )}
                    {status === 'available' && !isSelected && (
                      <span className="block text-[10px] text-primary opacity-70 mt-0.5">Available</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Client Details */}
        {selectedTime && (
          <div className="border-t border-border pt-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <CreditCard className="w-5 h-5 text-primary" />
              Your Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <Label className="text-sm text-foreground mb-1 block">Full Name *</Label>
                <Input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Full Name"
                  required
                  className="bg-background border-border focus:ring-primary"
                />
              </div>
              <div>
                <Label className="text-sm text-foreground mb-1 block">Email Address *</Label>
                <Input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="Email Address"
                  required
                  className="bg-background border-border focus:ring-primary"
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm text-foreground mb-1 block">Phone Number</Label>
                <Input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="bg-background border-border focus:ring-primary"
                />
              </div>
            </div>
            <Button
              onClick={handleConfirm}
              disabled={!clientName.trim() || !clientEmail.trim()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              Confirm Booking
            </Button>
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md text-center border-border bg-popover">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-3 shadow-lg">
              <Check className="w-8 h-8 text-primary-foreground" />
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Your appointment has been booked successfully.
            </DialogDescription>
          </DialogHeader>

          {confirmedBooking && (
            <div className="bg-muted/30 rounded-xl p-4 text-left text-sm space-y-3 my-4 border border-border">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="font-medium text-muted-foreground">Service:</span>
                <span className="font-semibold text-foreground">{confirmedBooking.service?.name}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="font-medium text-muted-foreground">Date & Time:</span>
                <span className="font-semibold text-foreground">
                  {confirmedBooking.time} on {confirmedBooking.date}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <span className="font-medium text-muted-foreground">Student:</span>
                <span className="font-semibold text-foreground">
                  {users.find((u) => u.uid === confirmedBooking.student_id)?.name}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="font-medium text-muted-foreground">Amount Due:</span>
                <span className="text-primary font-bold text-lg">
                  ${confirmedBooking.service?.price.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <p className="text-sm text-amber-500 font-medium mb-4 flex items-center justify-center gap-1.5 bg-amber-500/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            Payment is required at the clinic desk at the time of your appointment.
          </p>

          <Button
            onClick={handleCloseConfirm}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>

      {/* Paperwork Modal */}
      <Dialog open={showFormModal} onOpenChange={setShowFormModal}>
        <DialogContent className="sm:max-w-3xl bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Required Paperwork</DialogTitle>
            <DialogDescription>
              Please complete this form to proceed with your booking.
            </DialogDescription>
          </DialogHeader>
          
          {activeForm && (
            <div className="py-4">
              <FormRenderer
                form={activeForm}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowFormModal(false);
                  setPendingBooking(null);
                  setActiveForm(null);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}