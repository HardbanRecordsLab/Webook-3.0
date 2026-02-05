"""
Webbook Generator 3.0 API Tests
Tests for: Auth, Projects, Chapters, Payments, Export, Gamification
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndPublicEndpoints:
    """Test public endpoints that don't require authentication"""
    
    def test_api_root(self):
        """Test API root returns version info"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Webbook Generator 3.0 API"
        assert data["version"] == "3.0.0"
    
    def test_badges_endpoint(self):
        """Test badges endpoint returns gamification badges"""
        response = requests.get(f"{BASE_URL}/api/badges")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) == 5
        # Verify badge structure
        badge_ids = [b["id"] for b in data]
        assert "first_chapter" in badge_ids
        assert "quiz_master" in badge_ids


class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_auth_me_without_token(self):
        """Test /auth/me returns 401 without authentication"""
        response = requests.get(f"{BASE_URL}/api/auth/me")
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert data["detail"] == "Not authenticated"
    
    def test_auth_session_without_session_id(self):
        """Test /auth/session returns 400 without session_id"""
        response = requests.post(f"{BASE_URL}/api/auth/session", json={})
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        assert "session_id" in data["detail"].lower()
    
    def test_auth_session_with_invalid_session_id(self):
        """Test /auth/session returns 401 with invalid session_id"""
        response = requests.post(f"{BASE_URL}/api/auth/session", json={"session_id": "invalid_session_123"})
        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
    
    def test_auth_logout_without_session(self):
        """Test /auth/logout works even without session"""
        response = requests.post(f"{BASE_URL}/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Logged out"


class TestProjectEndpointsAuth:
    """Test project endpoints require authentication"""
    
    def test_get_projects_requires_auth(self):
        """Test GET /projects returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/projects")
        assert response.status_code == 401
    
    def test_create_project_requires_auth(self):
        """Test POST /projects returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/projects", json={"title": "Test", "description": "Test"})
        assert response.status_code == 401
    
    def test_get_single_project_requires_auth(self):
        """Test GET /projects/{id} returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/projects/test-id-123")
        assert response.status_code == 401
    
    def test_update_project_requires_auth(self):
        """Test PUT /projects/{id} returns 401 without auth"""
        response = requests.put(f"{BASE_URL}/api/projects/test-id-123", json={"title": "Updated"})
        assert response.status_code == 401
    
    def test_delete_project_requires_auth(self):
        """Test DELETE /projects/{id} returns 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/projects/test-id-123")
        assert response.status_code == 401


class TestChapterEndpointsAuth:
    """Test chapter endpoints require authentication"""
    
    def test_get_chapters_requires_auth(self):
        """Test GET /projects/{id}/chapters returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/projects/test-id/chapters")
        assert response.status_code == 401
    
    def test_create_chapter_requires_auth(self):
        """Test POST /projects/{id}/chapters returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/projects/test-id/chapters", json={"title": "Test Chapter"})
        assert response.status_code == 401
    
    def test_update_chapter_requires_auth(self):
        """Test PUT /chapters/{id} returns 401 without auth"""
        response = requests.put(f"{BASE_URL}/api/chapters/test-id", json={"title": "Updated"})
        assert response.status_code == 401
    
    def test_delete_chapter_requires_auth(self):
        """Test DELETE /chapters/{id} returns 401 without auth"""
        response = requests.delete(f"{BASE_URL}/api/chapters/test-id")
        assert response.status_code == 401


class TestPaymentEndpointsAuth:
    """Test payment endpoints require authentication"""
    
    def test_create_checkout_requires_auth(self):
        """Test POST /payments/checkout returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/payments/checkout", json={"project_id": "test-id", "origin_url": "http://test.com"})
        assert response.status_code == 401
    
    def test_get_payment_status_requires_auth(self):
        """Test GET /payments/status/{id} returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/payments/status/test-session-id")
        assert response.status_code == 401


class TestExportEndpointsAuth:
    """Test export endpoints require authentication"""
    
    def test_export_webbook_requires_auth(self):
        """Test GET /projects/{id}/export returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/projects/test-id/export")
        assert response.status_code == 401


class TestProgressEndpointsAuth:
    """Test progress/gamification endpoints require authentication"""
    
    def test_get_progress_requires_auth(self):
        """Test GET /progress/{id} returns 401 without auth"""
        response = requests.get(f"{BASE_URL}/api/progress/test-project-id")
        assert response.status_code == 401
    
    def test_complete_chapter_requires_auth(self):
        """Test POST /progress/{id}/complete-chapter returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/progress/test-id/complete-chapter", data={"chapter_id": "test"})
        assert response.status_code == 401
    
    def test_toggle_bookmark_requires_auth(self):
        """Test POST /progress/{id}/bookmark returns 401 without auth"""
        response = requests.post(f"{BASE_URL}/api/progress/test-id/bookmark", data={"chapter_id": "test"})
        assert response.status_code == 401


class TestQuizEndpoints:
    """Test quiz endpoints"""
    
    def test_get_quiz_public(self):
        """Test GET /chapters/{id}/quiz - returns null for non-existent quiz"""
        response = requests.get(f"{BASE_URL}/api/chapters/non-existent-id/quiz")
        assert response.status_code == 200
        # Returns null for non-existent quiz
        assert response.json() is None


class TestStripeWebhook:
    """Test Stripe webhook endpoint"""
    
    def test_stripe_webhook_accepts_post(self):
        """Test POST /webhook/stripe accepts requests"""
        response = requests.post(f"{BASE_URL}/api/webhook/stripe", data=b"test")
        # Should return 200 even with invalid data (graceful handling)
        assert response.status_code == 200


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
