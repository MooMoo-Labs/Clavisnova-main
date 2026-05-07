import os
from pathlib import Path
from typing import Optional

class Settings:
    def __init__(self):
        # Application settings
        self.app_name: str = "Clavisnova Backend"
        self.version: str = "3.0.0"
        self.debug: bool = self._get_env_bool("DEBUG", False)

        # Server settings
        self.host: str = os.getenv("HOST", "0.0.0.0")
        self.port: int = int(os.getenv("PORT", "8080"))

        # Database settings
        self.database_url: str = os.getenv("DATABASE_URL", "sqlite:///./data/Clavisnova.db")

        # Security settings
        self.secret_key: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")

        # Rate limiting
        self.rate_limit_requests: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
        self.rate_limit_window: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))  # seconds
        self.strict_rate_limit_requests: int = int(os.getenv("STRICT_RATE_LIMIT_REQUESTS", "10"))

        # CORS settings
        cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080")
        self.cors_origins: list = [origin.strip() for origin in cors_origins.split(",")]

        # Logging
        self.log_level: str = os.getenv("LOG_LEVEL", "INFO")
        self.log_max_size: int = int(os.getenv("LOG_MAX_SIZE", str(10*1024*1024)))  # 10MB
        self.log_retention: int = int(os.getenv("LOG_RETENTION", "30"))  # days

        # Email settings
        self.mail_server: str = os.getenv("MAIL_SERVER", "smtp.gmail.com")
        self.mail_port: int = int(os.getenv("MAIL_PORT", "587"))
        self.mail_use_tls: bool = self._get_env_bool("MAIL_USE_TLS", True)
        self.mail_use_ssl: bool = self._get_env_bool("MAIL_USE_SSL", False)
        self.mail_username: str = os.getenv("MAIL_USERNAME", "")
        self.mail_password: str = os.getenv("MAIL_PASSWORD", "")
        self.mail_default_sender: str = os.getenv("MAIL_DEFAULT_SENDER", "")
        self.notification_email: str = os.getenv("NOTIFICATION_EMAIL", "")  # 通知接收邮箱

        # Data paths
        self.data_dir: Path = Path("./data")
        self.logs_dir: Path = Path("./logs")
        self.backup_dir: Path = self.data_dir / "backup"

        # Ensure directories exist
        self.data_dir.mkdir(exist_ok=True)
        self.logs_dir.mkdir(exist_ok=True)
        self.backup_dir.mkdir(exist_ok=True)

    def _get_env_bool(self, key: str, default: bool = False) -> bool:
        """Get boolean value from environment variable"""
        value = os.getenv(key)
        if value is None:
            return default
        return value.lower() in ('true', '1', 'yes', 'on')

# Create global settings instance
settings = Settings()
