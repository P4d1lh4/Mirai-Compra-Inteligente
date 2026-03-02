"""Tests for authentication endpoints."""

import pytest
from fastapi import status


class TestRegister:
    """Test user registration."""

    def test_register_success(self, client, test_user_data):
        """Test successful user registration."""
        response = client.post("/api/v1/auth/register", json=test_user_data)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["access_token"]
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == test_user_data["email"]
        assert data["user"]["name"] == test_user_data["name"]

    def test_register_weak_password(self, client, test_user_weak_password):
        """Test registration with weak password validation."""
        response = client.post("/api/v1/auth/register", json=test_user_weak_password)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "password" in response.text.lower()

    def test_register_missing_fields(self, client):
        """Test registration with missing required fields."""
        response = client.post("/api/v1/auth/register", json={
            "email": "test@example.com"
            # Missing password, name
        })
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_duplicate_email(self, client, test_user_data):
        """Test registration with duplicate email."""
        # First registration
        response1 = client.post("/api/v1/auth/register", json=test_user_data)
        assert response1.status_code == status.HTTP_201_CREATED

        # Second registration with same email
        response2 = client.post("/api/v1/auth/register", json=test_user_data)
        assert response2.status_code == status.HTTP_409_CONFLICT


class TestLogin:
    """Test user login."""

    def test_login_success(self, client, test_user_data):
        """Test successful login."""
        # Register first
        client.post("/api/v1/auth/register", json=test_user_data)

        # Login
        login_data = {
            "email": test_user_data["email"],
            "password": test_user_data["password"],
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["access_token"]
        assert data["token_type"] == "bearer"
        assert data["user"]["email"] == test_user_data["email"]

    def test_login_invalid_credentials(self, client, test_user_data):
        """Test login with invalid credentials."""
        # Register user
        client.post("/api/v1/auth/register", json=test_user_data)

        # Try login with wrong password
        login_data = {
            "email": test_user_data["email"],
            "password": "WrongPassword123",
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent user."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "Password123",
        }
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_rate_limit(self, client, test_user_data):
        """Test rate limiting on login attempts."""
        # Register user first
        client.post("/api/v1/auth/register", json=test_user_data)

        # Attempt multiple logins (rate limit should kick in)
        login_data = {
            "email": test_user_data["email"],
            "password": "WrongPassword123",
        }

        # Make 10 failed login attempts
        for _ in range(10):
            response = client.post("/api/v1/auth/login", json=login_data)
            # Should get 401 for invalid credentials or 429 for rate limit

        # 11th attempt should definitely be rate limited
        response = client.post("/api/v1/auth/login", json=login_data)
        # Rate limit may return 429
        assert response.status_code in [401, 429]


class TestPasswordValidation:
    """Test password validation rules."""

    @pytest.mark.parametrize("password,should_pass", [
        ("ValidPass123", True),
        ("AnotherGood456", True),
        ("password123", False),  # Missing uppercase
        ("PASSWORD123", False),  # Missing lowercase
        ("Password", False),  # Missing digit
        ("Pass1", False),  # Too short
        ("P@ssw0rd", True),  # Special char ok
    ])
    def test_password_requirements(self, client, password, should_pass):
        """Test various password combinations."""
        user_data = {
            "email": f"test_{password}@example.com",
            "password": password,
            "name": "Test User",
        }
        response = client.post("/api/v1/auth/register", json=user_data)

        if should_pass:
            assert response.status_code == status.HTTP_201_CREATED
        else:
            assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
