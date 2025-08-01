from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, Float, Date, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class UserRole(enum.Enum):
    ADMIN = "ADMIN"
    REGULAR = "REGULAR"
    READONLY = "READONLY"
    GUEST = "GUEST"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    picture_url = Column(Text)
    role = Column(Enum(UserRole), default=UserRole.REGULAR, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    fitness_entries = relationship("FitnessEntry", back_populates="user")
    travel_entries = relationship("TravelEntry", back_populates="user")
    ledger_entries = relationship("LedgerEntry", back_populates="user")
    credit_cards = relationship("CreditCard", back_populates="user")

class CreditCard(Base):
    __tablename__ = "credit_cards"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    opening_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="credit_cards")

class SpendingCategory(Base):
    __tablename__ = "spending_categories"
    
    id = Column(Integer, primary_key=True, index=True)
    category_name = Column(String(255), nullable=False, unique=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class FitnessEntry(Base):
    __tablename__ = "fitness_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    activity = Column(String(100), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    calories = Column(Integer)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="fitness_entries")

class TravelEntry(Base):
    __tablename__ = "travel_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    destination = Column(String(255), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    description = Column(Text)
    rating = Column(Integer)  # 1-5 stars
    photos = Column(Text)  # JSON array of photo URLs
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationship
    user = relationship("User", back_populates="travel_entries")

class LedgerEntry(Base):
    __tablename__ = "ledger_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    year = Column(Integer, nullable=False)
    month = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    amount = Column(Float, nullable=False)
    credit_card = Column(String(100), nullable=False)
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Unique constraint for (year, month, user_id, credit_card, category)
    __table_args__ = (
        UniqueConstraint('year', 'month', 'user_id', 'credit_card', 'category', name='unique_ledger_entry'),
    )
    
    # Relationship
    user = relationship("User", back_populates="ledger_entries") 