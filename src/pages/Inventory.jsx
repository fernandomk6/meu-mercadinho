import { useState, useEffect } from 'react';
import { productsService } from '../services/firebaseService';
import '../styles/Inventory.css';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    costPrice: '',
    salePrice: '',
    stock: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsData = await productsService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      alert('Erro ao carregar produtos');
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
    
    try {
      const productData = {
        ...formData,
        costPrice: parseFloat(formData.costPrice),
        salePrice: parseFloat(formData.salePrice),
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await productsService.updateProduct(editingProduct.id, productData);
        alert('Produto atualizado com sucesso!');
      } else {
        await productsService.addProduct(productData);
        alert('Produto adicionado com sucesso!');
      }

      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      costPrice: product.costPrice.toString(),
      salePrice: product.salePrice.toString(),
      stock: product.stock.toString()
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await productsService.deleteProduct(productId);
        alert('Produto excluído com sucesso!');
        loadProducts();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      costPrice: '',
      salePrice: '',
      stock: ''
    });
    setEditingProduct(null);
    setShowForm(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Obter categorias únicas
  const categories = [...new Set(products.map(product => product.category))];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div className="inventory">
      <div className="inventory-header">
        <h1>Controle de Estoque</h1>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          ➕ Adicionar Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="filters">
        <div className="form-group">
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="form-control"
          >
            <option value="">Todas as categorias</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Formulário de Produto */}
      {showForm && (
        <div className="product-form-overlay">
          <div className="product-form">
            <div className="form-header">
              <h2>{editingProduct ? 'Editar Produto' : 'Novo Produto'}</h2>
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
                  <label className="form-label">Nome do Produto</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Categoria</label>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Preço de Compra</label>
                  <input
                    type="number"
                    step="0.01"
                    name="costPrice"
                    value={formData.costPrice}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preço de Venda</label>
                  <input
                    type="number"
                    step="0.01"
                    name="salePrice"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quantidade em Estoque</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
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
                  {editingProduct ? 'Atualizar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Produtos */}
      <div className="products-list">
        {filteredProducts.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Preço Compra</th>
                <th>Preço Venda</th>
                <th>Estoque</th>
                <th>Margem</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => {
                const margin = product.salePrice - product.costPrice;
                const marginPercent = ((margin / product.costPrice) * 100).toFixed(1);
                
                return (
                  <tr key={product.id}>
                    <td>
                      <div className="product-info">
                        <strong>{product.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info">{product.category}</span>
                    </td>
                    <td>{formatCurrency(product.costPrice)}</td>
                    <td>{formatCurrency(product.salePrice)}</td>
                    <td>
                      <span className={`badge ${product.stock < 10 ? 'badge-danger' : product.stock < 20 ? 'badge-warning' : 'badge-success'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td>
                      <div className="margin-info">
                        <div>{formatCurrency(margin)}</div>
                        <small>({marginPercent}%)</small>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn btn-sm btn-warning"
                          onClick={() => handleEdit(product)}
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(product.id)}
                          title="Excluir"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>Nenhum produto encontrado.</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
            >
              Adicionar primeiro produto
            </button>
          </div>
        )}
      </div>

      {/* Resumo do Estoque */}
      <div className="inventory-summary">
        <div className="summary-card">
          <h3>Resumo do Estoque</h3>
          <div className="summary-stats">
            <div className="stat">
              <span className="stat-label">Total de Produtos:</span>
              <span className="stat-value">{products.length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Estoque Baixo:</span>
              <span className="stat-value">{products.filter(p => p.stock < 10).length}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Valor Total:</span>
              <span className="stat-value">
                {formatCurrency(products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
