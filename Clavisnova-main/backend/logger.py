import logging
import sys
from pathlib import Path
from datetime import datetime
from config import settings

def setup_logging():
    """Setup logging configuration using built-in logging"""

    # Create logger
    logger = logging.getLogger("Clavisnova")
    logger.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))

    # Remove existing handlers
    logger.handlers.clear()

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))
    console_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    logger.addHandler(console_handler)

    # File handler - combined log
    combined_handler = logging.FileHandler(settings.logs_dir / "combined.log")
    combined_handler.setLevel(logging.INFO)
    file_formatter = logging.Formatter(
        '%(asctime)s | %(levelname)-8s | %(name)s:%(funcName)s:%(lineno)d - %(message)s'
    )
    combined_handler.setFormatter(file_formatter)
    logger.addHandler(combined_handler)

    # File handler - error log
    error_handler = logging.FileHandler(settings.logs_dir / "error.log")
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(file_formatter)
    logger.addHandler(error_handler)

    return logger

# Create logger instance
log = setup_logging()

class LoggerManager:
    def __init__(self):
        self.logger = log

    def log_request(self, client_ip: str, method: str, path: str, status_code: int, response_time: float):
        """Log API request"""
        if status_code >= 500:
            self.logger.error(f"HTTP {status_code} - {method} {path} | IP: {client_ip} | Time: {response_time:.2f}ms")
        elif status_code >= 400:
            self.logger.warning(f"HTTP {status_code} - {method} {path} | IP: {client_ip} | Time: {response_time:.2f}ms")
        else:
            self.logger.info(f"HTTP {status_code} - {method} {path} | IP: {client_ip} | Time: {response_time:.2f}ms")

    def log_form_submission(self, form_type: str, data: dict, success: bool = True):
        """Log form submission"""
        if success:
            self.logger.info(f"{form_type} form submitted successfully")
        else:
            self.logger.error(f"{form_type} form submission failed")

    def log_database_error(self, operation: str, error: Exception):
        """Log database error"""
        self.logger.error(f"Database {operation} failed: {str(error)}")

    def log_security_event(self, event: str, details: dict):
        """Log security event"""
        self.logger.warning(f"Security event: {event}")

    def cleanup_old_logs(self):
        """Cleanup old log files"""
        try:
            import glob
            import os
            from datetime import datetime, timedelta

            # Find all log files older than retention period
            cutoff_date = datetime.now() - timedelta(days=settings.log_retention)

            for log_file in settings.logs_dir.glob("*.log*"):
                if log_file.stat().st_mtime < cutoff_date.timestamp():
                    log_file.unlink()
                    self.logger.info(f"Cleaned up old log file: {log_file.name}")

        except Exception as e:
            self.logger.error(f"Log cleanup failed: {str(e)}")

# Create global logger manager instance
logger_manager = LoggerManager()
