import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { organizationService, OrganizationUnit, companyService, Company } from '../api';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Building } from 'lucide-react';

export default function OrganizationPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [units, setUnits] = useState<OrganizationUnit[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<OrganizationUnit>>({
    name: '',
    unit_type: 'DEPARTMENT',
    parent_id: null
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadUnits(selectedCompanyId);
    } else {
      setUnits([]);
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const data = await companyService.getAll();
    setCompanies(data);
    if (data.length > 0) {
      setSelectedCompanyId(data[0].id);
    }
  };

  const loadUnits = async (companyId: string) => {
    setLoading(true);
    try {
      const data = await organizationService.getAll(companyId);
      setUnits(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await organizationService.update(editingId, formData);
      } else {
        await organizationService.create(selectedCompanyId, formData);
      }
      loadUnits(selectedCompanyId);
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error(error);
      alert(t('common.saveError'));
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      try {
        await organizationService.delete(id);
        loadUnits(selectedCompanyId);
      } catch (error) {
        alert('Cannot delete unit. It may have children or assigned roles.');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', unit_type: 'DEPARTMENT', parent_id: null });
    setEditingId(null);
  };

  const openEdit = (unit: OrganizationUnit) => {
    setFormData({
      name: unit.name,
      unit_type: unit.unit_type,
      parent_id: unit.parent_id
    });
    setEditingId(unit.id);
    setShowForm(true);
  };

  // Build tree structure for display
  const buildTree = (items: OrganizationUnit[], parentId: string | null = null, level = 0): React.ReactNode[] => {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => (
        <React.Fragment key={item.id}>
          <div className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 group">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
              <ChevronRight size={16} className="text-gray-400" />
              <span className="font-medium text-gray-700">{item.name}</span>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">{t(`organization.types.${item.unit_type}`)}</span>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => {
                  setFormData({ ...formData, parent_id: item.id });
                  setShowForm(true);
                }}
                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                title={t('organization.addChild')}
              >
                <Plus size={16} />
              </button>
              <button 
                onClick={() => openEdit(item)}
                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                title={t('common.edit')}
              >
                <Edit2 size={16} />
              </button>
              <button 
                onClick={() => handleDelete(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                title={t('common.delete')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
          {buildTree(items, item.id, level + 1)}
        </React.Fragment>
      ));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('organization.title')}</h2>
          <p className="text-gray-500">{t('organization.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedCompanyId} 
            onChange={(e) => setSelectedCompanyId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          >
            {companies.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus size={20} />
            {t('organization.addRoot')}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">{t('common.loading')}</div>
        ) : units.length === 0 ? (
          <div className="p-8 text-center text-gray-500">{t('organization.noData')}</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {buildTree(units)}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{editingId ? t('organization.edit') : t('organization.new')}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('organization.name')}</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('organization.type')}</label>
                <select
                  value={formData.unit_type}
                  onChange={e => setFormData({ ...formData, unit_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="DEPARTMENT">{t('organization.types.DEPARTMENT')}</option>
                  <option value="TEAM">{t('organization.types.TEAM')}</option>
                  <option value="DIVISION">{t('organization.types.DIVISION')}</option>
                  <option value="BRANCH">{t('organization.types.BRANCH')}</option>
                </select>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
