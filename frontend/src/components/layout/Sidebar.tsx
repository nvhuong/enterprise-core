import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Users, 
  Briefcase, 
  Settings, 
  BarChart2, 
  FileText 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const navItems = [
    { icon: Home, label: t('nav.dashboard'), href: '/', active: true },
    { icon: Users, label: t('nav.hrm'), href: '/hrm', active: false },
    { icon: Briefcase, label: t('nav.erp'), href: '/erp', active: false },
    { icon: BarChart2, label: t('nav.crm'), href: '/crm', active: false },
    { icon: FileText, label: 'Reports', href: '/reports', active: false },
    { icon: Settings, label: t('common.settings'), href: '/settings', active: false },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={cn(
          "fixed lg:sticky top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-4 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Main Menu
          </div>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors",
                item.active 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", item.active ? "text-indigo-600" : "text-slate-400")} />
              {item.label}
            </a>
          ))}
        </div>

        <div className="absolute bottom-4 left-0 w-full px-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <h4 className="text-sm font-bold text-slate-900 mb-1">Pro Plan</h4>
            <p className="text-xs text-slate-500 mb-3">Your team has 12 days left.</p>
            <button className="w-full py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
