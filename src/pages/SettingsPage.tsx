import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Settings, Globe, Bell, Shield, Database, 
  Save, RefreshCw, AlertCircle, CheckCircle2, 
  Server, Mail, Key, HardDrive 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(t('common.saveSuccess') || 'Settings saved successfully');
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings size={18} /> },
    { id: 'localization', label: 'Localization', icon: <Globe size={18} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
    { id: 'security', label: 'Security', icon: <Shield size={18} /> },
    { id: 'system', label: 'System Parameters', icon: <Database size={18} /> },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('common.settings')}</h2>
          <p className="text-gray-500">Manage system-wide parameters and configurations</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          {t('common.save')}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          {activeTab === 'general' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <SectionTitle title="General Settings" desc="Basic application information and branding" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Application Name" value="Enterprise ERP" />
                <InputGroup label="Organization Name" value="Global Tech Solutions" />
                <InputGroup label="Contact Email" value="admin@enterprise.com" />
                <InputGroup label="Support Phone" value="+1 (555) 000-0000" />
              </div>
              <div className="pt-6 border-t border-gray-100">
                <SectionTitle title="Branding" desc="Customize the look and feel of your application" />
                <div className="mt-4 flex items-center gap-8">
                  <div className="w-24 h-24 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                    E
                  </div>
                  <div className="space-y-2">
                    <button className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                      Change Logo
                    </button>
                    <p className="text-xs text-gray-400">Recommended size: 512x512px. PNG or SVG.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <SectionTitle title="System Parameters" desc="Core engine configurations and limits" />
              <div className="space-y-6">
                <ToggleGroup 
                  label="Maintenance Mode" 
                  desc="Disable public access to the application during updates" 
                  enabled={false} 
                />
                <ToggleGroup 
                  label="Debug Logging" 
                  desc="Enable detailed system logs for troubleshooting" 
                  enabled={true} 
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <InputGroup label="Max Upload Size (MB)" value="50" type="number" />
                  <InputGroup label="Session Timeout (minutes)" value="60" type="number" />
                  <InputGroup label="Max Login Attempts" value="5" type="number" />
                  <InputGroup label="API Rate Limit (req/min)" value="1000" type="number" />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100">
                <SectionTitle title="Infrastructure" desc="Server and database connection status" />
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatusCard icon={<Server size={18} />} label="Main Server" status="Online" color="text-emerald-500" />
                  <StatusCard icon={<Database size={18} />} label="Database" status="Connected" color="text-emerald-500" />
                  <StatusCard icon={<HardDrive size={18} />} label="Storage" status="82% Full" color="text-amber-500" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
              <SectionTitle title="Security Policy" desc="Authentication and access control settings" />
              <div className="space-y-6">
                <ToggleGroup 
                  label="Two-Factor Authentication" 
                  desc="Require an extra verification step for all users" 
                  enabled={true} 
                />
                <ToggleGroup 
                  label="Strong Password Policy" 
                  desc="Enforce complex password requirements" 
                  enabled={true} 
                />
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Allowed IP Ranges</label>
                  <textarea 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-mono"
                    rows={4}
                    defaultValue="192.168.1.0/24&#10;10.0.0.0/8"
                  />
                  <p className="mt-2 text-xs text-gray-400 italic">Enter one IP range per line in CIDR format.</p>
                </div>
              </div>
            </div>
          )}

          {/* Placeholder for other tabs */}
          {['localization', 'notifications'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400 animate-in fade-in duration-300">
              <div className="p-4 bg-gray-50 rounded-full mb-4">
                <AlertCircle size={32} />
              </div>
              <p className="text-lg font-medium">Coming Soon</p>
              <p className="text-sm">This settings module is currently under development.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ title, desc }: any) {
  return (
    <div>
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500">{desc}</p>
    </div>
  );
}

function InputGroup({ label, value, type = "text" }: any) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input 
        type={type}
        defaultValue={value}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm transition-all"
      />
    </div>
  );
}

function ToggleGroup({ label, desc, enabled }: any) {
  const [isOn, setIsOn] = useState(enabled);
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex-1 pr-8">
        <p className="text-sm font-bold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={`w-12 h-6 rounded-full transition-all relative ${isOn ? 'bg-indigo-600' : 'bg-gray-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOn ? 'left-7' : 'left-1'}`}></div>
      </button>
    </div>
  );
}

function StatusCard({ icon, label, status, color }: any) {
  return (
    <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-3">
      <div className="text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className={`text-sm font-bold ${color}`}>{status}</p>
      </div>
    </div>
  );
}
