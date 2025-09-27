import { useState, useEffect } from 'react';
import { debtsService, cashFlowService } from '../services/firebaseService';
import '../styles/CreditSales.css';

const CreditSales = () => {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    client: '',
    value: '',
    dueDate: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      setLoading(true);
      const debtsData = await debtsService.getDebts();
      setDebts(debtsData);
    } catch (error) {
      console.error('Erro ao carregar dívidas:', error);
      alert('Erro ao carregar dívidas');
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
    
    if (!formData.client || !formData.value || !formData.dueDate) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const debtData = {
        ...formData,
        value: parseFloat(formData.value),
        dueDate: new Date(formData.dueDate),
        status: 'pending'
      };

      await debtsService.addDebt(debtData);
      alert('Dívida registrada com sucesso!');
      resetForm();
      loadDebts();
    } catch (error) {
      console.error('Erro ao registrar dívida:', error);
      alert('Erro ao registrar dívida');
    }
  };

  const handlePayment = async (debtId) => {
    if (window.confirm('Confirmar pagamento desta dívida?')) {
      try {
        const debt = debts.find(d => d.id === debtId);
        
        // Atualizar status da dívida
        await debtsService.updateDebtStatus(debtId, 'paid');
        
        // Registrar movimentação no fluxo de caixa
        await cashFlowService.addMovement({
          type: 'entrada',
          value: debt.value,
          description: `Pagamento de fiado - ${debt.client}`
        });

        alert('Pagamento registrado com sucesso!');
        loadDebts();
      } catch (error) {
        console.error('Erro ao registrar pagamento:', error);
        alert('Erro ao registrar pagamento');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      client: '',
      value: '',
      dueDate: '',
      description: ''
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

  const getStatusBadge = (debt) => {
    if (debt.status === 'paid') {
      return <span className="badge badge-success">Pago</span>;
    }
    
    const daysUntilDue = getDaysUntilDue(debt.dueDate);
    if (daysUntilDue < 0) {
      return <span className="badge badge-danger">Vencido</span>;
    } else if (daysUntilDue <= 3) {
      return <span className="badge badge-warning">Vence em {daysUntilDue} dias</span>;
    } else {
      return <span className="badge badge-info">Pendente</span>;
    }
  };

  // Filtrar dívidas
  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || debt.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Calcular totais
  const totalPending = debts
    .filter(debt => debt.status === 'pending')
    .reduce((sum, debt) => sum + debt.value, 0);

  const totalPaid = debts
    .filter(debt => debt.status === 'paid')
    .reduce((sum, debt) => sum + debt.value, 0);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando dívidas...</p>
      </div>
    );
  }

  return (
    <div className="credit-sales">
      <div className="credit-sales-header">
        <h1>Controle de Fiado</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nova Dívida
        </button>
      </div>

      {/* Resumo */}
      <div className="credit-summary">
        <div className="summary-cards">
          <div className="summary-card pending">
            <div className="card-icon">⏳</div>
            <div className="card-content">
              <h3>Pendentes</h3>
              <p className="card-value">{formatCurrency(totalPending)}</p>
              <p className="card-count">{debts.filter(d => d.status === 'pending').length} dívidas</p>
            </div>
          </div>
          
          <div className="summary-card paid">
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h3>Pagas</h3>
              <p className="card-value">{formatCurrency(totalPaid)}</p>
              <p className="card-count">{debts.filter(d => d.status === 'paid').length} dívidas</p>
            </div>
          </div>
          
          <div className="summary-card total">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <h3>Total</h3>
              <p className="card-value">{formatCurrency(totalPending + totalPaid)}</p>
              <p className="card-count">{debts.length} dívidas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters">
        <div className="form-group">
          <input
            type="text"
            placeholder="Buscar por cliente ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendentes</option>
            <option value="paid">Pagas</option>
          </select>
        </div>
      </div>

      {/* Formulário de Nova Dívida */}
      {showForm && (
        <div className="debt-form-overlay">
          <div className="debt-form">
            <div className="form-header">
              <h2>Nova Dívida</h2>
              <button 
                className="close-button"
                onClick={resetForm}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <input
                    type="text"
                    name="client"
                    value={formData.client}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Nome do cliente"
                    required
                  />
                </div>
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
              </div>

              <div className="form-row">
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
                <div className="form-group">
                  <label className="form-label">Descrição</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Descrição da dívida (opcional)"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Dívida
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Dívidas */}
      <div className="debts-list">
        {filteredDebts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredDebts.map(debt => {
                const daysUntilDue = getDaysUntilDue(debt.dueDate);
                
                return (
                  <tr key={debt.id} className={debt.status === 'paid' ? 'paid-row' : ''}>
                    <td>
                      <div className="client-info">
                        <strong>{debt.client}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="debt-description">
                        {debt.description || 'Sem descrição'}
                      </span>
                    </td>
                    <td>
                      <span className="debt-value">{formatCurrency(debt.value)}</span>
                    </td>
                    <td>
                      <div className="due-date-info">
                        <div>{formatDate(debt.dueDate)}</div>
                        {debt.status === 'pending' && (
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
                      {getStatusBadge(debt)}
                    </td>
                    <td>
                      {debt.status === 'pending' && (
                        <button 
                          className="btn btn-sm btn-success"
                          onClick={() => handlePayment(debt.id)}
                          title="Registrar Pagamento"
                        >
                          💰 Pagar
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Nenhuma dívida encontrada.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Registrar primeira dívida
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditSales;
