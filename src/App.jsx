import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import Sales from './pages/Sales';
import Purchases from './pages/Purchases';
import CreditSales from './pages/CreditSales';
import Accounts from './pages/Accounts';
import CashFlow from './pages/CashFlow';
import './styles/Global.css';
import './styles/Responsive.css';

// Componente principal da aplicação
function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Se ainda está carregando, mostra loading
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  // Se não está autenticado, mostra tela de login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Renderiza a página atual
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'inventory':
        return <Inventory />;
      case 'sales':
        return <Sales />;
      case 'purchases':
        return <Purchases />;
      case 'credit':
        return <CreditSales />;
      case 'accounts':
        return <Accounts />;
      case 'cashflow':
        return <CashFlow />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} setCurrentPage={setCurrentPage}>
      {renderCurrentPage()}
    </Layout>
  );
}

// Componente principal com AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
