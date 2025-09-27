import { useState, useEffect } from 'react';
import { 
  salesService, 
  productsService, 
  accountsPayableService, 
  accountsReceivableService, 
  cashFlowService 
} from '../services/firebaseService';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    todaySales: 0,
    lowStockProducts: [],
    accountsPayable: [],
    accountsReceivable: [],
    currentBalance: 0,
    loading: true
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Buscar vendas do dia
      const todaySales = await salesService.getTodaySales();
      const todaySalesTotal = todaySales.reduce((sum, sale) => sum + sale.total, 0);

      // Buscar produtos com estoque baixo (menos de 10 unidades)
      const products = await productsService.getProducts();
      const lowStockProducts = products.filter(product => product.stock < 10);

      // Buscar contas a pagar próximas (próximos 7 dias)
      const accountsPayable = await accountsPayableService.getAccounts();
      const upcomingPayable = accountsPayable
        .filter(account => account.status === 'pending')
        .filter(account => {
          const dueDate = account.dueDate.toDate();
          const today = new Date();
          const diffTime = dueDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && diffDays >= 0;
        });

      // Buscar contas a receber próximas (próximos 7 dias)
      const accountsReceivable = await accountsReceivableService.getAccounts();
      const upcomingReceivable = accountsReceivable
        .filter(account => account.status === 'pending')
        .filter(account => {
          const dueDate = account.dueDate.toDate();
          const today = new Date();
          const diffTime = dueDate - today;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return diffDays <= 7 && diffDays >= 0;
        });

      // Calcular saldo atual
      const currentBalance = await cashFlowService.getCurrentBalance();

      setDashboardData({
        todaySales: todaySalesTotal,
        lowStockProducts,
        accountsPayable: upcomingPayable,
        accountsReceivable: upcomingReceivable,
        currentBalance,
        loading: false
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date.toDate());
  };

  if (dashboardData.loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Resumo geral do seu mercadinho</p>
      </div>

      {/* Cards de Resumo */}
      <div className="dashboard-cards">
        <div className="summary-card balance-card">
          <div className="card-icon">💵</div>
          <div className="card-content">
            <h3>Saldo em Caixa</h3>
            <p className="card-value">{formatCurrency(dashboardData.currentBalance)}</p>
          </div>
        </div>

        <div className="summary-card sales-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <h3>Vendas Hoje</h3>
            <p className="card-value">{formatCurrency(dashboardData.todaySales)}</p>
          </div>
        </div>

        <div className="summary-card stock-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <h3>Estoque Baixo</h3>
            <p className="card-value">{dashboardData.lowStockProducts.length}</p>
            <p className="card-subtitle">produtos</p>
          </div>
        </div>

        <div className="summary-card accounts-card">
          <div className="card-icon">📄</div>
          <div className="card-content">
            <h3>Contas Próximas</h3>
            <p className="card-value">
              {dashboardData.accountsPayable.length + dashboardData.accountsReceivable.length}
            </p>
            <p className="card-subtitle">próximos 7 dias</p>
          </div>
        </div>
      </div>

      {/* Seções de Detalhes */}
      <div className="dashboard-sections">
        {/* Produtos com Estoque Baixo */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Produtos com Estoque Baixo</h2>
            <span className="badge badge-warning">{dashboardData.lowStockProducts.length}</span>
          </div>
          
          {dashboardData.lowStockProducts.length > 0 ? (
            <div className="section-content">
              <table className="table">
                <thead>
                  <tr>
                    <th>Produto</th>
                    <th>Categoria</th>
                    <th>Estoque</th>
                    <th>Preço</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.lowStockProducts.slice(0, 5).map(product => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.category}</td>
                      <td>
                        <span className="badge badge-danger">{product.stock}</span>
                      </td>
                      <td>{formatCurrency(product.salePrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {dashboardData.lowStockProducts.length > 5 && (
                <p className="section-more">
                  E mais {dashboardData.lowStockProducts.length - 5} produtos...
                </p>
              )}
            </div>
          ) : (
            <div className="section-empty">
              <p>✅ Todos os produtos estão com estoque adequado!</p>
            </div>
          )}
        </div>

        {/* Contas a Pagar Próximas */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Contas a Pagar (Próximos 7 dias)</h2>
            <span className="badge badge-danger">{dashboardData.accountsPayable.length}</span>
          </div>
          
          {dashboardData.accountsPayable.length > 0 ? (
            <div className="section-content">
              <table className="table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.accountsPayable.map(account => (
                    <tr key={account.id}>
                      <td>{account.description}</td>
                      <td>{formatCurrency(account.value)}</td>
                      <td>{formatDate(account.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="section-empty">
              <p>✅ Nenhuma conta a pagar nos próximos 7 dias!</p>
            </div>
          )}
        </div>

        {/* Contas a Receber Próximas */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Contas a Receber (Próximos 7 dias)</h2>
            <span className="badge badge-success">{dashboardData.accountsReceivable.length}</span>
          </div>
          
          {dashboardData.accountsReceivable.length > 0 ? (
            <div className="section-content">
              <table className="table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Valor</th>
                    <th>Vencimento</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.accountsReceivable.map(account => (
                    <tr key={account.id}>
                      <td>{account.description}</td>
                      <td>{formatCurrency(account.value)}</td>
                      <td>{formatDate(account.dueDate)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="section-empty">
              <p>✅ Nenhuma conta a receber nos próximos 7 dias!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
