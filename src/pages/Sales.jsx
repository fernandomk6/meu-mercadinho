import { useState, useEffect } from 'react';
import { productsService, salesService, cashFlowService } from '../services/firebaseService';
import '../styles/Sales.css';

const Sales = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSalesHistory, setShowSalesHistory] = useState(false);
  const [paymentType, setPaymentType] = useState('cash');
  const [clientName, setClientName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, salesData] = await Promise.all([
        productsService.getProducts(),
        salesService.getSales()
      ]);
      setProducts(productsData);
      setSales(salesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Produto sem estoque!');
      return;
    }

    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        alert('Quantidade solicitada excede o estoque disponível!');
        return;
      }
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (newQuantity > product.stock) {
      alert('Quantidade solicitada excede o estoque disponível!');
      return;
    }

    setCart(cart.map(item =>
      item.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.salePrice * item.quantity), 0);
  };

  const handleSale = async () => {
    if (cart.length === 0) {
      alert('Adicione produtos ao carrinho!');
      return;
    }

    if (paymentType === 'fiado' && !clientName.trim()) {
      alert('Digite o nome do cliente para vendas a prazo!');
      return;
    }

    try {
      const saleData = {
        items: cart.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          unitPrice: item.salePrice,
          totalPrice: item.salePrice * item.quantity
        })),
        total: calculateTotal(),
        paymentType,
        client: paymentType === 'fiado' ? clientName : null
      };

      // Registrar venda
      await salesService.addSale(saleData);

      // Atualizar estoque dos produtos
      for (const item of cart) {
        const newStock = item.stock - item.quantity;
        await productsService.updateProduct(item.id, { stock: newStock });
      }

      // Registrar movimentação no fluxo de caixa
      if (paymentType !== 'fiado') {
        await cashFlowService.addMovement({
          type: 'entrada',
          value: calculateTotal(),
          description: `Venda - ${paymentType === 'cash' ? 'Dinheiro' : 'Cartão'}`
        });
      }

      alert('Venda realizada com sucesso!');
      setCart([]);
      setClientName('');
      setPaymentType('cash');
      loadData();
    } catch (error) {
      console.error('Erro ao realizar venda:', error);
      alert('Erro ao realizar venda');
    }
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
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    product.stock > 0
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
    <div className="sales">
      <div className="sales-header">
        <h1>Sistema de Vendas</h1>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowSalesHistory(!showSalesHistory)}
        >
          {showSalesHistory ? 'Ocultar' : 'Ver'} Histórico
        </button>
      </div>

      <div className="sales-content">
        {/* Área de Produtos */}
        <div className="products-section">
          <div className="section-header">
            <h2>Produtos Disponíveis</h2>
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
                  <h3>{product.name}</h3>
                  <p className="product-category">{product.category}</p>
                  <p className="product-price">{formatCurrency(product.salePrice)}</p>
                  <p className="product-stock">
                    Estoque: <span className={product.stock < 10 ? 'low-stock' : ''}>{product.stock}</span>
                  </p>
                </div>
                <button 
                  className="btn btn-primary add-to-cart"
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                >
                  ➕ Adicionar
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Carrinho de Compras */}
        <div className="cart-section">
          <div className="section-header">
            <h2>Carrinho de Vendas</h2>
            <span className="cart-count">{cart.length} itens</span>
          </div>

          {cart.length > 0 ? (
            <>
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>{formatCurrency(item.salePrice)} cada</p>
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
                        onClick={() => removeFromCart(item.id)}
                      >
                        🗑️
                      </button>
                    </div>
                    <div className="item-total">
                      {formatCurrency(item.salePrice * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="total">
                  <strong>Total: {formatCurrency(calculateTotal())}</strong>
                </div>

                <div className="payment-section">
                  <div className="form-group">
                    <label className="form-label">Forma de Pagamento</label>
                    <select
                      value={paymentType}
                      onChange={(e) => setPaymentType(e.target.value)}
                      className="form-control"
                    >
                      <option value="cash">Dinheiro</option>
                      <option value="card">Cartão</option>
                      <option value="fiado">Fiado</option>
                    </select>
                  </div>

                  {paymentType === 'fiado' && (
                    <div className="form-group">
                      <label className="form-label">Nome do Cliente</label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="form-control"
                        placeholder="Digite o nome do cliente"
                      />
                    </div>
                  )}

                  <button 
                    className="btn btn-success btn-lg finalize-sale"
                    onClick={handleSale}
                  >
                    💰 Finalizar Venda
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-cart">
              <p>Seu carrinho está vazio</p>
              <p>Adicione produtos para começar uma venda</p>
            </div>
          )}
        </div>
      </div>

      {/* Histórico de Vendas */}
      {showSalesHistory && (
        <div className="sales-history">
          <div className="section-header">
            <h2>Histórico de Vendas</h2>
          </div>

          {sales.length > 0 ? (
            <div className="sales-list">
              {sales.map(sale => (
                <div key={sale.id} className="sale-item">
                  <div className="sale-header">
                    <div className="sale-info">
                      <h3>Venda #{sale.id.slice(-8)}</h3>
                      <p className="sale-date">{formatDate(sale.date)}</p>
                    </div>
                    <div className="sale-total">
                      {formatCurrency(sale.total)}
                    </div>
                  </div>
                  
                  <div className="sale-details">
                    <div className="payment-info">
                      <span className={`badge ${sale.paymentType === 'cash' ? 'badge-success' : sale.paymentType === 'card' ? 'badge-info' : 'badge-warning'}`}>
                        {sale.paymentType === 'cash' ? 'Dinheiro' : sale.paymentType === 'card' ? 'Cartão' : 'Fiado'}
                      </span>
                      {sale.client && <span className="client-name">Cliente: {sale.client}</span>}
                    </div>
                    
                    <div className="sale-items">
                      {sale.items.map((item, index) => (
                        <div key={index} className="sale-item-detail">
                          <span>{item.productName}</span>
                          <span>{item.quantity}x {formatCurrency(item.unitPrice)}</span>
                          <span>{formatCurrency(item.totalPrice)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Nenhuma venda realizada ainda</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Sales;
