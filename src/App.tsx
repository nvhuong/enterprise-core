import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CompanyList from './pages/CompanyList';
import CompanyForm from './pages/CompanyForm';
import OrganizationPage from './pages/OrganizationPage';
import RolePage from './pages/RolePage';
import ServicePage from './pages/ServicePage';
import EmployeesPage from './pages/EmployeesPage';

import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/new" element={<CompanyForm />} />
          <Route path="companies/:id/edit" element={<CompanyForm />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="roles" element={<RolePage />} />
          <Route path="services" element={<ServicePage />} />
          <Route path="employees" element={<EmployeesPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
