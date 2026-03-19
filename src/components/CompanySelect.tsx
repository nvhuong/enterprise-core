import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Company } from '../api';
import { Search, ChevronDown, Check, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CompanySelectProps {
  companies: Company[];
  selectedId: string;
  onSelect: (id: string) => void;
  className?: string;
}

export default function CompanySelect({ companies, selectedId, onSelect, className = "" }: CompanySelectProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCompany = companies.find(c => c.id === selectedId);
  
  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.tax_code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-300 rounded-xl hover:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 transition-all text-left shadow-sm"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <Building2 size={18} />
          </div>
          <div className="truncate">
            <p className="text-sm font-bold text-gray-900 truncate">
              {selectedCompany?.name || t('company.select')}
            </p>
            {selectedCompany && (
              <p className="text-[10px] text-gray-500 font-medium tracking-wider uppercase">
                {selectedCompany.tax_code || t('company.taxCode')}
              </p>
            )}
          </div>
        </div>
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden min-w-[280px]"
          >
            <div className="p-3 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input
                  autoFocus
                  type="text"
                  placeholder={t('common.search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </div>

            <div className="max-h-[320px] overflow-y-auto p-2">
              {filteredCompanies.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  <p className="text-sm">{t('common.noResults')}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredCompanies.map((company) => (
                    <button
                      key={company.id}
                      type="button"
                      onClick={() => {
                        onSelect(company.id);
                        setIsOpen(false);
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left group ${
                        selectedId === company.id 
                          ? 'bg-indigo-50 text-indigo-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className={`p-2 rounded-lg transition-colors ${
                          selectedId === company.id ? 'bg-indigo-100' : 'bg-gray-100 group-hover:bg-white'
                        }`}>
                          <Building2 size={16} />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-bold truncate">{company.name}</p>
                          <p className="text-[10px] opacity-60 font-medium">{company.tax_code}</p>
                        </div>
                      </div>
                      {selectedId === company.id && (
                        <Check size={18} className="text-indigo-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
