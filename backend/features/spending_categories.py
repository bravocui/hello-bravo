from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.models import User, SpendingCategory, CreateSpendingCategoryRequest, UpdateSpendingCategoryRequest
from auth import get_current_user
from database.database import get_db
from services.spending_category_service import SpendingCategoryService

router = APIRouter(prefix="/spending-categories", tags=["spending-categories"])

@router.get("/")
async def get_spending_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all spending categories"""
    return SpendingCategoryService.get_spending_categories(db)

@router.post("/")
async def create_spending_category(
    category: CreateSpendingCategoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new spending category"""
    return SpendingCategoryService.create_spending_category(db, category)

@router.get("/{category_id}")
async def get_spending_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific spending category"""
    return SpendingCategoryService.get_spending_category(db, category_id)

@router.put("/{category_id}")
async def update_spending_category(
    category_id: int,
    category_update: UpdateSpendingCategoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a spending category and update all related ledger entries"""
    return SpendingCategoryService.update_spending_category(db, category_id, category_update)

@router.delete("/{category_id}")
async def delete_spending_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a spending category - prevents deletion if related ledger entries exist"""
    return SpendingCategoryService.delete_spending_category(db, category_id) 