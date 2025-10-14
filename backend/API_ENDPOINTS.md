# Sip & Sing API Endpoints

## Base URL
`http://localhost:8000`

## Menu Endpoints

### Get All Menu Items
- **URL**: `/api/menu/` (note the trailing slash)
- **Method**: GET
- **Query Parameters**:
  - `category` (optional): Filter by category (e.g., grilled, seafood)
  - `available` (optional): Filter by availability (true/false)
- **Example**: `curl http://localhost:8000/api/menu/?category=grilled`

### Get Categories
- **URL**: `/api/menu/categories`
- **Method**: GET
- **Returns**: List of all menu categories

### Get Single Item
- **URL**: `/api/menu/{item_id}`
- **Method**: GET
- **Example**: `curl http://localhost:8000/api/menu/{uuid-here}`

## Categories Available
- appetizers
- bestsellers
- buckets
- grilled
- lemonade
- seafood
- silog
- smoothies

## API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
