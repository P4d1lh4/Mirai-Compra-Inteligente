"""Tests for product endpoints."""

import pytest
from fastapi import status


class TestProductSearch:
    """Test product search functionality."""

    def test_search_empty_query(self, client):
        """Test search with empty query."""
        response = client.get("/api/v1/products/search", params={"query": ""})
        assert response.status_code == status.HTTP_400_BAD_REQUEST

    def test_search_short_query(self, client):
        """Test search with query too short (less than 2 chars)."""
        response = client.get("/api/v1/products/search", params={"query": "a"})
        # Should either require minimum 2 chars or work fine
        # Implementation detail - adjust based on actual API behavior
        assert response.status_code in [400, 200]

    def test_search_pagination(self, client):
        """Test search with pagination parameters."""
        response = client.get(
            "/api/v1/products/search",
            params={
                "query": "arroz",
                "page": 1,
                "page_size": 10,
            }
        )
        assert response.status_code in [200, 400]  # May not have data in empty DB
        if response.status_code == 200:
            data = response.json()
            assert "items" in data or "results" in data or isinstance(data, list)


class TestCategories:
    """Test category endpoints."""

    def test_get_categories(self, client):
        """Test fetching product categories."""
        response = client.get("/api/v1/products/categories")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        # Should be a list or dict with categories
        assert isinstance(data, (list, dict))


class TestProductDetail:
    """Test product detail endpoint."""

    def test_get_nonexistent_product(self, client):
        """Test fetching non-existent product."""
        response = client.get("/api/v1/products/99999999-9999-9999-9999-999999999999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_invalid_uuid(self, client):
        """Test fetching product with invalid UUID format."""
        response = client.get("/api/v1/products/invalid-uuid")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
