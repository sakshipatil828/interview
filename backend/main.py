import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.config import settings
from backend.database import check_db_connection, engine, Base
from backend.models import *  # Ensure all SQLAlchemy models are registered
from backend.routers import (
    auth_router,
    admin_router,
    users_router,
    resumes_router,
    interviews_router,
    results_router,
)
from backend.security.csrf import verify_csrf_token

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("careercurve.main")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle manager: validates database connectivity upon startup."""
    logger.info(f"Starting {settings.PROJECT_NAME} in '{settings.ENVIRONMENT}' environment...")
    
    # Check PostgreSQL database connectivity
    connected, detail = check_db_connection()
    if connected:
        logger.info("PostgreSQL database connection established successfully.")
        # Auto-create tables if running in development / test mode
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Database tables verified.")
        except Exception as e:
            logger.error(f"Error checking/creating database tables: {e}")
    else:
        logger.error(
            f"CRITICAL: Failed to connect to database at {settings.DATABASE_URL}.\n"
            f"Details: {detail}\n"
            f"Please verify PostgreSQL is running and credentials in .env are configured. "
            f"Refer to .env.example for required settings."
        )

    yield
    logger.info("Shutting down CareerCurve API backend.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version="2.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# -----------------------------------------------------------------------------
# CORS Middleware
# Configured for exact trusted frontend origin and credentials
# -----------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        settings.CSRF_HEADER_NAME,
        "Accept",
        "Origin",
    ],
    expose_headers=["Set-Cookie"],
)


# -----------------------------------------------------------------------------
# CSRF State-Changing Request Interceptor
# -----------------------------------------------------------------------------
@app.middleware("http")
async def csrf_middleware(request: Request, call_next):
    # Only verify on /api/ endpoints that are state-changing
    if request.url.path.startswith("/api/"):
        try:
            verify_csrf_token(request)
        except Exception as exc:
            return JSONResponse(
                status_code=status.HTTP_403_FORBIDDEN,
                content={"detail": str(exc.detail if hasattr(exc, "detail") else "CSRF validation failed")}
            )
    response = await call_next(request)
    return response


# -----------------------------------------------------------------------------
# Global Health & Status Endpoints
# -----------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    connected, detail = check_db_connection()
    return {
        "status": "healthy" if connected else "degraded",
        "database": {
            "connected": connected,
            "engine": "PostgreSQL" if "postgresql" in settings.DATABASE_URL else "SQLite",
            "detail": detail if not connected else "Connected"
        },
        "environment": settings.ENVIRONMENT,
        "version": "2.0.0"
    }


# -----------------------------------------------------------------------------
# Register Modular Routers
# -----------------------------------------------------------------------------
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(users_router)
app.include_router(resumes_router)
app.include_router(interviews_router)
app.include_router(results_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
