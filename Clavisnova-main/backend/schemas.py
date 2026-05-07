from dataclasses import dataclass
from typing import Optional, List, Dict, Any
from datetime import datetime
import re

class ValidationError(Exception):
    pass

@dataclass
class RegistrationBase:
    manufacturer: str
    model: str
    serial: str
    year: int
    height: str
    finish: str
    color_wood: str
    city_state: str
    access: Optional[str] = None

    def __post_init__(self):
        self.validate()

    def validate(self):
        # Validate manufacturer
        if not self.manufacturer or not self.manufacturer.strip():
            raise ValidationError("Manufacturer cannot be empty")
        if len(self.manufacturer) < 2 or len(self.manufacturer) > 255:
            raise ValidationError("Manufacturer must be between 2 and 255 characters")

        # Validate model
        if not self.model or not self.model.strip():
            raise ValidationError("Model cannot be empty")
        if len(self.model) < 1 or len(self.model) > 255:
            raise ValidationError("Model must be between 1 and 255 characters")

        # Validate serial
        if not self.serial or not self.serial.strip():
            raise ValidationError("Serial number cannot be empty")
        if len(self.serial) < 1 or len(self.serial) > 100:
            raise ValidationError("Serial number must be between 1 and 100 characters")

        # Validate year (allow current calendar year for new instruments)
        max_year = datetime.now().year
        if not isinstance(self.year, int) or self.year < 1800 or self.year > max_year:
            raise ValidationError(f"Year must be between 1800 and {max_year}")

        # Validate height
        if not self.height or not self.height.strip():
            raise ValidationError("Height cannot be empty")
        if len(self.height) < 1 or len(self.height) > 50:
            raise ValidationError("Height must be between 1 and 50 characters")

        # Validate finish
        if not self.finish or not self.finish.strip():
            raise ValidationError("Finish cannot be empty")
        if len(self.finish) < 2 or len(self.finish) > 255:
            raise ValidationError("Finish must be between 2 and 255 characters")

        # Validate color_wood
        if not self.color_wood or not self.color_wood.strip():
            raise ValidationError("Color/Wood cannot be empty")
        if len(self.color_wood) < 2 or len(self.color_wood) > 255:
            raise ValidationError("Color/Wood must be between 2 and 255 characters")

        # Validate city_state
        if not self.city_state or not self.city_state.strip():
            raise ValidationError("City/State cannot be empty")
        if len(self.city_state) < 2 or len(self.city_state) > 255:
            raise ValidationError("City/State must be between 2 and 255 characters")

@dataclass
class RegistrationCreate(RegistrationBase):
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

@dataclass
class RegistrationResponse:
    id: int
    message: str

@dataclass
class RequirementsBase:
    school_name: Optional[str] = None
    current_pianos: Optional[str] = None
    preferred_type: Optional[str] = None
    teacher_name: Optional[str] = None
    background: Optional[str] = None
    commitment: Optional[str] = None

    def __post_init__(self):
        self.validate()

    def validate(self):
        # Check if at least one field is filled
        fields = [self.school_name, self.current_pianos, self.preferred_type, self.teacher_name, self.background, self.commitment]
        has_data = any(field and field.strip() for field in fields if field)
        if not has_data:
            raise ValidationError("At least one field must be filled")

        # Validate field lengths
        field_names = ['school_name', 'current_pianos', 'preferred_type', 'teacher_name', 'background', 'commitment']
        for name, field in zip(field_names, fields):
            if field and len(field) > 1000:
                raise ValidationError(f"{name} cannot exceed 1000 characters")

@dataclass
class RequirementsCreate(RequirementsBase):
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

@dataclass
class RequirementsResponse:
    id: int
    message: str

@dataclass
class ContactCreate:
    name: Optional[str] = None
    email: Optional[str] = None
    message: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

    def __post_init__(self):
        # basic validation: message required
        if not self.message or not self.message.strip():
            raise ValidationError("Message cannot be empty")

@dataclass
class ContactResponse:
    id: int
    message: str

@dataclass
class PaginationParams:
    page: int = 1
    limit: int = 25

    def __post_init__(self):
        if self.page < 1:
            self.page = 1
        if self.limit < 1 or self.limit > 100:
            self.limit = 25

@dataclass
class PaginatedResponse:
    data: List[Dict[str, Any]]
    pagination: Dict[str, Any]

@dataclass
class StatsResponse:
    registrations: int
    requirements: int
    total_submissions: int

@dataclass
class HealthResponse:
    status: str
    timestamp: float
    version: str
    database: str
    registrations: int
    uptime: float
    memory_usage: float

@dataclass
class ErrorResponse:
    message: str
    success: bool = False
