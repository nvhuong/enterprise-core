import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import CompanyList from './pages/CompanyList';
import CompanyForm from './pages/CompanyForm';
import OrganizationPage from './pages/OrganizationPage';
import RolePage from './pages/RolePage';
import ServicePage from './pages/ServicePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/companies" replace />} />
          <Route path="companies" element={<CompanyList />} />
          <Route path="companies/new" element={<CompanyForm />} />
          <Route path="companies/:id/edit" element={<CompanyForm />} />
          <Route path="organization" element={<OrganizationPage />} />
          <Route path="roles" element={<RolePage />} />
          <Route path="services" element={<ServicePage />} />
          <Route path="employees" element={
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <p className="text-lg font-medium">Employee Management</p>
              <p className="text-sm">Module coming soon...</p>
            </div>
          } />
          <Route path="settings" element={
            <div className="flex flex-col items-center justify-center h-96 text-gray-500">
              <p className="text-lg font-medium">System Settings</p>
              <p className="text-sm">Module coming soon...</p>
            </div>
          } />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
