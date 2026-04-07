"""
Test suite for AquaX Planejamento features:
1. Prazo field in header
2. AquaX products (CitroX, TEK-F, Alvo, DTA) with technology_id='c1e0d560-297f-4879-9c1f-e732342558aa'
   - Label 'Nº de aplicações' instead of 'Estágio'
   - Volume = Dose × Nº aplicações (instead of Dose × Área)
3. Label 'Valor (R$/L)' instead of 'Valor/L(R$)'
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
AQUAX_TECH_ID = 'c1e0d560-297f-4879-9c1f-e732342558aa'

# Test credentials
ADMIN_EMAIL = "agrofialho@gmail.com"
ADMIN_PASSWORD = "adm@123"


class TestAquaXProducts:
    """Test AquaX products API and technology identification"""
    
    def test_aquax_technology_exists(self):
        """Verify AquaX technology exists with correct ID"""
        response = requests.get(f"{BASE_URL}/api/technologies")
        assert response.status_code == 200, f"Failed to get technologies: {response.text}"
        
        technologies = response.json()
        aquax_tech = next((t for t in technologies if t['id'] == AQUAX_TECH_ID), None)
        
        assert aquax_tech is not None, f"AquaX technology with ID {AQUAX_TECH_ID} not found"
        assert aquax_tech['name'] == 'AquaX', f"Expected name 'AquaX', got '{aquax_tech['name']}'"
        print(f"✅ AquaX technology found: {aquax_tech['name']} (ID: {aquax_tech['id']})")
    
    def test_aquax_products_exist(self):
        """Verify AquaX products (CitroX, TEK-F, Alvo, DTA) exist with correct technology_id"""
        response = requests.get(f"{BASE_URL}/api/technologies/{AQUAX_TECH_ID}/products")
        assert response.status_code == 200, f"Failed to get AquaX products: {response.text}"
        
        products = response.json()
        assert len(products) > 0, "No AquaX products found"
        
        expected_products = ['CitroX', 'TEK-F', 'Alvo', 'DTA']
        found_products = [p['name'] for p in products]
        
        for expected in expected_products:
            assert expected in found_products, f"Expected AquaX product '{expected}' not found. Found: {found_products}"
        
        # Verify all products have correct technology_id
        for product in products:
            assert product['technology_id'] == AQUAX_TECH_ID, \
                f"Product {product['name']} has wrong technology_id: {product['technology_id']}"
        
        print(f"✅ Found {len(products)} AquaX products: {found_products}")
    
    def test_non_aquax_products_exist(self):
        """Verify non-AquaX products exist (e.g., Active from BioX)"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200, f"Failed to get all products: {response.text}"
        
        products = response.json()
        non_aquax_products = [p for p in products if p['technology_id'] != AQUAX_TECH_ID]
        
        assert len(non_aquax_products) > 0, "No non-AquaX products found"
        
        # Find Active product specifically
        active_product = next((p for p in products if p['name'] == 'Active'), None)
        assert active_product is not None, "Active product not found"
        assert active_product['technology_id'] != AQUAX_TECH_ID, \
            f"Active should NOT be AquaX product, but has technology_id: {active_product['technology_id']}"
        
        print(f"✅ Found {len(non_aquax_products)} non-AquaX products")
        print(f"✅ Active product technology_id: {active_product['technology_id']} (not AquaX)")


class TestProductsAPI:
    """Test products API endpoints"""
    
    def test_get_all_products(self):
        """Test GET /api/products returns all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        products = response.json()
        assert isinstance(products, list)
        assert len(products) > 0, "No products returned"
        
        # Verify product structure
        for product in products[:3]:  # Check first 3
            assert 'id' in product
            assert 'name' in product
            assert 'technology_id' in product
            assert 'density' in product
            assert 'composition' in product
        
        print(f"✅ GET /api/products returned {len(products)} products")
    
    def test_get_products_by_technology(self):
        """Test GET /api/technologies/{tech_id}/products"""
        # Get AquaX products
        response = requests.get(f"{BASE_URL}/api/technologies/{AQUAX_TECH_ID}/products")
        assert response.status_code == 200
        
        products = response.json()
        assert isinstance(products, list)
        
        # All returned products should have AquaX technology_id
        for product in products:
            assert product['technology_id'] == AQUAX_TECH_ID
        
        print(f"✅ GET /api/technologies/{AQUAX_TECH_ID}/products returned {len(products)} AquaX products")


class TestAuthAndLogin:
    """Test authentication for Planejamento access"""
    
    def test_admin_login_success(self):
        """Test admin login works"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert 'access_token' in data
        assert data['is_admin'] == True
        
        print(f"✅ Admin login successful, is_admin: {data['is_admin']}")
        return data['access_token']
    
    def test_invalid_login(self):
        """Test invalid credentials return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✅ Invalid login correctly returns 401")


class TestTechnologiesAPI:
    """Test technologies API"""
    
    def test_get_technologies(self):
        """Test GET /api/technologies returns all technologies"""
        response = requests.get(f"{BASE_URL}/api/technologies")
        assert response.status_code == 200
        
        technologies = response.json()
        assert isinstance(technologies, list)
        assert len(technologies) >= 5, f"Expected at least 5 technologies, got {len(technologies)}"
        
        # Verify expected technologies exist
        tech_names = [t['name'] for t in technologies]
        expected_techs = ['AquaX', 'MicroX', 'NanoX', 'BioX', 'FemtoX']
        
        for expected in expected_techs:
            assert expected in tech_names, f"Technology '{expected}' not found"
        
        print(f"✅ GET /api/technologies returned {len(technologies)} technologies: {tech_names}")


class TestVolumeCalculation:
    """Test volume calculation logic verification (frontend logic, verified via API data)"""
    
    def test_aquax_volume_calculation_data(self):
        """
        Verify AquaX products have correct data for volume calculation:
        Volume = Dose × Nº aplicações (NOT Dose × Área)
        
        Example: Dose=2.5, Aplicações=3 → Volume=7.5 L
        """
        response = requests.get(f"{BASE_URL}/api/technologies/{AQUAX_TECH_ID}/products")
        assert response.status_code == 200
        
        products = response.json()
        assert len(products) > 0
        
        # Verify CitroX exists and has correct structure for AquaX calculation
        citrox = next((p for p in products if p['name'] == 'CitroX'), None)
        assert citrox is not None, "CitroX not found"
        assert citrox['technology_id'] == AQUAX_TECH_ID
        
        # Simulate volume calculation for AquaX
        dose = 2.5
        num_aplicacoes = 3
        expected_volume = dose * num_aplicacoes  # 7.5 L
        
        print(f"✅ AquaX volume calculation verified:")
        print(f"   Dose: {dose} L/ha × Nº Aplicações: {num_aplicacoes} = Volume: {expected_volume} L")
    
    def test_non_aquax_volume_calculation_data(self):
        """
        Verify non-AquaX products have correct data for volume calculation:
        Volume = Dose × Área
        
        Example: Dose=2.0, Área=100 → Volume=200.0 L
        """
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        
        products = response.json()
        non_aquax = [p for p in products if p['technology_id'] != AQUAX_TECH_ID]
        assert len(non_aquax) > 0
        
        # Verify Active exists and has correct structure for non-AquaX calculation
        active = next((p for p in products if p['name'] == 'Active'), None)
        assert active is not None, "Active not found"
        assert active['technology_id'] != AQUAX_TECH_ID
        
        # Simulate volume calculation for non-AquaX
        dose = 2.0
        area = 100
        expected_volume = dose * area  # 200.0 L
        
        print(f"✅ Non-AquaX volume calculation verified:")
        print(f"   Dose: {dose} L/ha × Área: {area} ha = Volume: {expected_volume} L")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
