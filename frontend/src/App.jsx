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

import ProtectedRoute from './components/RoleGuard/ProtectedRoute';

// ALL routes are code-split for maximum initial bundle reduction.
// Public / marketing pages — separate chunks so app shell stays tiny
const Homepage = lazy(() => import('./pages/Homepage/Homepage'));
const About = lazy(() => import('./pages/About/About'));
const Features = lazy(() => import('./pages/Features/Features'));
const Advantages = lazy(() => import('./pages/Advantages/Advantages'));
const Pricing = lazy(() => import('./pages/Pricing/Pricing'));
const Contact = lazy(() => import('./pages/Contact/Contact'));
const Docs = lazy(() => import('./pages/Docs/Docs'));
const Login = lazy(() => import('./pages/Login/Login'));

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
                  <Route path="about" element={<About />} />
                  <Route path="features" element={<Features />} />
                  <Route path="advantages" element={<Navigate to="/about" replace />} />
                  <Route path="pricing" element={<Pricing />} />
                  <Route path="docs" element={<Docs />} />
                  <Route path="contact" element={<Contact />} />
                </Route>

                {/* Auth Split-Screen Routes */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Navigate to="/contact" replace />} />
                </Route>

                {/* Authenticated Clinical App Routes */}
                <Route
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/dashboard" element={<ProtectedRoute module="dashboard"><Dashboard /></ProtectedRoute>} />
                  <Route path="/patients" element={<ProtectedRoute module="patients"><Patients /></ProtectedRoute>} />
                  <Route path="/patients/:id" element={<ProtectedRoute module="patients"><PatientProfile /></ProtectedRoute>} />
                  <Route path="/calendar" element={<ProtectedRoute module="calendar"><Calendar /></ProtectedRoute>} />
                  <Route path="/treatment-plan" element={<ProtectedRoute module="treatment"><TreatmentPlan /></ProtectedRoute>} />
                  <Route path="/finance" element={<ProtectedRoute module="finance"><Finance /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute module="settings"><Settings /></ProtectedRoute>} />
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
