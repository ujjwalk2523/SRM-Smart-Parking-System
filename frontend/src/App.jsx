import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { FindParking } from './pages/FindParking';
import { ParkingLotView } from './pages/ParkingLotView';
import { MyBookings } from './pages/MyBookings';
import { ActiveSession } from './pages/ActiveSession';
import { VehiclesPage } from './pages/VehiclesPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { NotFound } from './pages/NotFound';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Route Guard
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Layout />}>
                {/* Public Routes */}
                <Route index element={<LandingPage />} />
                <Route path="explore" element={<FindParking />} />
                <Route path="lot/:id" element={<ParkingLotView />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />

                {/* Authenticated Customer Routes */}
                <Route
                  path="dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="active-session"
                  element={
                    <ProtectedRoute>
                      <ActiveSession />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="vehicles"
                  element={
                    <ProtectedRoute>
                      <VehiclesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Administrator Route */}
                <Route
                  path="admin"
                  element={
                    <AdminRoute>
                      <AdminDashboard />
                    </AdminRoute>
                  }
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Route>
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
