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

# --- CONFIGURATION ---
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)
# ---------------------

# Menu data structure
# Note: Complex pricing like alcohol lists are modeled as separate items 
# or grouped under a single 'item' with multiple 'options' where applicable.
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
    
    # --- NOODLES / PANCIT (NEW) ---
    {
        "code": "C1",
        "name": "Pancit Guisado",
        "category": "noodles",
        "description": "Sautéed bihon with chicken & fresh veggies.",
        "base_price": 220,
        "options": [
            {"label": "S", "price": 220, "sort_order": 1},
            {"label": "M", "price": 430, "sort_order": 2},
            {"label": "L", "price": 640, "sort_order": 3},
            {"label": "XL", "price": 850, "sort_order": 4},
        ]
    },
    {
        "code": "C2",
        "name": "Beef Pigar-Pigar",
        "category": "noodles",
        "description": "Marinated beef sautéed with cabbage & onion.",
        "base_price": 260,
        "options": [
            {"label": "S", "price": 260, "sort_order": 1},
            {"label": "M", "price": 510, "sort_order": 2},
            {"label": "L", "price": 760, "sort_order": 3},
            {"label": "XL", "price": 1020, "sort_order": 4},
        ]
    },
    {
        "code": "C3",
        "name": "Sautéed Veggies",
        "category": "noodles",
        "description": "Base price for vegetables. Add ₱30 for Chicken.",
        "base_price": 0, # Assuming this is a base component with no explicit price
        "options": [
            {"label": "Veggies Only", "price": 180, "sort_order": 1}, # Estimate based on typical side dish price
            {"label": "With Chicken", "price": 210, "sort_order": 2},
        ]
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
    { "code": "B5", "name": "Bacon Silog", "category": "silog", "description": "Bacon with garlic rice and egg", "base_price": 170, "options": [] },
    { "code": "B6", "name": "Long Silog", "category": "silog", "description": "Longanisa with garlic rice and egg", "base_price": 170, "options": [] },
    { "code": "B7", "name": "Hot Silog", "category": "silog", "description": "Hotdog with garlic rice and egg", "base_price": 130, "options": [] },
    { "code": "B8", "name": "Bang Silog", "category": "silog", "description": "Boneless Bangus with garlic rice and egg", "base_price": 160, "options": [] },
    { "code": "B9", "name": "Hung Silog", "category": "silog", "description": "Hungarian sausage with garlic rice and egg", "base_price": 145, "options": [] },

    # --- APPETIZERS / SIDES ---
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
    {
        "code": "A4",
        "name": "Shanghai Rolls",
        "category": "appetizers",
        "description": "Filipino-style spring rolls",
        "base_price": 195,
        "options": [
            {"label": "10 pcs", "price": 195, "sort_order": 1},
            {"label": "20 pcs", "price": 380, "sort_order": 2},
            {"label": "30 pcs", "price": 570, "sort_order": 3},
            {"label": "40 pcs", "price": 760, "sort_order": 4},
        ]
    },
    {
        "code": "A5",
        "name": "Garlic Longanisa",
        "category": "appetizers",
        "description": "Garlic-flavored native sausage",
        "base_price": 220,
        "options": [
            {"label": "6 pcs", "price": 220, "sort_order": 1},
            {"label": "12 pcs", "price": 430, "sort_order": 2},
            {"label": "18 pcs", "price": 640, "sort_order": 3},
            {"label": "24 pcs", "price": 850, "sort_order": 4},
        ]
    },
    {
        "code": "A6",
        "name": "Chicken Skin",
        "category": "appetizers",
        "description": "Crispy fried chicken skin (Limited availability)",
        "base_price": 195,
        "options": []
    },

    # --- SOUP (NEW) ---
    { "code": "SOP1", "name": "Pork Sinigang", "category": "soup", "description": "Sour and savory tamarind broth with pork.", "base_price": 360, "options": [] },
    { "code": "SOP2", "name": "Beef Bulalo", "category": "soup", "description": "Light colored beef soup with bone marrow.", "base_price": 380, "options": [] },
    { "code": "SOP3", "name": "Sotanghon Soup", "category": "soup", "description": "Vermicelli noodles with chicken & veggies.", "base_price": 220, "options": [] },
    { "code": "SOP4", "name": "Korean Ramyeon", "category": "soup", "description": "Spicy Korean instant noodles.", "base_price": 150, "options": [] },
    { "code": "SOP5", "name": "Jjapagheti", "category": "soup", "description": "Korean black bean instant noodles.", "base_price": 150, "options": [] },

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
    { "code": "D2", "name": "Ginger Lemonade", "category": "lemonade", "description": "Refreshing lemonade with a ginger kick.", "base_price": 95, "options": [] },
    { "code": "D3", "name": "Ginger Tea Lemonade", "category": "lemonade", "description": "Tea and lemonade infused with ginger.", "base_price": 120, "options": [] },
    { "code": "D4", "name": "Ginger Cucumber Lemonade", "category": "lemonade", "description": "A cooling and refreshing mix.", "base_price": 140, "options": [] },
    { "code": "D5", "name": "Ginger Apple Cucumber Lemonade", "category": "lemonade", "description": "A complex mix of fruits and ginger.", "base_price": 160, "options": [] },
    { "code": "D6", "name": "Ginger Carrot Apple Cucumber Lemonade", "category": "lemonade", "description": "The ultimate healthy blend.", "base_price": 180, "options": [] },


    # SMOOTHIES
    {
        "code": "SM1",
        "name": "Mango Milkshake",
        "category": "smoothies",
        "description": "Fresh mango milkshake",
        "base_price": 150,
        "options": []
    },
    { "code": "SM2", "name": "Banana Milkshake", "category": "smoothies", "description": "Fresh banana milkshake", "base_price": 150, "options": [] },
    { "code": "SM3", "name": "Mango Banana Milkshake", "category": "smoothies", "description": "Blend of mango and banana", "base_price": 160, "options": [] },
    {
        "code": "SM4",
        "name": "Strawberry Milkshake",
        "category": "smoothies",
        "description": "Fresh strawberry milkshake",
        "base_price": 135,
        "options": []
    },
    {
        "code": "SM5",
        "name": "Cookies & Cream Milkshake",
        "category": "smoothies",
        "description": "Classic cookies and cream",
        "base_price": 135,
        "options": []
    },
    { "code": "SM6", "name": "Blueberry Milkshake", "category": "smoothies", "description": "Refreshing blueberry flavor", "base_price": 135, "options": [] },
    { "code": "SM7", "name": "Mango Apple Banana Milkshake", "category": "smoothies", "description": "Tropical fruit blend", "base_price": 170, "options": [] },
    { "code": "SM8", "name": "Mango Strawberry Milkshake", "category": "smoothies", "description": "Sweet and tart blend", "base_price": 170, "options": [] },
    { "code": "SM9", "name": "Mango Graham Milkshake", "category": "smoothies", "description": "Filipino dessert-style shake", "base_price": 150, "options": [] },


    # --- COFFEE & TEA (NEW) ---
    { "code": "CF1", "name": "Coffee Latte", "category": "coffee", "description": "Espresso with steamed milk.", "base_price": 120, "options": [] },
    { "code": "CF2", "name": "Spanish Latte", "category": "coffee", "description": "Sweetened condensed milk latte.", "base_price": 125, "options": [] },
    { "code": "CF3", "name": "Cappuccino", "category": "coffee", "description": "Espresso, steamed milk, and milk foam.", "base_price": 125, "options": [] },
    { "code": "CF4", "name": "Americano", "category": "coffee", "description": "Espresso diluted with hot water.", "base_price": 125, "options": [] },
    { "code": "CF5", "name": "Espresso", "category": "coffee", "description": "A shot of concentrated coffee.", "base_price": 85, "options": [] },
    { "code": "CF6", "name": "Black Tea", "category": "coffee", "description": "Classic black tea.", "base_price": 80, "options": [] },
    { "code": "CF7", "name": "Ginger Tea with Lemon", "category": "coffee", "description": "Soothing ginger tea.", "base_price": 80, "options": [] },


    # --- ALCOHOLIC DRINKS (NEW - Grouped into single entries) ---
    {
        "code": "ALC1",
        "name": "Shots & Tequila (Group)",
        "category": "alcohol",
        "description": "A variety of shots and tequilas.",
        "base_price": 80,
        "options": [
            {"label": "Tequila", "price": 80, "sort_order": 1},
            {"label": "El Hombre Gold", "price": 140, "sort_order": 2},
            {"label": "Jose Cuervo", "price": 140, "sort_order": 3},
            {"label": "Tequila Rose", "price": 190, "sort_order": 4},
        ]
    },
    {
        "code": "ALC2",
        "name": "Beers (Group)",
        "category": "alcohol",
        "description": "Selection of popular local and imported beers.",
        "base_price": 80,
        "options": [
            {"label": "Red Horse", "price": 80, "sort_order": 1},
            {"label": "San Mig Light", "price": 80, "sort_order": 2},
            {"label": "San Mig Apple", "price": 80, "sort_order": 3},
            {"label": "San Mig Pilsen", "price": 80, "sort_order": 4},
            {"label": "San Mig Zero", "price": 90, "sort_order": 5},
            {"label": "Tanduay Ice", "price": 90, "sort_order": 6},
            {"label": "Smirnoff Mule", "price": 120, "sort_order": 7},
            {"label": "German Beer", "price": 170, "sort_order": 8},
        ]
    },
    {
        "code": "ALC3",
        "name": "Whiskey (Group)",
        "category": "alcohol",
        "description": "Selection of whiskeys.",
        "base_price": 80,
        "options": [
            {"label": "Embassy", "price": 80, "sort_order": 1},
            {"label": "Scottish Legacy", "price": 100, "sort_order": 2},
            {"label": "Captain Morgan", "price": 100, "sort_order": 3},
            {"label": "Jim Beam", "price": 120, "sort_order": 4},
            {"label": "Johnnie Walker Black", "price": 150, "sort_order": 5},
            {"label": "Jameson", "price": 140, "sort_order": 6},
            {"label": "Fireball", "price": 150, "sort_order": 7},
            {"label": "Jack Daniel", "price": 170, "sort_order": 8},
            {"label": "Jack Daniel Coke Can", "price": 150, "sort_order": 9},
            {"label": "Jack Daniel Coke", "price": 180, "sort_order": 10},
        ]
    },
    {
        "code": "ALC4",
        "name": "Vodka, Rhum & Gin (Group)",
        "category": "alcohol",
        "description": "Selection of white spirits and liqueurs.",
        "base_price": 80,
        "options": [
            {"label": "Toska Vodka", "price": 80, "sort_order": 1},
            {"label": "Smirnoff Vodka", "price": 130, "sort_order": 2},
            {"label": "Tanduay Rhum", "price": 80, "sort_order": 3},
            {"label": "Malibu", "price": 85, "sort_order": 4},
            {"label": "Zaffiro Gin", "price": 80, "sort_order": 5},
            {"label": "Jägermeister", "price": 130, "sort_order": 6},
            {"label": "Bailey's", "price": 140, "sort_order": 7},
        ]
    },
    {
        "code": "ALC5",
        "name": "Mixed Drinks (Group)",
        "category": "alcohol",
        "description": "Classic bar mixed drinks.",
        "base_price": 100,
        "options": [
            {"label": "Gin Tonic", "price": 100, "sort_order": 1}, # Using 100 as base price
            {"label": "Rhum Coke", "price": 100, "sort_order": 2},
            {"label": "Vodka Tonic / Soda", "price": 100, "sort_order": 3},
            {"label": "Cranberry Rhum / Vodka", "price": 100, "sort_order": 4},
            {"label": "Black Russian", "price": 100, "sort_order": 5},
            {"label": "Malibu Pineapple", "price": 150, "sort_order": 6},
            {"label": "Jager Bomb", "price": 150, "sort_order": 7},
        ]
    },

    # --- NON-ALCOHOLIC DRINKS (NEW - Grouped into single entry) ---
    {
        "code": "NALC1",
        "name": "Soft Drinks & Juices (Group)",
        "category": "nonalcohol",
        "description": "Various sodas, bottled juices, and water.",
        "base_price": 30,
        "options": [
            {"label": "Water 500ml", "price": 30, "sort_order": 1},
            {"label": "Pocari Sweat", "price": 70, "sort_order": 2},
            {"label": "Coke (orig/zero)", "price": 70, "sort_order": 3},
            {"label": "Sprite / Royal", "price": 70, "sort_order": 4},
            {"label": "Mango Juice", "price": 70, "sort_order": 5},
            {"label": "Pineapple Juice", "price": 70, "sort_order": 6},
            {"label": "Four Seasons", "price": 70, "sort_order": 7},
            {"label": "Smart C +", "price": 70, "sort_order": 8},
            {"label": "Iced Tea Pitcher", "price": 100, "sort_order": 9},
            {"label": "Red Bull Supreme", "price": 90, "sort_order": 10},
            {"label": "Red Bull Can 250ml", "price": 160, "sort_order": 11},
            {"label": "Coke 1.5L", "price": 130, "sort_order": 12},
        ]
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
    {
        "code": "BKT3",
        "name": "Bucket Set 2",
        "category": "buckets",
        "description": "1 Bucket + Pulutan (choice same as above)",
        "base_price": 610,
        "options": []
    },
    {
        "code": "BKT4",
        "name": "Bucket Set 3",
        "category": "buckets",
        "description": "1 Bucket + Pulutan (Sisig / Bopis / Dinuguan / Chicken Feet)",
        "base_price": 660,
        "options": []
    },
    { "code": "BKT5", "name": "Alfonso 1L + Coke", "category": "buckets", "description": "1 Liter bottle of Alfonso with Coke mixer.", "base_price": 700, "options": [] },
    { "code": "BKT6", "name": "Bottle of Wine", "category": "buckets", "description": "House wine bottle.", "base_price": 650, "options": [] },
]


def seed_menu():
    """Seed the menu items into Supabase"""
    print("🌱 Seeding menu items...")
    
    # Clear existing menu (optional - comment out if you want to keep existing data)
    print("🧹 Clearing existing menu...")
    # NOTE: These tables must exist in your Supabase project!
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
        
        # Check if insertion was successful before trying to get the ID
        if result.data:
            menu_item_id = result.data[0]["id"]
            print(f"✅ Added {item_data['code']} - {item_data['name']}")
            
            # Insert options if any
            if options:
                # Prepare all options for batch insertion (more efficient)
                options_to_insert = [
                    {
                        "menu_item_id": menu_item_id,
                        "label": opt["label"],
                        "price": opt["price"],
                        "sort_order": opt.get("sort_order", 0)
                    } for opt in options
                ]
                
                supabase.table("menu_item_options").insert(options_to_insert).execute()
                print(f"   ↳ Added {len(options)} options")
        else:
            print(f"❌ Failed to add item: {item_data['code']} - {item_data['name']}")
    
    print(f"\n🎉 Successfully seeded {len(MENU_DATA)} menu items!")


if __name__ == "__main__":
    seed_menu()
