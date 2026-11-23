from typing import List, Optional
from pydantic import BaseModel, Field


class AdminUserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    college: Optional[str] = ""
    department: Optional[str] = ""
    degree: Optional[str] = ""
    createdAt: str


class AdminUserListResponse(BaseModel):
    success: bool
    total: int
    page: int
    pageSize: int
    totalPages: int
    users: List[AdminUserOut]


class UpdateRoleRequest(BaseModel):
    role: str = Field(..., pattern="^(user|admin)$")


class UpdateStatusRequest(BaseModel):
    status: str = Field(..., pattern="^(active|suspended)$")
