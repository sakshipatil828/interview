def test_register_success(client):
    """Verifies successful registration, session cookie creation, and safe user data return."""
    payload = {
        "fullName": "John Doe",
        "email": "john.doe@example.com",
        "password": "SecurePassword2026!",
        "confirmPassword": "SecurePassword2026!",
        "department": "Computer Science & Engineering",
        "college": "Apex Institute of Technology",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["user"]["name"] == "John Doe"
    assert data["user"]["email"] == "john.doe@example.com"
    assert "password" not in data["user"]
    assert "password_hash" not in data["user"]
    assert "careercurve_session" in response.cookies


def test_register_duplicate_email_rejected(client, test_user):
    """Verifies that duplicate emails are rejected with status 400."""
    payload = {
        "fullName": "Alice Impostor",
        "email": test_user.email,  # duplicate
        "password": "Password123!",
        "confirmPassword": "Password123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"].lower()


def test_register_password_mismatch(client):
    """Verifies rejection when password confirmation does not match."""
    payload = {
        "fullName": "Bob Tester",
        "email": "bob@example.com",
        "password": "Password123!",
        "confirmPassword": "DifferentPassword123!",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code == 400
    assert "do not match" in response.json()["detail"].lower()


def test_register_weak_password(client):
    """Verifies rejection when password is shorter than 8 characters."""
    payload = {
        "fullName": "Charlie Short",
        "email": "charlie@example.com",
        "password": "short",
        "confirmPassword": "short",
    }
    response = client.post("/api/auth/register", json=payload)
    assert response.status_code in (400, 422)


def test_login_success_and_cookie(client, test_user):
    """Verifies login credentials check, opaque cookie creation, and safe profile return."""
    login_payload = {
        "email": test_user.email,
        "password": "Password123!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["user"]["email"] == test_user.email
    assert "careercurve_session" in response.cookies


def test_login_invalid_password_rejected(client, test_user):
    """Verifies that wrong passwords return 401 Unauthorized."""
    login_payload = {
        "email": test_user.email,
        "password": "WrongPassword999!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


def test_login_nonexistent_email_rejected(client):
    """Verifies that non-registered emails return 401 Unauthorized."""
    login_payload = {
        "email": "nobody@example.com",
        "password": "Password123!",
    }
    response = client.post("/api/auth/login", json=login_payload)
    assert response.status_code == 401


def test_auth_me_with_session_cookie(client, test_user):
    """Verifies /api/auth/me succeeds with a valid cookie and returns the user."""
    # Login first
    login_res = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "Password123!",
    })
    assert login_res.status_code == 200
    cookie_token = login_res.cookies.get("careercurve_session")

    # Access /api/auth/me with session cookie
    me_res = client.get("/api/auth/me", cookies={"careercurve_session": cookie_token})
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == test_user.email
    assert "password" not in me_res.json()["user"]


def test_logout_and_session_invalidation(client, test_user):
    """Verifies that logout clears the cookie and revokes the session on the server."""
    # 1. Login
    login_res = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "Password123!",
    })
    token = login_res.cookies.get("careercurve_session")

    # 2. Call Logout
    logout_res = client.post(
        "/api/auth/logout",
        cookies={"careercurve_session": token},
        headers={"x-requested-with": "XMLHttpRequest"}
    )
    assert logout_res.status_code == 200
    assert logout_res.json()["success"] is True

    # 3. Subsequent /api/auth/me with revoked token must fail with 401
    me_res = client.get("/api/auth/me", cookies={"careercurve_session": token})
    assert me_res.status_code == 401
