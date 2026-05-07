# Import psycopg2 to register the dialect with SQLAlchemy
import psycopg2

# Ensure psycopg is imported before SQLAlchemy
from sqlalchemy import Column, Integer, String, DateTime, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql import func
from sqlalchemy.orm import sessionmaker
from config import settings

# Ensure SQLAlchemy uses psycopg2 dialect when a plain postgresql URL is provided.
def _build_sqlalchemy_url(raw_url: str) -> str:
    if not raw_url:
        return raw_url
    if raw_url.startswith("postgresql://") and not raw_url.startswith("postgresql+"):
        return raw_url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return raw_url

# Replace settings.database_url in-place so subsequent engine creation uses the adjusted URL.
settings.database_url = _build_sqlalchemy_url(settings.database_url)
import os

Base = declarative_base()

class Registration(Base):
    """Piano registration model"""
    __tablename__ = "registrations"

    id = Column(Integer, primary_key=True, autoincrement=True)
    manufacturer = Column(String(255), nullable=False)
    model = Column(String(255), nullable=False)
    serial = Column(String(100), nullable=False)
    year = Column(Integer, nullable=False)
    height = Column(String(50), nullable=False)
    finish = Column(String(100), nullable=False)
    color_wood = Column(String(255), nullable=False)
    city_state = Column(String(255), nullable=False)
    access = Column(String(255))
    ip_address = Column(String(45))  # IPv6 compatible
    user_agent = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "manufacturer": self.manufacturer,
            "model": self.model,
            "serial": self.serial,
            "year": self.year,
            "height": self.height,
            "finish": self.finish,
            "color_wood": self.color_wood,
            "access": self.access,
            "city_state": self.city_state,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class Requirements(Base):
    """Requirements submission model"""
    __tablename__ = "requirements"

    id = Column(Integer, primary_key=True, autoincrement=True)
    school_name = Column(Text)
    current_pianos = Column(Text)
    preferred_type = Column(Text)
    teacher_name = Column(Text)
    background = Column(Text)
    commitment = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "school_name": self.school_name,
            "current_pianos": self.current_pianos,
            "preferred_type": self.preferred_type,
            "teacher_name": self.teacher_name,
            "background": self.background,
            "commitment": self.commitment,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

class SystemLog(Base):
    """System logs model"""
    __tablename__ = "system_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    level = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(Text)  # JSON string
    created_at = Column(DateTime, server_default=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "level": self.level,
            "message": self.message,
            "data": self.data,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Contact(Base):
    """Contact messages from Contact Us form"""
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String(255))
    email = Column(String(255))
    message = Column(Text)
    ip_address = Column(String(45))
    user_agent = Column(Text)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "message": self.message,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

# Database setup
engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {},
    echo=settings.debug
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_tables():
    """Create all database tables"""
    Base.metadata.create_all(bind=engine)

def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Note: table creation is performed explicitly via `backend/init_db.py`
# to avoid attempting DB connections at import time (which can fail in dev).
