import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

// Componente para indicador de status online/offline
const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white px-4 py-2 text-center text-sm z-50">
      📡 Você está offline. Algumas funcionalidades podem estar limitadas.
    </div>
  );
};

// Componente para botão de instalação PWA
const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              window.navigator.standalone === true;
    
    setIsIOS(isIOSDevice);
    
    // Se é iOS e não está instalado, mostra instruções APENAS depois de um tempo
    if (isIOSDevice && !isInStandaloneMode) {
      // Aguarda 5 segundos para não interferir com autenticação
      setTimeout(() => {
        setShowIOSInstructions(true);
      }, 5000);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    const handleAppInstalled = () => {
      setShowInstallButton(false);
      setShowIOSInstructions(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Trigger cache dinâmico após carregamento
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Aguarda 3 segundos para não atrapalhar carregamento inicial
        setTimeout(() => {
          registration.active?.postMessage({ type: 'CACHE_DYNAMIC_DATA' });
          console.log('🔄 Iniciando cache offline dos dados essenciais...');
        }, 3000);
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA install result: ${outcome}`);
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  const handleIOSInstallClick = () => {
    setShowIOSInstructions(!showIOSInstructions);
  };

  // Botão Android/Chrome (automático)
  if (showInstallButton && !isIOS) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={handleInstallClick}
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 text-sm flex items-center space-x-2"
        >
          <span>📱</span>
          <span>Instalar App</span>
        </button>
      </div>
    );
  }

  // Botão iOS (manual com instruções)
  if (showIOSInstructions && isIOS) {
    return (
      <>
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={handleIOSInstallClick}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 text-sm flex items-center space-x-2"
          >
            <span>🍎</span>
            <span>Instalar iOS</span>
          </button>
        </div>
        
        {showIOSInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">📱 Instalar no iPhone</h3>
                <p className="text-sm text-gray-600">Para usar como app nativo:</p>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-semibold">Toque no botão Compartilhar</p>
                    <p className="text-gray-500">📤 Na barra inferior do Safari</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <span className="text-blue-600 font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-semibold">Role para baixo</p>
                    <p className="text-gray-500">Encontre "Adicionar à Tela de Início"</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <span className="text-blue-600 font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-semibold">Toque "Adicionar"</p>
                    <p className="text-gray-500">O EasyX aparecerá na sua tela inicial!</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowIOSInstructions(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setShowIOSInstructions(false);
                    alert('Use o botão Compartilhar 📤 do Safari para instalar!');
                  }}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Entendi
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

// Admin Components
const UserManagement = ({ token }) => {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPendingUsers(data);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    }
  };

  const approveUser = async (userId, approved) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: userId, approved })
      });
      
      if (response.ok) {
        fetchUsers();
        fetchPendingUsers();
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
    setLoading(false);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Tem certeza que deseja remover este usuário?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchUsers();
        fetchPendingUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Pending Users */}
      {pendingUsers.length > 0 && (
        <div className="card">
          <h3 className="text-xl font-bold text-red-600 mb-4">Usuários Pendentes de Aprovação</h3>
          <div className="space-y-3">
            {pendingUsers.map(user => (
              <div key={user.id} className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div>
                  <p className="font-semibold">{user.email}</p>
                  <p className="text-sm text-gray-500">Cadastrado em: {new Date(user.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => approveUser(user.id, true)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Aprovar
                  </button>
                  <button
                    onClick={() => approveUser(user.id, false)}
                    disabled={loading}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Users */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Todos os Usuários</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Cadastro</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm ${user.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {user.is_approved ? 'Aprovado' : 'Pendente'}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-sm ${user.is_admin ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {user.is_admin ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {user.email !== 'agrofialho@gmail.com' && (
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={loading}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                      >
                        Remover
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const TechnologyManagement = ({ token, technologies, fetchTechnologies }) => {
  const [editingTech, setEditingTech] = useState(null);
  const [formData, setFormData] = useState({ name: '', logo: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleEdit = (tech) => {
    setEditingTech(tech);
    setFormData({ name: tech.name, logo: tech.logo, description: tech.description });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = editingTech 
        ? `${API_BASE}/api/admin/technologies/${editingTech.id}`
        : `${API_BASE}/api/admin/technologies`;
      
      const method = editingTech ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchTechnologies();
        setEditingTech(null);
        setFormData({ name: '', logo: '', description: '' });
      }
    } catch (error) {
      console.error('Error saving technology:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (techId) => {
    if (!window.confirm('Tem certeza que deseja remover esta tecnologia?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/technologies/${techId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchTechnologies();
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao remover tecnologia');
      }
    } catch (error) {
      console.error('Error deleting technology:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {editingTech ? 'Editar Tecnologia' : 'Nova Tecnologia'}
        </h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">URL do Logo</label>
            <input
              type="text"
              value={formData.logo}
              onChange={(e) => setFormData({...formData, logo: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-semibold mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 h-24"
            />
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleSave}
            disabled={loading || !formData.name}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          {editingTech && (
            <button
              onClick={() => {
                setEditingTech(null);
                setFormData({ name: '', logo: '', description: '' });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Technologies List */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Tecnologias Cadastradas</h3>
        <div className="grid gap-4">
          {technologies.map(tech => (
            <div key={tech.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <img src={tech.logo} alt={tech.name} className="h-12 w-auto object-contain" />
                <div>
                  <h4 className="font-semibold text-green-800">{tech.name}</h4>
                  <p className="text-gray-600 text-sm">{tech.description}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(tech)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(tech.id)}
                  disabled={loading}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ProductManagement = ({ token, technologies }) => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '', logo: '', technology_id: '', density: 0, nature: 'Líquido',
    composition: { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0, Mo: 0, Co: 0, Zn: 0, B: 0, Cu: 0, Mn: 0, Ni: 0, Se: 0, Si: 0, Fe: 0 },
    additives: '', description: '', materials_url: '', proposito: ''
  });
  const [loading, setLoading] = useState(false);

  // Propósito options
  const PROPOSITO_OPTIONS = [
    'Nitrogênio', 'Fósforo', 'Potássio', 'Complexo Mn', 'Complexo Zn', 'Complexo Cu', 
    'Complexo B', 'CoMo', 'CoMoNi', 'CaB', 'Indutor', 'Enchimento de Grãos', 'TS', 
    'Estruturador', 'Condicionador', 'Desalojante', 'Sanitário'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData(product);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const url = editingProduct 
        ? `${API_BASE}/api/admin/products/${editingProduct.id}`
        : `${API_BASE}/api/admin/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchProducts();
        setEditingProduct(null);
        setFormData({
          name: '', logo: '', technology_id: '', density: 0, nature: 'Líquido',
          composition: { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0, Mo: 0, Co: 0, Zn: 0, B: 0, Cu: 0, Mn: 0, Ni: 0, Se: 0, Si: 0, Fe: 0 },
          additives: '', description: '', materials_url: '', proposito: ''
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
    setLoading(false);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Tem certeza que deseja remover este produto?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
    setLoading(false);
  };

  const elements = [
    'N', 'P', 'K', 'Ca', 'Mg', 'S', 'Mo', 'Co', 'Zn', 'B', 'Cu', 'Mn', 'Ni', 'Se', 'Si', 'Fe'
  ];

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {editingProduct ? 'Editar Produto' : 'Novo Produto'}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nome</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">URL do Logo</label>
            <input
              type="text"
              value={formData.logo}
              onChange={(e) => setFormData({...formData, logo: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tecnologia</label>
            <select
              value={formData.technology_id}
              onChange={(e) => setFormData({...formData, technology_id: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            >
              <option value="">Selecione...</option>
              {technologies.map(tech => (
                <option key={tech.id} value={tech.id}>{tech.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Densidade (g/mL)</label>
            <input
              type="number"
              step="0.01"
              value={formData.density}
              onChange={(e) => setFormData({...formData, density: parseFloat(e.target.value) || 0})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Natureza</label>
            <select
              value={formData.nature}
              onChange={(e) => setFormData({...formData, nature: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            >
              <option value="Líquido">Líquido</option>
              <option value="Sólido">Sólido</option>
            </select>
          </div>
        </div>

        {/* Composition */}
        <div className="mb-4">
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Composição Química</h4>
          <div className="grid grid-cols-4 gap-3">
            {elements.map(element => (
              <div key={element}>
                <label className="block text-gray-700 font-medium mb-1 text-sm">{element}</label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.composition[element]}
                  onChange={(e) => setFormData({
                    ...formData, 
                    composition: {...formData.composition, [element]: parseFloat(e.target.value) || 0}
                  })}
                  className="w-full px-2 py-1 text-sm border rounded focus:outline-none focus:border-green-500"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Aditivos</label>
            <textarea
              value={formData.additives}
              onChange={(e) => setFormData({...formData, additives: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 h-20"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Descrição</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 h-20"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">URL dos Materiais (Opcional)</label>
          <input
            type="url"
            value={formData.materials_url}
            onChange={(e) => setFormData({...formData, materials_url: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            placeholder="https://exemplo.com/materiais-produto"
          />
          <p className="text-sm text-gray-500 mt-1">
            Link para materiais técnicos, fichas, vídeos ou documentos relacionados ao produto
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-semibold mb-2">Propósito (Opcional)</label>
          <select
            value={formData.proposito}
            onChange={(e) => setFormData({...formData, proposito: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
          >
            <option value="">Selecione o propósito...</option>
            {PROPOSITO_OPTIONS.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Propósito do produto para sugestões automáticas no comparativo
          </p>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={handleSave}
            disabled={loading || !formData.name || !formData.technology_id}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          {editingProduct && (
            <button
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '', logo: '', technology_id: '', density: 0, nature: 'Líquido',
                  composition: { N: 0, P: 0, K: 0, Ca: 0, Mg: 0, S: 0, Mo: 0, Co: 0, Zn: 0, B: 0, Cu: 0, Mn: 0, Ni: 0, Se: 0, Si: 0, Fe: 0 },
                  additives: '', description: '', materials_url: '', proposito: ''
                });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Products List */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Produtos Cadastrados</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Logo</th>
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Tecnologia</th>
                <th className="px-4 py-2 text-left">Densidade (g/mL)</th>
                <th className="px-4 py-2 text-left">Natureza</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => {
                const technology = technologies.find(t => t.id === product.technology_id);
                return (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-2">
                      <img src={product.logo} alt={product.name} className="h-8 w-auto object-contain" />
                    </td>
                    <td className="px-4 py-2 font-semibold">{product.name}</td>
                    <td className="px-4 py-2">{technology?.name || 'N/A'}</td>
                    <td className="px-4 py-2">{product.density}</td>
                    <td className="px-4 py-2">{product.nature}</td>
                    <td className="px-4 py-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(product)}
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Remover
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CompetitorManagement = ({ token }) => {
  const [competitors, setCompetitors] = useState([]);
  const [csvFile, setCsvFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Estados para tabela editável
  const [editableRows, setEditableRows] = useState([]);
  const [showEditableTable, setShowEditableTable] = useState(false);
  
  // NOVO: Estado para colagem em bloco
  const [bulkPasteData, setBulkPasteData] = useState('');
  const [showBulkPaste, setShowBulkPaste] = useState(false);

  const elements = [
    'N', 'P', 'K', 'Ca', 'Mg', 'S', 'Mo', 'Co', 'Zn', 'B', 'Cu', 'Mn', 'Ni', 'Se', 'Si', 'Fe'
  ];

  useEffect(() => {
    fetchCompetitors();
  }, []);

  const fetchCompetitors = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/competitors`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCompetitors(data);
    } catch (error) {
      console.error('Error fetching competitors:', error);
    }
  };

  // NOVA FUNÇÃO: Processar dados colados em bloco
  const processBulkPaste = () => {
    if (!bulkPasteData.trim()) {
      alert('Cole os dados da sua planilha na área de texto primeiro!');
      return;
    }

    const lines = bulkPasteData.trim().split('\n');
    const newRows = [];

    lines.forEach((line, index) => {
      // Dividir por tab ou vírgula (dependendo do que foi colado)
      const columns = line.includes('\t') ? line.split('\t') : line.split(',');
      
      // Debug: mostrar como as colunas estão sendo interpretadas
      console.log(`Linha ${index + 1}:`, columns);
      
      if (columns.length >= 4) { // Mínimo: Empresa, Produto, Natureza, Densidade
        const row = {
          id: Date.now() + index,
          company: (columns[0] || '').trim(),
          product: (columns[1] || '').trim(),
          density: (columns[3] || '0').trim().replace(',', '.'), // Densidade na coluna 3, converter vírgula para ponto
          nature: (columns[2] || 'liquido').trim().toLowerCase(), // Natureza na coluna 2
          composition: {},
          additives: '',
          proposito: ''
        };

        // Debug: mostrar o objeto row criado
        console.log(`Row criado:`, {
          company: row.company,
          product: row.product, 
          density: row.density,
          nature: row.nature
        });

        // Processar elementos químicos (colunas 4 a 19)
        elements.forEach((element, elemIndex) => {
          const colIndex = 4 + elemIndex; // Começar da coluna 4
          const value = (columns[colIndex] || '0').trim().replace(',', '.'); // Converter vírgula para ponto
          row.composition[element] = value;
        });

        // Aditivos na coluna 20 se existir
        if (columns[20]) {
          row.additives = columns[20].trim();
        }

        // Propósito na coluna 21 se existir
        if (columns[21]) {
          row.proposito = columns[21].trim();
        }

        if (row.company && row.product) {
          newRows.push(row);
        }
      }
    });

    if (newRows.length > 0) {
      setEditableRows([...editableRows, ...newRows]);
      setBulkPasteData('');
      setShowBulkPaste(false);
      alert(`🎉 ${newRows.length} produtos adicionados à tabela! Agora clique em "Salvar" para confirmar.`);
    } else {
      alert('❌ Nenhum produto válido encontrado. Verifique o formato dos dados.');
    }
  };

  // Função para adicionar nova linha editável
  const addEditableRow = () => {
    const newRow = {
      id: Date.now(),
      company: '',
      product: '',
      density: '',
      nature: 'liquido',
      composition: elements.reduce((acc, element) => {
        acc[element] = '';
        return acc;
      }, {}),
      additives: '',
      proposito: ''
    };
    setEditableRows([...editableRows, newRow]);
  };

  // Função para limpar todas as linhas
  const clearAllRows = () => {
    if (window.confirm('Tem certeza que deseja limpar todos os produtos da tabela?')) {
      setEditableRows([]);
    }
  };

  // Função para remover linha editável
  const removeEditableRow = (id) => {
    setEditableRows(editableRows.filter(row => row.id !== id));
  };

  // Função para atualizar dados da linha editável
  const updateEditableRow = (id, field, value, elementSymbol = null) => {
    setEditableRows(editableRows.map(row => {
      if (row.id === id) {
        if (elementSymbol) {
          return {
            ...row,
            composition: { ...row.composition, [elementSymbol]: value }
          };
        } else {
          return { ...row, [field]: value };
        }
      }
      return row;
    }));
  };

  // Função para salvar todas as linhas editáveis
  const saveEditableRows = async () => {
    if (editableRows.length === 0) {
      alert('Não há produtos para salvar!');
      return;
    }

    if (!window.confirm(`Confirma salvar ${editableRows.length} produtos concorrentes?`)) {
      return;
    }

    setLoading(true);
    let savedCount = 0;
    let errors = [];

    for (const row of editableRows) {
      if (!row.company.trim() || !row.product.trim()) {
        errors.push(`Linha com produto "${row.product || 'vazio'}": Empresa e Produto são obrigatórios`);
        continue;
      }

      try {
        const competitorData = {
          company: row.company.trim(),
          product: row.product.trim(),
          logo: '',
          density: parseFloat(row.density) || 0,
          nature: row.nature,
          composition: elements.reduce((acc, element) => {
            acc[element] = parseFloat(row.composition[element]) || 0;
            return acc;
          }, {}),
          additives: row.additives.trim()
        };

        const response = await fetch(`${API_BASE}/api/admin/competitors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(competitorData)
        });

        if (response.ok) {
          savedCount++;
        } else {
          const errorData = await response.json();
          errors.push(`Produto "${row.product}": ${errorData.detail || 'Erro desconhecido'}`);
        }
      } catch (error) {
        errors.push(`Produto "${row.product}": ${error.message}`);
      }
    }

    setImportResult({
      message: `✅ ${savedCount} concorrentes salvos com sucesso!`,
      imported_count: savedCount,
      errors
    });

    if (savedCount > 0) {
      fetchCompetitors();
      setEditableRows([]);
    }

    setLoading(false);
  };

  const handleCsvUpload = async () => {
    if (!csvFile) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', csvFile);
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/competitors/import-csv`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      
      const result = await response.json();
      setImportResult(result);
      
      if (response.ok) {
        fetchCompetitors();
        setCsvFile(null);
      }
    } catch (error) {
      console.error('Error uploading CSV:', error);
      setImportResult({ message: 'Erro ao importar arquivo', errors: [error.message] });
    }
    setLoading(false);
  };

  const deleteCompetitor = async (competitorId) => {
    if (!window.confirm('Tem certeza que deseja remover este concorrente?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/competitors/${competitorId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchCompetitors();
      }
    } catch (error) {
      console.error('Error deleting competitor:', error);
    }
    setLoading(false);
  };

  // NOVA FUNÇÃO: Limpar todos os concorrentes
  const deleteAllCompetitors = async () => {
    if (!window.confirm(`⚠️ ATENÇÃO: Isso vai remover TODOS os ${competitors.length} concorrentes cadastrados. Tem certeza?`)) return;
    
    if (!window.confirm('🚨 CONFIRMAÇÃO FINAL: Esta ação é irreversível! Confirma a exclusão de TODOS os concorrentes?')) return;
    
    setLoading(true);
    let deletedCount = 0;
    
    try {
      for (const competitor of competitors) {
        const response = await fetch(`${API_BASE}/api/admin/competitors/${competitor.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          deletedCount++;
        }
      }
      
      alert(`✅ ${deletedCount} concorrentes removidos com sucesso!`);
      fetchCompetitors();
    } catch (error) {
      console.error('Error deleting all competitors:', error);
      alert('❌ Erro ao remover concorrentes');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* NOVO: Colagem em Bloco - MELHOR SOLUÇÃO */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">🚀 Inserir 1000+ Produtos - Colagem em Bloco</h3>
          <button
            onClick={() => setShowBulkPaste(!showBulkPaste)}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            {showBulkPaste ? 'Ocultar' : '🚀 Colagem em Bloco'}
          </button>
        </div>

        {showBulkPaste && (
          <div>
            <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded">
              <h4 className="font-bold text-purple-800 mb-2">📋 Como usar (MUITO FÁCIL):</h4>
              <ol className="text-sm text-purple-700 space-y-1">
                <li><strong>1.</strong> Selecione TODOS os dados na sua planilha Excel (Ctrl+A)</li>
                <li><strong>2.</strong> Copie (Ctrl+C)</li>
                <li><strong>3.</strong> Cole na área abaixo (Ctrl+V)</li>
                <li><strong>4.</strong> Clique "Processar Dados"</li>
                <li><strong>5.</strong> Revise na tabela e clique "Salvar"</li>
              </ol>
              <p className="text-xs text-purple-600 mt-2">
                <strong>Formato CORRETO:</strong> Empresa | Produto | Natureza | Densidade | N | P | K | Ca | Mg | S | Mo | Co | Zn | B | Cu | Mn | Ni | Se | Si | Fe | Aditivos<br/>
                <strong>✅ PERFEITO:</strong> Vírgulas decimais (1,45) serão convertidas automaticamente para pontos
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">
                📋 Cole aqui TODOS os dados da sua planilha:
              </label>
              <textarea
                value={bulkPasteData}
                onChange={(e) => setBulkPasteData(e.target.value)}
                className="w-full h-32 px-3 py-2 border rounded-lg focus:outline-none focus:border-purple-500 font-mono text-xs"
                placeholder="Cole aqui os dados da sua planilha Excel... (Ctrl+V)

✅ FORMATO CORRETO (baseado no seu exemplo):
ICL     Kelmax  líquido 1,45    0       15,95   0       0       0       0       13,05   0,6525  0       0       0       0       1,305   0       0       0       33,4% Extratos de Algas

DICA: Copie DIRETAMENTE do Excel com Ctrl+C e cole aqui com Ctrl+V"
                spellCheck="false"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                translate="no"
              />
            </div>

            <div className="flex space-x-2">
              <button
                onClick={processBulkPaste}
                disabled={!bulkPasteData.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
              >
                🔄 Processar Dados
              </button>
              <button
                onClick={() => setBulkPasteData('')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                🗑️ Limpar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabela Editável - Para revisão */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">✏️ Tabela de Revisão ({editableRows.length} produtos)</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditableTable(!showEditableTable)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              {showEditableTable ? 'Ocultar' : 'Mostrar Tabela'}
            </button>
            {editableRows.length > 0 && (
              <>
                <button
                  onClick={clearAllRows}
                  className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  🗑️ Limpar Tudo
                </button>
                <button
                  onClick={saveEditableRows}
                  disabled={loading}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 font-bold"
                >
                  {loading ? '💾 Salvando...' : `💾 SALVAR ${editableRows.length} PRODUTOS`}
                </button>
              </>
            )}
          </div>
        </div>

        {showEditableTable && editableRows.length > 0 && (
          <div>
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Revise os dados abaixo antes de salvar!</strong> Você pode editar qualquer campo diretamente na tabela.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-2 py-1">Empresa</th>
                    <th className="border border-gray-300 px-2 py-1">Produto</th>
                    <th className="border border-gray-300 px-2 py-1">Densidade</th>
                    <th className="border border-gray-300 px-2 py-1">Natureza</th>
                    {elements.map(element => (
                      <th key={element} className="border border-gray-300 px-1 py-1 min-w-12">
                        {element}
                      </th>
                    ))}
                    <th className="border border-gray-300 px-2 py-1">Aditivos</th>
                    <th className="border border-gray-300 px-2 py-1">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {editableRows.map(row => (
                    <tr key={row.id}>
                      <td className="border border-gray-300 px-1 py-1">
                        <input
                          type="text"
                          value={row.company}
                          onChange={(e) => updateEditableRow(row.id, 'company', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:ring-1 focus:ring-green-500"
                          placeholder="Nome da Empresa"
                          spellCheck="false"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          translate="no"
                          data-translate="no"
                          lang="en"
                        />
                      </td>
                      <td className="border border-gray-300 px-1 py-1">
                        <input
                          type="text"
                          value={row.product}
                          onChange={(e) => updateEditableRow(row.id, 'product', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:ring-1 focus:ring-green-500"
                          placeholder="Nome do Produto"
                          spellCheck="false"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          translate="no"
                          data-translate="no"
                          lang="en"
                        />
                      </td>
                      <td className="border border-gray-300 px-1 py-1">
                        <input
                          type="number"
                          step="0.01"
                          value={row.density}
                          onChange={(e) => updateEditableRow(row.id, 'density', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:ring-1 focus:ring-green-500"
                          placeholder="g/mL"
                          spellCheck="false"
                          autoComplete="off"
                        />
                      </td>
                      <td className="border border-gray-300 px-1 py-1">
                        <select
                          value={row.nature}
                          onChange={(e) => updateEditableRow(row.id, 'nature', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:ring-1 focus:ring-green-500"
                        >
                          <option value="liquido">Líquido</option>
                          <option value="solido">Sólido</option>
                        </select>
                      </td>
                      {elements.map(element => (
                        <td key={element} className="border border-gray-300 px-1 py-1">
                          <input
                            type="number"
                            step="0.001"
                            value={row.composition[element]}
                            onChange={(e) => updateEditableRow(row.id, 'composition', e.target.value, element)}
                            className="w-full px-1 py-1 text-xs border-0 focus:ring-1 focus:ring-green-500"
                            style={{ minWidth: '50px' }}
                            spellCheck="false"
                            autoComplete="off"
                          />
                        </td>
                      ))}
                      <td className="border border-gray-300 px-1 py-1">
                        <input
                          type="text"
                          value={row.additives || ''}
                          onChange={(e) => updateEditableRow(row.id, 'additives', e.target.value)}
                          className="w-full px-1 py-1 text-xs border-0 focus:ring-1 focus:ring-green-500"
                          placeholder="Aditivos"
                          spellCheck="false"
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          translate="no"
                        />
                      </td>
                      <td className="border border-gray-300 px-1 py-1">
                        <button
                          onClick={() => removeEditableRow(row.id)}
                          className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={addEditableRow}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                ➕ Adicionar Linha Manual
              </button>
            </div>
          </div>
        )}

        {importResult && (
          <div className={`mt-4 p-4 rounded-lg ${importResult.errors && importResult.errors.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
            <p className="font-semibold">{importResult.message}</p>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-600">Erros encontrados:</p>
                <ul className="list-disc list-inside text-sm text-red-600 mt-1 max-h-32 overflow-y-auto">
                  {importResult.errors.slice(0, 50).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {importResult.errors.length > 50 && (
                    <li>... e mais {importResult.errors.length - 50} erros</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CSV Import - Funcionalidade secundária */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">📁 Importar via CSV (Alternativo)</h3>
        
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Formato do CSV:</h4>
          <p className="text-sm text-blue-700 mb-2">O arquivo deve conter as seguintes colunas (na ordem exata):</p>
          <div className="text-xs text-blue-600 grid grid-cols-4 gap-1">
            <span>• Empresa</span>
            <span>• Produto</span>
            <span>• Densidade</span>
            <span>• Natureza</span>
            <span>• N</span>
            <span>• P</span>
            <span>• K</span>
            <span>• Ca</span>
            <span>• Mg</span>
            <span>• S</span>
            <span>• Mo</span>
            <span>• Co</span>
            <span>• Zn</span>
            <span>• B</span>
            <span>• Cu</span>
            <span>• Mn</span>
            <span>• Ni</span>
            <span>• Se</span>
            <span>• Si</span>
            <span>• Fe</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv"
            onChange={(e) => setCsvFile(e.target.files[0])}
            className="flex-1"
          />
          <button
            onClick={handleCsvUpload}
            disabled={!csvFile || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Importando...' : 'Importar CSV'}
          </button>
        </div>
      </div>

      {/* Competitors List */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800">Concorrentes Cadastrados ({competitors.length})</h3>
          {competitors.length > 0 && (
            <button
              onClick={deleteAllCompetitors}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 font-bold"
            >
              🗑️ LIMPAR TODOS OS CONCORRENTES
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Empresa</th>
                <th className="px-3 py-2 text-left">Produto</th>
                <th className="px-3 py-2 text-left">Natureza</th>
                <th className="px-3 py-2 text-left">Densidade (g/mL)</th>
                <th className="px-3 py-2 text-left">Elementos</th>
                <th className="px-3 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map(competitor => (
                <tr key={competitor.id} className="border-t">
                  <td className="px-3 py-2 font-semibold" translate="no" data-translate="no" lang="en">{competitor.company}</td>
                  <td className="px-3 py-2" translate="no" data-translate="no" lang="en">{competitor.product}</td>
                  <td className="px-3 py-2">{competitor.nature}</td>
                  <td className="px-3 py-2">{competitor.density}</td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(competitor.composition).filter(([key, value]) => value > 0).map(([key, value]) => (
                        <span key={key} className="text-xs bg-green-100 text-green-800 px-1 rounded">
                          {key}: {value}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => deleteCompetitor(competitor.id)}
                      disabled={loading}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const HomeContentManagement = ({ token, homeContent, fetchHomeContent }) => {
  const [content, setContent] = useState({ text: '', pdf_url: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (homeContent) {
      setContent({ text: homeContent.text || '', pdf_url: homeContent.pdf_url || '' });
    }
  }, [homeContent]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/home`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(content)
      });
      
      if (response.ok) {
        fetchHomeContent();
        alert('Conteúdo atualizado com sucesso!');
      }
    } catch (error) {
      console.error('Error updating home content:', error);
    }
    setLoading(false);
  };

  return (
    <div className="card">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Gerenciar Conteúdo da Página Inicial</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Texto Principal</label>
          <textarea
            value={content.text}
            onChange={(e) => setContent({...content, text: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 h-32"
            placeholder="Digite o texto que será exibido na página inicial..."
          />
        </div>
        
        <div>
          <label className="block text-gray-700 font-semibold mb-2">URL do PDF (Opcional)</label>
          <input
            type="text"
            value={content.pdf_url}
            onChange={(e) => setContent({...content, pdf_url: e.target.value})}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
            placeholder="https://exemplo.com/documento.pdf"
          />
          <p className="text-sm text-gray-500 mt-1">
            Se fornecido, será exibido um botão para download do PDF na página inicial
          </p>
        </div>
        
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};
const CultureManagement = ({ token, cultures, fetchCultures }) => {
  const [editingCulture, setEditingCulture] = useState(null);
  const [formData, setFormData] = useState({ name: '', image: '', link: '' });
  const [loading, setLoading] = useState(false);

  const handleEdit = (culture) => {
    setEditingCulture(culture);
    setFormData({ name: culture.name, image: culture.image, link: culture.link });
  };

  const handleSave = async () => {
    if (!formData.name || !formData.image || !formData.link) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    setLoading(true);
    try {
      const url = editingCulture 
        ? `${API_BASE}/api/admin/cultures/${editingCulture.id}`
        : `${API_BASE}/api/admin/cultures`;
      
      const method = editingCulture ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        fetchCultures();
        setEditingCulture(null);
        setFormData({ name: '', image: '', link: '' });
        alert(editingCulture ? 'Cultura atualizada com sucesso!' : 'Cultura adicionada com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao salvar cultura');
      }
    } catch (error) {
      console.error('Error saving culture:', error);
      alert('Erro ao salvar cultura');
    }
    setLoading(false);
  };

  const handleDelete = async (cultureId) => {
    if (!window.confirm('Tem certeza que deseja remover esta cultura?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/admin/cultures/${cultureId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchCultures();
        alert('Cultura removida com sucesso!');
      } else {
        const error = await response.json();
        alert(error.detail || 'Erro ao remover cultura');
      }
    } catch (error) {
      console.error('Error deleting culture:', error);
      alert('Erro ao remover cultura');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          {editingCulture ? 'Editar Cultura' : 'Nova Cultura'}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Nome da Cultura</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
              placeholder="Ex: Soja, Milho, Algodão..."
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">URL da Imagem/Ícone</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
              placeholder="https://exemplo.com/icone-cultura.png"
            />
            {formData.image && (
              <div className="mt-2">
                <p className="text-sm text-gray-500 mb-1">Preview:</p>
                <img src={formData.image} alt="Preview" className="h-16 w-16 object-contain border rounded" />
              </div>
            )}
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Link para Pasta de Materiais</label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({...formData, link: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
              placeholder="https://drive.google.com/drive/folders/..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Link para pasta do Google Drive, Dropbox ou outro repositório de arquivos
            </p>
          </div>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleSave}
            disabled={loading || !formData.name || !formData.image || !formData.link}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
          {editingCulture && (
            <button
              onClick={() => {
                setEditingCulture(null);
                setFormData({ name: '', image: '', link: '' });
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>

      {/* Cultures List */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Culturas Cadastradas</h3>
        {cultures.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nenhuma cultura cadastrada ainda.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cultures.map(culture => (
              <div key={culture.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-center space-x-4 mb-3">
                  <img src={culture.image} alt={culture.name} className="h-16 w-16 object-contain" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-green-800">{culture.name}</h4>
                    <a 
                      href={culture.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      Ver materiais →
                    </a>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(culture)}
                    className="flex-1 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(culture.id)}
                    disabled={loading}
                    className="flex-1 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};



const AdminTutorials = () => {
  const [activeSection, setActiveSection] = React.useState('technologies');

  const tutorialSections = [
    { id: 'technologies', title: 'Gerenciar Tecnologias', icon: '⚙️' },
    { id: 'products', title: 'Gerenciar Produtos', icon: '📦' },
    { id: 'competitors', title: 'Importar Concorrentes', icon: '🔄' },
    { id: 'home', title: 'Conteúdo da Home', icon: '🏠' },
    { id: 'users', title: 'Gerenciar Usuários', icon: '👥' }
  ];

  const renderTechnologiesTutorial = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
          ⚙️ Como Gerenciar Tecnologias MicroXisto
        </h3>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-bold text-green-700 mb-2">📝 1. Adicionar Nova Tecnologia</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Vá para a aba <strong>"Tecnologias"</strong> no painel administrativo</li>
              <li>Preencha o campo <strong>"Nome"</strong> (ex: AquaX, MicroX, NanoX)</li>
              <li>Cole a <strong>"URL do Logo"</strong> da tecnologia</li>
              <li>Escreva uma <strong>"Descrição"</strong> detalhada da tecnologia</li>
              <li>Clique em <strong>"Salvar"</strong></li>
            </ol>
            <div className="mt-3 p-3 bg-blue-50 rounded">
              <p className="text-xs text-blue-700">
                💡 <strong>Dica:</strong> Use URLs de imagens hospedadas (ex: imgur, cloud storage) para garantir que os logos sejam exibidos corretamente
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-700 mb-2">✏️ 2. Editar Tecnologia Existente</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Encontre a tecnologia na lista de <strong>"Tecnologias Cadastradas"</strong></li>
              <li>Clique no botão <strong>"Editar"</strong> (azul)</li>
              <li>Modifique os campos desejados</li>
              <li>Clique em <strong>"Salvar"</strong> ou <strong>"Cancelar"</strong></li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-700 mb-2">🗑️ 3. Remover Tecnologia</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Clique no botão <strong>"Remover"</strong> (vermelho) ao lado da tecnologia</li>
              <li>Confirme a remoção na caixa de diálogo</li>
            </ol>
            <div className="mt-3 p-3 bg-yellow-50 rounded">
              <p className="text-xs text-yellow-700">
                ⚠️ <strong>Atenção:</strong> Remover uma tecnologia pode afetar produtos vinculados a ela
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProductsTutorial = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
          📦 Como Gerenciar Produtos MicroXisto
        </h3>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-700 mb-2">📝 1. Adicionar Novo Produto</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Vá para a aba <strong>"Produtos"</strong> no painel administrativo</li>
              <li>Preencha os campos básicos:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li><strong>Nome:</strong> Nome do produto</li>
                  <li><strong>URL do Logo:</strong> Link da imagem do produto</li>
                  <li><strong>Tecnologia:</strong> Selecione uma das tecnologias cadastradas</li>
                  <li><strong>Densidade:</strong> Em g/mL (ex: 1.25)</li>
                  <li><strong>Natureza:</strong> Líquido ou Sólido</li>
                </ul>
              </li>
              <li>Preencha a <strong>"Composição Química"</strong>:
                <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                  <li>Digite valores para cada elemento (N, P, K, Ca, Mg, S, etc.)</li>
                  <li>Use pontos para decimais (ex: 15.5)</li>
                  <li>Deixe zero os elementos que não estão presentes</li>
                </ul>
              </li>
              <li>Adicione <strong>"Aditivos"</strong> e <strong>"Descrição"</strong></li>
              <li>Opcionalmente, adicione <strong>"URL dos Materiais"</strong> para documentação técnica</li>
              <li>Clique em <strong>"Salvar"</strong></li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-bold text-green-700 mb-2">⚗️ 2. Preenchimento da Composição Química</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold mb-2">Elementos Principais:</p>
                <ul className="space-y-1 text-gray-700">
                  <li><strong>N:</strong> Nitrogênio</li>
                  <li><strong>P:</strong> Fósforo</li>
                  <li><strong>K:</strong> Potássio</li>
                  <li><strong>Ca:</strong> Cálcio</li>
                  <li><strong>Mg:</strong> Magnésio</li>
                  <li><strong>S:</strong> Enxofre</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold mb-2">Micronutrientes:</p>
                <ul className="space-y-1 text-gray-700">
                  <li><strong>Mo:</strong> Molibdênio</li>
                  <li><strong>Co:</strong> Cobalto</li>
                  <li><strong>Zn:</strong> Zinco</li>
                  <li><strong>B:</strong> Boro</li>
                  <li><strong>Cu:</strong> Cobre</li>
                  <li><strong>Mn:</strong> Manganês</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 p-3 bg-green-50 rounded">
              <p className="text-xs text-green-700">
                💡 <strong>Dica:</strong> Os valores são exibidos automaticamente em negrito quando maiores que zero nas comparações
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompetitorsTutorial = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-purple-800 mb-4 flex items-center">
          🔄 Como Importar Dados de Concorrentes
        </h3>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
            <h4 className="font-bold text-purple-700 mb-2">🚀 1. Colagem em Bloco (RECOMENDADO)</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Prepare sua planilha Excel/Google Sheets com o formato correto:
                <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono">
                  Empresa | Produto | Natureza | Densidade | N | P | K | Ca | Mg | S | Mo | Co | Zn | B | Cu | Mn | Ni | Se | Si | Fe | Aditivos
                </div>
              </li>
              <li>Selecione <strong>TODOS</strong> os dados na planilha (Ctrl+A ou Cmd+A)</li>
              <li>Copie os dados (Ctrl+C ou Cmd+C)</li>
              <li>Vá para <strong>"Concorrentes"</strong> → clique em <strong>"🚀 Colagem em Bloco"</strong></li>
              <li>Cole os dados na área de texto (Ctrl+V ou Cmd+V)</li>
              <li>Clique em <strong>"🔄 Processar Dados"</strong></li>
              <li>Revise os dados na tabela editável</li>
              <li>Clique em <strong>"💾 SALVAR X PRODUTOS"</strong></li>
            </ol>
            <div className="mt-3 p-3 bg-green-50 rounded">
              <p className="text-xs text-green-700">
                ✅ <strong>Vantagem:</strong> Permite importar 1000+ produtos de uma só vez de forma muito rápida!
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-700 mb-2">📁 2. Importação via CSV (Alternativo)</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Salve sua planilha como arquivo <strong>.csv</strong></li>
              <li>Certifique-se que as colunas estão na ordem correta</li>
              <li>Na seção <strong>"Importar via CSV"</strong>, clique em <strong>"Escolher arquivo"</strong></li>
              <li>Selecione seu arquivo .csv</li>
              <li>Clique em <strong>"Importar CSV"</strong></li>
            </ol>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-orange-500">
            <h4 className="font-bold text-orange-700 mb-2">📋 3. Formato de Dados - MUITO IMPORTANTE</h4>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-800">Exemplo de linha correta:</p>
                <div className="mt-1 p-2 bg-gray-50 rounded text-xs font-mono">
                  ICL | Kelmax | líquido | 1,45 | 0 | 15,95 | 0 | 0 | 0 | 0 | 13,05 | 0,6525 | 0 | 0 | 0 | 0 | 1,305 | 0 | 0 | 0 | 33,4% Extratos de Algas
                </div>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                <p><strong>Coluna 1:</strong> Nome da Empresa</p>
                <p><strong>Coluna 2:</strong> Nome do Produto</p>
                <p><strong>Coluna 3:</strong> Natureza (líquido/sólido)</p>
                <p><strong>Coluna 4:</strong> Densidade em g/mL</p>
                <p><strong>Colunas 5-20:</strong> Elementos químicos na ordem: N, P, K, Ca, Mg, S, Mo, Co, Zn, B, Cu, Mn, Ni, Se, Si, Fe</p>
                <p><strong>Coluna 21:</strong> Aditivos (opcional)</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 rounded">
              <p className="text-xs text-yellow-700">
                ⚠️ <strong>Dica:</strong> Vírgulas decimais (1,45) são automaticamente convertidas para pontos (1.45)
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-700 mb-2">🗑️ 4. Gerenciar Concorrentes Existentes</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li><strong>Visualizar:</strong> Todos os concorrentes aparecem na tabela inferior</li>
              <li><strong>Remover individual:</strong> Clique em "Remover" na linha do concorrente</li>
              <li><strong>Limpar todos:</strong> Use o botão "🗑️ LIMPAR TODOS OS CONCORRENTES" (cuidado!)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderHomeTutorial = () => (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
          🏠 Como Gerenciar Conteúdo da Página Inicial
        </h3>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
            <h4 className="font-bold text-green-700 mb-2">📝 1. Editar Texto Principal</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Vá para a aba <strong>"Conteúdo Home"</strong> no painel administrativo</li>
              <li>Digite ou edite o texto no campo <strong>"Texto Principal"</strong></li>
              <li>Use quebras de linha para organizar o conteúdo</li>
              <li>Clique em <strong>"Salvar Alterações"</strong></li>
            </ol>
            <div className="mt-3 p-3 bg-blue-50 rounded">
              <p className="text-xs text-blue-700">
                💡 <strong>Dica:</strong> Este texto aparece logo abaixo do logo EasyX na página inicial
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-700 mb-2">📄 2. Adicionar Link para PDF</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Cole a URL completa do PDF no campo <strong>"URL do PDF"</strong></li>
              <li>Exemplo: https://exemplo.com/catalogo-microxisto.pdf</li>
              <li>Clique em <strong>"Salvar Alterações"</strong></li>
              <li>Um botão de download aparecerá automaticamente na página inicial</li>
            </ol>
            <div className="mt-3 p-3 bg-green-50 rounded">
              <p className="text-xs text-green-700">
                ✅ <strong>Resultado:</strong> Visitantes poderão baixar o PDF diretamente da página inicial
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTutorial = () => (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-indigo-800 mb-4 flex items-center">
          👥 Como Gerenciar Usuários
        </h3>
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 border-l-4 border-yellow-500">
            <h4 className="font-bold text-yellow-700 mb-2">⏳ 1. Aprovar Usuários Pendentes</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Novos usuários aparecem na seção <strong>"Usuários Pendentes de Aprovação"</strong></li>
              <li>Verifique se o email é @microxisto.com.br válido</li>
              <li>Clique em <strong>"Aprovar"</strong> (verde) para liberar acesso</li>
              <li>Ou clique em <strong>"Rejeitar"</strong> (vermelho) para negar</li>
            </ol>
            <div className="mt-3 p-3 bg-yellow-50 rounded">
              <p className="text-xs text-yellow-700">
                ⚠️ <strong>Importante:</strong> Apenas emails @microxisto.com.br podem se cadastrar
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
            <h4 className="font-bold text-blue-700 mb-2">📋 2. Visualizar Todos os Usuários</h4>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li><strong>Email:</strong> Endereço de email do usuário</li>
              <li><strong>Status:</strong> Aprovado (verde) ou Pendente (vermelho)</li>
              <li><strong>Tipo:</strong> Admin (azul) ou Usuário (cinza)</li>
              <li><strong>Cadastro:</strong> Data de registro</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4 border-l-4 border-red-500">
            <h4 className="font-bold text-red-700 mb-2">🗑️ 3. Remover Usuários</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Clique em <strong>"Remover"</strong> na linha do usuário desejado</li>
              <li>Confirme a remoção na caixa de diálogo</li>
            </ol>
            <div className="mt-3 p-3 bg-red-50 rounded">
              <p className="text-xs text-red-700">
                🛡️ <strong>Proteção:</strong> O usuário admin principal (agrofialho@gmail.com) não pode ser removido
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tutorial Navigation */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
          📚 Tutoriais do Painel Administrativo
        </h2>
        <p className="text-gray-600 text-center mb-6">
          Guias completos para usar todas as funcionalidades do sistema EasyX
        </p>
        
        <div className="flex flex-wrap justify-center gap-3">
          {tutorialSections.map(section => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeSection === section.id 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {section.icon} {section.title}
            </button>
          ))}
        </div>
      </div>

      {/* Tutorial Content */}
      {activeSection === 'technologies' && renderTechnologiesTutorial()}
      {activeSection === 'products' && renderProductsTutorial()}
      {activeSection === 'competitors' && renderCompetitorsTutorial()}
      {activeSection === 'home' && renderHomeTutorial()}
      {activeSection === 'users' && renderUsersTutorial()}

      {/* Additional Help */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          💡 Dicas Gerais
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="space-y-2">
            <p><strong>🔄 PWA (App Mobile):</strong> O sistema funciona offline quando instalado como app</p>
            <p><strong>🎨 Anti-Tradução:</strong> Nomes químicos e empresas não são traduzidos automaticamente</p>
            <p><strong>📱 Responsivo:</strong> Interface adaptada para desktop, tablet e mobile</p>
          </div>
          <div className="space-y-2">
            <p><strong>🔐 Segurança:</strong> Apenas admins acessam este painel</p>
            <p><strong>💾 Backup:</strong> Dados são salvos automaticamente no MongoDB</p>
            <p><strong>⚡ Performance:</strong> Cache inteligente para acesso rápido</p>
          </div>
        </div>
      </div>
    </div>
  );
};

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

  // Cultures states - NOVA FUNCIONALIDADE
  const [cultures, setCultures] = useState([]);

  // Propósito options - NOVA FUNCIONALIDADE
  const PROPOSITO_OPTIONS = [
    'Nitrogênio',
    'Fósforo', 
    'Potássio',
    'Complexo Mn',
    'Complexo Zn',
    'Complexo Cu',
    'Complexo B',
    'CoMo',
    'CoMoNi',
    'CaB',
    'Indutor',
    'Enchimento de Grãos',
    'TS',
    'Estruturador',
    'Condicionador',
    'Desalojante',
    'Sanitário'
  ];

  // New comparison states for enhanced features
  const [selectedProposito, setSelectedProposito] = useState('');
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [viewMode, setViewMode] = useState('comparison'); // 'comparison' or 'standalone'


  // Auth states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  
  // Registration states
  const [registerForm, setRegisterForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [registerMessage, setRegisterMessage] = useState('');

  // Admin states
  const [adminTab, setAdminTab] = useState('home');
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    fetchTechnologies();
    fetchHomeContent();
    fetchCompetitorCompanies();
    fetchCultures(); // NOVA FUNCIONALIDADE
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const storedToken = localStorage.getItem('token');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    if (storedToken) {
      setToken(storedToken);
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
      setFilteredCompanies(data); // Initialize filtered companies
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  // Fetch cultures - NOVA FUNCIONALIDADE
  const fetchCultures = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/cultures`);
      if (response.ok) {
        const data = await response.json();
        setCultures(data);
      }
    } catch (error) {
      console.error('Error fetching cultures:', error);
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
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('isAdmin', data.is_admin);
        setToken(data.access_token);
        setIsLoggedIn(true);
        setIsAdmin(data.is_admin);
        setCurrentPage('home');
      } else {
        alert(data.detail || 'Credenciais inválidas');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Erro no login');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterMessage('As senhas não coincidem');
      return;
    }
    
    if (!registerForm.email.endsWith('@microxisto.com.br')) {
      setRegisterMessage('Email deve ser @microxisto.com.br');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerForm.email,
          password: registerForm.password
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setRegisterMessage('Cadastro realizado! Aguarde a aprovação do administrador.');
        setRegisterForm({ email: '', password: '', confirmPassword: '' });
      } else {
        setRegisterMessage(data.detail || 'Erro no cadastro');
      }
    } catch (error) {
      console.error('Register error:', error);
      setRegisterMessage('Erro no cadastro');
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setToken(null);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentPage('home');
  };


  // NEW: Fetch suggested products based on proposito
  const fetchSuggestedProducts = async (proposito) => {
    if (!proposito) {
      setSuggestedProducts([]);
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE}/api/products/by-proposito/${encodeURIComponent(proposito)}`);
      if (response.ok) {
        const data = await response.json();
        setSuggestedProducts(data);
      }
    } catch (error) {
      console.error('Error fetching suggested products:', error);
    }
  };

  // NEW: Handle proposito selection
  const handlePropositoChange = (proposito) => {
    setSelectedProposito(proposito);
    fetchSuggestedProducts(proposito);
  };

  // NEW: Filter companies for autocomplete
  const handleSearchChange = (value) => {
    setSearchTerm(value);
    if (value.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter(company =>
        company.company.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCompanies(filtered);
    }
  };

  // NEW: Fetch suggested products when competitor is selected
  const handleCompetitorSelection = async (competitorId) => {
    setSelectedCompetitor(competitorId);
    
    if (competitorId) {
      try {
        // Fetch competitor details
        const response = await fetch(`${API_BASE}/api/competitors/${competitorId}`);
        const competitorData = await response.json();
        
        // If competitor has a proposito, fetch suggested MicroXisto products
        if (competitorData.proposito) {
          const suggestionsResponse = await fetch(
            `${API_BASE}/api/products/by-proposito/${encodeURIComponent(competitorData.proposito)}`
          );
          if (suggestionsResponse.ok) {
            const suggestions = await suggestionsResponse.json();
            setSuggestedProducts(suggestions);
          }
        } else {
          setSuggestedProducts([]);
        }
      } catch (error) {
        console.error('Error fetching competitor details:', error);
        setSuggestedProducts([]);
      }
    } else {
      setSuggestedProducts([]);
    }
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
          product: microxistoData
        });
      } catch (error) {
        console.error('Error loading comparison:', error);
      }
      setLoading(false);
    }
  };

  const selectedTechData = technologies.find(t => t.id === selectedTech);
  const selectedComparisonTechData = technologies.find(t => t.id === selectedComparisonTech);

  // Registration form
  if (currentPage === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
        <div className="bg-white p-6 lg:p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <img src="https://i.imgur.com/rJRL0ca.png" alt="EasyX" className="h-12 lg:h-16 mx-auto mb-4 object-contain" />
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Cadastro</h2>
            <p className="text-gray-600 text-sm mt-2">Apenas emails @microxisto.com.br</p>
          </div>
          
          <form onSubmit={handleRegister}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
              <input
                type="email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                placeholder="usuario@microxisto.com.br"
                required
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Senha</label>
              <input
                type="password"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">Confirmar Senha</label>
              <input
                type="password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                required
              />
            </div>
            
            {registerMessage && (
              <div className={`mb-4 p-3 rounded ${registerMessage.includes('sucesso') || registerMessage.includes('Aguarde') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {registerMessage}
              </div>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentPage('login')}
              className="text-green-600 hover:text-green-800"
            >
              Já tem conta? Fazer login
            </button>
            <br />
            <button
              onClick={() => setCurrentPage('home')}
              className="text-green-600 hover:text-green-800 mt-2"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  const renderCompositionTable = (composition, title) => {
    // ELEMENTOS QUÍMICOS - SÍMBOLOS FIXOS (SEM TRADUÇÃO)
    const chemicalSymbols = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Mo', 'Co', 'Zn', 'B', 'Cu', 'Mn', 'Ni', 'Se', 'Si', 'Fe'];
    
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h4 className="font-semibold text-gray-800 mb-3" translate="no">{title}</h4>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
          {chemicalSymbols.map(symbol => {
            const value = composition[symbol] || 0;
            const hasValue = value > 0;
            
            return (
              <div key={symbol} className="flex justify-between p-2 bg-gray-50 rounded">
                <span className="font-medium" translate="no" spellCheck="false">{symbol}:</span>
                <span 
                  translate="no" 
                  className={hasValue ? 'font-bold text-green-700' : 'text-gray-600'}
                >
                  {value} g/L
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isLoggedIn && currentPage === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
        <div className="bg-white p-6 lg:p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <img src="https://i.imgur.com/rJRL0ca.png" alt="EasyX" className="h-12 lg:h-16 mx-auto mb-4 object-contain" />
            <h2 className="text-xl lg:text-2xl font-bold text-gray-800">Login</h2>
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
          
          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentPage('register')}
              className="text-green-600 hover:text-green-800"
            >
              Não tem conta? Cadastre-se
            </button>
            <br />
            <button
              onClick={() => setCurrentPage('home')}
              className="text-green-600 hover:text-green-800 mt-2"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Componentes PWA */}
      <OfflineIndicator />
      <InstallPWAButton />
      
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            {/* Logo e Título */}
            <div className="flex items-center justify-center lg:justify-start mb-4 lg:mb-0 pt-2">
              <img src="https://i.imgur.com/lwNbD0G.png" alt="MicroXisto" className="h-6 lg:h-8" />
            </div>
            
            {/* Navigation */}
            <nav className="flex flex-col lg:flex-row items-center lg:space-x-4 space-y-2 lg:space-y-0">
              <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:gap-4">
                <button
                  onClick={() => setCurrentPage('home')}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base ${currentPage === 'home' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-100'}`}
                >
                  Início
                </button>
                <button
                  onClick={() => setCurrentPage('technologies')}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base ${currentPage === 'technologies' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-100'}`}
                >
                  Tecnologias
                </button>
                <button
                  onClick={() => setCurrentPage('cultures')}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base ${currentPage === 'cultures' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-100'}`}
                >
                  🌾 Culturas
                </button>
                <button
                  onClick={() => setCurrentPage('comparison')}
                  className={`px-3 lg:px-4 py-2 rounded-lg text-sm lg:text-base ${currentPage === 'comparison' ? 'bg-green-600 text-white' : 'text-green-600 hover:bg-green-100'}`}
                >
                  Comparativo
                </button>
                {isLoggedIn && (
                  <button
                    onClick={handleLogout}
                    className="px-3 lg:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm lg:text-base"
                  >
                    Sair
                  </button>
                )}
              </div>
              
              {/* Auth buttons */}
              <div className="flex items-center space-x-2 mt-2 lg:mt-0">
                {isLoggedIn ? (
                  <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-2">
                    {isAdmin && (
                      <button
                        onClick={() => setCurrentPage('admin')}
                        className="px-3 lg:px-4 py-2 bg-green-800 text-white rounded-lg hover:bg-green-900 text-sm lg:text-base"
                      >
                        Admin
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col lg:flex-row gap-2">
                    <button
                      onClick={() => setCurrentPage('login')}
                      className="px-3 lg:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm lg:text-base"
                    >
                      Login
                    </button>
                    <button
                      onClick={() => setCurrentPage('register')}
                      className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm lg:text-base"
                    >
                      Cadastro
                    </button>
                  </div>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentPage === 'home' && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 lg:p-8 text-center">
              <img src="https://i.imgur.com/rJRL0ca.png" alt="EasyX" className="h-16 lg:h-20 mx-auto mb-6 object-contain" />
              <div className="prose max-w-none">
                <p className="text-base lg:text-lg text-gray-700 mb-6">{homeContent.text}</p>
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
          <>
            {isLoggedIn ? (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-bold text-green-800 mb-6 lg:mb-8 text-center">Tecnologias MicroXisto</h2>
                
                <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6 lg:mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Selecione a Tecnologia</label>
                  <select
                    value={selectedTech}
                    onChange={(e) => handleTechChange(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-green-500"
                    spellCheck="false"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    translate="no"
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
                      spellCheck="false"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      translate="no"
                    >
                      <option value="">Escolha um produto...</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id} translate="no">{product.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              
              {selectedTechData && (
                <div className="border-t pt-6">
                  <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-4">
                    <img src={selectedTechData.logo} alt={selectedTechData.name} className="h-12 lg:h-16 mx-auto lg:mx-0" />
                    <div className="text-center lg:text-left">
                      <h3 className="text-xl lg:text-2xl font-bold text-green-800">{selectedTechData.name}</h3>
                      <p className="text-gray-600">{selectedTechData.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {productDetails && (
              <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
                  <img src={productDetails.logo} alt={productDetails.name} className="h-12 lg:h-16 mx-auto lg:mx-0" />
                  <div className="text-center lg:text-left">
                    <h3 className="text-xl lg:text-2xl font-bold text-green-800" translate="no">{productDetails.name}</h3>
                    <div className="flex flex-col lg:flex-row lg:space-x-4 text-sm text-gray-600">
                      <span>Densidade: {productDetails.density} g/mL</span>
                      <span>Natureza: {productDetails.nature}</span>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {renderCompositionTable(productDetails.composition, 'Composição Química')}
                  
                  <div className="bg-white rounded-lg shadow-md p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Informações Adicionais</h4>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Aditivos:</span>
                        <p className="text-gray-600" translate="no">{productDetails.additives}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Descrição:</span>
                        <p className="text-gray-600" translate="no">{productDetails.description}</p>
                      </div>
                      {productDetails.materials_url && (
                        <div>
                          <span className="font-medium text-gray-700">Materiais:</span>
                          <div className="mt-2">
                            <a
                              href={productDetails.materials_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                            >
                              📋 Acessar Materiais
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🔒 Acesso Restrito</h3>
                  <p className="text-gray-600 mb-6">Para acessar as tecnologias MicroXisto, você precisa estar logado.</p>
                  <button 
                    onClick={() => setCurrentPage('login')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Fazer Login
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* NOVA FUNCIONALIDADE - CULTURAS */}
        {currentPage === 'cultures' && (
          <>
            {isLoggedIn ? (
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-bold text-green-800 mb-6 lg:mb-8 text-center">🌾 Culturas MicroXisto</h2>
                
                {cultures.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {cultures.map(culture => (
                      <div key={culture.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
                        <div className="p-6 text-center">
                          <div className="mb-4">
                            <img 
                              src={culture.image} 
                              alt={culture.name}
                              className="w-20 h-20 mx-auto rounded-full object-cover border-4 border-green-100"
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiByeD0iNDAiIGZpbGw9IiM4M0I5NDIiLz4KPHRleHQgeD0iNDAiIHk9IjQ1IiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzAiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn4y+PC90ZXh0Pgo8L3N2Zz4K';
                              }}
                            />
                          </div>
                          <h3 className="text-xl font-bold text-gray-800 mb-4">{culture.name}</h3>
                          <a
                            href={culture.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold"
                          >
        {currentPage === 'comparison' && (
          <>
            {isLoggedIn ? (
              <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl lg:text-3xl font-bold text-green-800 mb-6 lg:mb-8 text-center">Comparativo de Concorrentes</h2>
            
                {/* Simplified Search Form */}
                <div className="bg-white rounded-lg shadow-md p-4 lg:p-6 mb-6 lg:mb-8">
                  {/* Competitor Search with Autocomplete */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">
                        🔍 Buscar Empresa Concorrente
                      </label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Digite para buscar..."
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 text-sm"
                      />
                      {searchTerm && filteredCompanies.length > 0 && (
                        <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg bg-white shadow-lg absolute z-10 w-full max-w-md">
                          {filteredCompanies.slice(0, 10).map((company, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setSearchTerm('');
                                handleCompanyChange(company.company);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-green-50 border-b last:border-b-0 text-sm"
                            >
                              {company.company}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Ou Selecione da Lista</label>
                      <select
                        value={selectedCompany}
                        onChange={(e) => handleCompanyChange(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 text-sm"
                      >
                        <option value="">Selecione...</option>
                        {companies.map(company => (
                          <option key={company.company} value={company.company} translate="no">
                            {company.company}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Product Selection Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4 mb-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Produto Concorrente</label>
                      <select
                        value={selectedCompetitor}
                        onChange={(e) => handleCompetitorSelection(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 text-sm"
                        disabled={!selectedCompany}
                      >
                        <option value="">Selecione...</option>
                        {competitorProducts.map(product => (
                          <option key={product.id} value={product.id} translate="no">{product.product}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Tecnologia MicroXisto</label>
                      <select
                        value={selectedComparisonTech}
                        onChange={(e) => {
                          setSelectedComparisonTech(e.target.value);
                          handleTechChange(e.target.value);
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 text-sm"
                      >
                        <option value="">Selecione...</option>
                        {technologies.map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 text-sm">Produto MicroXisto</label>
                      <select
                        value={selectedComparisonProduct}
                        onChange={(e) => setSelectedComparisonProduct(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 text-sm"
                        disabled={!selectedComparisonTech}
                        translate="no"
                      >
                        <option value="">Selecione...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id} translate="no">{product.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Suggested Products Alert - NEW */}
                  {suggestedProducts.length > 0 && (
                    <div className="mb-6 p-4 bg-green-50 rounded-lg border-2 border-green-300">
                      <p className="text-sm font-bold text-green-900 mb-2">
                        💡 Produtos MicroXisto recomendados com o mesmo propósito:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {suggestedProducts.map(product => (
                          <span key={product.id} className="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-semibold">
                            {product.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={loadComparison}
                      disabled={!selectedCompetitor || !selectedComparisonProduct || loading}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-base"
                    >
                      {loading ? 'Carregando...' : '🔄 Comparar Produtos'}
                    </button>
                    
                    {selectedCompetitor && (
                      <button
                        onClick={() => setViewMode('standalone')}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-base"
                      >
                        👁️ Ver Concorrente Isolado
                      </button>
                    )}
                  </div>
                </div>
            
                {/* Comparison Results - ENHANCED RESPONSIVE LAYOUT */}
                {comparisonData && viewMode === 'comparison' && (
                  <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-green-800 mb-6 text-center">Comparação de Produtos</h3>
                    
                    {/* Mobile: Side-by-Side Layout */}
                    <div className="block lg:hidden mb-6">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1" translate="no">{comparisonData.competitor.company}</h4>
                          <h5 className="text-xs text-gray-600 mb-2" translate="no">{comparisonData.competitor.product}</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>Dens: {comparisonData.competitor.density}</p>
                            <p>{comparisonData.competitor.nature}</p>
                            {comparisonData.competitor.proposito && (
                              <p className="font-semibold text-blue-600">🎯 {comparisonData.competitor.proposito}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <img src={comparisonData.product.logo} alt={comparisonData.product.name} className="h-12 mx-auto mb-2 object-contain" />
                          <h5 className="text-xs text-gray-600 mb-2" translate="no">{comparisonData.product.name}</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>Dens: {comparisonData.product.density}</p>
                            <p>{comparisonData.product.nature}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Original Layout */}
                    <div className="hidden lg:grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                      <div className="text-center">
                        <h4 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2" translate="no">{comparisonData.competitor.company}</h4>
                        <h5 className="text-base lg:text-lg text-gray-600 mb-4" translate="no">{comparisonData.competitor.product}</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Densidade: {comparisonData.competitor.density} g/mL</p>
                          <p>Natureza: {comparisonData.competitor.nature}</p>
                          {comparisonData.competitor.proposito && (
                            <p className="font-bold text-blue-600 mt-2">🎯 Propósito: {comparisonData.competitor.proposito}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <img src={comparisonData.product.logo} alt={comparisonData.product.name} className="h-16 lg:h-20 mx-auto mb-4 object-contain" />
                        <h5 className="text-base lg:text-lg text-gray-600 mb-4" translate="no">{comparisonData.product.name}</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Densidade: {comparisonData.product.density} g/mL</p>
                          <p>Natureza: {comparisonData.product.nature}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Composition Table - Responsive */}
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-2 text-left text-xs lg:text-sm">Elemento</th>
                            <th className="px-2 py-2 text-center text-xs lg:text-sm" translate="no">{comparisonData.competitor.company}</th>
                            <th className="px-2 py-2 text-center text-xs lg:text-sm">MicroXisto</th>
                            <th className="px-2 py-2 text-center text-xs lg:text-sm">Diferença</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(comparisonData.competitor.composition).map(element => {
                            const compValue = comparisonData.competitor.composition[element];
                            const prodValue = comparisonData.product.composition[element];
                            const diff = prodValue - compValue;
                            
                            return (
                              <tr key={element} className="border-t hover:bg-gray-50">
                                <td className="px-2 py-2 font-semibold text-xs lg:text-sm">{element}</td>
                                <td className={`px-2 py-2 text-center text-xs lg:text-sm ${compValue > 0 ? 'font-bold' : ''}`}>
                                  {compValue > 0 ? compValue : '-'}
                                </td>
                                <td className={`px-2 py-2 text-center text-xs lg:text-sm ${prodValue > 0 ? 'font-bold' : ''}`}>
                                  {prodValue > 0 ? prodValue : '-'}
                                </td>
                                <td className={`px-2 py-2 text-center font-semibold text-xs lg:text-sm ${
                                  diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'
                                }`}>
                                  {diff > 0 ? `+${diff.toFixed(2)}` : diff < 0 ? diff.toFixed(2) : '0'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Additives Comparison */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-3 lg:p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">Aditivos Concorrente:</h4>
                        <p className="text-xs lg:text-sm text-gray-600" translate="no">{comparisonData.competitor.additives || 'Nenhum aditivo especificado'}</p>
                      </div>
                      <div className="p-3 lg:p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2 text-sm lg:text-base">Aditivos MicroXisto:</h4>
                        <p className="text-xs lg:text-sm text-gray-700" translate="no">{comparisonData.product.additives || 'Nenhum aditivo especificado'}</p>
                        {comparisonData.product.description && (
                          <>
                            <hr className="my-2 border-green-200" />
                            <p className="text-xs lg:text-sm text-gray-700 mt-2">
                              <strong>Descrição:</strong> {comparisonData.product.description}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Standalone Competitor View - NEW */}
                {selectedCompetitor && viewMode === 'standalone' && (
                  <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Visualização do Concorrente</h3>
                      <button
                        onClick={() => setViewMode('comparison')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                      >
                        ← Voltar para Comparação
                      </button>
                    </div>

                    {comparisonData && (
                      <div>
                        <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-xl font-semibold text-gray-800 mb-2" translate="no">{comparisonData.competitor.company}</h4>
                          <h5 className="text-lg text-gray-600 mb-4" translate="no">{comparisonData.competitor.product}</h5>
                          <div className="text-sm text-gray-600 space-y-2">
                            <p><strong>Densidade:</strong> {comparisonData.competitor.density} g/mL</p>
                            <p><strong>Natureza:</strong> {comparisonData.competitor.nature}</p>
                            {comparisonData.competitor.proposito && (
                              <p className="font-bold text-blue-600 text-base mt-3">🎯 Propósito: {comparisonData.competitor.proposito}</p>
                            )}
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-800 mb-3">Composição Química:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                          {Object.entries(comparisonData.competitor.composition)
                            .filter(([, value]) => value > 0)
                            .map(([element, value]) => (
                              <div key={element} className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="font-bold text-blue-800 text-lg">{element}</div>
                                <div className="text-sm text-gray-700 mt-1">{value}</div>
                              </div>
                            ))}
                        </div>

                        {comparisonData.competitor.additives && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Aditivos:</h4>
                            <p className="text-sm text-gray-600" translate="no">{comparisonData.competitor.additives}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🔒 Acesso Restrito</h3>
                  <p className="text-gray-600 mb-6">Para acessar o comparativo de produtos, você precisa estar logado.</p>
                  <button 
                    onClick={() => setCurrentPage('login')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Fazer Login
                  </button>
                </div>
              </div>
            )}
          </>
        )}
                      <select
                        value={selectedComparisonProduct}
                        onChange={(e) => setSelectedComparisonProduct(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-green-500 text-sm"
                        disabled={!selectedComparisonTech}
                        translate="no"
                      >
                        <option value="">Selecione...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id} translate="no">{product.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Action Buttons - ENHANCED */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={loadComparison}
                      disabled={!selectedCompetitor || !selectedComparisonProduct || loading}
                      className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold text-base"
                    >
                      {loading ? 'Carregando...' : '🔄 Comparar Produtos'}
                    </button>
                    
                    {selectedCompetitor && (
                      <button
                        onClick={() => setViewMode('standalone')}
                        className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold text-base"
                      >
                        👁️ Ver Concorrente Isolado
                      </button>
                    )}
                  </div>
                </div>
            
                {/* Comparison Results - ENHANCED RESPONSIVE LAYOUT */}
                {comparisonData && viewMode === 'comparison' && (
                  <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-green-800 mb-6 text-center">Comparação de Produtos</h3>
                    
                    {/* Mobile: Side-by-Side Layout */}
                    <div className="block lg:hidden mb-6">
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-semibold text-gray-800 mb-1" translate="no">{comparisonData.competitor.company}</h4>
                          <h5 className="text-xs text-gray-600 mb-2" translate="no">{comparisonData.competitor.product}</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>Dens: {comparisonData.competitor.density}</p>
                            <p>{comparisonData.competitor.nature}</p>
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <img src={comparisonData.product.logo} alt={comparisonData.product.name} className="h-12 mx-auto mb-2 object-contain" />
                          <h5 className="text-xs text-gray-600 mb-2" translate="no">{comparisonData.product.name}</h5>
                          <div className="text-xs text-gray-600 space-y-1">
                            <p>Dens: {comparisonData.product.density}</p>
                            <p>{comparisonData.product.nature}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop: Original Layout */}
                    <div className="hidden lg:grid lg:grid-cols-2 gap-4 lg:gap-6 mb-6">
                      <div className="text-center">
                        <h4 className="text-lg lg:text-xl font-semibold text-gray-800 mb-2" translate="no">{comparisonData.competitor.company}</h4>
                        <h5 className="text-base lg:text-lg text-gray-600 mb-4" translate="no">{comparisonData.competitor.product}</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Densidade: {comparisonData.competitor.density} g/mL</p>
                          <p>Natureza: {comparisonData.competitor.nature}</p>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <img src={comparisonData.product.logo} alt={comparisonData.product.name} className="h-16 lg:h-20 mx-auto mb-4 object-contain" />
                        <h5 className="text-base lg:text-lg text-gray-600 mb-4" translate="no">{comparisonData.product.name}</h5>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Densidade: {comparisonData.product.density} g/mL</p>
                          <p>Natureza: {comparisonData.product.nature}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Composition Table - Responsive */}
                    <div className="overflow-x-auto">
                      <table className="w-full table-auto text-sm">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="px-2 py-2 text-left text-xs lg:text-sm">Elemento</th>
                            <th className="px-2 py-2 text-center text-xs lg:text-sm" translate="no">{comparisonData.competitor.company}</th>
                            <th className="px-2 py-2 text-center text-xs lg:text-sm">MicroXisto</th>
                            <th className="px-2 py-2 text-center text-xs lg:text-sm">Diferença</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(comparisonData.competitor.composition).map(element => {
                            const compValue = comparisonData.competitor.composition[element];
                            const prodValue = comparisonData.product.composition[element];
                            const diff = prodValue - compValue;
                            
                            return (
                              <tr key={element} className="border-t hover:bg-gray-50">
                                <td className="px-2 py-2 font-semibold text-xs lg:text-sm">{element}</td>
                                <td className={`px-2 py-2 text-center text-xs lg:text-sm ${compValue > 0 ? 'font-bold' : ''}`}>
                                  {compValue > 0 ? compValue : '-'}
                                </td>
                                <td className={`px-2 py-2 text-center text-xs lg:text-sm ${prodValue > 0 ? 'font-bold' : ''}`}>
                                  {prodValue > 0 ? prodValue : '-'}
                                </td>
                                <td className={`px-2 py-2 text-center font-semibold text-xs lg:text-sm ${
                                  diff > 0 ? 'text-green-600' : diff < 0 ? 'text-red-600' : 'text-gray-400'
                                }`}>
                                  {diff > 0 ? `+${diff.toFixed(2)}` : diff < 0 ? diff.toFixed(2) : '0'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Additives Comparison */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div className="p-3 lg:p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm lg:text-base">Aditivos Concorrente:</h4>
                        <p className="text-xs lg:text-sm text-gray-600" translate="no">{comparisonData.competitor.additives || 'Nenhum aditivo especificado'}</p>
                      </div>
                      <div className="p-3 lg:p-4 bg-green-50 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2 text-sm lg:text-base">Aditivos MicroXisto:</h4>
                        <p className="text-xs lg:text-sm text-gray-700" translate="no">{comparisonData.product.additives || 'Nenhum aditivo especificado'}</p>
                        {comparisonData.product.description && (
                          <>
                            <hr className="my-2 border-green-200" />
                            <p className="text-xs lg:text-sm text-gray-700 mt-2">
                              <strong>Descrição:</strong> {comparisonData.product.description}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Standalone Competitor View - NEW */}
                {selectedCompetitor && viewMode === 'standalone' && (
                  <div className="bg-white rounded-lg shadow-md p-4 lg:p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl lg:text-2xl font-bold text-gray-800">Visualização do Concorrente</h3>
                      <button
                        onClick={() => setViewMode('comparison')}
                        className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                      >
                        ← Voltar para Comparação
                      </button>
                    </div>

                    {comparisonData && (
                      <div>
                        <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="text-xl font-semibold text-gray-800 mb-2" translate="no">{comparisonData.competitor.company}</h4>
                          <h5 className="text-lg text-gray-600 mb-4" translate="no">{comparisonData.competitor.product}</h5>
                          <div className="text-sm text-gray-600 space-y-2">
                            <p><strong>Densidade:</strong> {comparisonData.competitor.density} g/mL</p>
                            <p><strong>Natureza:</strong> {comparisonData.competitor.nature}</p>
                            {comparisonData.competitor.proposito && (
                              <p><strong>Propósito:</strong> {comparisonData.competitor.proposito}</p>
                            )}
                          </div>
                        </div>

                        <h4 className="font-bold text-gray-800 mb-3">Composição Química:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                          {Object.entries(comparisonData.competitor.composition)
                            .filter(([, value]) => value > 0)
                            .map(([element, value]) => (
                              <div key={element} className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="font-bold text-blue-800 text-lg">{element}</div>
                                <div className="text-sm text-gray-700 mt-1">{value}</div>
                              </div>
                            ))}
                        </div>

                        {comparisonData.competitor.additives && (
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">Aditivos:</h4>
                            <p className="text-sm text-gray-600" translate="no">{comparisonData.competitor.additives}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">🔒 Acesso Restrito</h3>
                  <p className="text-gray-600 mb-6">Para acessar o comparativo de produtos, você precisa estar logado.</p>
                  <button 
                    onClick={() => setCurrentPage('login')}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                  >
                    Fazer Login
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {currentPage === 'admin' && isAdmin && (
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-green-800 mb-8 text-center">Painel Administrativo</h2>
            
            {/* Admin Navigation Tabs */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setAdminTab('home')}
                  className={`px-4 py-2 rounded-lg ${adminTab === 'home' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Conteúdo Home
                </button>
                <button
                  onClick={() => setAdminTab('users')}
                  className={`px-4 py-2 rounded-lg ${adminTab === 'users' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Usuários
                </button>
                <button
                  onClick={() => setAdminTab('technologies')}
                  className={`px-4 py-2 rounded-lg ${adminTab === 'technologies' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Tecnologias
                </button>
                <button
                  onClick={() => setAdminTab('products')}
                  className={`px-4 py-2 rounded-lg ${adminTab === 'products' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Produtos
                </button>
                <button
                  onClick={() => setAdminTab('competitors')}
                  className={`px-4 py-2 rounded-lg ${adminTab === 'competitors' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  Concorrentes
                </button>
                <button
                  onClick={() => setAdminTab('tutorials')}
                  className={`px-4 py-2 rounded-lg ${adminTab === 'tutorials' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  📚 Tutoriais
                </button>
                <button
                  onClick={() => setAdminTab('cultures')}
                  className={`px-4 py-2 rounded-lg ${adminTab === 'cultures' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  🌾 Culturas
                </button>
              </div>
            </div>

            {/* Admin Tab Content */}
            {adminTab === 'home' && (
              <HomeContentManagement token={token} homeContent={homeContent} fetchHomeContent={fetchHomeContent} />
            )}
            
            {adminTab === 'users' && (
              <UserManagement token={token} />
            )}
            
            {adminTab === 'technologies' && (
              <TechnologyManagement token={token} technologies={technologies} fetchTechnologies={fetchTechnologies} />
            )}
            
            {adminTab === 'products' && (
              <ProductManagement token={token} technologies={technologies} />
            )}
            
            {adminTab === 'competitors' && (
              <CompetitorManagement token={token} />
            )}
            
            {adminTab === 'tutorials' && (
              <AdminTutorials />
            )}
            
            {adminTab === 'cultures' && (
              <CultureManagement token={token} cultures={cultures} fetchCultures={fetchCultures} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;