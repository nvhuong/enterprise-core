import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { serviceService, Service, permissionService, Feature, companyService, Company } from '../api';
import CompanySelect from '../components/CompanySelect';
import { Box, Layers, CheckCircle, XCircle, Power, Search, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ServicePage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [services, setServices] = useState<Service[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);
  const [featureSearch, setFeatureSearch] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadData(selectedCompanyId);
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    try {
      const data = await companyService.getAll();
      setCompanies(data);
      if (data.length > 0) setSelectedCompanyId(data[0].id);
    } catch (error) {
      toast.error(t('common.loadError'));
    }
  };

  const loadData = async (companyId: string) => {
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        serviceService.getAll(companyId),
        permissionService.getFeatures(companyId)
      ]);
      setServices(s);
      setFeatures(f);
    } catch (error) {
      toast.error(t('common.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const toggleService = async (service: Service) => {
    if (!selectedCompanyId) return;
    const loadingToast = toast.loading(t('common.processing'));
    try {
      const result = await serviceService.toggle(selectedCompanyId, service.id);
      setServices(services.map(s => s.id === service.id ? { ...s, is_active: result.is_active } : s));
      toast.success(result.is_active ? t('service.enabled') : t('service.disabled'), { id: loadingToast });
    } catch (error) {
      toast.error(t('common.error'), { id: loadingToast });
    }
  };

  const toggleFeature = async (feature: Feature) => {
    if (!selectedCompanyId) return;
    const loadingToast = toast.loading(t('common.processing'));
    try {
      const result = await permissionService.toggleFeature(selectedCompanyId, feature.id);
      setFeatures(features.map(f => f.id === feature.id ? { ...f, is_active: result.is_active } : f));
      toast.success(result.is_active ? t('service.featureEnabled') : t('service.featureDisabled'), { id: loadingToast });
    } catch (error) {
      toast.error(t('common.error'), { id: loadingToast });
    }
  };

  const getFilteredFeatures = (serviceId: string) => {
    const serviceFeatures = features.filter(f => f.service_id === serviceId);
    const search = featureSearch[serviceId]?.toLowerCase() || '';
    if (!search) return serviceFeatures;
    return serviceFeatures.filter(f => 
      f.name.toLowerCase().includes(search) || 
      f.code.toLowerCase().includes(search)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('service.title')}</h2>
          <p className="text-gray-500">{t('service.subtitle')}</p>
        </div>
        <CompanySelect
          companies={companies}
          selectedId={selectedCompanyId}
          onSelect={setSelectedCompanyId}
          className="w-64"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map(service => {
            const serviceFeatures = getFilteredFeatures(service.id);
            const totalFeatures = features.filter(f => f.service_id === service.id).length;
            
            return (
              <div key={service.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col transition-all duration-300 ${service.is_active ? 'border-gray-200' : 'border-gray-200 opacity-75'}`}>
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`p-2 rounded-lg ${service.is_active ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Box size={24} />
                    </div>
                    <button
                      onClick={() => toggleService(service)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                        service.is_active 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Power size={12} />
                      {service.is_active ? t('common.active') : t('common.inactive')}
                    </button>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{service.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 h-10">{service.description}</p>
                </div>
                
                <div className="p-6 flex-1 flex flex-col min-h-[300px]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <Layers size={14} />
                      {t('service.features')} ({totalFeatures})
                    </h4>
                  </div>

                  {/* Feature Search */}
                  {totalFeatures > 5 && (
                    <div className="relative mb-4">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        placeholder={t('common.search')}
                        className="w-full pl-9 pr-4 py-1.5 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={featureSearch[service.id] || ''}
                        onChange={(e) => setFeatureSearch({ ...featureSearch, [service.id]: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                    <ul className="space-y-3">
                      {serviceFeatures.map(feature => (
                        <li key={feature.id} className="flex items-center justify-between text-sm text-gray-700 group">
                          <div className="flex items-center gap-2 min-w-0">
                            {feature.is_active ? (
                              <CheckCircle size={16} className="text-green-500 shrink-0" />
                            ) : (
                              <XCircle size={16} className="text-gray-300 shrink-0" />
                            )}
                            <span className={`truncate ${feature.is_active ? '' : 'text-gray-400 line-through'}`} title={feature.name}>
                              {feature.name}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => toggleFeature(feature)}
                            className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all shrink-0 ${
                              feature.is_active 
                                ? 'text-red-500 hover:bg-red-50' 
                                : 'text-green-500 hover:bg-green-50'
                            }`}
                            title={feature.is_active ? t('service.disableFeature') : t('service.enableFeature')}
                          >
                            <Power size={14} />
                          </button>
                        </li>
                      ))}
                      {serviceFeatures.length === 0 && (
                        <li className="text-sm text-gray-400 italic py-4 text-center">
                          {totalFeatures === 0 ? t('service.noFeatures') : t('common.noResults')}
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
