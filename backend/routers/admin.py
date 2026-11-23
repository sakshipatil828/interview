import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session as DBSession

from backend.database import get_db
from backend.models.user import User
from backend.schemas.admin import (
    AdminUserOut,
    AdminUserListResponse,
    UpdateRoleRequest,
    UpdateStatusRequest,
)
from backend.dependencies import get_current_admin
from backend.security.session import revoke_all_user_sessions

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])


@router.get("/users", response_model=AdminUserListResponse)
def list_registered_users(
    page: int = Query(1, ge=1, description="Page number"),
    pageSize: int = Query(10, ge=1, le=100, description="Items per page"),
    q: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by role: user, admin"),
    userStatus: Optional[str] = Query(None, alias="status", description="Filter by status: active, suspended"),
    admin: User = Depends(get_current_admin),
    db: DBSession = Depends(get_db)
):
    """
    Admin-only endpoint:
    - Lists registered users with pagination, search, and filtering.
    - Requires verified server-side admin role.
    - Excludes passwords, hashes, session secrets.
    """
    query = db.query(User)

    if q and q.strip():
        search_term = f"%{q.strip().lower()}%"
        query = query.filter(
            (User.name.ilike(search_term)) | (User.email.ilike(search_term))
        )

    if role and role.strip():
        query = query.filter(User.role == role.strip().lower())

    if userStatus and userStatus.strip():
        query = query.filter(User.status == userStatus.strip().lower())

    total = query.count()
    total_pages = max(1, math.ceil(total / pageSize))
    offset = (page - 1) * pageSize

    users = query.order_by(User.created_at.desc()).offset(offset).limit(pageSize).all()

    user_items = [
        AdminUserOut(
            id=u.id,
            name=u.name,
            email=u.email,
            role=u.role,
            status=u.status,
            college=u.college or "",
            department=u.department or "",
            degree=u.degree or "",
            createdAt=u.created_at.isoformat() if u.created_at else "",
        )
        for u in users
    ]

    return AdminUserListResponse(
        success=True,
        total=total,
        page=page,
        pageSize=pageSize,
        totalPages=total_pages,
        users=user_items,
    )


@router.patch("/users/{user_id}/role")
def update_user_role(
    user_id: str,
    req: UpdateRoleRequest,
    admin: User = Depends(get_current_admin),
    db: DBSession = Depends(get_db)
):
    """Admin-only: updates user role ('user' or 'admin')."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    if user.id == admin.id and req.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot demote yourself from admin role."
        )

    user.role = req.role
    db.commit()
    return {
        "success": True,
        "message": f"User {user.email} role updated to {req.role}.",
        "userId": user.id,
        "role": user.role
    }


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: str,
    req: UpdateStatusRequest,
    admin: User = Depends(get_current_admin),
    db: DBSession = Depends(get_db)
):
    """Admin-only: updates user status ('active' or 'suspended')."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found."
        )

    if user.id == admin.id and req.status == "suspended":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot suspend your own admin account."
        )

    user.status = req.status
    if req.status == "suspended":
        # Revoke all active sessions immediately
        revoke_all_user_sessions(db, user.id)

    db.commit()
    return {
        "success": True,
        "message": f"User {user.email} status updated to {req.status}.",
        "userId": user.id,
        "status": user.status
    }
