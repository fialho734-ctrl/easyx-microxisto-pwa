import requests
import sys
from datetime import datetime

class MicroXistoAPITester:
    def __init__(self, base_url="https://b64fc90e-fe69-408b-88f9-e757c4944e6d.preview.emergentagent.com"):
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
        
        return success

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
    
    # Run admin tests if authentication worked
    if not auth_failed:
        tester.test_admin_endpoints()
    
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