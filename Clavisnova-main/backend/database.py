from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List, Dict, Any, Optional, Tuple
import json
from models import Registration, Requirements, SystemLog, SessionLocal, engine
from logger import logger_manager
from config import settings

class DatabaseManager:
    def __init__(self):
        self.logger = logger_manager

    def get_db(self) -> Session:
        """Get database session"""
        return SessionLocal()

    # Registration methods
    async def save_registration(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Save a new registration"""
        db = self.get_db()
        try:
            registration = Registration(
                manufacturer=data["manufacturer"],
                model=data["model"],
                serial=data["serial"],
                year=data["year"],
                height=data["height"],
                finish=data["finish"],
                color_wood=data["color_wood"],
                city_state=data["city_state"],
                access=data.get("access", ""),
                ip_address=data.get("ip_address", ""),
                user_agent=data.get("user_agent", "")
            )

            db.add(registration)
            db.commit()
            db.refresh(registration)

            self.logger.log_form_submission("registration", data, True)
            return {"id": registration.id}

        except Exception as e:
            db.rollback()
            self.logger.log_database_error("registration_save", e)
            self.logger.log_form_submission("registration", data, False)
            raise e
        finally:
            db.close()

    async def get_registrations(self, page: int = 1, limit: int = 50) -> Tuple[List[Dict], int]:
        """Get paginated registrations"""
        db = self.get_db()
        try:
            offset = (page - 1) * limit

            # Get total count
            total = db.query(func.count(Registration.id)).scalar()

            # Get paginated results
            registrations = (
                db.query(Registration)
                .order_by(desc(Registration.created_at))
                .offset(offset)
                .limit(limit)
                .all()
            )

            return [reg.to_dict() for reg in registrations], total

        finally:
            db.close()

    async def get_registration_count(self) -> int:
        """Get total registration count"""
        db = self.get_db()
        try:
            return db.query(func.count(Registration.id)).scalar()
        finally:
            db.close()

    async def delete_registration(self, registration_id: int) -> bool:
        """Delete a registration"""
        db = self.get_db()
        try:
            registration = db.query(Registration).filter(Registration.id == registration_id).first()
            if not registration:
                return False

            db.delete(registration)
            db.commit()

            self.logger.logger.info(f"Registration deleted", extra={"id": registration_id})
            return True

        except Exception as e:
            db.rollback()
            self.logger.log_database_error("registration_delete", e)
            raise e
        finally:
            db.close()

    # Requirements methods
    async def save_requirements(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Save new requirements"""
        db = self.get_db()
        try:
            requirements = Requirements(
                info1=data.get("info1", ""),
                info2=data.get("info2", ""),
                info3=data.get("info3", ""),
                info4=data.get("info4", ""),
                info5=data.get("info5", ""),
                info6=data.get("info6", ""),
                ip_address=data.get("ip_address", ""),
                user_agent=data.get("user_agent", "")
            )

            db.add(requirements)
            db.commit()
            db.refresh(requirements)

            self.logger.log_form_submission("requirements", data, True)
            return {"id": requirements.id}

        except Exception as e:
            db.rollback()
            self.logger.log_database_error("requirements_save", e)
            self.logger.log_form_submission("requirements", data, False)
            raise e
        finally:
            db.close()

    async def get_requirements(self, page: int = 1, limit: int = 50) -> Tuple[List[Dict], int]:
        """Get paginated requirements"""
        db = self.get_db()
        try:
            offset = (page - 1) * limit

            # Get total count
            total = db.query(func.count(Requirements.id)).scalar()

            # Get paginated results
            requirements = (
                db.query(Requirements)
                .order_by(desc(Requirements.created_at))
                .offset(offset)
                .limit(limit)
                .all()
            )

            return [req.to_dict() for req in requirements], total

        finally:
            db.close()

    async def get_requirements_count(self) -> int:
        """Get total requirements count"""
        db = self.get_db()
        try:
            return db.query(func.count(Requirements.id)).scalar()
        finally:
            db.close()

    async def delete_requirements(self, requirements_id: int) -> bool:
        """Delete requirements"""
        db = self.get_db()
        try:
            requirements = db.query(Requirements).filter(Requirements.id == requirements_id).first()
            if not requirements:
                return False

            db.delete(requirements)
            db.commit()

            self.logger.logger.info(f"Requirements deleted", extra={"id": requirements_id})
            return True

        except Exception as e:
            db.rollback()
            self.logger.log_database_error("requirements_delete", e)
            raise e
        finally:
            db.close()

    # Logging methods
    async def log(self, level: str, message: str, data: Optional[Dict] = None):
        """Save log entry to database"""
        db = self.get_db()
        try:
            log_entry = SystemLog(
                level=level,
                message=message,
                data=json.dumps(data) if data else None
            )

            db.add(log_entry)
            db.commit()

        except Exception as e:
            # Don't let logging errors crash the app
            print(f"Failed to save log to database: {e}")
        finally:
            db.close()

    # Export methods
    async def export_registrations(self) -> List[Dict]:
        """Export all registrations"""
        db = self.get_db()
        try:
            registrations = (
                db.query(Registration)
                .order_by(desc(Registration.created_at))
                .all()
            )
            return [reg.to_dict() for reg in registrations]
        finally:
            db.close()

    async def export_requirements(self) -> List[Dict]:
        """Export all requirements"""
        db = self.get_db()
        try:
            requirements = (
                db.query(Requirements)
                .order_by(desc(Requirements.created_at))
                .all()
            )
            return [req.to_dict() for req in requirements]
        finally:
            db.close()

    # Cleanup methods
    async def cleanup_logs(self):
        """Cleanup old logs (keep last 1000 entries)"""
        db = self.get_db()
        try:
            # Find logs to delete (keep only the most recent 1000)
            subquery = (
                db.query(SystemLog.id)
                .order_by(desc(SystemLog.created_at))
                .limit(1000)
                .subquery()
            )

            deleted_count = (
                db.query(SystemLog)
                .filter(~SystemLog.id.in_(db.query(subquery.c.id)))
                .delete(synchronize_session=False)
            )

            db.commit()

            if deleted_count > 0:
                self.logger.logger.info(f"Cleaned up {deleted_count} old log entries")

        except Exception as e:
            db.rollback()
            self.logger.logger.error(f"Log cleanup failed: {str(e)}")
        finally:
            db.close()

# Create global database manager instance
db_manager = DatabaseManager()
