from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from .models import ApplicationStatus


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str


class ApplicationCreate(BaseModel):
    company: str = Field(min_length=1, max_length=255)
    position: str = Field(min_length=1, max_length=255)
    location: str | None = None
    status: ApplicationStatus = ApplicationStatus.SAVED
    job_url: str | None = None
    salary: str | None = None
    applied_at: datetime | None = None


class ApplicationUpdate(BaseModel):
    company: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    position: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    location: str | None = Field(
        default=None,
        max_length=255,
    )

    status: ApplicationStatus | None = None

    job_url: str | None = None

    salary: str | None = None

    applied_at: datetime | None = None

class ApplicationStatsResponse(BaseModel):
    total: int
    by_status: dict[str, int]  



    position: str | None = Field(
        default=None,
        min_length=1,
        max_length=255,
    )

    location: str | None = None
    status: ApplicationStatus | None = None
    job_url: str | None = None
    salary: str | None = None
    applied_at: datetime | None = None


class ApplicationResponse(BaseModel):
    id: int
    company: str
    position: str
    location: str | None
    status: ApplicationStatus
    job_url: str | None
    salary: str | None
    applied_at: datetime | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)