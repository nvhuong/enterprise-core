import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { serviceService, Service, permissionService, Feature } from '../api';
import { Box, Layers, CheckCircle, XCircle, Power } from 'lucide-react';

export default function ServicePage() {
  const { t } = useTranslation();
  const [services, setServices] = useState<Service[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [s, f] = await Promise.all([
        serviceService.getAll(),
        permissionService.getFeatures()
      ]);
      setServices(s);
      setFeatures(f);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleService = async (service: Service) => {
    try {
      const result = await serviceService.toggle(service.id);
      setServices(services.map(s => s.id === service.id ? { ...s, is_active: result.is_active } : s));
    } catch (error) {
      console.error(error);
      alert(t('common.error'));
    }
  };

  const toggleFeature = async (feature: Feature) => {
    try {
      const result = await permissionService.toggleFeature(feature.id);
      setFeatures(features.map(f => f.id === feature.id ? { ...f, is_active: result.is_active } : f));
    } catch (error) {
      console.error(error);
      alert(t('common.error'));
    }
  };

  const getServiceFeatures = (serviceId: string) => {
    return features.filter(f => f.service_id === serviceId);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('service.title')}</h2>
          <p className="text-gray-500">{t('service.subtitle')}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <div key={service.id} className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col transition-colors ${service.is_active ? 'border-gray-200' : 'border-gray-200 opacity-75'}`}>
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
              <p className="text-sm text-gray-500">{service.description}</p>
            </div>
            
            <div className="p-6 flex-1">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Layers size={14} />
                {t('service.features')}
              </h4>
              <ul className="space-y-3">
                {getServiceFeatures(service.id).map(feature => (
                  <li key={feature.id} className="flex items-center justify-between text-sm text-gray-700 group">
                    <div className="flex items-center gap-2">
                      {feature.is_active ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <XCircle size={16} className="text-gray-300" />
                      )}
                      <span className={feature.is_active ? '' : 'text-gray-400 line-through'}>{feature.name}</span>
                    </div>
                    
                    <button
                      onClick={() => toggleFeature(feature)}
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
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
                {getServiceFeatures(service.id).length === 0 && (
                  <li className="text-sm text-gray-400 italic">{t('service.noFeatures')}</li>
                )}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
