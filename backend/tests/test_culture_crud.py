"""
Culture CRUD Tests - Testing the ObjectId serialization bug fix
Bug: POST /api/admin/cultures was returning 500 Internal Server Error due to ObjectId serialization
Fix: Added culture_data.pop('_id', None) after insert_one in server.py lines 440-458
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://microxisto-preview.preview.emergentagent.com')

# Test credentials
ADMIN_EMAIL = "agrofialho@gmail.com"
ADMIN_PASSWORD = "adm@123"


class TestCultureCRUD:
    """Culture CRUD endpoint tests - Focus on the ObjectId serialization bug fix"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        return response.json()["access_token"]
    
    def test_create_culture_success(self, admin_token):
        """
        POST /api/admin/cultures - Create new culture should return 200 with culture data
        This was the bug: returning 500 Internal Server Error due to ObjectId serialization
        """
        culture_data = {
            "name": f"TEST_Culture_{uuid.uuid4().hex[:8]}",
            "image": "https://example.com/test-culture-icon.png",
            "link": "https://drive.google.com/drive/folders/test-culture"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/cultures",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=culture_data
        )
        
        # This is the key assertion - was returning 500 before the fix
        assert response.status_code == 200, f"Create culture failed with status {response.status_code}: {response.text}"
        
        data = response.json()
        assert "message" in data, "Response should have message"
        assert "culture" in data, "Response should have culture object"
        
        created_culture = data["culture"]
        assert "id" in created_culture, "Created culture should have id"
        assert created_culture["name"] == culture_data["name"], "Name should match"
        assert created_culture["image"] == culture_data["image"], "Image should match"
        assert created_culture["link"] == culture_data["link"], "Link should match"
        
        # Verify no _id field (MongoDB ObjectId) in response
        assert "_id" not in created_culture, "Response should not contain MongoDB _id"
        
        print(f"✅ Culture created successfully: {created_culture['name']}")
        return created_culture["id"]
    
    def test_get_admin_cultures(self, admin_token):
        """GET /api/admin/cultures - List all cultures for admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/cultures",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200, f"Get cultures failed: {response.text}"
        
        data = response.json()
        assert isinstance(data, list), "Response should be a list"
        
        # Verify no _id in any culture
        for culture in data:
            assert "_id" not in culture, f"Culture {culture.get('name')} should not have _id"
            assert "id" in culture, f"Culture should have id field"
        
        print(f"✅ Retrieved {len(data)} cultures")
    
    def test_update_culture(self, admin_token):
        """PUT /api/admin/cultures/{id} - Update culture should work"""
        # First create a culture
        culture_data = {
            "name": f"TEST_Update_{uuid.uuid4().hex[:8]}",
            "image": "https://example.com/original-icon.png",
            "link": "https://drive.google.com/drive/folders/original"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/cultures",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=culture_data
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        culture_id = create_response.json()["culture"]["id"]
        
        # Update the culture
        update_data = {
            "name": f"TEST_Updated_{uuid.uuid4().hex[:8]}",
            "image": "https://example.com/updated-icon.png",
            "link": "https://drive.google.com/drive/folders/updated"
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/cultures/{culture_id}",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=update_data
        )
        
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        data = update_response.json()
        assert "message" in data, "Response should have message"
        assert data["message"] == "Culture updated successfully"
        
        print(f"✅ Culture updated successfully")
        return culture_id
    
    def test_delete_culture(self, admin_token):
        """DELETE /api/admin/cultures/{id} - Delete culture should work"""
        # First create a culture
        culture_data = {
            "name": f"TEST_Delete_{uuid.uuid4().hex[:8]}",
            "image": "https://example.com/delete-icon.png",
            "link": "https://drive.google.com/drive/folders/delete"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/cultures",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=culture_data
        )
        assert create_response.status_code == 200, f"Create failed: {create_response.text}"
        culture_id = create_response.json()["culture"]["id"]
        
        # Delete the culture
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/cultures/{culture_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert delete_response.status_code == 200, f"Delete failed: {delete_response.text}"
        
        data = delete_response.json()
        assert "message" in data, "Response should have message"
        assert data["message"] == "Culture deleted successfully"
        
        # Verify culture is deleted - try to get all cultures and check it's not there
        list_response = requests.get(
            f"{BASE_URL}/api/admin/cultures",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        cultures = list_response.json()
        deleted_culture = next((c for c in cultures if c["id"] == culture_id), None)
        assert deleted_culture is None, "Deleted culture should not be in list"
        
        print(f"✅ Culture deleted successfully")
    
    def test_full_culture_crud_flow(self, admin_token):
        """Full CRUD flow for cultures - Create, Read, Update, Delete"""
        # Use unique name to avoid conflicts with cleanup
        unique_id = uuid.uuid4().hex[:12]
        
        # CREATE
        culture_data = {
            "name": f"TEST_FLOW_{unique_id}",
            "image": "https://example.com/crud-icon.png",
            "link": "https://drive.google.com/drive/folders/crud"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/cultures",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=culture_data
        )
        assert create_response.status_code == 200, f"CREATE failed: {create_response.text}"
        created = create_response.json()["culture"]
        culture_id = created["id"]
        print(f"✅ CREATE: Culture '{created['name']}' created with id {culture_id}")
        
        # READ - verify in list
        list_response = requests.get(
            f"{BASE_URL}/api/admin/cultures",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert list_response.status_code == 200
        cultures = list_response.json()
        found = any(c["id"] == culture_id for c in cultures)
        assert found, "Created culture should be in list"
        print(f"✅ READ: Culture found in list")
        
        # UPDATE
        update_data = {
            "name": f"TEST_FLOW_Updated_{unique_id}",
            "image": "https://example.com/crud-updated-icon.png",
            "link": "https://drive.google.com/drive/folders/crud-updated"
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/cultures/{culture_id}",
            headers={
                "Authorization": f"Bearer {admin_token}",
                "Content-Type": "application/json"
            },
            json=update_data
        )
        assert update_response.status_code == 200, f"UPDATE failed: {update_response.text}"
        print(f"✅ UPDATE: Culture updated successfully")
        
        # DELETE - use the same culture_id we just updated
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/cultures/{culture_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200, f"DELETE failed: {delete_response.text}"
        
        # Verify deleted
        list_after_delete = requests.get(
            f"{BASE_URL}/api/admin/cultures",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        cultures_after = list_after_delete.json()
        not_found = not any(c["id"] == culture_id for c in cultures_after)
        assert not_found, "Deleted culture should not be in list"
        print(f"✅ DELETE: Culture deleted and verified")
    
    def test_create_culture_requires_admin(self):
        """POST /api/admin/cultures without admin auth should fail"""
        culture_data = {
            "name": "TEST_NoAuth",
            "image": "https://example.com/noauth.png",
            "link": "https://example.com"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/cultures",
            headers={"Content-Type": "application/json"},
            json=culture_data
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"
        print(f"✅ Create culture correctly requires admin auth")


# Cleanup fixture
@pytest.fixture(scope="session", autouse=True)
def cleanup_test_cultures():
    """Cleanup TEST_ prefixed cultures after all tests"""
    yield
    try:
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if login_response.status_code == 200:
            token = login_response.json()["access_token"]
            cultures_response = requests.get(
                f"{BASE_URL}/api/admin/cultures",
                headers={"Authorization": f"Bearer {token}"}
            )
            if cultures_response.status_code == 200:
                for culture in cultures_response.json():
                    if culture.get("name", "").startswith("TEST_"):
                        requests.delete(
                            f"{BASE_URL}/api/admin/cultures/{culture['id']}",
                            headers={"Authorization": f"Bearer {token}"}
                        )
                        print(f"🧹 Cleaned up test culture: {culture['name']}")
    except Exception as e:
        print(f"Cleanup error: {e}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
