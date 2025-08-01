from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.models import User, SpendingCategory, CreateSpendingCategoryRequest, UpdateSpendingCategoryRequest
from auth import get_current_user
from database.database import get_db
from database.db_models import SpendingCategory as DBSpendingCategory

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
    """Update a spending category and update all related ledger entries"""
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
        
        # Store the old category name for updating ledger entries
        old_category_name = db_category.category_name
        new_category_name = category_update.category_name
        
        # Update the category
        db_category.category_name = new_category_name
        
        # Update all related ledger entries efficiently
        from database.db_models import LedgerEntry as DBLedgerEntry
        
        # Use a single UPDATE query instead of iterating
        result = db.query(DBLedgerEntry).filter(
            DBLedgerEntry.category == old_category_name
        ).update(
            {DBLedgerEntry.category: new_category_name},
            synchronize_session=False
        )
        updated_count = result
        
        db.commit()
        db.refresh(db_category)
        
        return {
            "category": SpendingCategory(
                id=db_category.id,
                category_name=db_category.category_name,
                created_at=db_category.created_at,
                updated_at=db_category.updated_at
            ),
            "message": f"Category updated successfully. {updated_count} ledger entries were also updated."
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"❌ Error updating spending category: {e}")
        print(f"🔍 Error type: {type(e).__name__}")
        raise HTTPException(status_code=500, detail=f"Failed to update spending category: {str(e)}")

@router.delete("/{category_id}")
async def delete_spending_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a spending category - prevents deletion if related ledger entries exist"""
    try:
        db_category = db.query(DBSpendingCategory).filter(
            DBSpendingCategory.id == category_id
        ).first()
        
        if not db_category:
            raise HTTPException(status_code=404, detail="Spending category not found")
        
        # Check for related ledger entries
        from database.db_models import LedgerEntry as DBLedgerEntry
        related_entries = db.query(DBLedgerEntry).filter(
            DBLedgerEntry.category == db_category.category_name
        ).count()
        
        if related_entries > 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Cannot delete category '{db_category.category_name}' because it has {related_entries} related ledger entries. Please rename the category instead of deleting it."
            )
        
        db.delete(db_category)
        db.commit()
        
        return {"message": "Spending category deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete spending category: {str(e)}") 