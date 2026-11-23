from backend.routers.auth import router as auth_router
from backend.routers.admin import router as admin_router
from backend.routers.users import router as users_router
from backend.routers.resumes import router as resumes_router
from backend.routers.interviews import router as interviews_router
from backend.routers.results import router as results_router

__all__ = [
    "auth_router",
    "admin_router",
    "users_router",
    "resumes_router",
    "interviews_router",
    "results_router",
]
