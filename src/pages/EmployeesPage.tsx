import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  employeeService, 
  Employee, 
  EmployeePosition,
  companyService, 
  Company, 
  organizationService, 
  OrganizationUnit, 
  roleService, 
  Role 
} from '../api';
import CompanySelect from '../components/CompanySelect';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Lock, 
  Unlock, 
  Search, 
  Filter, 
  MoreVertical, 
  Mail, 
  Phone, 
  Building, 
  Shield,
  AlertTriangle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeesPage() {
  const { t } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [units, setUnits] = useState<OrganizationUnit[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterUnitId, setFilterUnitId] = useState<string>('');
  const [filterRoleId, setFilterRoleId] = useState<string>('');

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<Employee>>({
    full_name: '',
    email: '',
    phone: '',
    positions: []
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Delete/Lock Confirmation
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);
  const [employeeToToggle, setEmployeeToToggle] = useState<Employee | null>(null);

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompanyId) {
      loadData(selectedCompanyId);
      setSearchQuery('');
      setFilterUnitId('');
      setFilterRoleId('');
    }
  }, [selectedCompanyId]);

  const loadCompanies = async () => {
    const data = await companyService.getAll();
    setCompanies(data);
    if (data.length > 0) {
      setSelectedCompanyId(data[0].id);
    }
  };

  const loadData = async (companyId: string) => {
    setLoading(true);
    try {
      const [empData, unitData, roleData] = await Promise.all([
        employeeService.getAll(companyId),
        organizationService.getAll(companyId),
        roleService.getAll(companyId)
      ]);
      setEmployees(empData);
      setUnits(unitData);
      setRoles(roleData);
    } catch (error) {
      toast.error(t('common.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.positions || formData.positions.length === 0) {
      toast.error(t('employee.positionsRequired') || 'At least one position is required');
      return;
    }

    const loadingToast = toast.loading(t('common.saving'));
    try {
      if (editingId) {
        await employeeService.update(editingId, formData);
        toast.success(t('common.updateSuccess'), { id: loadingToast });
      } else {
        await employeeService.create(selectedCompanyId, formData);
        toast.success(t('common.createSuccess'), { id: loadingToast });
      }
      loadData(selectedCompanyId);
      setShowForm(false);
      resetForm();
    } catch (error) {
      toast.error(t('common.saveError'), { id: loadingToast });
    }
  };

  const handleToggleStatus = async () => {
    if (!employeeToToggle) return;
    const loadingToast = toast.loading(t('common.processing'));
    try {
      await employeeService.toggleStatus(employeeToToggle.id);
      toast.success(t('common.updateSuccess'), { id: loadingToast });
      setEmployeeToToggle(null);
      loadData(selectedCompanyId);
    } catch (error) {
      toast.error(t('common.error'), { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    const loadingToast = toast.loading(t('common.deleting'));
    try {
      await employeeService.delete(employeeToDelete.id);
      toast.success(t('common.deleteSuccess'), { id: loadingToast });
      setEmployeeToDelete(null);
      loadData(selectedCompanyId);
    } catch (error) {
      toast.error(t('common.deleteError'), { id: loadingToast });
    }
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      phone: '',
      positions: [{ 
        employee_id: '', 
        role_id: roles[0]?.id || '', 
        organization_unit_id: units[0]?.id || '', 
        title: '' 
      }]
    });
    setEditingId(null);
  };

  const openEdit = (emp: Employee) => {
    setFormData({
      full_name: emp.full_name,
      email: emp.email,
      phone: emp.phone,
      positions: emp.positions.map(p => ({ ...p }))
    });
    setEditingId(emp.id);
    setShowForm(true);
  };

  const addPosition = () => {
    setFormData({
      ...formData,
      positions: [
        ...(formData.positions || []),
        { 
          employee_id: editingId || '', 
          role_id: roles[0]?.id || '', 
          organization_unit_id: units[0]?.id || '', 
          title: '' 
        }
      ]
    });
  };

  const removePosition = (index: number) => {
    const newPositions = [...(formData.positions || [])];
    newPositions.splice(index, 1);
    setFormData({ ...formData, positions: newPositions });
  };

  const updatePosition = (index: number, field: keyof EmployeePosition, value: string) => {
    const newPositions = [...(formData.positions || [])];
    newPositions[index] = { ...newPositions[index], [field]: value };
    setFormData({ ...formData, positions: newPositions });
  };

  const filteredEmployees = employees.filter(emp => {
    const searchLower = searchQuery.toLowerCase();
    
    // Search query matches
    const matchesSearch = !searchQuery || 
      emp.full_name.toLowerCase().includes(searchLower) ||
      emp.email.toLowerCase().includes(searchLower) ||
      emp.phone.includes(searchQuery) ||
      emp.positions.some(pos => 
        pos.title?.toLowerCase().includes(searchLower) ||
        pos.unit_name?.toLowerCase().includes(searchLower) ||
        pos.role_name?.toLowerCase().includes(searchLower)
      );
    
    // Unit filter matches
    const matchesUnit = !filterUnitId || 
      emp.positions.some(pos => pos.organization_unit_id === filterUnitId);
    
    // Role filter matches
    const matchesRole = !filterRoleId || 
      emp.positions.some(pos => pos.role_id === filterRoleId);

    return matchesSearch && matchesUnit && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('employee.title')}</h2>
          <p className="text-gray-500">{t('employee.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4">
          <CompanySelect
            companies={companies}
            selectedId={selectedCompanyId}
            onSelect={setSelectedCompanyId}
            className="w-64"
          />
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={20} />
            {t('employee.add')}
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder={t('common.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={filterUnitId}
            onChange={(e) => setFilterUnitId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm min-w-[160px]"
          >
            <option value="">{t('organization.unit')}</option>
            {units.map(unit => (
              <option key={unit.id} value={unit.id}>{unit.name}</option>
            ))}
          </select>
          <select
            value={filterRoleId}
            onChange={(e) => setFilterRoleId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm min-w-[160px]"
          >
            <option value="">{t('role.title')}</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          {(searchQuery || filterUnitId || filterRoleId) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setFilterUnitId('');
                setFilterRoleId('');
              }}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              <X size={16} />
              {t('common.clear')}
            </button>
          )}
        </div>
      </div>

      {/* Employee Grid/Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('employee.name')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('employee.contact')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('employee.positions')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{t('common.status')}</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t('common.loading')}</td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">{t('common.noResults')}</td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                          {emp.full_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{emp.full_name}</p>
                          <p className="text-xs text-gray-500">{emp.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {emp.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} className="text-gray-400" />
                          {emp.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="space-y-3">
                        {emp.positions.map((pos, idx) => (
                          <div key={idx} className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600">
                              <Shield size={14} />
                              {pos.role_name}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                              <Building size={12} className="text-gray-400" />
                              {pos.unit_name}
                            </div>
                            {pos.title && (
                              <div className="text-[10px] text-gray-400 mt-1 italic">
                                {pos.title}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        emp.status === 'ACTIVE' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-red-50 text-red-700 border border-red-100'
                      }`}>
                        {t(`common.${emp.status.toLowerCase()}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right align-top">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEdit(emp)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t('common.edit')}
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => setEmployeeToToggle(emp)}
                          className={`p-2 rounded-lg transition-colors ${
                            emp.status === 'ACTIVE' 
                              ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' 
                              : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={emp.status === 'ACTIVE' ? t('employee.lock') : t('employee.unlock')}
                        >
                          {emp.status === 'ACTIVE' ? <Lock size={16} /> : <Unlock size={16} />}
                        </button>
                        <button 
                          onClick={() => setEmployeeToDelete(emp)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t('common.delete')}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900">
                {editingId ? t('employee.edit') : t('employee.new')}
              </h3>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-auto p-6 space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('employee.contact')}</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t('employee.fullName')}</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Nguyen Van A"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t('employee.email')}</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{t('employee.phone')}</label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        placeholder="0123456789"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider">{t('employee.positions')}</h4>
                  <button
                    type="button"
                    onClick={addPosition}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Plus size={14} />
                    {t('employee.addPosition')}
                  </button>
                </div>
                
                <div className="space-y-4">
                  {formData.positions?.map((pos, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 relative group/pos">
                      {formData.positions!.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removePosition(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">{t('employee.organization')}</label>
                          <select
                            required
                            value={pos.organization_unit_id}
                            onChange={e => updatePosition(index, 'organization_unit_id', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="" disabled>{t('organization.selectType')}</option>
                            {units.map(unit => (
                              <option key={unit.id} value={unit.id}>{unit.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">{t('employee.role')}</label>
                          <select
                            required
                            value={pos.role_id}
                            onChange={e => updatePosition(index, 'role_id', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                          >
                            <option value="" disabled>{t('role.scopeType')}</option>
                            {roles.map(role => (
                              <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-500 mb-1">{t('employee.titleDisplay')}</label>
                          <input
                            type="text"
                            value={pos.title}
                            onChange={e => updatePosition(index, 'title', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder={t('employee.titleDisplay') || 'e.g. Manager'}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-bold"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {employeeToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-xl font-bold">{t('common.confirmDelete')}</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {t('employee.deleteConfirmText', { name: employeeToDelete.full_name })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEmployeeToDelete(null)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={confirmDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-bold"
              >
                {t('common.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Confirmation Modal */}
      {employeeToToggle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
              <div className="p-3 bg-indigo-50 rounded-full">
                {employeeToToggle.status === 'ACTIVE' ? <Lock size={24} /> : <Unlock size={24} />}
              </div>
              <h3 className="text-xl font-bold">
                {employeeToToggle.status === 'ACTIVE' ? t('employee.lockTitle') : t('employee.unlockTitle')}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {employeeToToggle.status === 'ACTIVE' 
                ? t('employee.lockConfirmText', { name: employeeToToggle.full_name })
                : t('employee.unlockConfirmText', { name: employeeToToggle.full_name })}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEmployeeToToggle(null)}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors font-medium"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleToggleStatus}
                className={`px-6 py-2 text-white rounded-xl transition-colors font-bold ${
                  employeeToToggle.status === 'ACTIVE' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {employeeToToggle.status === 'ACTIVE' ? t('employee.lock') : t('employee.unlock')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
