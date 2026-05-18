import { useState, useMemo } from 'react';
import { Check, User as UserIcon, Calendar, Clock, CreditCard, AlertCircle } from 'lucide-react';
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
    <div className="fade-in max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Book an Appointment</h2>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step.done
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step.done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium ${
                  step.done ? 'text-purple-700' : 'text-gray-400'
                }`}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div className="w-6 h-px bg-gray-200" />
              )}
            </div>
          ))}
        </div>

        {/* Service Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Service Category
            </Label>
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
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
            <Label className="text-sm font-medium text-gray-700 mb-2 block">
              Specific Service
            </Label>
            <Select value={selectedServiceId} onValueChange={handleServiceChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Select a Service</SelectItem>
                {filteredServices.map((s) => (
                  <SelectItem key={s.service_id} value={s.service_id}>
                    {s.name} (${s.price.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Selected Service Info */}
        {selectedService && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-purple-800 font-semibold text-lg">
                    {selectedService.name}
                  </p>
                  <p className="text-purple-600 text-sm">{selectedService.category}</p>
                </div>
              </div>
              <p className="text-purple-700 text-2xl font-bold">
                ${selectedService.price.toFixed(2)}
              </p>
            </div>
            <p className="text-amber-700 text-sm mt-3 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Payment is required at the clinic desk at the time of your appointment.
            </p>
          </div>
        )}

        {/* Student Selection */}
        {selectedService && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
              <UserIcon className="w-4 h-4" />
              Select Student
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {availableStudents.length > 0 ? (
                availableStudents.map((s) => (
                  <label
                    key={s.uid}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${
                      selectedStudentId === s.uid
                        ? 'bg-purple-50 border-purple-300 shadow-sm'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="student"
                      value={s.uid}
                      checked={selectedStudentId === s.uid}
                      onChange={() => handleStudentSelect(s.uid)}
                      className="mr-3 w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
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
                <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg p-3">
                  No students currently offering this service.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Date Selection */}
        {selectedStudentId && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Select Date
            </Label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              min={minDate}
              className="w-full md:w-64"
            />
          </div>
        )}

        {/* Time Slots */}
        {selectedDate && (
          <div className="mb-6 animate-in fade-in slide-in-from-bottom-2">
            <Label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-1.5">
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
                    className={`p-2.5 border rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                        : status === 'booked'
                        ? 'bg-amber-50 border-amber-200 text-amber-700 cursor-not-allowed'
                        : status === 'available'
                        ? 'bg-white text-gray-700 hover:bg-purple-50 hover:border-purple-300 border-gray-200'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                    }`}
                  >
                    {t}
                    {status === 'booked' && (
                      <span className="block text-[10px] opacity-70">Booked</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Client Details */}
        {selectedTime && (
          <div className="border-t pt-6 animate-in fade-in slide-in-from-bottom-2">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-700" />
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
                />
              </div>
              <div className="md:col-span-2">
                <Label className="text-sm text-gray-700 mb-1 block">Phone Number</Label>
                <Input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="Phone Number"
                />
              </div>
            </div>
            <Button
              onClick={handleConfirm}
              disabled={!clientName.trim() || !clientEmail.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm Booking
            </Button>
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Your appointment has been booked successfully.
            </DialogDescription>
          </DialogHeader>

          {confirmedBooking && (
            <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 my-4">
              <p>
                <span className="font-medium text-gray-700">Service:</span>{' '}
                {confirmedBooking.service?.name}
              </p>
              <p>
                <span className="font-medium text-gray-700">Date & Time:</span>{' '}
                {confirmedBooking.time} on {confirmedBooking.date}
              </p>
              <p>
                <span className="font-medium text-gray-700">Student:</span>{' '}
                {
                  users.find((u) => u.uid === confirmedBooking.student_id)
                    ?.name
                }
              </p>
              <p className="text-purple-700 font-bold text-base pt-1">
                Amount Due on Arrival: $
                {confirmedBooking.service?.price.toFixed(2)}
              </p>
            </div>
          )}

          <p className="text-sm text-amber-700 font-medium mb-4 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Payment is required at the clinic desk at the time of your appointment.
          </p>

          <Button
            onClick={handleCloseConfirm}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
