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
     <nav className="bg-background/90 backdrop-blur-md shadow-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo and Brand */}
          <div
            className="flex items-center cursor-pointer gap-3 group"
            onClick={() => onSwitchView('catalog')}
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#F26522] to-[#E55A1A] flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#1A1A1A] tracking-tight">
                Beauty & Nails Clinic
              </h1>
              <p className="text-xs text-gray-500">Student Training Portal</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSwitchView('catalog')}
              className="text-gray-700 hover:text-[#F26522] hover:bg-orange-50 font-medium"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Services
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSwitchView('booking')}
              className="text-[#F26522] bg-orange-50 hover:bg-orange-100 hover:text-[#E55A1A] font-semibold"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Book Now
            </Button>

            {!currentUser && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSwitchView('admin-login')}
                  className="text-gray-700 hover:text-[#F26522] hover:bg-orange-50"
                >
                  <ShieldCheck className="w-4 h-4 mr-2" />
                  Admin
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSwitchView('student-login')}
                  className="text-gray-700 hover:text-[#F26522] hover:bg-orange-50"
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student
                </Button>
              </>
            )}

            {currentUser && (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSwitchView(`${currentUser.role}-dashboard` as ViewName)}
                  className="text-[#F26522] hover:text-[#E55A1A] hover:bg-orange-50 font-semibold"
                >
                  {currentUser.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  onSwitchView('catalog');
                  setMobileMenuOpen(false);
                }}
                className="justify-start text-gray-700 hover:text-[#F26522] hover:bg-orange-50"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Services
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  onSwitchView('booking');
                  setMobileMenuOpen(false);
                }}
                className="justify-start text-[#F26522] bg-orange-50 hover:bg-orange-100"
              >
                <CalendarDays className="w-4 h-4 mr-2" />
                Book Now
              </Button>
              {!currentUser && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onSwitchView('admin-login');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-gray-700 hover:text-[#F26522] hover:bg-orange-50"
                  >
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onSwitchView('student-login');
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-gray-700 hover:text-[#F26522] hover:bg-orange-50"
                  >
                    <GraduationCap className="w-4 h-4 mr-2" />
                    Student
                  </Button>
                </>
              )}
              {currentUser && (
                <>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onSwitchView(`${currentUser.role}-dashboard` as ViewName);
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-[#F26522] hover:bg-orange-50"
                  >
                    Dashboard ({currentUser.name})
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="justify-start text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
