import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Components
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import EmpleadosPage from './pages/EmpleadosPage';
import ProyectosPage from './pages/ProyectosPage';
import CalculadoraPage from './pages/CalculadoraPage';
import PlanesPage from './pages/PlanesPage';
import ConfiguracionPage from './pages/ConfiguracionPage';

// Services
import { dbService } from './services/database';

// Types
import { AppState, NotificationOptions } from './types';

// Test utilities (for development)
import './utils/testCalculator';

function App() {
  const [appState, setAppState] = useState<AppState>({
    isLoading: true,
    error: null,
    notifications: [],
  });

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      setAppState(prev => ({ ...prev, isLoading: true }));
      
      // Inicializar base de datos con datos de ejemplo si está vacía
      await dbService.initializeWithSampleData();
      
      setAppState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: null 
      }));
      
    } catch (error) {
      console.error('Error inicializando la aplicación:', error);
      setAppState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }));
    }
  };

  // const addNotification = (notification: NotificationOptions) => {
  //   setAppState(prev => ({
  //     ...prev,
  //     notifications: [...prev.notifications, { ...notification, id: Date.now() }],
  //   }));
  // };

  // const removeNotification = (id: number) => {
  //   setAppState(prev => ({
  //     ...prev,
  //     notifications: prev.notifications.filter(n => n.id !== id),
  //   }));
  // };

  if (appState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-700">Inicializando aplicación...</h2>
          <p className="text-sm text-gray-500 mt-2">Cargando datos y configuración</p>
        </div>
      </div>
    );
  }

  if (appState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="bg-red-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-2">Error de inicialización</h2>
          <p className="text-sm text-gray-600 mb-4">{appState.error}</p>
          <button
            onClick={initializeApp}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/empleados" element={<EmpleadosPage />} />
            <Route path="/proyectos" element={<ProyectosPage />} />
            <Route path="/calculadora" element={<CalculadoraPage />} />
            <Route path="/planes" element={<PlanesPage />} />
            <Route path="/configuracion" element={<ConfiguracionPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Layout>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              style: {
                background: '#10B981',
              },
            },
            error: {
              style: {
                background: '#EF4444',
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;