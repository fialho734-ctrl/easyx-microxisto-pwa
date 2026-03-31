"""
MicroXisto PWA API Tests
Tests for: Login, Maintenance Mode, Market Studies CRUD, Navigation tabs
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://homolog-features.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "agrofialho@gmail.com"
ADMIN_PASSWORD = "adm@123"


class TestAuthFlow:
    """Authentication endpoint tests"""
    
    def test_login_success_admin(self):
        """Test admin login with correct credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "is_admin" in data, "No is_admin field in response"
        assert data["is_admin"] == True, "User should be admin"
        print(f"✅ Admin login successful, is_admin={data['is_admin']}")
    
    def test_login_invalid_credentials(self):
        """Test login with wrong credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Invalid credentials correctly rejected")


class TestMaintenanceMode:
    """Maintenance mode API tests"""
    
    def test_get_maintenance_status(self):
        """Test GET /api/maintenance-status returns status"""
        response = requests.get(f"{BASE_URL}/api/maintenance-status")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "active" in data, "No 'active' field in response"
        assert isinstance(data["active"], bool), "active should be boolean"
        print(f"✅ Maintenance status: active={data['active']}")
    
    def test_toggle_maintenance_requires_admin(self):
        """Test that toggling maintenance requires admin auth"""
        response = requests.post(f"{BASE_URL}/api/admin/maintenance")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Maintenance toggle correctly requires auth")


class TestMarketStudiesCRUD:
    """Market Studies (Estudo de Mercado) CRUD tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_create_market_study(self, auth_token):
        """Test POST /api/market-studies creates a study"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        payload = {
            "empresa": "TEST_Empresa_Pytest",
            "produto": "TEST_Produto_Pytest",
            "dose_ha": 2.5,
            "valor": 100.0,
            "venda": "Venda direta",
            "estado": "SP"
        }
        
        response = requests.post(f"{BASE_URL}/api/market-studies", json=payload, headers=headers)
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert data["empresa"] == payload["empresa"], "Empresa mismatch"
        assert data["produto"] == payload["produto"], "Produto mismatch"
        assert data["dose_ha"] == payload["dose_ha"], "Dose mismatch"
        assert data["valor"] == payload["valor"], "Valor mismatch"
        # Check R$/ha calculation
        expected_rs_ha = payload["dose_ha"] * payload["valor"]
        assert data["rs_ha"] == expected_rs_ha, f"R$/ha calculation wrong: expected {expected_rs_ha}, got {data['rs_ha']}"
        assert "id" in data, "No ID returned"
        print(f"✅ Market study created: id={data['id']}, rs_ha={data['rs_ha']}")
        return data["id"]
    
    def test_get_market_studies(self, auth_token):
        """Test GET /api/market-studies returns user's studies"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/market-studies", headers=headers)
        assert response.status_code == 200, f"Get failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Got {len(data)} market studies")
    
    def test_update_market_study(self, auth_token):
        """Test PUT /api/market-studies/{id} updates a study"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a study
        create_payload = {
            "empresa": "TEST_Update_Empresa",
            "produto": "TEST_Update_Produto",
            "dose_ha": 1.0,
            "valor": 50.0,
            "venda": "Distribuição",
            "estado": "MG"
        }
        create_response = requests.post(f"{BASE_URL}/api/market-studies", json=create_payload, headers=headers)
        assert create_response.status_code == 200, f"Create for update failed: {create_response.text}"
        study_id = create_response.json()["id"]
        
        # Update the study
        update_payload = {
            "dose_ha": 3.0,
            "valor": 200.0
        }
        update_response = requests.put(f"{BASE_URL}/api/market-studies/{study_id}", json=update_payload, headers=headers)
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        print(f"✅ Market study {study_id} updated")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/market-studies/{study_id}", headers=headers)
    
    def test_delete_market_study(self, auth_token):
        """Test DELETE /api/market-studies/{id} deletes a study"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # First create a study
        create_payload = {
            "empresa": "TEST_Delete_Empresa",
            "produto": "TEST_Delete_Produto",
            "dose_ha": 1.0,
            "valor": 50.0,
            "venda": "Cooperativa",
            "estado": "PR"
        }
        create_response = requests.post(f"{BASE_URL}/api/market-studies", json=create_payload, headers=headers)
        assert create_response.status_code == 200, f"Create for delete failed: {create_response.text}"
        study_id = create_response.json()["id"]
        
        # Delete the study
        delete_response = requests.delete(f"{BASE_URL}/api/market-studies/{study_id}", headers=headers)
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        print(f"✅ Market study {study_id} deleted")
    
    def test_market_studies_requires_auth(self):
        """Test that market studies endpoints require authentication"""
        response = requests.get(f"{BASE_URL}/api/market-studies")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print("✅ Market studies correctly requires auth")


class TestPublicEndpoints:
    """Tests for public endpoints (no auth required)"""
    
    def test_get_technologies(self):
        """Test GET /api/technologies returns technologies"""
        response = requests.get(f"{BASE_URL}/api/technologies")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        assert len(data) > 0, "Should have at least one technology"
        print(f"✅ Got {len(data)} technologies")
    
    def test_get_products(self):
        """Test GET /api/products returns products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Got {len(data)} products")
    
    def test_get_competitors(self):
        """Test GET /api/competitors returns competitors"""
        response = requests.get(f"{BASE_URL}/api/competitors")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Got {len(data)} competitors")
    
    def test_get_competitor_companies(self):
        """Test GET /api/competitors/companies returns companies"""
        response = requests.get(f"{BASE_URL}/api/competitors/companies")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Got {len(data)} competitor companies")
    
    def test_get_cultures(self):
        """Test GET /api/cultures returns cultures"""
        response = requests.get(f"{BASE_URL}/api/cultures")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        print(f"✅ Got {len(data)} cultures")
    
    def test_get_home_content(self):
        """Test GET /api/home returns home content"""
        response = requests.get(f"{BASE_URL}/api/home")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "text" in data, "No text field in home content"
        print(f"✅ Got home content")


class TestAdminEndpoints:
    """Tests for admin-only endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_admin_toggle_maintenance(self, auth_token):
        """Test admin can toggle maintenance mode"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get current status
        status_response = requests.get(f"{BASE_URL}/api/maintenance-status")
        initial_status = status_response.json()["active"]
        
        # Toggle maintenance
        toggle_response = requests.post(f"{BASE_URL}/api/admin/maintenance", headers=headers)
        assert toggle_response.status_code == 200, f"Toggle failed: {toggle_response.text}"
        
        # Verify it changed
        new_status_response = requests.get(f"{BASE_URL}/api/maintenance-status")
        new_status = new_status_response.json()["active"]
        assert new_status != initial_status, "Maintenance status should have toggled"
        
        # Toggle back to original
        requests.post(f"{BASE_URL}/api/admin/maintenance", headers=headers)
        print(f"✅ Maintenance mode toggled: {initial_status} -> {new_status} -> {initial_status}")
    
    def test_admin_export_market_studies(self, auth_token):
        """Test admin can export market studies to Excel"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        response = requests.get(f"{BASE_URL}/api/admin/market-studies/export", headers=headers)
        assert response.status_code == 200, f"Export failed: {response.text}"
        assert "spreadsheetml" in response.headers.get("content-type", ""), "Should return Excel file"
        print("✅ Market studies Excel export works")


class TestCleanup:
    """Cleanup test data"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Authentication failed")
    
    def test_cleanup_test_market_studies(self, auth_token):
        """Clean up TEST_ prefixed market studies"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        
        # Get all studies
        response = requests.get(f"{BASE_URL}/api/market-studies", headers=headers)
        if response.status_code == 200:
            studies = response.json()
            deleted = 0
            for study in studies:
                if study.get("empresa", "").startswith("TEST_") or study.get("produto", "").startswith("TEST_"):
                    del_response = requests.delete(f"{BASE_URL}/api/market-studies/{study['id']}", headers=headers)
                    if del_response.status_code == 200:
                        deleted += 1
            print(f"✅ Cleaned up {deleted} test market studies")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
