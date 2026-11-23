from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field


class ResumeSaveRequest(BaseModel):
    filename: str
    fileSize: Optional[str] = ""
    rawText: Optional[str] = ""
    extractedSkills: Optional[List[Any]] = None
    education: Optional[List[Any]] = None
    experience: Optional[List[Any]] = None
    projects: Optional[List[Any]] = None
    certifications: Optional[List[Any]] = None
    parsedData: Optional[Dict[str, Any]] = None
    atsScore: Optional[int] = 0
    resumeScore: Optional[int] = 0
    matchRank: Optional[str] = ""


class ResumeOut(BaseModel):
    id: str
    userId: str
    filename: str
    fileSize: Optional[str] = ""
    extractedSkills: Optional[List[Any]] = None
    education: Optional[List[Any]] = None
    experience: Optional[List[Any]] = None
    parsedData: Optional[Dict[str, Any]] = None
    atsScore: Optional[int] = 0
    resumeScore: Optional[int] = 0
    matchRank: Optional[str] = ""
    uploadedAt: str
