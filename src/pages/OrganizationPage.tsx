import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { organizationService, OrganizationUnit, companyService, Company, unitTypeService, UnitType } from '../api';
import CompanySelect from '../components/CompanySelect';
import { Plus, Edit2, Trash2, ChevronRight, ChevronDown, Building, AlertTriangle, Settings, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrganizationPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [units, setUnits] = useState<OrganizationUnit[]>([]);
  const [unitTypes, setUnitTypes] = useState<UnitType[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Tree state
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<OrganizationUnit>>({
    name: '',
    unit_type: '',
    parent_id: null
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Unit Type Manager state
  const [showUnitTypeManager, setShowUnitTypeManager] = useState(false);
  const [unitTypeFormData, setUnitTypeFormData] = useState<Partial<UnitType>>({ name: '', code: '', description: '' });
  const [editingUnitTypeId, setEditingUnitTypeId] = useState<string | null>(null);

  // Delete Confirmation
  const [unitToDelete, setUnitToDelete] = useState<OrganizationUnit | null>(null);
  const [unitTypeToDelete, setUnitTypeToDelete] = useState<UnitType | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadData(selectedCompanyId, true);
    } else {
      setUnits([]);
      setUnitTypes([]);
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const data = await companyService.getAll();
    setCompanies(data);
    if (data.length > 0) {
      setSelectedCompanyId(data[0].id);
    }
  };

  const loadData = async (companyId: string, isInitial = false) => {
    setLoading(true);
    try {
      const [unitsData, typesData] = await Promise.all([
        organizationService.getAll(companyId),
        unitTypeService.getAll(companyId)
      ]);
      setUnits(unitsData);
      setUnitTypes(typesData);
      
      // Expand all nodes by default only on initial load
      if (isInitial) {
        setExpandedNodes(new Set(unitsData.map(u => u.id)));
      }
    } catch (error) {
      toast.error(t('common.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(t('common.saving'));
    try {
      if (editingId) {
        await organizationService.update(editingId, formData);
        toast.success(t('common.updateSuccess'), { id: loadingToast });
      } else {
        const newUnit = await organizationService.create(selectedCompanyId, formData);
        toast.success(t('common.createSuccess'), { id: loadingToast });
        
        // Ensure parent is expanded if we added a child
        if (newUnit.parent_id) {
          setExpandedNodes(prev => new Set([...prev, newUnit.parent_id!]));
        }
      }
      loadData(selectedCompanyId);
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error(t('common.saveError'), { id: loadingToast });
    }
  };

  const handleUnitTypeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading(t('common.saving'));
    try {
      if (editingUnitTypeId) {
        await unitTypeService.update(editingUnitTypeId, unitTypeFormData);
        toast.success(t('common.updateSuccess'), { id: loadingToast });
      } else {
        await unitTypeService.create(selectedCompanyId, unitTypeFormData);
        toast.success(t('common.createSuccess'), { id: loadingToast });
      }
      const types = await unitTypeService.getAll(selectedCompanyId);
      setUnitTypes(types);
      setUnitTypeFormData({ name: '', code: '', description: '' });
      setEditingUnitTypeId(null);
    } catch (error) {
      toast.error(t('common.saveError'), { id: loadingToast });
    }
  };

  const confirmDeleteUnitType = async () => {
    if (!unitTypeToDelete) return;
    const loadingToast = toast.loading(t('common.deleting'));
    try {
      await unitTypeService.delete(unitTypeToDelete.id);
      toast.success(t('common.deleteSuccess'), { id: loadingToast });
      setUnitTypeToDelete(null);
      const types = await unitTypeService.getAll(selectedCompanyId);
      setUnitTypes(types);
    } catch (error) {
      toast.error(t('common.deleteError'), { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    if (!unitToDelete) return;
    const loadingToast = toast.loading(t('common.deleting'));
    try {
      await organizationService.delete(unitToDelete.id);
      toast.success(t('common.deleteSuccess'), { id: loadingToast });
      setUnitToDelete(null);
      loadData(selectedCompanyId);
    } catch (error) {
      toast.error(t('common.deleteError'), { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', unit_type: unitTypes[0]?.code || '', parent_id: null });
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
      .map(item => {
        const hasChildren = items.some(child => child.parent_id === item.id);
        const isExpanded = expandedNodes.has(item.id);
        const unitType = unitTypes.find(ut => ut.code === item.unit_type);

        return (
          <React.Fragment key={item.id}>
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 border-b border-gray-100 group">
              <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
                {hasChildren ? (
                  <button 
                    onClick={() => toggleNode(item.id)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                  >
                    {isExpanded ? <ChevronDown size={16} className="text-gray-600" /> : <ChevronRight size={16} className="text-gray-600" />}
                  </button>
                ) : (
                  <div className="w-6" />
                )}
                <span className="font-medium text-gray-700">{item.name}</span>
                <span className="text-[10px] px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 font-semibold uppercase tracking-wider">
                  {unitType?.name || item.unit_type}
                </span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => {
                    setFormData({ ...formData, parent_id: item.id, unit_type: unitTypes[0]?.code || '' });
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
                  onClick={() => setUnitToDelete(item)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                  title={t('common.delete')}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            {hasChildren && isExpanded && buildTree(items, item.id, level + 1)}
          </React.Fragment>
        );
      });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('organization.title')}</h2>
          <p className="text-gray-500">{t('organization.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <CompanySelect
            companies={companies}
            selectedId={selectedCompanyId}
            onSelect={setSelectedCompanyId}
            className="w-64"
          />
          <button
            onClick={() => setShowUnitTypeManager(true)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Settings size={20} />
            {t('organization.unitTypes')}
          </button>
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

      {/* Delete Confirmation Modal */}
      {(unitToDelete || unitTypeToDelete) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70]">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-lg font-bold">{t('common.confirmDelete')}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {unitToDelete 
                ? t('organization.deleteConfirmText', { name: unitToDelete.name })
                : t('organization.deleteUnitTypeConfirmText', { name: unitTypeToDelete?.name })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setUnitToDelete(null); setUnitTypeToDelete(null); }}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={unitToDelete ? confirmDelete : confirmDeleteUnitType}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unit Type Manager Modal */}
      {showUnitTypeManager && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-3xl p-6 h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-xl font-bold text-gray-900">{t('organization.unitTypes')}</h3>
              <button onClick={() => setShowUnitTypeManager(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
              {/* List */}
              <div className="flex-1 overflow-y-auto border rounded-lg">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-3 border-b text-xs font-semibold text-gray-500 uppercase">{t('organization.unitTypeName')}</th>
                      <th className="p-3 border-b text-xs font-semibold text-gray-500 uppercase">{t('organization.unitTypeCode')}</th>
                      <th className="p-3 border-b text-xs font-semibold text-gray-500 uppercase text-right">{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {unitTypes.map(type => (
                      <tr key={type.id} className="hover:bg-gray-50">
                        <td className="p-3 text-sm font-medium text-gray-900">{type.name}</td>
                        <td className="p-3 text-sm text-gray-500 font-mono">{type.code}</td>
                        <td className="p-3 text-right space-x-1">
                          <button 
                            onClick={() => { setUnitTypeFormData(type); setEditingUnitTypeId(type.id); }}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => setUnitTypeToDelete(type)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {unitTypes.length === 0 && (
                      <tr>
                        <td colSpan={3} className="p-8 text-center text-gray-400 italic">{t('common.noData')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Form */}
              <div className="w-72 bg-gray-50 p-4 rounded-lg border">
                <h4 className="font-bold text-gray-900 mb-4">{editingUnitTypeId ? t('organization.editUnitType') : t('organization.newUnitType')}</h4>
                <form onSubmit={handleUnitTypeSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('organization.unitTypeName')}</label>
                    <input
                      type="text"
                      required
                      value={unitTypeFormData.name}
                      onChange={e => setUnitTypeFormData({ ...unitTypeFormData, name: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('organization.unitTypeCode')}</label>
                    <input
                      type="text"
                      required
                      value={unitTypeFormData.code}
                      onChange={e => setUnitTypeFormData({ ...unitTypeFormData, code: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">{t('organization.unitTypeDescription')}</label>
                    <textarea
                      value={unitTypeFormData.description}
                      onChange={e => setUnitTypeFormData({ ...unitTypeFormData, description: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    {editingUnitTypeId && (
                      <button
                        type="button"
                        onClick={() => { setEditingUnitTypeId(null); setUnitTypeFormData({ name: '', code: '', description: '' }); }}
                        className="flex-1 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
                      >
                        {t('common.cancel')}
                      </button>
                    )}
                    <button
                      type="submit"
                      className="flex-1 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      {editingUnitTypeId ? t('common.save') : t('common.add')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

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
                  <option value="" disabled>{t('organization.selectType')}</option>
                  {unitTypes.map(type => (
                    <option key={type.id} value={type.code}>{type.name}</option>
                  ))}
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
