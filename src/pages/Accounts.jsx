import { useState, useEffect } from 'react';
import { accountsPayableService, accountsReceivableService } from '../services/firebaseService';
import '../styles/Accounts.css';

const Accounts = () => {
  const [activeTab, setActiveTab] = useState('payable');
  const [payableAccounts, setPayableAccounts] = useState([]);
  const [receivableAccounts, setReceivableAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    value: '',
    dueDate: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const [payableData, receivableData] = await Promise.all([
        accountsPayableService.getAccounts(),
        accountsReceivableService.getAccounts()
      ]);
      setPayableAccounts(payableData);
      setReceivableAccounts(receivableData);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
      alert('Erro ao carregar contas');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.description || !formData.value || !formData.dueDate) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const accountData = {
        ...formData,
        value: parseFloat(formData.value),
        dueDate: new Date(formData.dueDate),
        status: 'pending'
      };

      if (activeTab === 'payable') {
        await accountsPayableService.addAccount(accountData);
      } else {
        await accountsReceivableService.addAccount(accountData);
      }

      alert('Conta registrada com sucesso!');
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error('Erro ao registrar conta:', error);
      alert('Erro ao registrar conta');
    }
  };

  const handleStatusChange = async (accountId, newStatus) => {
    try {
      if (activeTab === 'payable') {
        await accountsPayableService.updateAccountStatus(accountId, newStatus);
      } else {
        await accountsReceivableService.updateAccountStatus(accountId, newStatus);
      }

      alert(`Status atualizado para ${newStatus === 'paid' ? 'Pago' : 'Pendente'}!`);
      loadAccounts();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      value: '',
      dueDate: ''
    });
    setShowForm(false);
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

  const getDaysUntilDue = (dueDate) => {
    const today = new Date();
    const due = dueDate.toDate();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (account) => {
    if (account.status === 'paid') {
      return <span className="badge badge-success">Pago</span>;
    }
    
    const daysUntilDue = getDaysUntilDue(account.dueDate);
    if (daysUntilDue < 0) {
      return <span className="badge badge-danger">Vencido</span>;
    } else if (daysUntilDue <= 3) {
      return <span className="badge badge-warning">Vence em {daysUntilDue} dias</span>;
    } else {
      return <span className="badge badge-info">Pendente</span>;
    }
  };

  // Filtrar contas
  const currentAccounts = activeTab === 'payable' ? payableAccounts : receivableAccounts;
  const filteredAccounts = currentAccounts.filter(account =>
    account.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcular totais
  const totalPending = currentAccounts
    .filter(account => account.status === 'pending')
    .reduce((sum, account) => sum + account.value, 0);

  const totalPaid = currentAccounts
    .filter(account => account.status === 'paid')
    .reduce((sum, account) => sum + account.value, 0);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando contas...</p>
      </div>
    );
  }

  return (
    <div className="accounts">
      <div className="accounts-header">
        <h1>Contas a Pagar e Receber</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nova Conta
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'payable' ? 'active' : ''}`}
          onClick={() => setActiveTab('payable')}
        >
          📄 Contas a Pagar
        </button>
        <button 
          className={`tab ${activeTab === 'receivable' ? 'active' : ''}`}
          onClick={() => setActiveTab('receivable')}
        >
          💰 Contas a Receber
        </button>
      </div>

      {/* Resumo */}
      <div className="accounts-summary">
        <div className="summary-cards">
          <div className="summary-card pending">
            <div className="card-icon">⏳</div>
            <div className="card-content">
              <h3>Pendentes</h3>
              <p className="card-value">{formatCurrency(totalPending)}</p>
              <p className="card-count">
                {currentAccounts.filter(a => a.status === 'pending').length} contas
              </p>
            </div>
          </div>
          
          <div className="summary-card paid">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>Pagas</h3>
              <p className="card-value">{formatCurrency(totalPaid)}</p>
              <p className="card-count">
                {currentAccounts.filter(a => a.status === 'paid').length} contas
              </p>
            </div>
          </div>
          
          <div className="summary-card total">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Total</h3>
              <p className="card-value">{formatCurrency(totalPending + totalPaid)}</p>
              <p className="card-count">{currentAccounts.length} contas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters">
        <div className="form-group">
          <input
            type="text"
            placeholder="Buscar por descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
      </div>

      {/* Formulário de Nova Conta */}
      {showForm && (
        <div className="account-form-overlay">
          <div className="account-form">
            <div className="form-header">
              <h2>Nova Conta {activeTab === 'payable' ? 'a Pagar' : 'a Receber'}</h2>
              <button 
                className="close-button"
                onClick={resetForm}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Descrição *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Descrição da conta"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Valor *</label>
                  <input
                    type="number"
                    step="0.01"
                    name="value"
                    value={formData.value}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="0,00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Data de Vencimento *</label>
                  <input
                    type="date"
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Contas */}
      <div className="accounts-list">
        {filteredAccounts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map(account => {
                const daysUntilDue = getDaysUntilDue(account.dueDate);
                
                return (
                  <tr key={account.id} className={account.status === 'paid' ? 'paid-row' : ''}>
                    <td>
                      <div className="account-description">
                        <strong>{account.description}</strong>
                      </div>
                    </td>
                    <td>
                      <span className={`account-value ${activeTab === 'payable' ? 'payable' : 'receivable'}`}>
                        {formatCurrency(account.value)}
                      </span>
                    </td>
                    <td>
                      <div className="due-date-info">
                        <div>{formatDate(account.dueDate)}</div>
                        {account.status === 'pending' && (
                          <small className={daysUntilDue < 0 ? 'overdue' : daysUntilDue <= 3 ? 'warning' : ''}>
                            {daysUntilDue < 0 
                              ? `${Math.abs(daysUntilDue)} dias atrasado`
                              : daysUntilDue === 0 
                                ? 'Vence hoje'
                                : `${daysUntilDue} dias restantes`
                            }
                          </small>
                        )}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(account)}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {account.status === 'pending' ? (
                          <button 
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(account.id, 'paid')}
                            title="Marcar como Pago"
                          >
                            ✅ Pagar
                          </button>
                        ) : (
                          <button 
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(account.id, 'pending')}
                            title="Marcar como Pendente"
                          >
                            ↩️ Reverter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Nenhuma conta {activeTab === 'payable' ? 'a pagar' : 'a receber'} encontrada.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Registrar primeira conta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Accounts;
