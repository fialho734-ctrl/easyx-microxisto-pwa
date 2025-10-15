import requests
import sys
from datetime import datetime

class MicroXistoAPITester:
    def __init__(self, base_url="https://farmtech-hub-8.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.admin_email = "agrofialho@gmail.com"
        self.admin_password = "adm@123"

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, list):
                        print(f"   Response: List with {len(response_data)} items")
                    elif isinstance(response_data, dict):
                        print(f"   Response keys: {list(response_data.keys())}")
                except:
                    print(f"   Response: {response.text[:100]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            return success, response.json() if response.headers.get('content-type', '').startswith('application/json') else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_login(self):
        """Test admin login and get token"""
        print("\n" + "="*50)
        print("TESTING AUTHENTICATION")
        print("="*50)
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "api/auth/login",
            200,
            data={"email": self.admin_email, "password": self.admin_password}
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            print(f"   Token obtained: {self.token[:20]}...")
            print(f"   Is Admin: {response.get('is_admin', False)}")
            return True
        return False

    def test_technologies(self):
        """Test technologies endpoints"""
        print("\n" + "="*50)
        print("TESTING TECHNOLOGIES")
        print("="*50)
        
        # Get all technologies
        success, technologies = self.run_test(
            "Get Technologies",
            "GET",
            "api/technologies",
            200
        )
        
        if not success or not technologies:
            return False
            
        print(f"   Found {len(technologies)} technologies")
        expected_techs = ["AquaX", "MicroX", "NanoX", "BioX", "FemtoX"]
        found_techs = [tech['name'] for tech in technologies]
        
        for expected in expected_techs:
            if expected in found_techs:
                print(f"   ✅ Found technology: {expected}")
            else:
                print(f"   ❌ Missing technology: {expected}")
        
        # Test products for first technology
        if technologies:
            tech_id = technologies[0]['id']
            tech_name = technologies[0]['name']
            
            success, products = self.run_test(
                f"Get Products for {tech_name}",
                "GET",
                f"api/technologies/{tech_id}/products",
                200
            )
            
            if success:
                print(f"   Found {len(products)} products for {tech_name}")
                
                # Test individual product details
                if products:
                    product_id = products[0]['id']
                    product_name = products[0]['name']
                    
                    success, product_details = self.run_test(
                        f"Get Product Details for {product_name}",
                        "GET",
                        f"api/products/{product_id}",
                        200
                    )
                    
                    if success and product_details:
                        print(f"   Product details loaded for: {product_details.get('name', 'Unknown')}")
                        print(f"   Composition elements: {len(product_details.get('composition', {}))}")
        
        return True

    def test_competitors(self):
        """Test competitor endpoints"""
        print("\n" + "="*50)
        print("TESTING COMPETITORS")
        print("="*50)
        
        # Get competitor companies
        success, companies = self.run_test(
            "Get Competitor Companies",
            "GET",
            "api/competitors/companies",
            200
        )
        
        if not success:
            return False
            
        print(f"   Found {len(companies)} competitor companies")
        
        # Check for Kimberlit
        company_names = [comp['company'] for comp in companies]
        if "Kimberlit" in company_names:
            print("   ✅ Found Kimberlit company")
            
            # Get Kimberlit products
            success, products = self.run_test(
                "Get Kimberlit Products",
                "GET",
                "api/competitors/companies/Kimberlit/products",
                200
            )
            
            if success:
                print(f"   Found {len(products)} Kimberlit products")
                expected_products = ["KBT Radicel", "Exion Vida", "Exion Potencer Ultra"]
                found_products = [prod['product'] for prod in products]
                
                for expected in expected_products:
                    if expected in found_products:
                        print(f"   ✅ Found product: {expected}")
                    else:
                        print(f"   ❌ Missing product: {expected}")
                
                # Test individual competitor details
                if products:
                    competitor_id = products[0]['id']
                    competitor_name = products[0]['product']
                    
                    success, competitor_details = self.run_test(
                        f"Get Competitor Details for {competitor_name}",
                        "GET",
                        f"api/competitors/{competitor_id}",
                        200
                    )
                    
                    if success and competitor_details:
                        print(f"   Competitor details loaded for: {competitor_details.get('product', 'Unknown')}")
        else:
            print("   ❌ Kimberlit company not found")
        
        return True

    def test_home_content(self):
        """Test home content endpoint"""
        print("\n" + "="*50)
        print("TESTING HOME CONTENT")
        print("="*50)
        
        success, content = self.run_test(
            "Get Home Content",
            "GET",
            "api/home",
            200
        )
        
        if success and content:
            print(f"   Home content loaded: {len(content.get('text', ''))} characters")
            print(f"   PDF URL: {content.get('pdf_url', 'None')}")
        
        return success

    def test_admin_endpoints(self):
        """Test admin-only endpoints (requires authentication)"""
        print("\n" + "="*50)
        print("TESTING ADMIN ENDPOINTS")
        print("="*50)
        
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        all_passed = True
        
        # Test user management endpoints
        success, users = self.run_test(
            "Get All Users (Admin)",
            "GET",
            "api/admin/users",
            200
        )
        if success:
            print(f"   Found {len(users)} total users")
        all_passed = all_passed and success
        
        success, pending_users = self.run_test(
            "Get Pending Users (Admin)",
            "GET",
            "api/admin/users/pending",
            200
        )
        if success:
            print(f"   Found {len(pending_users)} pending users")
        all_passed = all_passed and success
        
        # Test products management
        success, products = self.run_test(
            "Get All Products (Admin)",
            "GET",
            "api/admin/products",
            200
        )
        if success:
            print(f"   Found {len(products)} total products")
        all_passed = all_passed and success
        
        # Test competitors management
        success, competitors = self.run_test(
            "Get All Competitors (Admin)",
            "GET",
            "api/admin/competitors",
            200
        )
        if success:
            print(f"   Found {len(competitors)} total competitors")
        all_passed = all_passed and success
        
        # Test home content update
        success, response = self.run_test(
            "Update Home Content (Admin)",
            "POST",
            "api/admin/home",
            200,
            data={
                "text": "Test content update from API test",
                "pdf_url": None
            }
        )
        all_passed = all_passed and success
        
    def test_pwa_caching_support(self):
        """Test PWA caching support - verify all endpoints return proper JSON for caching"""
        print("\n" + "="*50)
        print("TESTING PWA CACHING SUPPORT")
        print("="*50)
        
        all_passed = True
        
        # Test all main endpoints that should be cached by Service Worker
        endpoints_to_test = [
            ("Technologies", "api/technologies"),
            ("Home Content", "api/home"),
            ("Competitor Companies", "api/competitors/companies")
        ]
        
        for name, endpoint in endpoints_to_test:
            success, response = self.run_test(
                f"PWA Cache Test - {name}",
                "GET",
                endpoint,
                200
            )
            
            if success:
                # Verify response is JSON serializable (important for caching)
                try:
                    import json
                    json.dumps(response)
                    print(f"   ✅ {name} response is JSON serializable for caching")
                except:
                    print(f"   ❌ {name} response is NOT JSON serializable")
                    all_passed = False
            else:
                all_passed = False
        
        return all_passed
    
    def test_database_connectivity(self):
        """Test database connectivity and data persistence"""
        print("\n" + "="*50)
        print("TESTING DATABASE CONNECTIVITY")
        print("="*50)
        
        all_passed = True
        
        # Test data retrieval to verify DB connection
        success, technologies = self.run_test(
            "Database Connection Test - Technologies",
            "GET",
            "api/technologies",
            200
        )
        
        if success and technologies:
            print(f"   ✅ Database connection working - retrieved {len(technologies)} technologies")
            
            # Verify expected data structure
            if len(technologies) >= 5:
                print("   ✅ Expected number of technologies found")
            else:
                print(f"   ❌ Expected at least 5 technologies, found {len(technologies)}")
                all_passed = False
                
            # Check data integrity
            for tech in technologies[:3]:  # Check first 3
                if all(key in tech for key in ['id', 'name', 'logo', 'description']):
                    print(f"   ✅ Technology '{tech['name']}' has all required fields")
                else:
                    print(f"   ❌ Technology '{tech.get('name', 'Unknown')}' missing required fields")
                    all_passed = False
        else:
            print("   ❌ Database connection failed")
            all_passed = False
        
        return all_passed
    
    def test_crud_operations(self):
        """Test CRUD operations for admin endpoints"""
        print("\n" + "="*50)
        print("TESTING CRUD OPERATIONS")
        print("="*50)
        
        if not self.token:
            print("❌ No authentication token available")
            return False
        
        all_passed = True
        
        # Test creating a new technology
        test_tech_data = {
            "name": "TestX Technology",
            "logo": "https://example.com/test-logo.png",
            "description": "Test technology for API testing"
        }
        
        success, created_tech = self.run_test(
            "Create Technology (Admin)",
            "POST",
            "api/admin/technologies",
            200,
            data=test_tech_data
        )
        
        if success and created_tech:
            tech_id = created_tech.get('id')
            print(f"   ✅ Created technology with ID: {tech_id}")
            
            # Test updating the technology
            updated_data = {
                "name": "TestX Technology Updated",
                "logo": "https://example.com/updated-logo.png", 
                "description": "Updated test technology description"
            }
            
            success, response = self.run_test(
                "Update Technology (Admin)",
                "PUT",
                f"api/admin/technologies/{tech_id}",
                200,
                data=updated_data
            )
            
            if success:
                print("   ✅ Technology updated successfully")
            else:
                all_passed = False
            
            # Test deleting the technology
            success, response = self.run_test(
                "Delete Technology (Admin)",
                "DELETE",
                f"api/admin/technologies/{tech_id}",
                200
            )
            
            if success:
                print("   ✅ Technology deleted successfully")
            else:
                all_passed = False
                
        else:
            print("   ❌ Failed to create test technology")
            all_passed = False
        
        return all_passed

def main():
    print("🚀 Starting MicroXisto API Tests")
    print("="*60)
    
    # Setup
    tester = MicroXistoAPITester()
    
    # Run authentication test first
    if not tester.test_login():
        print("\n❌ Authentication failed, stopping admin tests")
        auth_failed = True
    else:
        auth_failed = False
    
    # Run basic API tests (no auth required)
    tester.test_technologies()
    tester.test_competitors() 
    tester.test_home_content()
    
    # Run PWA and database tests
    tester.test_pwa_caching_support()
    tester.test_database_connectivity()
    
    # Run admin tests if authentication worked
    if not auth_failed:
        tester.test_admin_endpoints()
        tester.test_crud_operations()
    
    # Print final results
    print("\n" + "="*60)
    print("📊 FINAL TEST RESULTS")
    print("="*60)
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())