import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = process.env.REACT_APP_BACKEND_URL;

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
    additives: '', description: ''
  });
  const [loading, setLoading] = useState(false);

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
          additives: '', description: ''
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

  const elements = ['N', 'P', 'K', 'Ca', 'Mg', 'S', 'Mo', 'Co', 'Zn', 'B', 'Cu', 'Mn', 'Ni', 'Se', 'Si', 'Fe'];

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
            <label className="block text-gray-700 font-semibold mb-2">Densidade</label>
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
                  additives: '', description: ''
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
                <th className="px-4 py-2 text-left">Densidade</th>
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

  return (
    <div className="space-y-6">
      {/* CSV Import */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Importar Concorrentes via CSV</h3>
        
        {/* CSV Template Info */}
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Formato do CSV:</h4>
          <p className="text-sm text-blue-700 mb-2">O arquivo deve conter as seguintes colunas (na ordem exata):</p>
          <div className="text-xs text-blue-600 grid grid-cols-3 gap-1">
            <span>• Empresa</span>
            <span>• Produto</span>
            <span>• Natureza</span>
            <span>• Densidade (g/cm³)</span>
            <span>• N (g/L ou Kg)</span>
            <span>• P2O5 (g/L ou Kg)</span>
            <span>• K2O (g/L ou Kg)</span>
            <span>• Ca (g/L ou Kg)</span>
            <span>• Mg (g/L ou Kg)</span>
            <span>• S (g/L ou Kg)</span>
            <span>• Mo (g/L ou Kg)</span>
            <span>• Co (g/L ou Kg)</span>
            <span>• Zn (g/L ou Kg)</span>
            <span>• B (g/L ou Kg)</span>
            <span>• Cu (g/L ou Kg)</span>
            <span>• Mn (g/L ou Kg)</span>
            <span>• Ni (g/L ou Kg)</span>
            <span>• Se (g/L ou Kg)</span>
            <span>• Si (g/L ou Kg)</span>
            <span>• Fe (g/L ou Kg)</span>
            <span>• Aditivos</span>
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

        {importResult && (
          <div className={`mt-4 p-4 rounded-lg ${importResult.errors && importResult.errors.length > 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
            <p className="font-semibold">{importResult.message}</p>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-red-600">Erros encontrados:</p>
                <ul className="list-disc list-inside text-sm text-red-600 mt-1">
                  {importResult.errors.slice(0, 10).map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                  {importResult.errors.length > 10 && (
                    <li>... e mais {importResult.errors.length - 10} erros</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Competitors List */}
      <div className="card">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Concorrentes Cadastrados ({competitors.length})</h3>
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2 text-left">Empresa</th>
                <th className="px-3 py-2 text-left">Produto</th>
                <th className="px-3 py-2 text-left">Natureza</th>
                <th className="px-3 py-2 text-left">Densidade</th>
                <th className="px-3 py-2 text-left">Elementos</th>
                <th className="px-3 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {competitors.map(competitor => (
                <tr key={competitor.id} className="border-t">
                  <td className="px-3 py-2 font-semibold">{competitor.company}</td>
                  <td className="px-3 py-2">{competitor.product}</td>
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

  // Registration form
  if (currentPage === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
          <div className="text-center mb-6">
            <img src="https://i.imgur.com/lwNbD0G.png" alt="MicroXisto" className="h-16 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Cadastro de Usuário</h2>
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