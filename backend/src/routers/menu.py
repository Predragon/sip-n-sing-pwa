"""
Menu API Router
Handles menu items, categories, and options
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

# Supabase client
def get_supabase() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    return create_client(url, key)

# Pydantic models
class MenuItemOption(BaseModel):
    id: str
    name: str
    price_modifier: float

class MenuItem(BaseModel):
    id: str
    code: str
    name: str
    category: str
    description: Optional[str] = None
    base_price: float
    image_url: Optional[str] = None
    available: bool = True
    created_at: datetime
    updated_at: datetime

@router.get("/", response_model=List[MenuItem])
async def get_menu_items(
    category: Optional[str] = None,
    available: Optional[bool] = None,
    supabase: Client = Depends(get_supabase)
):
    """
    Get all menu items, optionally filtered by category and availability
    """
    try:
        query = supabase.table("menu_items").select("*")
        
        if category:
            query = query.eq("category", category)
        if available is not None:
            query = query.eq("available", available)
            
        response = query.order("code").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/categories")
async def get_categories(supabase: Client = Depends(get_supabase)):
    """
    Get all unique menu categories
    """
    try:
        response = supabase.table("menu_items").select("category").execute()
        categories = list(set(item["category"] for item in response.data))
        return {"categories": sorted(categories)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{item_id}", response_model=MenuItem)
async def get_menu_item(
    item_id: str,
    supabase: Client = Depends(get_supabase)
):
    """
    Get a specific menu item by ID
    """
    try:
        response = supabase.table("menu_items").select("*").eq("id", item_id).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Menu item not found")
        return response.data[0]
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
