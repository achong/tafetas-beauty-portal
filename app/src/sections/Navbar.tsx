import { Globe, BookOpen, CalendarDays, ShieldCheck, GraduationCap, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User, ViewName } from '@/types';
import { useState } from 'react';

interface NavbarProps {
  currentUser: User | null;
  onSwitchView: (view: ViewName) => void;
  onLogout: () => void;
}

export function Navbar({ currentUser, onSwitchView, onLogout }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-[#1A1A1A] border-b border-[#F26522] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and Brand */}
          <div
            className="flex items-center cursor-pointer gap-3"
            onClick={() => onSwitchView('catalog')}
          >
            {/* Replace this with the actual TasTAFE logo image */}
            <div className="w-10 h-10 bg-[#F26522] rounded flex items-center justify-center">
              {/* TODO: Replace with actual TasTAFE logo */}
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                Beauty & Nails Clinic
              </h1>
              <p className="text-xs text-gray-400">Student Training Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onSwitchView('catalog')}
              className="flex items-center gap-2 text-gray-300 hover:text-[#F26522] transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Services</span>
            </button>

            <button
              onClick={() => onSwitchView('booking')}
              className="flex items-center gap-2 text-[#F26522] font-semibold hover:text-[#E55A1A] transition-colors"
            >
              <CalendarDays className="w-4 h-4" />
              <span>Book Now</span>
            </button>

            {!currentUser && (
              <>
                <button
                  onClick={() => onSwitchView('admin-login')}
                  className="flex items-center gap-2 text-gray-300 hover:text-[#F26522] transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin</span>
                </button>

                <button
                  onClick={() => onSwitchView('student-login')}
                  className="flex items-center gap-2 text-gray-300 hover:text-[#F26522] transition-colors"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Student</span>
                </button>
              </>
            )}

            {currentUser && (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-gray-700">
                <button
                  onClick={() => onSwitchView(`${currentUser.role}-dashboard` as ViewName)}
                  className="text-[#F26522] font-semibold hover:text-[#E55A1A] transition-colors"
                >
                  {currentUser.name}
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 text-gray-300 hover:text-red-500 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-800">
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onSwitchView('catalog');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-gray-300 hover:text-[#F26522] transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>Services</span>
              </button>
              <button
                onClick={() => {
                  onSwitchView('booking');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-[#F26522] font-semibold"
              >
                <CalendarDays className="w-4 h-4" />
                <span>Book Now</span>
              </button>
              {!currentUser && (
                <>
                  <button
                    onClick={() => {
                      onSwitchView('admin-login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-300 hover:text-[#F26522] transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchView('student-login');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-gray-300 hover:text-[#F26522] transition-colors"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Student</span>
                  </button>
                </>
              )}
              {currentUser && (
                <>
                  <button
                    onClick={() => {
                      onSwitchView(`${currentUser.role}-dashboard` as ViewName);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-[#F26522] font-semibold"
                  >
                    Dashboard ({currentUser.name})
                  </button>
                  <button
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 text-red-500"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
