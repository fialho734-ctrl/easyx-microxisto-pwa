"""
MicroXisto API Backend Tests
Tests for: Authentication, Maintenance, Market Studies, Competitors, Cultures, User Activity
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://microxisto-preview.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "agrofialho@gmail.com"
ADMIN_PASSWORD = "adm@123"


class TestAuthentication:
    """Authentication endpoint tests"""
    
    def test_login_admin_success(self):
        """Test admin login returns is_admin: true"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "Missing access_token"
        assert "token_type" in data, "Missing token_type"
        assert "is_admin" in data, "Missing is_admin field"
        assert data["is_admin"] == True, "Admin should have is_admin: true"
        assert data["token_type"] == "bearer", "Token type should be bearer"
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpass"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"


class TestMaintenanceMode:
    """Maintenance mode endpoint tests"""
    
    def test_get_maintenance_status(self):
        """GET /api/maintenance-status should return {active: false}"""
        response = requests.get(f"{BASE_URL}/api/maintenance-status")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert "active" in data, "Missing 'active' field"
        assert isinstance(data["active"], bool), "active should be boolean"
    
    def test_toggle_maintenance_admin_only(self):
        """POST /api/admin/maintenance should toggle maintenance mode (admin only)"""
        # First login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Get current status
        status_response = requests.get(f"{BASE_URL}/api/maintenance-status")
        initial_status = status_response.json()["active"]
        
        # Toggle maintenance
        toggle_response = requests.post(
            f"{BASE_URL}/api/admin/maintenance",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert toggle_response.status_code == 200, f"Toggle failed: {toggle_response.text}"
        
        data = toggle_response.json()
        assert "active" in data, "Missing 'active' in response"
        assert data["active"] != initial_status, "Status should have toggled"
        
        # Toggle back to original state
        toggle_back = requests.post(
            f"{BASE_URL}/api/admin/maintenance",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert toggle_back.status_code == 200
    
    def test_toggle_maintenance_requires_auth(self):
        """POST /api/admin/maintenance without auth should fail"""
        response = requests.post(f"{BASE_URL}/api/admin/maintenance")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestCompetitors:
    """Competitors endpoint tests"""
    
    def test_get_all_competitors(self):
        """GET /api/competitors should return list of all competitors"""
        response = requests.get(f"{BASE_URL}/api/competitors")
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        if len(data) > 0:
            competitor = data[0]
            assert "id" in competitor, "Competitor should have id"
            assert "company" in competitor, "Competitor should have company"
            assert "product" in competitor, "Competitor should have product"
            assert "composition" in competitor, "Competitor should have composition"


class TestAdminCultures:
    """Admin cultures endpoint tests"""
    
    def test_admin_get_cultures(self):
        """Admin should be able to access /api/admin/cultures without getting 403"""
        # Login as admin
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Access admin cultures
        response = requests.get(
            f"{BASE_URL}/api/admin/cultures",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 200, f"Admin cultures access failed: {response.status_code} - {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
    
    def test_admin_cultures_requires_admin(self):
        """Non-admin should get 403 on /api/admin/cultures"""
        # Try without auth
        response = requests.get(f"{BASE_URL}/api/admin/cultures")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestMarketStudies:
    """Market studies CRUD tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_get_market_studies_requires_auth(self):
        """GET /api/market-studies requires authentication"""
        response = requests.get(f"{BASE_URL}/api/market-studies")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
    
    def test_get_market_studies_authenticated(self, admin_token):
        """GET /api/market-studies should return user's market studies"""
        response = requests.get(
            f"{BASE_URL}/api/market-studies",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
    
    def test_create_market_study(self, admin_token):
        """POST /api/market-studies - create a market study"""
        study_data = {
            "empresa": "TEST_Empresa",
            "produto": "TEST_Produto",
            "dose_ha": 2.5,
            "valor": 150.0,
            "venda": "Direta",
            "estado": "SP"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/market-studies",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=study_data
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        
        data = response.json()
        assert "id" in data, "Created study should have id"
        assert data["empresa"] == study_data["empresa"]
        assert data["produto"] == study_data["produto"]
        assert data["dose_ha"] == study_data["dose_ha"]
        assert data["valor"] == study_data["valor"]
        assert "rs_ha" in data, "Should calculate rs_ha"
        
        return data["id"]
    
    def test_market_study_crud_flow(self, admin_token):
        """Full CRUD flow for market studies"""
        # CREATE
        study_data = {
            "empresa": "TEST_CRUD_Empresa",
            "produto": "TEST_CRUD_Produto",
            "dose_ha": 3.0,
            "valor": 200.0,
            "venda": "Revenda",
            "estado": "MG"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/market-studies",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=study_data
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        created = create_response.json()
        study_id = created["id"]
        
        # READ - verify in list
        list_response = requests.get(
            f"{BASE_URL}/api/market-studies",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert list_response.status_code == 200
        studies = list_response.json()
        found = any(s["id"] == study_id for s in studies)
        assert found, "Created study should be in list"
        
        # UPDATE
        update_data = {
            "empresa": "TEST_CRUD_Empresa_Updated",
            "produto": "TEST_CRUD_Produto_Updated",
            "dose_ha": 4.0,
            "valor": 250.0,
            "venda": "Direta",
            "estado": "PR"
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/market-studies/{study_id}",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=update_data
        )
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # DELETE
        delete_response = requests.delete(
            f"{BASE_URL}/api/market-studies/{study_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        
        # Verify deleted
        list_after_delete = requests.get(
            f"{BASE_URL}/api/market-studies",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        studies_after = list_after_delete.json()
        not_found = not any(s["id"] == study_id for s in studies_after)
        assert not_found, "Deleted study should not be in list"
    
    def test_market_studies_dashboard(self, admin_token):
        """GET /api/market-studies/dashboard - returns aggregated dashboard data"""
        response = requests.get(
            f"{BASE_URL}/api/market-studies/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        
        data = response.json()
        assert "national" in data or "products" in data, "Dashboard should have aggregated data"
    
    def test_admin_market_studies_dashboard_filtered(self, admin_token):
        """GET /api/admin/market-studies/dashboard-filtered - returns filtered dashboard for admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/market-studies/dashboard-filtered",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Filtered dashboard failed: {response.text}"
        
        data = response.json()
        assert "products" in data or "by_state" in data, "Should have aggregated data"
        assert "filter_options" in data, "Should have filter options"


class TestUserActivity:
    """User activity tracking tests"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_track_activity(self, admin_token):
        """POST /api/track-activity - tracks user login activity"""
        response = requests.post(
            f"{BASE_URL}/api/track-activity",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Track activity failed: {response.text}"
        
        data = response.json()
        assert "message" in data, "Should return message"
    
    def test_get_user_activity_admin_only(self, admin_token):
        """GET /api/admin/user-activity - returns user activity log (admin only)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/user-activity",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Get activity failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Should return list of activities"
    
    def test_user_activity_requires_admin(self):
        """GET /api/admin/user-activity without admin should fail"""
        response = requests.get(f"{BASE_URL}/api/admin/user-activity")
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestPublicEndpoints:
    """Tests for public endpoints"""
    
    def test_get_technologies(self):
        """GET /api/technologies should return list"""
        response = requests.get(f"{BASE_URL}/api/technologies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0, "Should have technologies"
    
    def test_get_cultures(self):
        """GET /api/cultures should return list"""
        response = requests.get(f"{BASE_URL}/api/cultures")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_products(self):
        """GET /api/products should return list"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_home_content(self):
        """GET /api/home should return content"""
        response = requests.get(f"{BASE_URL}/api/home")
        assert response.status_code == 200
        data = response.json()
        assert "text" in data


# Cleanup fixture
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_data():
    """Cleanup TEST_ prefixed data after all tests"""
    yield
    # Cleanup market studies with TEST_ prefix
    try:
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            studies_response = requests.get(
                f"{BASE_URL}/api/market-studies",
                headers={"Authorization": f"Bearer {token}"}
            )
            if studies_response.status_code == 200:
                for study in studies_response.json():
                    if study.get("empresa", "").startswith("TEST_"):
                        requests.delete(
                            f"{BASE_URL}/api/market-studies/{study['id']}",
                            headers={"Authorization": f"Bearer {token}"}
                        )
    except Exception as e:
        print(f"Cleanup error: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
