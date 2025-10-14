import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';
// Import 'useSearchParams' for table number URL detection
import { useSearchParams } from 'react-router-dom';

// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// NOTE: Vite automatically exposes environment variables prefixed with VITE_
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Category config (Keep this external definition)
const CATEGORIES = [
  { id: 'grilled', icon: '🥩', label: 'Grilled' },
  { id: 'bestsellers', icon: '⭐', label: 'Best Sellers' },
  { id: 'seafood', icon: '🐟', label: 'Seafood' },
  { id: 'silog', icon: '🍳', label: 'Silog' },
  { id: 'appetizers', icon: '🍟', label: 'Appetizers' },
  { id: 'lemonade', icon: '🍋', label: 'Lemonade' },
  { id: 'smoothies', icon: '🍓', label: 'Smoothies' },
  { id: 'buckets', icon: '🍻', label: 'Buckets' },
  { id: 'alcohol', icon: '🥃', label: 'Alcohol' }, // Added common category
  { id: 'coffee', icon: '☕', label: 'Coffee' }, // Added common category
];


export default function Menu() {
  const [searchParams] = useSearchParams();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('grilled');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  
  // Set initial state from URL query, e.g., ?table=5
  const initialTable = searchParams.get('table') || '';
  const [orderType, setOrderType] = useState(initialTable ? 'dine-in' : 'takeout');
  const [tableNumber, setTableNumber] = useState(initialTable);

  // --- Initial Data Load ---
  useEffect(() => {
    loadMenuFromSupabase();
    // Also load cart from localStorage
    const savedCart = localStorage.getItem('sipnsing_cart');
    if (savedCart) {
        setCart(JSON.parse(savedCart));
    }
  }, []);
  
  // --- Persist Cart to Local Storage ---
  useEffect(() => {
    localStorage.setItem('sipnsing_cart', JSON.stringify(cart));
  }, [cart]);
  
  // --- Supabase Fetch Logic ---
  const loadMenuFromSupabase = async () => {
    try {
      // 1. Fetch all menu items
      let { data: items, error: itemsError } = await supabase
        .from('menu_items')
        .select(`*, options:menu_item_options (id, label, price, sort_order)`)
        .order('category', { ascending: true })
        .order('code', { ascending: true });

      if (itemsError) throw itemsError;
      
      const structuredMenu = items || [];
      setMenuItems(structuredMenu);
      
      // Cache for offline use (JSON.stringify is automatic when storing objects)
      localStorage.setItem('sipnsing_menu', JSON.stringify(structuredMenu));
      
    } catch (err) {
      console.error('Error loading menu from Supabase:', err.message);
      
      // Fallback to localStorage for offline
      const cached = localStorage.getItem('sipnsing_menu');
      if (cached) {
        setMenuItems(JSON.parse(cached));
      } else {
        // Show error message if no data is available
        alert("Failed to load menu. Check network connection or Supabase keys.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Cart Management Functions ---
  const addToCart = (item, option = null) => {
    // Determine price: use option price if available, otherwise use base_price
    const price = option?.price || item.base_price; 
    
    // Create a unique ID for the cart item (item_id + option_id)
    const cartItemId = `${item.id}-${option?.id || 'base'}`;
    
    const cartItem = {
      id: cartItemId,
      item_id: item.id,
      code: item.code,
      name: item.name,
      option_id: option?.id || null, // Track the option ID for clarity
      option_label: option?.label || 'Regular',
      price: parseFloat(price), // Ensure price is a number
      quantity: 1,
    };

    setCart(prev => {
      const existing = prev.find(i => i.id === cartItemId);
      if (existing) {
        return prev.map(i =>
          i.id === cartItemId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      return [...prev, cartItem];
    });
  };

  const updateQuantity = (cartItemId, change) => {
    // ... (Your updateQuantity logic remains unchanged)
    setCart(prev => {
      const updated = prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
      return updated;
    });
  };

  const removeFromCart = (cartItemId) => {
    // ... (Your removeFromCart logic remains unchanged)
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // --- Order Submission ---
  const submitOrder = async () => {
    
    // Simple Guest Checkout (as per RLS policy: Anyone can INSERT)
    // We don't need to check for Supabase user auth for guest checkout.
    
    if (orderType === 'dine-in' && !tableNumber) {
        alert('Please enter your table number.');
        return;
    }
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }

    try {
        const orderData = {
            // customer_id is NULL for guest checkout
            customer_name: 'Guest', // Placeholder
            order_type: orderType,
            table_number: orderType === 'dine-in' ? tableNumber : null,
            
            // Map cart items to the JSONB structure defined in the orders table
            items: cart.map(item => ({
                item_id: item.item_id,
                code: item.code,
                name: item.name,
                option: item.option_label,
                price: item.price,
                quantity: item.quantity,
            })),
            
            subtotal: getCartTotal(),
            tax: 0,
            total: getCartTotal(),
            status: 'pending', // Default status
            payment_method: 'cash',
            payment_status: 'pending',
        };

        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select('id') // Just fetch ID to confirm success
            .single();

        if (error) throw error;
        
        // Success actions
        setCart([]); // Clear cart
        localStorage.removeItem('sipnsing_cart'); // Clear storage
        setShowCart(false); // Close modal
        
        // Use a less intrusive success message
        alert(`Order successfully placed! Please wait for our staff.`); 
        
    } catch (err) {
        console.error('Error placing order:', err);
        alert('Failed to place order. Please try again. Error: ' + err.message);
    }
  };

  // --- UI and Rendering Functions ---
  const scrollToCategory = (categoryId) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      const headerOffset = 150;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  // Group items by category (using the CATEGORIES array for order)
  const itemsByCategory = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading menu...</div>
      </div>
    );
  }

  // --- Render Menu Items and Options ---
  const renderMenuItem = (item) => {
    // Check if the item has options (variants/sizes)
    const hasOptions = item.options && item.options.length > 0;
    
    return (
      <div
        key={item.id}
        className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 hover:border-pink-500/50 transition-all"
      >
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-pink-400 font-bold text-xs">{item.code}</span>
            <h3 className="text-lg font-bold text-white">{item.name}</h3>
            {item.description && (
              <p className="text-purple-200 text-sm mt-1">{item.description}</p>
            )}
          </div>
        </div>

        {/* Dynamic Pricing and Add to Cart Section */}
        {hasOptions ? (
          <div className="mt-3 space-y-2">
            {item.options.map(option => (
              <div key={option.id} className="flex justify-between items-center py-1 border-t border-purple-700/50 first:border-t-0">
                <span className="text-purple-300 font-medium">{option.label}</span>
                <div className="flex items-center gap-3">
                    <span className="text-green-400 font-bold text-base">₱{option.price}</span>
                    <button
                      onClick={() => addToCart(item, option)}
                      className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-3 py-1 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                    >
                      <Plus className='w-4 h-4' />
                    </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Single Price Item
          <div className="flex justify-between items-center mt-3">
            <span className="text-green-400 font-bold text-xl">₱{item.base_price}</span>
            <button
              onClick={() => addToCart(item)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Add to Cart
            </button>
          </div>
        )}
      </div>
    );
  };
  
  // --- Main Render Return (Unchanged UI) ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-center sticky top-0 z-50 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-1">🎤 Sip & Sing Restobar</h1>
        <p className="text-purple-100 text-sm">Delicious Food • Refreshing Drinks • Great Vibes</p>
        {initialTable && orderType === 'dine-in' && (
          <p className="text-yellow-300 text-base mt-2">
            Ordering for Table **{initialTable}**
          </p>
        )}
      </div>

      {/* Category Nav */}
      <div className="sticky top-[88px] z-40 bg-purple-800/90 backdrop-blur-sm overflow-x-auto flex gap-2 p-3 scrollbar-hide">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => scrollToCategory(cat.id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap font-semibold transition-all ${
              activeCategory === cat.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                : 'bg-purple-700 text-purple-200 hover:bg-purple-600'
            }`}
          >
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <div className="max-w-4xl mx-auto p-4 pb-24">
        {CATEGORIES.map(category => {
          const items = itemsByCategory[category.id] || [];
          if (items.length === 0) return null;

          return (
            <div key={category.id} id={category.id} className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-3xl">{category.icon}</span>
                {category.label.toUpperCase()}
              </h2>

              <div className="grid gap-4">
                {items.map(item => renderMenuItem(item))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Button (Unchanged) */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </button>

      {/* Cart Modal (Unchanged) */}
      {showCart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end md:items-center justify-center">
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 w-full md:max-w-2xl md:rounded-t-3xl md:rounded-b-3xl max-h-[90vh] overflow-y-auto">
            {/* Cart Header */}
            <div className="sticky top-0 bg-purple-800 p-5 flex justify-between items-center border-b border-purple-700">
              <h2 className="text-2xl font-bold text-white">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Order Type Selection */}
            <div className="p-5 border-b border-purple-700">
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setOrderType('dine-in')}
                  className={`flex-1 py-3 rounded-lg font-semibold ${
                    orderType === 'dine-in'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-purple-800 text-purple-300'
                  }`}
                >
                  Dine In
                </button>
                <button
                  onClick={() => setOrderType('takeout')}
                  className={`flex-1 py-3 rounded-lg font-semibold ${
                    orderType === 'takeout'
                      ? 'bg-takeout'
                      : 'bg-purple-800 text-purple-300'
                  }`}
                >
                  Takeout
                </button>
              </div>

              {orderType === 'dine-in' && (
                <input
                  type="text"
                  placeholder="Table Number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full p-3 rounded-lg bg-purple-800 text-white border border-purple-600 focus:border-pink-500 focus:outline-none"
                />
              )}
            </div>

            {/* Cart Items */}
            <div className="p-5 space-y-3">
              {cart.length === 0 ? (
                <p className="text-purple-300 text-center py-8">Your cart is empty</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="bg-purple-800/50 rounded-lg p-4 flex justify-between items-center">
                    <div className="flex-1">
                      <h4 className="font-bold text-white">{item.name}</h4>
                      <p className="text-purple-300 text-sm">{item.option_label}</p>
                      <p className="text-green-400 font-semibold">₱{item.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="bg-purple-700 text-white w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-bold w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="bg-purple-700 text-white w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-400 ml-2"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="sticky bottom-0 bg-purple-900 p-5 border-t border-purple-700">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold text-white">Total:</span>
                  <span className="text-2xl font-bold text-green-400">₱{getCartTotal().toFixed(2)}</span>
                </div>
                <button
                  onClick={submitOrder}
                  disabled={orderType === 'dine-in' && !tableNumber}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
