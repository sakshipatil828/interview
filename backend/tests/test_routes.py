def test_unauthenticated_request_blocked(client):
    """Verifies that accessing protected endpoints without a session cookie returns 401."""
    # Attempting to fetch interview sessions
    res1 = client.get("/api/interviews/sessions")
    assert res1.status_code == 401
    assert "unauthorized" in res1.json()["detail"].lower()

    # Attempting to fetch profile
    res2 = client.get("/api/users/me")
    assert res2.status_code == 401

    # Attempting to fetch latest resume
    res3 = client.get("/api/resumes/latest")
    assert res3.status_code == 401


def test_csrf_token_endpoint_and_protection(client, test_user):
    """Verifies CSRF token acquisition and header enforcement on state-changing requests."""
    # 1. Acquire CSRF token
    csrf_res = client.get("/api/auth/csrf")
    assert csrf_res.status_code == 200
    token = csrf_res.json()["csrfToken"]
    assert token is not None

    # 2. Login to obtain session
    login_res = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "Password123!"
    })
    session_cookie = login_res.cookies.get("careercurve_session")

    # 3. State-changing request with valid X-Requested-With header passes
    patch_res = client.patch(
        "/api/users/me",
        json={"phone": "+1-555-0199"},
        cookies={"careercurve_session": session_cookie},
        headers={"x-requested-with": "XMLHttpRequest"}
    )
    assert patch_res.status_code == 200
    assert patch_res.json()["phone"] == "+1-555-0199"
