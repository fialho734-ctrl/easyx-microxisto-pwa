import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [technologies, setTechnologies] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [homeContent, setHomeContent] = useState({ text: '', pdf_url: null });
  const [loading, setLoading] = useState(false);

  // Comparison states
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [competitorProducts, setCompetitorProducts] = useState([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState('');
  const [selectedComparisonTech, setSelectedComparisonTech] = useState('');
  const [selectedComparisonProduct, setSelectedComparisonProduct] = useState('');
  const [comparisonData, setComparisonData] = useState(null);

  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  useEffect(() => {
    fetchTechnologies();
    fetchHomeContent();
    fetchCompetitorCompanies();
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setIsLoggedIn(true);
      setIsAdmin(adminStatus);
    }
  };

  const fetchTechnologies = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/technologies`);
      const data = await response.json();
      setTechnologies(data);
    } catch (error) {
      console.error('Error fetching technologies:', error);
    }
  };

  const fetchHomeContent = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/home`);
      const data = await response.json();
      setHomeContent(data);
    } catch (error) {
      console.error('Error fetching home content:', error);
    }
  };

  const fetchCompetitorCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/competitors/companies`);
      const data = await response.json();
      setCompanies(data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleTechChange = async (techId) => {
    setSelectedTech(techId);
    setSelectedProduct('');
    setProductDetails(null);
    
    if (techId) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/technologies/${techId}/products`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      }
      setLoading(false);
    } else {
      setProducts([]);
    }
  };

  const handleProductChange = async (productId) => {
    setSelectedProduct(productId);
    
    if (productId) {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE}/api/products/${productId}`);
        const data = await response.json();
        setProductDetails(data);
      } catch (error) {
        console.error('Error fetching product details:', error);
      }
      setLoading(false);
    } else {
      setProductDetails(null);
    }
  };

  const handleCompanyChange = async (company) => {
    setSelectedCompany(company);
    setSelectedCompetitor('');
    
    if (company) {
      try {
        const response = await fetch(`${API_BASE}/api/competitors/companies/${encodeURIComponent(company)}/products`);
        const data = await response.json();
        setCompetitorProducts(data);
      } catch (error) {
        console.error('Error fetching competitor products:', error);
      }
    } else {
      setCompetitorProducts([]);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('isAdmin', data.is_admin);
        setIsLoggedIn(true);
        setIsAdmin(data.is_admin);
        setCurrentPage('home');
      } else {
        alert('Credenciais inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Erro no login');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentPage('home');
  };

  const loadComparison = async () => {
    if (selectedCompetitor && selectedComparisonProduct) {
      setLoading(true);
      try {
        const [competitorResponse, microxistoResponse] = await Promise.all([
          fetch(`${API_BASE}/api/competitors/${selectedCompetitor}`),
          fetch(`${API_BASE}/api/products/${selectedComparisonProduct}`)
        ]);
        
        const competitorData = await competitorResponse.json();
        const microxistoData = await microxistoResponse.json();
        
        setComparisonData({
          competitor: competitorData,
          microxisto: microxistoData
        });
      } catch (error) {
        console.error('Error loading comparison:', error);
      }
      setLoading(false);
    }
  };

  const selectedTechData = technologies.find(t => t.id === selectedTech);
  const selectedComparisonTechData = technologies.find(t => t.id === selectedComparisonTech);

  const renderCompositionTable = (composition, title) => {
    const elements = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Mo', 'Co', 'Zn', 'B', 'Cu', 'Mn', 'Ni', 'Se', 'Si', 'Fe'];
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-semibold text-gray-800 mb-3">{title}</h4>
        <div className="grid grid-cols-4 gap-2 text-sm">
          {elements.map(element => (
            <div key={element} className="flex justify-between p-2 bg-gray-50 rounded">
              <span className="font-medium">{element}:</span>
              <span>{composition[element] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isLoggedIn && currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <img src="https://i.imgur.com/lwNbD0G.png" alt="MicroXisto" className="h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Login Administrativo</h2>
          </div>
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
          
          <button
            onClick={() => setCurrentPage('home')}
            className="w-full mt-4 text-green-600 hover:text-green-800"
          >
            Voltar ao Início
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src="https://i.imgur.com/lwNbD0G.png" alt="MicroXisto" className="h-12" />
              <h1 className="text-2xl font-bold text-green-800">MicroXisto</h1>
            </div>
            
            <nav className="flex items-center space-x-6">
              <button
                onClick={() => setCurrentPage('home')}
                className={`px-4 py-2 rounded-lg ${currentPage === 'home' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-100'}`}
              >
                Início
              </button>
              <button
                onClick={() => setCurrentPage('technologies')}
                className={`px-4 py-2 rounded-lg ${currentPage === 'technologies' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-100'}`}
              >
                Tecnologias
              </button>
              <button
                onClick={() => setCurrentPage('comparison')}
                className={`px-4 py-2 rounded-lg ${currentPage === 'comparison' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-100'}`}
              >
                Comparativo
              </button>
              
              {isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  {isAdmin && (
                    <button
                      onClick={() => setCurrentPage('admin')}
                      className="px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900"
                    >
                      Admin
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setCurrentPage('login')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Login
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'home' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <img src="https://i.imgur.com/lwNbD0G.png" alt="MicroXisto" className="h-24 mx-auto mb-6" />
              <div className="prose max-w-none">
                <p className="text-lg text-gray-700 mb-6">{homeContent.text}</p>
                {homeContent.pdf_url && (
                  <a
                    href={homeContent.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
                  >
                    Baixar PDF Informativo
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {currentPage === 'technologies' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Tecnologias MicroXisto</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Selecione a Tecnologia</label>
                  <select
                    value={selectedTech}
                    onChange={(e) => handleTechChange(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                  >
                    <option value="">Escolha uma tecnologia...</option>
                    {technologies.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                </div>
                
                {products.length > 0 && (
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Selecione o Produto</label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                    >
                      <option value="">Escolha um produto...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>{product.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              {selectedTechData && (
                <div className="border-t pt-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img src={selectedTechData.logo} alt={selectedTechData.name} className="h-16" />
                    <div>
                      <h3 className="text-2xl font-bold text-green-800">{selectedTechData.name}</h3>
                      <p className="text-gray-600">{selectedTechData.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {productDetails && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <img src={productDetails.logo} alt={productDetails.name} className="h-16" />
                  <div>
                    <h3 className="text-2xl font-bold text-green-800">{productDetails.name}</h3>
                    <div className="flex space-x-4 text-sm text-gray-600">
                      <span>Densidade: {productDetails.density} g/cm³</span>
                      <span>Natureza: {productDetails.nature}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {renderCompositionTable(productDetails.composition, 'Composição Química')}
                  
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Informações Adicionais</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Aditivos:</span>
                        <p className="text-gray-600">{productDetails.additives}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Descrição:</span>
                        <p className="text-gray-600">{productDetails.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'comparison' && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Comparativo de Concorrentes</h2>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Empresa Concorrente</label>
                  <select
                    value={selectedCompany}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                  >
                    <option value="">Selecione...</option>
                    {companies.map(company => (
                      <option key={company.company} value={company.company}>{company.company}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Produto Concorrente</label>
                  <select
                    value={selectedCompetitor}
                    onChange={(e) => setSelectedCompetitor(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                    disabled={!selectedCompany}
                  >
                    <option value="">Selecione...</option>
                    {competitorProducts.map(product => (
                      <option key={product.id} value={product.id}>{product.product}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Tecnologia MicroXisto</label>
                  <select
                    value={selectedComparisonTech}
                    onChange={(e) => {
                      setSelectedComparisonTech(e.target.value);
                      handleTechChange(e.target.value);
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                  >
                    <option value="">Selecione...</option>
                    {technologies.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Produto MicroXisto</label>
                  <select
                    value={selectedComparisonProduct}
                    onChange={(e) => setSelectedComparisonProduct(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                    disabled={!selectedComparisonTech}
                  >
                    <option value="">Selecione...</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>{product.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <button
                onClick={loadComparison}
                disabled={!selectedCompetitor || !selectedComparisonProduct || loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Carregando...' : 'Comparar Produtos'}
              </button>
            </div>
            
            {comparisonData && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">Comparação de Produtos</h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center">
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">{comparisonData.competitor.company}</h4>
                    <h5 className="text-lg text-gray-600 mb-4">{comparisonData.competitor.product}</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Densidade: {comparisonData.competitor.density} g/cm³</p>
                      <p>Natureza: {comparisonData.competitor.nature}</p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <img src={comparisonData.microxisto.logo} alt="MicroXisto" className="h-8" />
                      <h4 className="text-xl font-semibold text-green-800">MicroXisto</h4>
                    </div>
                    <h5 className="text-lg text-gray-600 mb-4">{comparisonData.microxisto.name}</h5>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Densidade: {comparisonData.microxisto.density} g/cm³</p>
                      <p>Natureza: {comparisonData.microxisto.nature}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {renderCompositionTable(comparisonData.competitor.composition, `${comparisonData.competitor.company} - ${comparisonData.competitor.product}`)}
                  {renderCompositionTable(comparisonData.microxisto.composition, `MicroXisto - ${comparisonData.microxisto.name}`)}
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-gray-800 mb-2">Aditivos - {comparisonData.competitor.company}</h5>
                    <p className="text-gray-600">{comparisonData.competitor.additives}</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h5 className="font-semibold text-green-800 mb-2">Aditivos - MicroXisto</h5>
                    <p className="text-gray-600">{comparisonData.microxisto.additives}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {currentPage === 'admin' && isAdmin && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Painel Administrativo</h2>
            <div className="bg-white rounded-lg shadow-md p-8">
              <p className="text-center text-gray-600">Funcionalidades administrativas em desenvolvimento...</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;