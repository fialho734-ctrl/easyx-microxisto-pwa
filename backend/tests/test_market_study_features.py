"""
Test suite for Market Study (Estudo de Mercado) features:
1. New 'concorre_microxisto' field in market study form
2. Admin panel - all market studies from all users
3. Admin inline editing capability
4. Admin dashboard by MicroXisto product
5. Excel export functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL')

# Test credentials
ADMIN_EMAIL = "agrofialho@gmail.com"
ADMIN_PASSWORD = "adm@123"

# MicroXisto products list (should match frontend)
MICROXISTO_PRODUCTS = [
    'Magnus', 'Pullseed Ni', 'Pullseed G', 'Active', 'One-Max', 'Complex', 
    'MN-MAX', 'ZINMAX', 'S-MAX', 'Guardian', 'TRUCKER', 'CA-ULTRA', 
    'MG-ULTRA', 'Citro-X', 'Tek-F', 'Alvo', 'DTA'
]


class TestAuth:
    """Authentication tests"""
    
    def test_admin_login(self):
        """Test admin login returns access_token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "Response should contain 'access_token'"
        assert data.get("is_admin") == True, "User should be admin"
        print(f"✅ Admin login successful, token received")
        return data["access_token"]


class TestMarketStudyCRUD:
    """Market Study CRUD operations with concorre_microxisto field"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_create_market_study_with_concorre_microxisto(self, auth_token):
        """Test creating market study with the new concorre_microxisto field"""
        study_data = {
            "empresa": "TEST_Empresa_Teste",
            "produto": "TEST_Produto_Teste",
            "dose_ha": 2.5,
            "valor": 150.00,
            "venda": "Venda direta",
            "estado": "SP",
            "concorre_microxisto": "Active"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/market-studies",
            json=study_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        
        # Verify all fields including concorre_microxisto
        assert data["empresa"] == study_data["empresa"]
        assert data["produto"] == study_data["produto"]
        assert data["dose_ha"] == study_data["dose_ha"]
        assert data["valor"] == study_data["valor"]
        assert data["venda"] == study_data["venda"]
        assert data["estado"] == study_data["estado"]
        assert data["concorre_microxisto"] == "Active", "concorre_microxisto should be saved"
        assert "rs_ha" in data, "rs_ha should be calculated"
        assert data["rs_ha"] == 2.5 * 150.00, "rs_ha should be dose_ha * valor"
        assert "id" in data, "Should have an ID"
        
        print(f"✅ Market study created with concorre_microxisto='Active', id={data['id']}")
        return data["id"]
    
    def test_create_market_study_without_concorre_microxisto(self, auth_token):
        """Test creating market study without concorre_microxisto (optional field)"""
        study_data = {
            "empresa": "TEST_Empresa_Sem_MX",
            "produto": "TEST_Produto_Sem_MX",
            "dose_ha": 1.0,
            "valor": 100.00,
            "venda": "Distribuição",
            "estado": "MG"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/market-studies",
            json=study_data,
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        
        # concorre_microxisto should be empty string or None
        assert data.get("concorre_microxisto") in ["", None], "concorre_microxisto should be empty when not provided"
        print(f"✅ Market study created without concorre_microxisto, id={data['id']}")
    
    def test_get_user_market_studies(self, auth_token):
        """Test getting market studies for current user"""
        response = requests.get(
            f"{BASE_URL}/api/market-studies",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Get failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        print(f"✅ Retrieved {len(data)} market studies for user")
    
    def test_update_market_study_concorre_microxisto(self, auth_token):
        """Test updating market study with concorre_microxisto field"""
        # First create a study
        create_response = requests.post(
            f"{BASE_URL}/api/market-studies",
            json={
                "empresa": "TEST_Update_Empresa",
                "produto": "TEST_Update_Produto",
                "dose_ha": 3.0,
                "valor": 200.00,
                "venda": "Cooperativa",
                "estado": "PR",
                "concorre_microxisto": "Magnus"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert create_response.status_code == 200
        study_id = create_response.json()["id"]
        
        # Update the concorre_microxisto field
        update_response = requests.put(
            f"{BASE_URL}/api/market-studies/{study_id}",
            json={"concorre_microxisto": "Pullseed Ni"},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        print(f"✅ Market study updated with new concorre_microxisto value")
    
    def test_delete_market_study(self, auth_token):
        """Test deleting a market study"""
        # First create a study to delete
        create_response = requests.post(
            f"{BASE_URL}/api/market-studies",
            json={
                "empresa": "TEST_Delete_Empresa",
                "produto": "TEST_Delete_Produto",
                "dose_ha": 1.0,
                "valor": 50.00,
                "venda": "Venda direta",
                "estado": "RS"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert create_response.status_code == 200
        study_id = create_response.json()["id"]
        
        # Delete the study
        delete_response = requests.delete(
            f"{BASE_URL}/api/market-studies/{study_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        print(f"✅ Market study deleted successfully")


class TestAdminMarketStudies:
    """Admin-specific market study endpoints"""
    
    @pytest.fixture
    def auth_token(self):
        """Get admin auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_admin_get_all_market_studies(self, auth_token):
        """Test admin can get ALL market studies from ALL users"""
        response = requests.get(
            f"{BASE_URL}/api/admin/market-studies/all",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Get all failed: {response.text}"
        data = response.json()
        assert isinstance(data, list), "Should return a list"
        
        # Verify structure of returned studies
        if len(data) > 0:
            study = data[0]
            assert "id" in study
            assert "user_email" in study, "Should include user_email for admin view"
            assert "empresa" in study
            assert "produto" in study
            # concorre_microxisto may or may not be present in old records
        
        print(f"✅ Admin retrieved {len(data)} market studies from all users")
        return data
    
    def test_admin_update_any_market_study(self, auth_token):
        """Test admin can update any market study (inline editing)"""
        # First get all studies
        get_response = requests.get(
            f"{BASE_URL}/api/admin/market-studies/all",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert get_response.status_code == 200
        studies = get_response.json()
        
        if len(studies) == 0:
            # Create a test study first
            create_response = requests.post(
                f"{BASE_URL}/api/market-studies",
                json={
                    "empresa": "TEST_Admin_Edit",
                    "produto": "TEST_Admin_Product",
                    "dose_ha": 2.0,
                    "valor": 100.00,
                    "venda": "Venda direta",
                    "estado": "GO",
                    "concorre_microxisto": "Complex"
                },
                headers={"Authorization": f"Bearer {auth_token}"}
            )
            assert create_response.status_code == 200
            study_id = create_response.json()["id"]
        else:
            study_id = studies[0]["id"]
        
        # Admin updates the study
        update_response = requests.put(
            f"{BASE_URL}/api/admin/market-studies/{study_id}",
            json={
                "empresa": "TEST_Admin_Updated_Empresa",
                "concorre_microxisto": "Guardian"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert update_response.status_code == 200, f"Admin update failed: {update_response.text}"
        print(f"✅ Admin successfully updated market study {study_id}")
    
    def test_admin_delete_any_market_study(self, auth_token):
        """Test admin can delete any market study"""
        # Create a study to delete
        create_response = requests.post(
            f"{BASE_URL}/api/market-studies",
            json={
                "empresa": "TEST_Admin_Delete",
                "produto": "TEST_Admin_Delete_Product",
                "dose_ha": 1.5,
                "valor": 75.00,
                "venda": "Cooperativa",
                "estado": "MT"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        assert create_response.status_code == 200
        study_id = create_response.json()["id"]
        
        # Admin deletes the study
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/market-studies/{study_id}",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert delete_response.status_code == 200, f"Admin delete failed: {delete_response.text}"
        print(f"✅ Admin successfully deleted market study {study_id}")
    
    def test_admin_dashboard_by_microxisto(self, auth_token):
        """Test admin dashboard grouped by MicroXisto product"""
        # First ensure we have a study with concorre_microxisto
        requests.post(
            f"{BASE_URL}/api/market-studies",
            json={
                "empresa": "TEST_Dashboard_Empresa",
                "produto": "TEST_Dashboard_Produto",
                "dose_ha": 2.0,
                "valor": 120.00,
                "venda": "Venda direta",
                "estado": "SP",
                "concorre_microxisto": "Active"
            },
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        # Get dashboard without filter (all products)
        response = requests.get(
            f"{BASE_URL}/api/admin/market-studies/dashboard-by-microxisto",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        
        assert "competitors" in data, "Should have 'competitors' key"
        assert "microxisto_products" in data, "Should have 'microxisto_products' key"
        
        # Verify competitor data structure
        if len(data["competitors"]) > 0:
            competitor = data["competitors"][0]
            assert "produto_microxisto" in competitor
            assert "empresa" in competitor
            assert "produto" in competitor
            assert "min_valor" in competitor
            assert "max_valor" in competitor
            assert "avg_valor" in competitor
            assert "avg_rs_ha" in competitor
            assert "count" in competitor
        
        print(f"✅ Dashboard returned {len(data['competitors'])} competitor entries")
        print(f"   MicroXisto products with data: {data['microxisto_products']}")
    
    def test_admin_dashboard_filtered_by_product(self, auth_token):
        """Test admin dashboard filtered by specific MicroXisto product"""
        response = requests.get(
            f"{BASE_URL}/api/admin/market-studies/dashboard-by-microxisto?produto_microxisto=Active",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Filtered dashboard failed: {response.text}"
        data = response.json()
        
        # All competitors should be for 'Active' product
        for competitor in data["competitors"]:
            assert competitor["produto_microxisto"] == "Active", "Should only show Active product competitors"
        
        print(f"✅ Filtered dashboard returned {len(data['competitors'])} entries for 'Active'")
    
    def test_admin_export_excel(self, auth_token):
        """Test admin Excel export endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/market-studies/export",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        assert response.status_code == 200, f"Export failed: {response.text}"
        assert "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" in response.headers.get("content-type", ""), "Should return Excel file"
        assert len(response.content) > 0, "Excel file should have content"
        
        print(f"✅ Excel export successful, file size: {len(response.content)} bytes")


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
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_cleanup_test_data(self, auth_token):
        """Clean up TEST_ prefixed market studies"""
        # Get all studies
        response = requests.get(
            f"{BASE_URL}/api/admin/market-studies/all",
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        
        if response.status_code == 200:
            studies = response.json()
            deleted_count = 0
            for study in studies:
                if study.get("empresa", "").startswith("TEST_"):
                    delete_response = requests.delete(
                        f"{BASE_URL}/api/admin/market-studies/{study['id']}",
                        headers={"Authorization": f"Bearer {auth_token}"}
                    )
                    if delete_response.status_code == 200:
                        deleted_count += 1
            
            print(f"✅ Cleaned up {deleted_count} test market studies")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
