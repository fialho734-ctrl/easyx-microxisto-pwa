"""
Final Pre-Deploy Tests for MicroXisto PWA
Tests: Auth, Technologies, Cultures, Comparison, Market Study, Admin Security
"""
import pytest
import requests
import os
import json
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://microxisto-preview.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "agrofialho@gmail.com"
ADMIN_PASSWORD = "adm@123"

class TestAuthAndJWT:
    """Test authentication and JWT token security"""
    
    def test_admin_login_success(self):
        """Admin login should return token with is_admin=true"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["is_admin"] == True
        
        # Verify JWT payload contains is_admin claim
        token = data["access_token"]
        payload_b64 = token.split('.')[1]
        # Add padding if needed
        payload_b64 += '=' * (4 - len(payload_b64) % 4)
        payload = json.loads(base64.b64decode(payload_b64))
        assert payload.get("is_admin") == True, "JWT payload must contain is_admin=true"
        print(f"✓ Admin login successful, JWT contains is_admin={payload.get('is_admin')}")
    
    def test_invalid_credentials(self):
        """Invalid credentials should return 401"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@email.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        print("✓ Invalid credentials correctly rejected")


class TestTechnologies:
    """Test technologies endpoint"""
    
    def test_get_technologies(self):
        """Should return list of technologies"""
        response = requests.get(f"{BASE_URL}/api/technologies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 5, "Should have at least 5 technologies (AquaX, MicroX, NanoX, BioX, FemtoX)"
        
        tech_names = [t["name"] for t in data]
        expected_techs = ["AquaX", "MicroX", "NanoX", "BioX", "FemtoX"]
        for tech in expected_techs:
            assert tech in tech_names, f"Missing technology: {tech}"
        print(f"✓ Technologies endpoint returns {len(data)} technologies")


class TestCultures:
    """Test cultures endpoint"""
    
    def test_get_cultures(self):
        """Should return list of cultures"""
        response = requests.get(f"{BASE_URL}/api/cultures")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Cultures endpoint returns {len(data)} cultures")


class TestComparison:
    """Test comparison/competitors endpoints"""
    
    def test_get_competitor_companies(self):
        """Should return list of competitor companies"""
        response = requests.get(f"{BASE_URL}/api/competitors/companies")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Competitor companies endpoint returns {len(data)} companies")
    
    def test_get_all_competitors(self):
        """Should return all competitors"""
        response = requests.get(f"{BASE_URL}/api/competitors")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ All competitors endpoint returns {len(data)} competitors")


class TestProducts:
    """Test products endpoints"""
    
    def test_get_all_products(self):
        """Should return all products"""
        response = requests.get(f"{BASE_URL}/api/products")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Products endpoint returns {len(data)} products")


class TestAdminSecurity:
    """Test admin-only endpoints security"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_admin_users_requires_auth(self):
        """Admin users endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code in [401, 403], "Should require auth"
        print("✓ Admin users endpoint requires authentication")
    
    def test_admin_users_with_token(self, admin_token):
        """Admin users endpoint should work with admin token"""
        response = requests.get(f"{BASE_URL}/api/admin/users", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin users endpoint returns {len(data)} users with valid token")
    
    def test_admin_technologies_requires_auth(self):
        """Admin technologies endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/products")
        assert response.status_code in [401, 403], "Should require auth"
        print("✓ Admin products endpoint requires authentication")


class TestMarketStudy:
    """Test market study endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        return response.json()["access_token"]
    
    def test_market_studies_requires_auth(self):
        """Market studies endpoint should require authentication"""
        response = requests.get(f"{BASE_URL}/api/market-studies")
        assert response.status_code in [401, 403], "Should require auth"
        print("✓ Market studies endpoint requires authentication")
    
    def test_market_studies_with_token(self, admin_token):
        """Market studies endpoint should work with valid token"""
        response = requests.get(f"{BASE_URL}/api/market-studies", headers={
            "Authorization": f"Bearer {admin_token}"
        })
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Market studies endpoint returns {len(data)} studies with valid token")


class TestMaintenanceMode:
    """Test maintenance mode endpoint"""
    
    def test_maintenance_status(self):
        """Should return maintenance status"""
        response = requests.get(f"{BASE_URL}/api/maintenance-status")
        assert response.status_code == 200
        data = response.json()
        assert "active" in data
        print(f"✓ Maintenance status: active={data['active']}")


class TestHomeContent:
    """Test home content endpoint"""
    
    def test_get_home_content(self):
        """Should return home content"""
        response = requests.get(f"{BASE_URL}/api/home")
        assert response.status_code == 200
        data = response.json()
        assert "text" in data or data == {}
        print("✓ Home content endpoint working")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
