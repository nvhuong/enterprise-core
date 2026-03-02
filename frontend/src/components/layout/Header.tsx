import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Menu, 
  Search, 
  Bell, 
  Grid, 
  ChevronRight, 
  User, 
  LogOut, 
  Settings,
  Globe
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface HeaderProps {
  onMobileMenuToggle: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const { t, i18n } = useTranslation();
  const [isAppSwitcherOpen, setIsAppSwitcherOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'vi' : 'en';
    i18n.changeLanguage(newLang);
    setIsLangOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/60 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Left Section: Context */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-slate-600"
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
            N
          </div>
          <span className="hidden sm:block font-bold text-slate-900">NexusHRM</span>
        </div>

        <div className="hidden md:flex items-center text-sm">
          <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />
          <span className="text-slate-400">Dashboard</span>
          <ChevronRight className="w-4 h-4 text-slate-400 mx-2" />
          <span className="text-slate-900 font-semibold">Overview</span>
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Search */}
        <div className="hidden sm:flex items-center bg-slate-100 rounded-xl px-3 py-1.5 w-64">
          <Search className="w-4 h-4 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder={t('common.search')} 
            className="bg-transparent border-none outline-none text-sm text-slate-700 w-full placeholder:text-slate-400"
          />
        </div>
        <button className="sm:hidden p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-slate-600">
          <Search className="w-5 h-5" />
        </button>

        {/* Language Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-slate-600 flex items-center gap-1"
          >
            <Globe className="w-5 h-5" />
            <span className="text-xs font-bold uppercase">{i18n.language}</span>
          </button>
          
          <AnimatePresence>
            {isLangOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden"
              >
                <button 
                  onClick={() => { i18n.changeLanguage('vi'); setIsLangOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors",
                    i18n.language === 'vi' && "text-indigo-600 bg-indigo-50 font-medium"
                  )}
                >
                  Tiếng Việt
                </button>
                <button 
                  onClick={() => { i18n.changeLanguage('en'); setIsLangOpen(false); }}
                  className={cn(
                    "w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors",
                    i18n.language === 'en' && "text-indigo-600 bg-indigo-50 font-medium"
                  )}
                >
                  English
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notification */}
        <button className="relative p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-slate-600">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
        </button>

        {/* App Switcher */}
        <div className="relative">
          <button 
            onClick={() => setIsAppSwitcherOpen(!isAppSwitcherOpen)}
            className={cn(
              "p-2 rounded-xl hover:bg-slate-100 active:scale-95 transition-all text-slate-600",
              isAppSwitcherOpen && "bg-slate-100 text-indigo-600"
            )}
          >
            <Grid className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {isAppSwitcherOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 grid grid-cols-3 gap-2"
              >
                {['HRM', 'ERP', 'CRM', 'Finance', 'Sales', 'Admin'].map((app) => (
                  <button 
                    key={app}
                    className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-indigo-50 transition-colors group"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-lg mb-2 group-hover:bg-white group-hover:shadow-sm transition-all flex items-center justify-center text-slate-500 group-hover:text-indigo-600">
                      <Grid className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-indigo-600">{app}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Profile */}
        <div className="relative pl-2 border-l border-slate-200">
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 hover:bg-slate-50 rounded-full p-1 pr-3 transition-all"
          >
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
              JD
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900">John Doe</p>
              <p className="text-[10px] text-slate-500 font-medium">Admin</p>
            </div>
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-50">
                  <p className="text-sm font-bold text-slate-900">John Doe</p>
                  <p className="text-xs text-slate-500">john.doe@example.com</p>
                </div>
                <div className="p-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <User className="w-4 h-4" />
                    {t('common.profile')}
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <Settings className="w-4 h-4" />
                    {t('common.settings')}
                  </button>
                </div>
                <div className="border-t border-slate-50 p-1">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                    {t('common.logout')}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
