import { useState, useEffect } from 'react';
import { productsService, purchasesService, cashFlowService } from '../services/firebaseService';
import '../styles/Purchases.css';

const Purchases = () => {
  const [products, setProducts] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [purchaseItems, setPurchaseItems] = useState([]);
  const [supplier, setSupplier] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, purchasesData] = await Promise.all([
        productsService.getProducts(),
        purchasesService.getPurchases()
      ]);
      setProducts(productsData);
      setPurchases(purchasesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const addPurchaseItem = (product) => {
    const existingItem = purchaseItems.find(item => item.id === product.id);
    if (existingItem) {
      setPurchaseItems(purchaseItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setPurchaseItems([...purchaseItems, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removePurchaseItem(productId);
      return;
    }

    setPurchaseItems(purchaseItems.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removePurchaseItem = (productId) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return purchaseItems.reduce((total, item) => total + (item.costPrice * item.quantity), 0);
  };

  const handlePurchase = async () => {
    if (purchaseItems.length === 0) {
      alert('Adicione produtos à compra!');
      return;
    }

    try {
      const purchaseData = {
        items: purchaseItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.costPrice,
          totalPrice: item.costPrice * item.quantity
        })),
        total: calculateTotal(),
        supplier: supplier || 'Fornecedor não informado'
      };

      // Registrar compra
      await purchasesService.addPurchase(purchaseData);

      // Atualizar estoque dos produtos
      for (const item of purchaseItems) {
        const newStock = item.stock + item.quantity;
        await productsService.updateProduct(item.id, { stock: newStock });
      }

      // Registrar movimentação no fluxo de caixa
      await cashFlowService.addMovement({
        type: 'saída',
        value: calculateTotal(),
        description: `Compra - ${supplier || 'Fornecedor não informado'}`
      });

      alert('Compra registrada com sucesso!');
      resetForm();
      loadData();
    } catch (error) {
      console.error('Erro ao registrar compra:', error);
      alert('Erro ao registrar compra');
    }
  };

  const resetForm = () => {
    setPurchaseItems([]);
    setSupplier('');
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

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando dados...</p>
      </div>
    );
  }

  return (
    <div className="purchases">
      <div className="purchases-header">
        <h1>Controle de Compras</h1>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowHistory(!showHistory)}
          >
            {showHistory ? 'Ocultar' : 'Ver'} Histórico
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            ➕ Nova Compra
          </button>
        </div>
      </div>

      {/* Formulário de Nova Compra */}
      {showForm && (
        <div className="purchase-form-overlay">
          <div className="purchase-form">
            <div className="form-header">
              <h2>Nova Compra</h2>
              <button 
                className="close-button"
                onClick={resetForm}
              >
                ✕
              </button>
            </div>

            <div className="form-content">
              {/* Seleção de Produtos */}
              <div className="products-selection">
                <div className="section-header">
                  <h3>Selecionar Produtos</h3>
                  <div className="search-box">
                    <input
                      type="text"
                      placeholder="Buscar produtos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="form-control"
                    />
                  </div>
                </div>

                <div className="products-grid">
                  {filteredProducts.map(product => (
                    <div key={product.id} className="product-card">
                      <div className="product-info">
                        <h4>{product.name}</h4>
                        <p className="product-category">{product.category}</p>
                        <p className="product-price">{formatCurrency(product.costPrice)}</p>
                        <p className="product-stock">Estoque: {product.stock}</p>
                      </div>
                      <button 
                        className="btn btn-primary btn-sm"
                        onClick={() => addPurchaseItem(product)}
                      >
                        ➕ Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Itens da Compra */}
              <div className="purchase-items">
                <div className="section-header">
                  <h3>Itens da Compra</h3>
                  <span className="items-count">{purchaseItems.length} itens</span>
                </div>

                {purchaseItems.length > 0 ? (
                  <>
                    <div className="items-list">
                      {purchaseItems.map(item => (
                        <div key={item.id} className="purchase-item">
                          <div className="item-info">
                            <h4>{item.name}</h4>
                            <p>{formatCurrency(item.costPrice)} cada</p>
                          </div>
                          <div className="item-controls">
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              ➖
                            </button>
                            <span className="quantity">{item.quantity}</span>
                            <button 
                              className="btn btn-sm btn-secondary"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              ➕
                            </button>
                            <button 
                              className="btn btn-sm btn-danger"
                              onClick={() => removePurchaseItem(item.id)}
                            >
                              🗑️
                            </button>
                          </div>
                          <div className="item-total">
                            {formatCurrency(item.costPrice * item.quantity)}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="purchase-summary">
                      <div className="form-group">
                        <label className="form-label">Fornecedor</label>
                        <input
                          type="text"
                          value={supplier}
                          onChange={(e) => setSupplier(e.target.value)}
                          className="form-control"
                          placeholder="Nome do fornecedor (opcional)"
                        />
                      </div>

                      <div className="total">
                        <strong>Total: {formatCurrency(calculateTotal())}</strong>
                      </div>

                      <div className="form-actions">
                        <button 
                          type="button" 
                          className="btn btn-secondary" 
                          onClick={resetForm}
                        >
                          Cancelar
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-success"
                          onClick={handlePurchase}
                        >
                          🛒 Registrar Compra
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="empty-items">
                    <p>Nenhum item adicionado</p>
                    <p>Selecione produtos para começar a compra</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Histórico de Compras */}
      {showHistory && (
        <div className="purchases-history">
          <div className="section-header">
            <h2>Histórico de Compras</h2>
          </div>

          {purchases.length > 0 ? (
            <div className="purchases-list">
              {purchases.map(purchase => (
                <div key={purchase.id} className="purchase-history-item">
                  <div className="purchase-header">
                    <div className="purchase-info">
                      <h3>Compra #{purchase.id.slice(-8)}</h3>
                      <p className="purchase-date">{formatDate(purchase.date)}</p>
                      <p className="purchase-supplier">Fornecedor: {purchase.supplier}</p>
                    </div>
                    <div className="purchase-total">
                      {formatCurrency(purchase.total)}
                    </div>
                  </div>
                  
                  <div className="purchase-items-details">
                    {purchase.items.map((item, index) => (
                      <div key={index} className="purchase-item-detail">
                        <span>{item.productName}</span>
                        <span>{item.quantity}x {formatCurrency(item.unitPrice)}</span>
                        <span>{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Nenhuma compra registrada ainda</p>
            </div>
          )}
        </div>
      )}

      {/* Resumo */}
      <div className="purchases-summary">
        <div className="summary-card">
          <h3>Resumo de Compras</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total de Compras:</span>
              <span className="stat-value">{purchases.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Valor Total:</span>
              <span className="stat-value">
                {formatCurrency(purchases.reduce((sum, p) => sum + p.total, 0))}
              </span>
            </div>
            <div className="stat">
              <span className="stat-label">Última Compra:</span>
              <span className="stat-value">
                {purchases.length > 0 ? formatDate(purchases[0].date) : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Purchases;
