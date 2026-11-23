def test_admin_access_rejected_for_unauthenticated(client):
    """Verifies that unauthenticated visitors are blocked from admin endpoints."""
    res = client.get("/api/admin/users")
    assert res.status_code == 401


def test_admin_access_rejected_for_standard_user(client, test_user):
    """Verifies that normal students with role='user' receive 403 Forbidden."""
    login_res = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "Password123!"
    })
    cookie = login_res.cookies.get("careercurve_session")

    admin_attempt = client.get("/api/admin/users", cookies={"careercurve_session": cookie})
    assert admin_attempt.status_code == 403
    assert "admin privileges required" in admin_attempt.json()["detail"].lower()


def test_admin_access_granted_for_admin_user(client, test_admin, test_user):
    """Verifies that users with server-verified role='admin' can view registered users."""
    login_res = client.post("/api/auth/login", json={
        "email": test_admin.email,
        "password": "AdminSecure2026!"
    })
    cookie = login_res.cookies.get("careercurve_session")

    res = client.get("/api/admin/users", cookies={"careercurve_session": cookie})
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["total"] >= 2
    assert "users" in data

    # Verify that sensitive secrets are never exposed
    for u in data["users"]:
        assert "password" not in u
        assert "password_hash" not in u
        assert "passwordHash" not in u
        assert "token" not in u


def test_admin_search_and_filter(client, test_admin, test_user):
    """Verifies admin search filter by user name and email."""
    login_res = client.post("/api/auth/login", json={
        "email": test_admin.email,
        "password": "AdminSecure2026!"
    })
    cookie = login_res.cookies.get("careercurve_session")

    # Search for "alice"
    search_res = client.get(
        "/api/admin/users?q=alice",
        cookies={"careercurve_session": cookie}
    )
    assert search_res.status_code == 200
    results = search_res.json()["users"]
    assert len(results) == 1
    assert results[0]["email"] == test_user.email

    # Filter by role "admin"
    role_res = client.get(
        "/api/admin/users?role=admin",
        cookies={"careercurve_session": cookie}
    )
    assert role_res.status_code == 200
    results = role_res.json()["users"]
    assert all(u["role"] == "admin" for u in results)
