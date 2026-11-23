from backend.models.user import User
from backend.security.hashing import hash_password


def test_user_data_isolation_between_accounts(client, test_user, db_session):
    """
    Critical Isolation Test:
    Ensures that Candidate B cannot access, read, or overwrite Candidate A's interview data.
    """
    # 1. Create Candidate B in DB
    user_b = User(
        id="usr_test_student_202",
        name="Bob Builder",
        email="bob.builder@example.com",
        password_hash=hash_password("Password456!"),
        role="user",
        status="active",
        department="Civil Engineering",
    )
    db_session.add(user_b)
    db_session.commit()

    # 2. Login as Candidate A (Alice)
    login_a = client.post("/api/auth/login", json={
        "email": test_user.email,
        "password": "Password123!"
    })
    cookie_a = login_a.cookies.get("careercurve_session")

    # Candidate A creates an interview session
    create_sess_res = client.post(
        "/api/interviews/sessions",
        json={
            "targetRole": "Full-Stack Developer",
            "branch": "Computer Science & Engineering",
            "selectedRounds": ["aptitude", "technical", "hr"],
            "difficulty": "Intermediate",
            "mode": "practice"
        },
        cookies={"careercurve_session": cookie_a},
        headers={"x-requested-with": "XMLHttpRequest"}
    )
    assert create_sess_res.status_code == 201
    session_a_id = create_sess_res.json()["id"]

    # Candidate A submits Aptitude results
    apt_res = client.post(
        f"/api/interviews/sessions/{session_a_id}/aptitude",
        json={
            "answers": {"q1": "A", "q2": "B"},
            "score": 90.0,
            "accuracy": 85.0,
            "totalQuestions": 10,
            "correctAnswers": 9,
            "timeSpentSeconds": 300
        },
        cookies={"careercurve_session": cookie_a},
        headers={"x-requested-with": "XMLHttpRequest"}
    )
    assert apt_res.status_code == 200

    # 3. Login as Candidate B (Bob)
    login_b = client.post("/api/auth/login", json={
        "email": user_b.email,
        "password": "Password456!"
    })
    cookie_b = login_b.cookies.get("careercurve_session")

    # Candidate B tries to read Candidate A's session detail
    leak_attempt = client.get(
        f"/api/interviews/sessions/{session_a_id}",
        cookies={"careercurve_session": cookie_b}
    )
    assert leak_attempt.status_code == 403
    assert "forbidden" in leak_attempt.json()["detail"].lower()

    # Candidate B tries to submit results to Candidate A's session
    tamper_attempt = client.post(
        f"/api/interviews/sessions/{session_a_id}/technical",
        json={
            "questions": [],
            "answers": {},
            "evaluation": {},
            "score": 100.0,
            "feedback": "Hacked"
        },
        cookies={"careercurve_session": cookie_b},
        headers={"x-requested-with": "XMLHttpRequest"}
    )
    assert tamper_attempt.status_code == 403

    # Candidate B checks interview history: must be empty
    history_b = client.get(
        "/api/interviews/history",
        cookies={"careercurve_session": cookie_b}
    )
    assert history_b.status_code == 200
    assert len(history_b.json()["history"]) == 0

    # Candidate A checks interview history: must see their own session
    history_a = client.get(
        "/api/interviews/history",
        cookies={"careercurve_session": cookie_a}
    )
    assert history_a.status_code == 200
    assert len(history_a.json()["history"]) == 1
    assert history_a.json()["history"][0]["sessionId"] == session_a_id
