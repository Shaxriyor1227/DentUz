import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import SkeletonLoader from './components/SkeletonLoader/SkeletonLoader';

// Layouts — loaded eagerly since they are shared shells
import PublicLayout from './layouts/PublicLayout/PublicLayout';
import AuthLayout from './layouts/AuthLayout/AuthLayout';
import AppLayout from './layouts/AppLayout/AppLayout';

// ALL routes are code-split for maximum initial bundle reduction.
// Public / marketing pages — separate chunk so app shell stays tiny
const Homepage = lazy(() => import('./pages/Homepage/Homepage'));
const Login = lazy(() => import('./pages/Login/Login'));
const Signup = lazy(() => import('./pages/Signup/Signup'));

// Authenticated app pages — each gets its own async chunk
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const Patients = lazy(() => import('./pages/Patients/Patients'));
const Calendar = lazy(() => import('./pages/Calendar/Calendar'));
const PatientProfile = lazy(() => import('./pages/PatientProfile/PatientProfile'));
const TreatmentPlan = lazy(() => import('./pages/TreatmentPlan/TreatmentPlan'));
const Finance = lazy(() => import('./pages/Finance/Finance'));
const Settings = lazy(() => import('./pages/Settings/Settings'));

function PageFallback() {
  return (
    <div style={{ padding: '24px 0', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <SkeletonLoader type="card" height="100px" />
      <SkeletonLoader type="table" count={6} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SidebarProvider>
          <BrowserRouter>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                {/* Public Marketing Route */}
                <Route path="/" element={<PublicLayout />}>
                  <Route index element={<Homepage />} />
                </Route>

                {/* Auth Split-Screen Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                </Route>

                {/* Authenticated Clinical App Routes */}
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/patients" element={<Patients />} />
                  <Route path="/patients/:id" element={<PatientProfile />} />
                  <Route path="/calendar" element={<Calendar />} />
                  <Route path="/treatment-plan" element={<TreatmentPlan />} />
                  <Route path="/finance" element={<Finance />} />
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
