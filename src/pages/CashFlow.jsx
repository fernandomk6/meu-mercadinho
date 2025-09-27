import { useState, useEffect } from 'react';
import { cashFlowService } from '../services/firebaseService';
import '../styles/CashFlow.css';

const CashFlow = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'entrada',
    value: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [movementsData, balance] = await Promise.all([
        cashFlowService.getMovements(),
        cashFlowService.getCurrentBalance()
      ]);
      setMovements(movementsData);
      setCurrentBalance(balance);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
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
    
    if (!formData.value || !formData.description) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const movementData = {
        ...formData,
        value: parseFloat(formData.value)
      };

      await cashFlowService.addMovement(movementData);
      alert('Movimentação registrada com sucesso!');
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      alert('Erro ao registrar movimentação');
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'entrada',
      value: '',
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
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date.toDate());
  };

  // Filtrar movimentações
  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || movement.type === filterType;
    return matchesSearch && matchesType;
  });

  // Calcular totais
  const totalIncome = movements
    .filter(m => m.type === 'entrada')
    .reduce((sum, m) => sum + m.value, 0);

  const totalExpense = movements
    .filter(m => m.type === 'saída')
    .reduce((sum, m) => sum + m.value, 0);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando fluxo de caixa...</p>
      </div>
    );
  }

  return (
    <div className="cash-flow">
      <div className="cash-flow-header">
        <h1>Fluxo de Caixa</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Nova Movimentação
        </button>
      </div>

      {/* Resumo do Saldo */}
      <div className="balance-summary">
        <div className="balance-card">
          <div className="balance-icon">💰</div>
          <div className="balance-content">
            <h2>Saldo Atual</h2>
            <p className={`balance-value ${currentBalance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(currentBalance)}
            </p>
          </div>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="summary-cards">
        <div className="summary-card income">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <h3>Total de Entradas</h3>
            <p className="card-value">{formatCurrency(totalIncome)}</p>
            <p className="card-count">
              {movements.filter(m => m.type === 'entrada').length} movimentações
            </p>
          </div>
        </div>
        
        <div className="summary-card expense">
          <div className="card-icon">📉</div>
          <div className="card-content">
            <h3>Total de Saídas</h3>
            <p className="card-value">{formatCurrency(totalExpense)}</p>
            <p className="card-count">
              {movements.filter(m => m.type === 'saída').length} movimentações
            </p>
          </div>
        </div>
        
        <div className="summary-card movements">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Total de Movimentações</h3>
            <p className="card-value">{movements.length}</p>
            <p className="card-count">registros</p>
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
        <div className="form-group">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="form-control"
          >
            <option value="">Todos os tipos</option>
            <option value="entrada">Entradas</option>
            <option value="saída">Saídas</option>
          </select>
        </div>
      </div>

      {/* Formulário de Nova Movimentação */}
      {showForm && (
        <div className="movement-form-overlay">
          <div className="movement-form">
            <div className="form-header">
              <h2>Nova Movimentação</h2>
              <button 
                className="close-button"
                onClick={resetForm}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Tipo de Movimentação *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="form-control"
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="saída">Saída</option>
                </select>
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

              <div className="form-group">
                <label className="form-label">Descrição *</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  placeholder="Descrição da movimentação"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Registrar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Movimentações */}
      <div className="movements-list">
        {filteredMovements.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovements.map(movement => (
                <tr key={movement.id} className={movement.type === 'entrada' ? 'income-row' : 'expense-row'}>
                  <td>
                    <div className="movement-date">
                      {formatDate(movement.date)}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${movement.type === 'entrada' ? 'badge-success' : 'badge-danger'}`}>
                      {movement.type === 'entrada' ? 'Entrada' : 'Saída'}
                    </span>
                  </td>
                  <td>
                    <div className="movement-description">
                      {movement.description}
                    </div>
                  </td>
                  <td>
                    <span className={`movement-value ${movement.type === 'entrada' ? 'income' : 'expense'}`}>
                      {movement.type === 'entrada' ? '+' : '-'}{formatCurrency(movement.value)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Nenhuma movimentação encontrada.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Registrar primeira movimentação
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashFlow;
