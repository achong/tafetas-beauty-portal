import { Globe, BookOpen, CalendarDays, ShieldCheck, GraduationCap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { User, ViewName } from '@/types';

interface NavbarProps {
  currentUser: User | null;
  onSwitchView: (view: ViewName) => void;
  onLogout: () => void;
}

export function Navbar({ currentUser, onSwitchView, onLogout }: NavbarProps) {
  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div
            className="flex items-center cursor-pointer gap-2.5 group"
            onClick={() => onSwitchView('catalog')}
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight hidden sm:block">
              Student Beauty & Nails Clinic
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSwitchView('catalog')}
              className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
            >
              <BookOpen className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Services</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSwitchView('booking')}
              className="text-purple-600 bg-purple-50 hover:bg-purple-100 hover:text-purple-700"
            >
              <CalendarDays className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Book Now</span>
            </Button>

            {!currentUser && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSwitchView('admin-login')}
                  className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                >
                  <ShieldCheck className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSwitchView('student-login')}
                  className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
                >
                  <GraduationCap className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Student</span>
                </Button>
              </>
            )}

            {currentUser && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSwitchView(`${currentUser.role}-dashboard` as ViewName)}
                  className="text-purple-600 hover:text-purple-800 hover:bg-purple-50 font-semibold"
                >
                  {currentUser.name}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1.5" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
