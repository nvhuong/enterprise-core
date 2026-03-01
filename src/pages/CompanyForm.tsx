import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { companyService, Company } from '../api';
import { ArrowLeft, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function CompanyForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    company_type: 'LIMITED',
    tax_code: '',
    status: 'ACTIVE'
  });

  useEffect(() => {
    if (isEdit) {
      loadCompany();
    }
  }, [id]);

  const loadCompany = async () => {
    try {
      if (id) {
        setLoading(true);
        const data = await companyService.getById(id);
        setFormData(data);
      }
    } catch (error) {
      console.error('Failed to load company', error);
      alert('Failed to load company details');
      navigate('/companies');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit && id) {
        await companyService.update(id, formData);
      } else {
        await companyService.create(formData as any);
      }
      navigate('/companies');
    } catch (error) {
      console.error('Failed to save company', error);
      alert('Failed to save company');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit && !formData.id) return <div>{t('common.loading')}</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <Link to="/companies" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4">
          <ArrowLeft size={16} className="mr-1" />
          {t('common.back')}
        </Link>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? t('company.edit') : t('company.new')}
        </h2>
        <p className="text-gray-500">
          {isEdit ? t('company.editSubtitle') : t('company.newSubtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('company.name')} <span className="text-red-500">*</span></label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Acme Corp"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('company.type')} <span className="text-red-500">*</span></label>
              <select
                value={formData.company_type}
                onChange={e => setFormData({ ...formData, company_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="LIMITED">{t('company.types.LIMITED')}</option>
                <option value="JOINT_STOCK">{t('company.types.JOINT_STOCK')}</option>
                <option value="GROUP">{t('company.types.GROUP')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('company.taxCode')}</label>
              <input
                type="text"
                value={formData.tax_code}
                onChange={e => setFormData({ ...formData, tax_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. 0101234567"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.status')}</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="ACTIVE">{t('common.active')}</option>
              <option value="INACTIVE">{t('common.inactive')}</option>
              <option value="SUSPENDED">{t('common.suspended')}</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">{t('company.inactiveNote')}</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
          <Link
            to="/companies"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            {t('common.cancel')}
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? t('common.saving') : (isEdit ? t('common.save') : t('company.add'))}
          </button>
        </div>
      </form>
    </div>
  );
}
