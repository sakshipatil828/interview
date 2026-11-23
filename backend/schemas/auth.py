from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=8)
    confirmPassword: str
    phone: Optional[str] = ""
    college: Optional[str] = "University Institute of Technology"
    degree: Optional[str] = "B.Tech"
    department: Optional[str] = "Computer Science & Engineering"
    semester: Optional[str] = "Semester 7"
    graduationYear: Optional[str] = "2026"
    linkedin: Optional[str] = ""
    github: Optional[str] = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    status: str
    phone: Optional[str] = ""
    college: Optional[str] = ""
    degree: Optional[str] = ""
    department: Optional[str] = ""
    semester: Optional[str] = ""
    graduationYear: Optional[str] = ""
    linkedin: Optional[str] = ""
    github: Optional[str] = ""
    createdAt: str
    token: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    user: Optional[UserOut] = None
    error: Optional[str] = None
