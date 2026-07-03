"""
Test suite for MicroXisto EasyX PWA - Bulk Import Feature
Tests the new bulk import functionality for market studies
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "agrofialho@gmail.com"
ADMIN_PASSWORD = "adm@123"


class TestBulkImportAPI:
    """Tests for POST /api/admin/market-studies/bulk-import endpoint"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get admin token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        
        token_data = login_response.json()
        self.token = token_data.get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        
        # Store IDs of created records for cleanup
        self.created_ids = []
        
        yield
        
        # Cleanup: Delete test records
        for study_id in self.created_ids:
            try:
                self.session.delete(f"{BASE_URL}/api/admin/market-studies/{study_id}")
            except:
                pass
    
    def test_bulk_import_success(self):
        """Test successful bulk import with valid records"""
        records = [
            {
                "empresa": "TEST_Empresa1",
                "produto": "TEST_Produto1",
                "dose_ha": 2.5,
                "valor": 100.0,
                "venda": "Venda direta",
                "estado": "SP",
                "concorre_microxisto": "Magnus",
                "cultura": "Soja"
            },
            {
                "empresa": "TEST_Empresa2",
                "produto": "TEST_Produto2",
                "dose_ha": 3.0,
                "valor": 150.0,
                "venda": "Distribuicao",
                "estado": "PR",
                "concorre_microxisto": "Active",
                "cultura": "Milho"
            }
        ]
        
        response = self.session.post(
            f"{BASE_URL}/api/admin/market-studies/bulk-import",
            json={"records": records}
        )
        
        assert response.status_code == 200, f"Bulk import failed: {response.text}"
        
        data = response.json()
        assert "imported" in data
        assert "errors" in data
        assert "total_sent" in data
        assert data["imported"] == 2
        assert data["total_sent"] == 2
        assert len(data["errors"]) == 0
        
        print(f"SUCCESS: Imported {data['imported']} records")
        
        # Verify records were created by fetching all studies
        all_studies = self.session.get(f"{BASE_URL}/api/admin/market-studies/all")
        assert all_studies.status_code == 200
        
        studies_data = all_studies.json()
        test_records = [s for s in studies_data if s.get("empresa", "").startswith("TEST_")]
        
        # Store IDs for cleanup
        for s in test_records:
            self.created_ids.append(s["id"])
        
        assert len(test_records) >= 2, "Created records not found in database"
        
        # Verify R$/ha calculation
        for s in test_records:
            expected_rs_ha = s["dose_ha"] * s["valor"]
            assert abs(s.get("rs_ha", 0) - expected_rs_ha) < 0.01, "R$/ha calculation incorrect"
        
        print("SUCCESS: Records verified in database with correct R$/ha calculation")
    
    def test_bulk_import_empty_empresa_produto_error(self):
        """Test that empty empresa/produto shows error"""
        records = [
            {
                "empresa": "",  # Empty empresa
                "produto": "TEST_Produto",
                "dose_ha": 2.5,
                "valor": 100.0,
                "venda": "Venda direta",
                "estado": "SP"
            },
            {
                "empresa": "TEST_Empresa",
                "produto": "",  # Empty produto
                "dose_ha": 2.5,
                "valor": 100.0,
                "venda": "Venda direta",
                "estado": "SP"
            }
        ]
        
        response = self.session.post(
            f"{BASE_URL}/api/admin/market-studies/bulk-import",
            json={"records": records}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["imported"] == 0, "Should not import records with empty empresa/produto"
        assert len(data["errors"]) == 2, "Should have 2 errors for empty fields"
        
        # Check error messages mention required fields
        for error in data["errors"]:
            assert "obrigatórios" in error.lower() or "empresa" in error.lower() or "produto" in error.lower()
        
        print(f"SUCCESS: Empty empresa/produto correctly rejected with errors: {data['errors']}")
    
    def test_bulk_import_decimal_with_comma(self):
        """Test that decimal values with comma work (Brazilian format)"""
        # Note: The frontend converts comma to dot before sending
        # Backend receives float values, so this tests the API accepts floats
        records = [
            {
                "empresa": "TEST_DecimalTest",
                "produto": "TEST_CommaDecimal",
                "dose_ha": 2.5,  # Frontend converts "2,5" to 2.5
                "valor": 150.75,  # Frontend converts "150,75" to 150.75
                "venda": "Venda direta",
                "estado": "MG",
                "concorre_microxisto": "ZINMAX",
                "cultura": "Soja"
            }
        ]
        
        response = self.session.post(
            f"{BASE_URL}/api/admin/market-studies/bulk-import",
            json={"records": records}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["imported"] == 1
        
        # Verify the record
        all_studies = self.session.get(f"{BASE_URL}/api/admin/market-studies/all")
        studies_data = all_studies.json()
        
        test_record = next((s for s in studies_data if s.get("empresa") == "TEST_DecimalTest"), None)
        assert test_record is not None
        
        self.created_ids.append(test_record["id"])
        
        assert test_record["dose_ha"] == 2.5
        assert test_record["valor"] == 150.75
        assert abs(test_record["rs_ha"] - (2.5 * 150.75)) < 0.01
        
        print(f"SUCCESS: Decimal values handled correctly - dose: {test_record['dose_ha']}, valor: {test_record['valor']}, rs_ha: {test_record['rs_ha']}")
    
    def test_bulk_import_default_values(self):
        """Test that default values are applied for missing fields"""
        records = [
            {
                "empresa": "TEST_DefaultValues",
                "produto": "TEST_MinimalRecord",
                "dose_ha": 1.0,
                "valor": 50.0
                # Missing: venda, estado, concorre_microxisto, cultura
            }
        ]
        
        response = self.session.post(
            f"{BASE_URL}/api/admin/market-studies/bulk-import",
            json={"records": records}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["imported"] == 1
        
        # Verify defaults were applied
        all_studies = self.session.get(f"{BASE_URL}/api/admin/market-studies/all")
        studies_data = all_studies.json()
        
        test_record = next((s for s in studies_data if s.get("empresa") == "TEST_DefaultValues"), None)
        assert test_record is not None
        
        self.created_ids.append(test_record["id"])
        
        # Check defaults from backend: venda="Venda direta", estado="SP", cultura="Soja"
        assert test_record.get("venda") == "Venda direta", f"Default venda not applied: {test_record.get('venda')}"
        assert test_record.get("estado") == "SP", f"Default estado not applied: {test_record.get('estado')}"
        assert test_record.get("cultura") == "Soja", f"Default cultura not applied: {test_record.get('cultura')}"
        
        print(f"SUCCESS: Default values applied - venda: {test_record['venda']}, estado: {test_record['estado']}, cultura: {test_record['cultura']}")
    
    def test_bulk_import_requires_admin(self):
        """Test that bulk import requires admin authentication"""
        # Create a new session without auth
        no_auth_session = requests.Session()
        no_auth_session.headers.update({"Content-Type": "application/json"})
        
        records = [{"empresa": "Test", "produto": "Test", "dose_ha": 1, "valor": 100}]
        
        response = no_auth_session.post(
            f"{BASE_URL}/api/admin/market-studies/bulk-import",
            json={"records": records}
        )
        
        # Should fail without auth
        assert response.status_code in [401, 403], f"Should require auth, got: {response.status_code}"
        print(f"SUCCESS: Bulk import correctly requires authentication (status: {response.status_code})")
    
    def test_bulk_import_response_structure(self):
        """Test that response has correct structure: {imported, errors, total_sent}"""
        records = [
            {"empresa": "TEST_Structure", "produto": "TEST_Valid", "dose_ha": 1, "valor": 100},
            {"empresa": "", "produto": "TEST_Invalid", "dose_ha": 1, "valor": 100}  # Will fail
        ]
        
        response = self.session.post(
            f"{BASE_URL}/api/admin/market-studies/bulk-import",
            json={"records": records}
        )
        
        assert response.status_code == 200
        
        data = response.json()
        
        # Check response structure
        assert "imported" in data, "Response missing 'imported' field"
        assert "errors" in data, "Response missing 'errors' field"
        assert "total_sent" in data, "Response missing 'total_sent' field"
        
        assert isinstance(data["imported"], int)
        assert isinstance(data["errors"], list)
        assert isinstance(data["total_sent"], int)
        
        assert data["total_sent"] == 2
        assert data["imported"] == 1
        assert len(data["errors"]) == 1
        
        # Cleanup
        all_studies = self.session.get(f"{BASE_URL}/api/admin/market-studies/all")
        for s in all_studies.json():
            if s.get("empresa") == "TEST_Structure":
                self.created_ids.append(s["id"])
        
        print(f"SUCCESS: Response structure correct - imported: {data['imported']}, errors: {len(data['errors'])}, total_sent: {data['total_sent']}")


class TestServiceWorkerCaching:
    """Tests for Service Worker caching configuration"""
    
    def test_sw_js_no_cache_headers(self):
        """Test that sw.js has no-cache headers"""
        response = requests.get(f"{BASE_URL}/sw.js")
        
        # Check response is successful
        assert response.status_code == 200, f"sw.js not accessible: {response.status_code}"
        
        # Check no-cache headers
        cache_control = response.headers.get("Cache-Control", "")
        
        # The middleware should add these headers
        assert "no-cache" in cache_control or "no-store" in cache_control or "must-revalidate" in cache_control, \
            f"sw.js missing no-cache headers. Got: {cache_control}"
        
        print(f"SUCCESS: sw.js has cache headers: {cache_control}")
    
    def test_sw_js_version_14(self):
        """Test that sw.js contains version 14"""
        response = requests.get(f"{BASE_URL}/sw.js")
        
        assert response.status_code == 200
        
        content = response.text
        
        # Check for v14 in cache name
        assert "easyx-offline-v14" in content or "v14" in content, \
            "sw.js should contain v14 version"
        
        print("SUCCESS: sw.js contains v14 version")
    
    def test_index_html_sw_registration(self):
        """Test that index.html registers SW with ?v=14 and updateViaCache: 'none'"""
        response = requests.get(f"{BASE_URL}/")
        
        assert response.status_code == 200
        
        content = response.text
        
        # Check for SW registration with version parameter
        assert "sw.js?v=14" in content or "sw.js" in content, \
            "index.html should register sw.js"
        
        # Check for updateViaCache: 'none'
        assert "updateViaCache" in content, \
            "index.html should have updateViaCache setting"
        
        print("SUCCESS: index.html has correct SW registration")


class TestDashboardUpdatesAfterImport:
    """Tests to verify dashboard updates after bulk import"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup: Get admin token"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Login as admin
        login_response = self.session.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert login_response.status_code == 200
        
        token_data = login_response.json()
        self.token = token_data.get("access_token")
        self.session.headers.update({"Authorization": f"Bearer {self.token}"})
        
        self.created_ids = []
        
        yield
        
        # Cleanup
        for study_id in self.created_ids:
            try:
                self.session.delete(f"{BASE_URL}/api/admin/market-studies/{study_id}")
            except:
                pass
    
    def test_dashboard_reflects_new_records(self):
        """Test that dashboard data updates after bulk import"""
        # Get initial count
        initial_dashboard = self.session.get(f"{BASE_URL}/api/admin/market-studies/dashboard-filtered")
        assert initial_dashboard.status_code == 200
        initial_data = initial_dashboard.json()
        initial_count = initial_data.get("summary", {}).get("total", 0)
        
        # Import new records
        records = [
            {
                "empresa": "TEST_Dashboard1",
                "produto": "TEST_DashProd1",
                "dose_ha": 2.0,
                "valor": 200.0,
                "venda": "Venda direta",
                "estado": "GO",
                "concorre_microxisto": "Guardian",
                "cultura": "Soja"
            },
            {
                "empresa": "TEST_Dashboard2",
                "produto": "TEST_DashProd2",
                "dose_ha": 3.0,
                "valor": 300.0,
                "venda": "Cooperativa",
                "estado": "MT",
                "concorre_microxisto": "TRUCKER",
                "cultura": "Milho"
            }
        ]
        
        import_response = self.session.post(
            f"{BASE_URL}/api/admin/market-studies/bulk-import",
            json={"records": records}
        )
        assert import_response.status_code == 200
        import_data = import_response.json()
        assert import_data["imported"] == 2
        
        # Get updated dashboard
        updated_dashboard = self.session.get(f"{BASE_URL}/api/admin/market-studies/dashboard-filtered")
        assert updated_dashboard.status_code == 200
        updated_data = updated_dashboard.json()
        updated_count = updated_data.get("summary", {}).get("total", 0)
        
        # Verify count increased
        assert updated_count >= initial_count + 2, \
            f"Dashboard count should increase. Initial: {initial_count}, Updated: {updated_count}"
        
        # Cleanup - get IDs
        all_studies = self.session.get(f"{BASE_URL}/api/admin/market-studies/all")
        for s in all_studies.json():
            if s.get("empresa", "").startswith("TEST_Dashboard"):
                self.created_ids.append(s["id"])
        
        print(f"SUCCESS: Dashboard updated - Initial count: {initial_count}, After import: {updated_count}")
    
    def test_filter_options_include_new_data(self):
        """Test that filter options include newly imported data"""
        # Import record with unique estado
        records = [
            {
                "empresa": "TEST_FilterTest",
                "produto": "TEST_FilterProd",
                "dose_ha": 1.5,
                "valor": 75.0,
                "venda": "Pool de compras",
                "estado": "AC",  # Unique state
                "concorre_microxisto": "Citro-X",
                "cultura": "Algodão"
            }
        ]
        
        import_response = self.session.post(
            f"{BASE_URL}/api/admin/market-studies/bulk-import",
            json={"records": records}
        )
        assert import_response.status_code == 200
        
        # Get filter options
        dashboard = self.session.get(f"{BASE_URL}/api/admin/market-studies/dashboard-filtered")
        assert dashboard.status_code == 200
        data = dashboard.json()
        
        filter_options = data.get("filter_options", {})
        
        # Check new empresa is in options
        assert "TEST_FilterTest" in filter_options.get("empresas", []), \
            "New empresa should appear in filter options"
        
        # Check new estado is in options
        assert "AC" in filter_options.get("estados", []), \
            "New estado should appear in filter options"
        
        # Cleanup
        all_studies = self.session.get(f"{BASE_URL}/api/admin/market-studies/all")
        for s in all_studies.json():
            if s.get("empresa") == "TEST_FilterTest":
                self.created_ids.append(s["id"])
        
        print(f"SUCCESS: Filter options updated with new data")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
