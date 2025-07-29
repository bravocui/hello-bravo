from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from models import User, SpendingCategory, CreateSpendingCategoryRequest, UpdateSpendingCategoryRequest
from auth import get_current_user
from database import get_db
from db_models import SpendingCategory as DBSpendingCategory

router = APIRouter(prefix="/spending-categories", tags=["spending-categories"])

@router.get("/")
async def get_spending_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all spending categories"""
    try:
        categories = db.query(DBSpendingCategory).all()
        
        # Convert to Pydantic models for response
        result = []
        for category in categories:
            result.append(SpendingCategory(
                id=category.id,
                category_name=category.category_name,
                created_at=category.created_at,
                updated_at=category.updated_at
            ))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.post("/")
async def create_spending_category(
    category: CreateSpendingCategoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new spending category"""
    try:
        # Check if category already exists
        existing_category = db.query(DBSpendingCategory).filter(
            DBSpendingCategory.category_name == category.category_name
        ).first()
        
        if existing_category:
            raise HTTPException(status_code=400, detail="Category already exists")
        
        # Create new database entry
        db_category = DBSpendingCategory(
            category_name=category.category_name
        )
        
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        
        # Return the created category
        return SpendingCategory(
            id=db_category.id,
            category_name=db_category.category_name,
            created_at=db_category.created_at,
            updated_at=db_category.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create spending category: {str(e)}")

@router.get("/{category_id}")
async def get_spending_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific spending category"""
    try:
        category = db.query(DBSpendingCategory).filter(
            DBSpendingCategory.id == category_id
        ).first()
        
        if not category:
            raise HTTPException(status_code=404, detail="Spending category not found")
        
        return SpendingCategory(
            id=category.id,
            category_name=category.category_name,
            created_at=category.created_at,
            updated_at=category.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.put("/{category_id}")
async def update_spending_category(
    category_id: int,
    category_update: UpdateSpendingCategoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a spending category"""
    try:
        # Check if new name already exists
        existing_category = db.query(DBSpendingCategory).filter(
            DBSpendingCategory.category_name == category_update.category_name,
            DBSpendingCategory.id != category_id
        ).first()
        
        if existing_category:
            raise HTTPException(status_code=400, detail="Category name already exists")
        
        # Find the category
        db_category = db.query(DBSpendingCategory).filter(
            DBSpendingCategory.id == category_id
        ).first()
        
        if not db_category:
            raise HTTPException(status_code=404, detail="Spending category not found")
        
        # Update the category
        db_category.category_name = category_update.category_name
        
        db.commit()
        db.refresh(db_category)
        
        return SpendingCategory(
            id=db_category.id,
            category_name=db_category.category_name,
            created_at=db_category.created_at,
            updated_at=db_category.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update spending category: {str(e)}")

@router.delete("/{category_id}")
async def delete_spending_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a spending category"""
    try:
        db_category = db.query(DBSpendingCategory).filter(
            DBSpendingCategory.id == category_id
        ).first()
        
        if not db_category:
            raise HTTPException(status_code=404, detail="Spending category not found")
        
        db.delete(db_category)
        db.commit()
        
        return {"message": "Spending category deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete spending category: {str(e)}") 