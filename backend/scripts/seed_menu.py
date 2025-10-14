# ================================
# scripts/seed_menu.py - Run this to populate your menu
# ================================

"""
Seed Script for Sip & Sing Menu
Run: python scripts/seed_menu.py
"""

import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

# Menu data structure
MENU_DATA = [
    # GRILLED MEAT
    {
        "code": "G1",
        "name": "Hungarian",
        "category": "grilled",
        "description": "Grilled Hungarian sausage",
        "base_price": 95,
        "options": [
            {"label": "Plain", "price": 95, "sort_order": 1},
            {"label": "With Rice", "price": 115, "sort_order": 2},
            {"label": "With Small Fries", "price": 175, "sort_order": 3},
            {"label": "With Medium Fries", "price": 225, "sort_order": 4},
        ]
    },
    {
        "code": "G2",
        "name": "Chicken",
        "category": "grilled",
        "description": "Grilled chicken",
        "base_price": 150,
        "options": [
            {"label": "Plain", "price": 150, "sort_order": 1},
            {"label": "With Rice", "price": 170, "sort_order": 2},
            {"label": "With Small Fries", "price": 230, "sort_order": 3},
            {"label": "With Medium Fries", "price": 280, "sort_order": 4},
        ]
    },
    {
        "code": "G3",
        "name": "Pork Chop",
        "category": "grilled",
        "description": "Grilled pork chop",
        "base_price": 150,
        "options": [
            {"label": "Plain", "price": 150, "sort_order": 1},
            {"label": "With Rice", "price": 170, "sort_order": 2},
            {"label": "With Small Fries", "price": 230, "sort_order": 3},
            {"label": "With Medium Fries", "price": 280, "sort_order": 4},
        ]
    },
    {
        "code": "G4",
        "name": "Liempo",
        "category": "grilled",
        "description": "Grilled pork belly",
        "base_price": 180,
        "options": [
            {"label": "Plain", "price": 180, "sort_order": 1},
            {"label": "With Rice", "price": 200, "sort_order": 2},
            {"label": "With Small Fries", "price": 260, "sort_order": 3},
            {"label": "With Medium Fries", "price": 310, "sort_order": 4},
        ]
    },
    
    # BEST SELLERS
    {
        "code": "S1",
        "name": "Pork Bopis",
        "category": "bestsellers",
        "description": "Minced pork lung & heart cooked with onions, garlic & chili peppers",
        "base_price": 220,
        "options": []
    },
    {
        "code": "S2",
        "name": "Chicken Feet",
        "category": "bestsellers",
        "description": "Fried, boiled, steamed & seasoned with authentic Chinese spices",
        "base_price": 230,
        "options": []
    },
    {
        "code": "S3",
        "name": "Pork Dinuguan",
        "category": "bestsellers",
        "description": "Savory stew of pork meat and pig's blood with mild spicy-sour taste",
        "base_price": 220,
        "options": []
    },
    {
        "code": "S4",
        "name": "Sizzling Hungarian",
        "category": "bestsellers",
        "description": "Hungarian sausage (2 pcs) served on a sizzling plate",
        "base_price": 220,
        "options": []
    },
    {
        "code": "S5",
        "name": "Pork Sisig",
        "category": "bestsellers",
        "description": "Choice of Pork or Chicken",
        "base_price": 230,
        "options": []
    },
    {
        "code": "S6",
        "name": "Sizzling Hotdog",
        "category": "bestsellers",
        "description": "Tender Juicy Hotdog on a sizzling plate",
        "base_price": 175,
        "options": []
    },
    {
        "code": "S7",
        "name": "Chicken Feet Dimsum",
        "category": "bestsellers",
        "description": "",
        "base_price": 190,
        "options": []
    },
    
    # SEAFOOD
    {
        "code": "CAJUN",
        "name": "Cajun Mix Seafood",
        "category": "seafood",
        "description": "Mixed seafood in Cajun sauce",
        "base_price": 290,
        "options": [
            {"label": "With Rice", "price": 290, "sort_order": 1},
            {"label": "Small", "price": 320, "sort_order": 2},
            {"label": "Medium", "price": 630, "sort_order": 3},
            {"label": "Large", "price": 940, "sort_order": 4},
            {"label": "X-Large", "price": 1250, "sort_order": 5},
        ]
    },
    {
        "code": "F1",
        "name": "Garlic Butter Shrimp",
        "category": "seafood",
        "description": "Shrimp in garlic butter sauce",
        "base_price": 260,
        "options": [
            {"label": "Small", "price": 260, "sort_order": 1},
            {"label": "Medium", "price": 510, "sort_order": 2},
            {"label": "Large", "price": 760, "sort_order": 3},
            {"label": "X-Large", "price": 1020, "sort_order": 4},
        ]
    },
    {
        "code": "F2",
        "name": "Bangus (Milkfish)",
        "category": "seafood",
        "description": "Marinated & grilled with tomatoes & onion toppings",
        "base_price": 270,
        "options": [
            {"label": "Plain", "price": 270, "sort_order": 1},
            {"label": "With Rice", "price": 290, "sort_order": 2},
        ]
    },
    {
        "code": "F3",
        "name": "Boneless Bangus",
        "category": "seafood",
        "description": "Boneless milkfish with rice",
        "base_price": 190,
        "options": [
            {"label": "With Rice", "price": 190, "sort_order": 1},
        ]
    },
    {
        "code": "F4",
        "name": "Tilapia",
        "category": "seafood",
        "description": "Fried; served with soy-chili-calamansi dip",
        "base_price": 170,
        "options": [
            {"label": "Plain", "price": 170, "sort_order": 1},
            {"label": "With Rice", "price": 190, "sort_order": 2},
        ]
    },
    {
        "code": "F5",
        "name": "Squid / Pusit",
        "category": "seafood",
        "description": "Grilled and stuffed with tomato & onion",
        "base_price": 180,
        "options": [
            {"label": "Plain", "price": 180, "sort_order": 1},
            {"label": "With Rice", "price": 200, "sort_order": 2},
        ]
    },
    
    # LEMONADE
    {
        "code": "L1",
        "name": "Lemon Tea",
        "category": "lemonade",
        "description": "Refreshing lemon tea",
        "base_price": 85,
        "options": []
    },
    {
        "code": "L2",
        "name": "Lemonade",
        "category": "lemonade",
        "description": "Classic lemonade",
        "base_price": 100,
        "options": []
    },
    {
        "code": "L3",
        "name": "Cucumber Lemonade",
        "category": "lemonade",
        "description": "Lemonade with cucumber",
        "base_price": 120,
        "options": []
    },
    {
        "code": "L4",
        "name": "Apple Cucumber Lemonade",
        "category": "lemonade",
        "description": "Lemonade with apple and cucumber",
        "base_price": 140,
        "options": []
    },
    {
        "code": "L5",
        "name": "Mango Lemonade",
        "category": "lemonade",
        "description": "Lemonade with mango",
        "base_price": 150,
        "options": []
    },
    {
        "code": "L6",
        "name": "Apple Mango Cucumber Lemonade",
        "category": "lemonade",
        "description": "Ultimate fruit lemonade blend",
        "base_price": 170,
        "options": []
    },
    
    # SMOOTHIES
    {
        "code": "SM1",
        "name": "Mango Milkshake",
        "category": "smoothies",
        "description": "Fresh mango milkshake",
        "base_price": 150,
        "options": []
    },
    {
        "code": "SM2",
        "name": "Strawberry Milkshake",
        "category": "smoothies",
        "description": "Fresh strawberry milkshake",
        "base_price": 135,
        "options": []
    },
    {
        "code": "SM3",
        "name": "Cookies & Cream Milkshake",
        "category": "smoothies",
        "description": "Classic cookies and cream",
        "base_price": 135,
        "options": []
    },
    
    # SILOG MEALS
    {
        "code": "B1",
        "name": "Corned Beef Silog",
        "category": "silog",
        "description": "Corned beef with garlic rice and egg",
        "base_price": 180,
        "options": []
    },
    {
        "code": "B2",
        "name": "Tapsilog",
        "category": "silog",
        "description": "Beef tapa with garlic rice and egg",
        "base_price": 180,
        "options": []
    },
    {
        "code": "B3",
        "name": "Spam Silog",
        "category": "silog",
        "description": "Spam with garlic rice and egg",
        "base_price": 230,
        "options": []
    },
    {
        "code": "B4",
        "name": "Sisig Silog",
        "category": "silog",
        "description": "Sisig with garlic rice and egg - Best Seller!",
        "base_price": 170,
        "options": []
    },
    
    # APPETIZERS
    {
        "code": "A1",
        "name": "French Fries",
        "category": "appetizers",
        "description": "Crispy golden fries",
        "base_price": 80,
        "options": [
            {"label": "Small", "price": 80, "sort_order": 1},
            {"label": "Medium", "price": 130, "sort_order": 2},
            {"label": "Large", "price": 200, "sort_order": 3},
            {"label": "X-Large", "price": 340, "sort_order": 4},
        ]
    },
    {
        "code": "A2",
        "name": "Chicken Nuggets",
        "category": "appetizers",
        "description": "Crispy chicken nuggets",
        "base_price": 145,
        "options": [
            {"label": "6 pcs", "price": 145, "sort_order": 1},
            {"label": "12 pcs", "price": 280, "sort_order": 2},
            {"label": "18 pcs", "price": 425, "sort_order": 3},
            {"label": "24 pcs", "price": 570, "sort_order": 4},
        ]
    },
    {
        "code": "A3",
        "name": "Calamari",
        "category": "appetizers",
        "description": "Fried squid rings",
        "base_price": 220,
        "options": []
    },
    
    # BUCKETS
    {
        "code": "BKT1",
        "name": "Bucket (6 beers)",
        "category": "buckets",
        "description": "Choice of Red Horse, San Mig Apple, San Mig Light, San Mig Pilsen + Free Karaoke!",
        "base_price": 450,
        "options": []
    },
    {
        "code": "BKT2",
        "name": "Bucket Set 1",
        "category": "buckets",
        "description": "1 Bucket + Pulutan (French Fries or 6 pcs Nuggets or Sizzling Hotdog)",
        "base_price": 570,
        "options": []
    },
]


def seed_menu():
    """Seed the menu items into Supabase"""
    print("🌱 Seeding menu items...")
    
    # Clear existing menu (optional - comment out if you want to keep existing data)
    print("🧹 Clearing existing menu...")
    supabase.table("menu_item_options").delete().gte("created_at", "1970-01-01").execute()
    supabase.table("menu_items").delete().gte("created_at", "1970-01-01").execute()
    
    for item_data in MENU_DATA:
        options = item_data.pop("options", [])
        
        # Insert menu item
        result = supabase.table("menu_items").insert({
            "code": item_data["code"],
            "name": item_data["name"],
            "category": item_data["category"],
            "description": item_data.get("description", ""),
            "base_price": item_data["base_price"],
            "available": True
        }).execute()
        
        menu_item_id = result.data[0]["id"]
        print(f"✅ Added {item_data['code']} - {item_data['name']}")
        
        # Insert options if any
        if options:
            for opt in options:
                supabase.table("menu_item_options").insert({
                    "menu_item_id": menu_item_id,
                    "label": opt["label"],
                    "price": opt["price"],
                    "sort_order": opt.get("sort_order", 0)
                }).execute()
            print(f"   ↳ Added {len(options)} options")
    
    print(f"\n🎉 Successfully seeded {len(MENU_DATA)} menu items!")


if __name__ == "__main__":
    seed_menu()

