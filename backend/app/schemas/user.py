"""User & auth schemas."""

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, EmailStr, field_validator


class UserCreate(BaseModel):
    email: str  # Using str instead of EmailStr to avoid extra dep
    password: str
    name: str
    zip_code: str | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength: minimum 8 chars with mixed case and numbers."""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserLogin(BaseModel):
    email: str
    password: str


class UserUpdate(BaseModel):
    """Fields the user can edit on their profile."""
    name: str | None = None
    zip_code: str | None = None


class UserOut(BaseModel):
    id: UUID
    email: str
    name: str
    zip_code: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── Addresses ──

class UserAddressCreate(BaseModel):
    label: str  # "Casa", "Trabalho", etc.
    street: str
    number: str | None = None
    complement: str | None = None
    neighborhood: str | None = None
    city: str
    state: str  # UF (2 chars)
    zip_code: str
    latitude: float | None = None
    longitude: float | None = None
    is_default: bool = False


class UserAddressUpdate(BaseModel):
    label: str | None = None
    street: str | None = None
    number: str | None = None
    complement: str | None = None
    neighborhood: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class UserAddressOut(BaseModel):
    id: UUID
    label: str
    street: str
    number: str | None = None
    complement: str | None = None
    neighborhood: str | None = None
    city: str
    state: str
    zip_code: str
    latitude: float | None = None
    longitude: float | None = None
    is_default: bool = False
    created_at: datetime

    model_config = {"from_attributes": True}


class UserProfileOut(BaseModel):
    """Full profile response: user data + list of addresses."""
    id: UUID
    email: str
    name: str
    zip_code: str | None = None
    created_at: datetime
    addresses: list[UserAddressOut] = []

    model_config = {"from_attributes": True}
