import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from backend.config import settings
from backend.database import Base, get_db
from backend.main import app
from backend.models.user import User
from backend.security.hashing import hash_password

# Test In-Memory SQLite database with StaticPool for test isolation
TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="function")
def db_session():
    """Creates a fresh isolated database schema for each test function."""
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(scope="function")
def client(db_session):
    """FastAPI TestClient with overridden get_db dependency."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def test_user(db_session):
    """Creates a standard test user in the test database."""
    user = User(
        id="usr_test_student_101",
        name="Alice Student",
        email="alice@example.com",
        password_hash=hash_password("Password123!"),
        role="user",
        status="active",
        department="Computer Science & Engineering",
        college="National Institute of Technology",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture(scope="function")
def test_admin(db_session):
    """Creates an administrator user in the test database."""
    admin = User(
        id="usr_test_admin_999",
        name="Platform Administrator",
        email="admin@careercurve.ai",
        password_hash=hash_password("AdminSecure2026!"),
        role="admin",
        status="active",
        department="Platform Operations",
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin
