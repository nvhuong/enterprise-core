import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Building2, Users, Settings, LayoutDashboard, Menu, Bell, User, Grid, Globe, Shield, Box } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Layout() {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [showApps, setShowApps] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const appsRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
        setShowApps(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLang(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setShowLang(false);
  };

  const apps = [
    { id: 'hrm', icon: <Users className="text-blue-500" size={24} />, name: t('apps.hrm'), color: 'bg-blue-50' },
    { id: 'erp', icon: <Building2 className="text-emerald-500" size={24} />, name: t('apps.erp'), color: 'bg-emerald-50' },
    { id: 'crm', icon: <User className="text-purple-500" size={24} />, name: t('apps.crm'), color: 'bg-purple-50' },
    { id: 'project', icon: <LayoutDashboard className="text-orange-500" size={24} />, name: t('apps.project'), color: 'bg-orange-50' },
    { id: 'wiki', icon: <Grid className="text-pink-500" size={24} />, name: t('apps.wiki'), color: 'bg-pink-50' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <div className="bg-indigo-600 text-white p-1.5 rounded-lg">
              <Building2 size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Enterprise</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-4">{t('common.main')}</div>
          <NavItem to="/" icon={<LayoutDashboard size={20} />} label={t('common.dashboard')} active={location.pathname === '/'} />
          <NavItem to="/companies" icon={<Building2 size={20} />} label={t('common.companies')} active={location.pathname.startsWith('/companies')} />
          <NavItem to="/employees" icon={<Users size={20} />} label={t('common.employees')} active={location.pathname.startsWith('/employees')} />
          <NavItem to="/organization" icon={<Grid size={20} />} label={t('organization.nav')} active={location.pathname.startsWith('/organization')} />
          <NavItem to="/roles" icon={<Shield size={20} />} label={t('role.nav')} active={location.pathname.startsWith('/roles')} />
          <NavItem to="/services" icon={<Box size={20} />} label={t('service.nav')} active={location.pathname.startsWith('/services')} />
          
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-2 px-4">{t('common.system')}</div>
          <NavItem to="/settings" icon={<Settings size={20} />} label={t('common.settings')} active={location.pathname.startsWith('/settings')} />
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{t('common.adminUser')}</p>
              <p className="text-xs text-gray-500 truncate">admin@enterprise.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8">
          <button className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
            <Menu size={20} />
          </button>
          <div className="flex-1"></div>
          <div className="flex items-center gap-3">
            
            {/* Language Switcher */}
            <div className="relative" ref={langRef}>
              <button 
                onClick={() => setShowLang(!showLang)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title={t('common.language')}
              >
                <Globe size={20} />
              </button>
              
              {showLang && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => changeLanguage('vi')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${i18n.language === 'vi' ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                  >
                    <span>Tiếng Việt</span>
                    {i18n.language === 'vi' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                  </button>
                  <button 
                    onClick={() => changeLanguage('en')}
                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${i18n.language === 'en' ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                  >
                    <span>English</span>
                    {i18n.language === 'en' && <div className="w-2 h-2 rounded-full bg-indigo-600"></div>}
                  </button>
                </div>
              )}
            </div>

            {/* App Switcher */}
            <div className="relative" ref={appsRef}>
              <button 
                onClick={() => setShowApps(!showApps)}
                className={`p-2 rounded-full transition-colors ${showApps ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                title={t('common.apps')}
              >
                <Grid size={20} />
              </button>

              {showApps && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="grid grid-cols-3 gap-4">
                    {apps.map((app) => (
                      <div key={app.id} className="flex flex-col items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group">
                        <div className={`w-12 h-12 ${app.color} rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform`}>
                          {app.icon}
                        </div>
                        <span className="text-xs font-medium text-gray-600 text-center">{app.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label, active }: { to: string; icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
        active 
          ? 'bg-indigo-50 text-indigo-600 font-medium' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
