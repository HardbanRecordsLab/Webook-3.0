#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime

class WebbookGeneratorAPITester:
    def __init__(self, base_url="https://eduweb-builder.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details="", expected_status=None, actual_status=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
            if expected_status and actual_status:
                print(f"   Expected: {expected_status}, Got: {actual_status}")
        
        self.test_results.append({
            "name": name,
            "success": success,
            "details": details,
            "expected_status": expected_status,
            "actual_status": actual_status
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.session_token:
            test_headers['Authorization'] = f'Bearer {self.session_token}'
        
        if headers:
            test_headers.update(headers)

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
            details = ""
            
            if not success:
                try:
                    error_data = response.json()
                    details = error_data.get('detail', 'Unknown error')
                except:
                    details = response.text[:100] if response.text else "No response body"

            self.log_test(name, success, details, expected_status, response.status_code)
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_api_version(self):
        """Test API version endpoint"""
        print("\n🔍 Testing API Version...")
        result = self.run_test("API Version Check", "GET", "", 200)
        if result:
            version = result.get('version')
            if version == '3.0.0':
                print(f"   ✅ Version: {version}")
            else:
                print(f"   ⚠️  Expected version 3.0.0, got: {version}")
        return result is not None

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔍 Testing Authentication...")
        
        # Test /auth/me without authentication (should return 401)
        self.run_test("Auth Me (Unauthenticated)", "GET", "auth/me", 401)
        
        # Test session creation without session_id (should return 400)
        self.run_test("Create Session (No session_id)", "POST", "auth/session", 400, {})
        
        return True

    def test_projects_auth_required(self):
        """Test that projects endpoint requires authentication"""
        print("\n🔍 Testing Projects Authentication...")
        
        # Test projects endpoint without auth (should return 401)
        self.run_test("Get Projects (Unauthenticated)", "GET", "projects", 401)
        
        # Test create project without auth (should return 401)
        self.run_test("Create Project (Unauthenticated)", "POST", "projects", 401, {
            "title": "Test Project",
            "description": "Test Description"
        })
        
        return True

    def test_payment_endpoints(self):
        """Test payment endpoints without authentication"""
        print("\n🔍 Testing Payment Endpoints...")
        
        # Test checkout without auth (should return 401)
        self.run_test("Create Checkout (Unauthenticated)", "POST", "payments/checkout", 401, {
            "project_id": "test-id",
            "origin_url": "https://example.com"
        })
        
        return True

    def test_export_endpoints(self):
        """Test export endpoints without authentication"""
        print("\n🔍 Testing Export Endpoints...")
        
        # Test export without auth (should return 401)
        self.run_test("Export Webbook (Unauthenticated)", "GET", "projects/test-id/export", 401)
        
        return True

    def test_gamification_endpoints(self):
        """Test gamification endpoints"""
        print("\n🔍 Testing Gamification...")
        
        # Test badges endpoint (should work without auth)
        result = self.run_test("Get Badges", "GET", "badges", 200)
        if result and isinstance(result, list):
            print(f"   ✅ Found {len(result)} badges")
            # Check for expected badges
            badge_names = [badge.get('name', '') for badge in result]
            expected_badges = ['Pierwszy Krok', 'Tydzień Nauki', 'Mistrz Quizów', 'Mól Książkowy', 'Mistrz']
            for expected in expected_badges:
                if expected in badge_names:
                    print(f"   ✅ Badge found: {expected}")
                else:
                    print(f"   ⚠️  Badge missing: {expected}")
        
        # Test progress endpoint without auth (should return 401)
        self.run_test("Get Progress (Unauthenticated)", "GET", "progress/test-id", 401)
        
        return True

    def test_chapter_endpoints(self):
        """Test chapter endpoints without authentication"""
        print("\n🔍 Testing Chapter Endpoints...")
        
        # Test get chapters without auth (should return 401)
        self.run_test("Get Chapters (Unauthenticated)", "GET", "projects/test-id/chapters", 401)
        
        # Test create chapter without auth (should return 401)
        self.run_test("Create Chapter (Unauthenticated)", "POST", "projects/test-id/chapters", 401, {
            "title": "Test Chapter",
            "content": "<p>Test content</p>"
        })
        
        return True

    def test_pdf_upload(self):
        """Test PDF upload endpoint without authentication"""
        print("\n🔍 Testing PDF Upload...")
        
        # Test PDF upload without auth (should return 401)
        # Note: This would normally require multipart/form-data, but we're testing auth first
        self.run_test("Upload PDF (Unauthenticated)", "POST", "projects/test-id/upload-pdf", 401)
        
        return True

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting Webbook Generator 3.0 Backend API Tests")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)

        try:
            # Test basic API functionality
            self.test_api_version()
            
            # Test authentication requirements
            self.test_auth_endpoints()
            self.test_projects_auth_required()
            self.test_payment_endpoints()
            self.test_export_endpoints()
            self.test_chapter_endpoints()
            self.test_pdf_upload()
            
            # Test public endpoints
            self.test_gamification_endpoints()
            
        except Exception as e:
            print(f"\n❌ Critical error during testing: {e}")
            return False

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("⚠️  Some tests failed - see details above")
            failed_tests = [t for t in self.test_results if not t['success']]
            print(f"\n❌ Failed tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"   • {test['name']}: {test['details']}")
            return False

def main():
    """Main test runner"""
    tester = WebbookGeneratorAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    results = {
        "timestamp": datetime.now().isoformat(),
        "total_tests": tester.tests_run,
        "passed_tests": tester.tests_passed,
        "success_rate": (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0,
        "test_details": tester.test_results
    }
    
    try:
        with open('/app/backend_test_results.json', 'w') as f:
            json.dump(results, f, indent=2)
        print(f"\n📄 Detailed results saved to: /app/backend_test_results.json")
    except Exception as e:
        print(f"\n⚠️  Could not save results: {e}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())