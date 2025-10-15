import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, Check } from 'lucide-react';
// Import 'useSearchParams' for table number URL detection
import { useSearchParams } from 'react-router-dom';

// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

// NOTE: Vite automatically exposes environment variables prefixed with VITE_
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(
  VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY
);

// --- Image Configuration ---
// The URL path to your public Supabase Storage bucket.
const SUPABASE_STORAGE_URL = `${VITE_SUPABASE_URL}/storage/v1/object/public/menu-images`;

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
  { id: 'alcohol', icon: '🥃', label: 'Alcohol' }, 
  { id: 'coffee', icon: '☕', label: 'Coffee' },
];

// --- Checkout Modal Component (Integrated) ---
const CheckoutModal = ({ total, orderType, tableNumber, onClose, onSubmitOrder }) => {
    const [customerName, setCustomerName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Custom modal implementation for alert
        if ((orderType === 'dine-in' && !tableNumber) || !customerName.trim()) {
            console.error('Validation failed: Name and table number required.');
            return;
        }
        setIsSubmitting(true);
        await onSubmitOrder({ customerName, paymentMethod });
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4 border-b pb-3">
                        <h2 className="text-2xl font-bold text-gray-800">Confirm Order</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* Order Context */}
                        <div className="mb-4 bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                            <p className="text-lg font-semibold text-indigo-700">Type: {orderType === 'dine-in' ? `Dine In (Table: ${tableNumber})` : 'Takeout'}</p>
                        </div>

                        {/* Customer Name Input */}
                        <div className="mb-4">
                            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                            <input
                                id="customerName"
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500"
                                placeholder="e.g., Jane Smith"
                                required
                            />
                        </div>

                        {/* Payment Method Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                            <div className="flex gap-4">
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Cash"
                                        checked={paymentMethod === 'Cash'}
                                        onChange={() => setPaymentMethod('Cash')}
                                        className="form-radio text-pink-600 h-5 w-5"
                                    />
                                    <span className="text-gray-700">Cash</span>
                                </label>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Card"
                                        checked={paymentMethod === 'Card'}
                                        onChange={() => setPaymentMethod('Card')}
                                        className="form-radio text-pink-600 h-5 w-5"
                                    />
                                    <span className="text-gray-700">Card (Debit/Credit)</span>
                                </label>
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="flex justify-between items-center text-xl font-bold text-gray-900 border-t pt-3">
                            <span>Total:</span>
                            <span className="text-pink-600">₱{total.toFixed(2)}</span>
                        </div>
                        
                        {/* Submit Button */}
                        <button
                            type="submit"
                            className={`w-full mt-6 py-3 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 
                                ${isSubmitting ? 'bg-gray-400' : 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'}`}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <span className="animate-spin h-5 w-5">⏳</span>
                            ) : (
                                <>
                                    <Check className="w-5 h-5" />
                                    Place Order (₱{total.toFixed(2)})
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};


// --- Main Menu Component ---
export default function Menu() {
  const [searchParams] = useSearchParams();
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('grilled');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false); 
  const [itemCount, setItemCount] = useState(0); // NEW STATE FOR COUNT
  
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
      setItemCount(structuredMenu.length); // SET THE COUNT HERE
      
      // Cache for offline use (JSON.stringify is automatic when storing objects)
      localStorage.setItem('sipnsing_menu', JSON.stringify(structuredMenu));
      
    } catch (err) {
      console.error('Error loading menu from Supabase:', err.message);
      
      // Fallback to localStorage for offline
      const cached = localStorage.getItem('sipnsing_menu');
      if (cached) {
        const cachedMenu = JSON.parse(cached);
        setMenuItems(cachedMenu);
        setItemCount(cachedMenu.length);
      } else {
        // Logging error as per instructions
        console.error("Failed to load menu. Check network connection or Supabase keys.");
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Cart Management Functions (Unchanged) ---
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
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  };

  const getCartTotal = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // --- Order Submission (Unchanged) ---
  const handlePlaceOrder = async ({ customerName, paymentMethod }) => {
    
    if (cart.length === 0) return;

    try {
        const orderData = {
            // This is the clean, correct column name after running the SQL script
            customer_name: customerName, 
            
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
            
            // Use payment method captured in the modal (converted to lowercase for DB CHECK constraint)
            payment_method: paymentMethod.toLowerCase(), 
            payment_status: 'pending',
        };
        
        const { data, error } = await supabase
            .from('orders')
            .insert([orderData])
            .select('id') 
            .single();

        if (error) throw error;
        
        // Success actions
        setCart([]); // Clear cart
        localStorage.removeItem('sipnsing_cart'); // Clear storage
        setShowCheckoutModal(false); // Close the modal
        setOrderConfirmed(true); // Show confirmation banner
        
    } catch (err) {
        console.error('Error placing order:', err);
        // Logging error as per instructions
        console.error('Failed to place order. Error: ' + err.message); 
    }
  };

  // --- UI and Rendering Functions (Unchanged) ---
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

  // --- Render Menu Items and Options (Unchanged) ---
  const renderMenuItem = (item) => {
    // FIX: Only convert to uppercase. Use the code exactly as is from the DB.
    const standardizedCode = item.code.toUpperCase();
    
    // 1. Primary URL (WebP - recommended)
    const webpUrl = `${SUPABASE_STORAGE_URL}/${standardizedCode}.webp`;
    
    // 2. Fallback URL (JPG - for your uploaded file)
    const jpgUrl = `${SUPABASE_STORAGE_URL}/${standardizedCode}.jpg`;

    // 3. Placeholder image URL
    const placeholderUrl = `https://placehold.co/200x150/5B21B6/D8B4FE?text=${standardizedCode}`;

    // Check if the item has options (variants/sizes)
    const hasOptions = item.options && item.options.length > 0;
    
    return (
      <div
        key={item.id}
        className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 hover:border-pink-500/50 transition-all flex flex-col sm:flex-row gap-4"
      >
        
        {/* Image Container (with hover effect) */}
        <div className="w-full sm:w-2/5 md:w-1/3 flex-shrink-0 aspect-[4/3] rounded-lg overflow-hidden shadow-xl transform transition-transform duration-300 hover:scale-[1.02]">
            <img
                // Start by trying the WebP URL
                src={webpUrl}
                alt={item.name}
                className="w-full h-full object-cover"
                // Fallback logic
                onError={(e) => {
                    // If the first try (.webp) failed, try .jpg
                    if (e.target.src.endsWith('.webp')) {
                        e.target.src = jpgUrl; 
                    } 
                    // If the second try (.jpg) failed, use the final placeholder
                    else if (e.target.src.endsWith('.jpg')) {
                        e.target.onerror = null; // Prevent infinite loop
                        e.target.src = placeholderUrl;
                    }
                }}
            />
        </div>

        {/* Content and CTA */}
        <div className="flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="text-pink-400 font-bold text-xs">{item.code}</span>
                    <h3 className="text-xl font-bold text-white">{item.name}</h3>
                    {item.description && (
                      <p className="text-purple-200 text-sm mt-1">{item.description}</p>
                    )}
                </div>
            </div>

            {/* Dynamic Pricing and Add to Cart Section */}
            {hasOptions ? (
              <div className="mt-auto space-y-2 pt-3 border-t border-purple-700/50">
                {item.options.map(option => (
                  <div key={option.id} className="flex justify-between items-center py-1">
                    <span className="text-purple-300 font-medium">{option.label}</span>
                    <div className="flex items-center gap-3">
                        <span className="text-green-400 font-bold text-base">₱{option.price}</span>
                        <button
                          onClick={() => addToCart(item, option)}
                          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                        >
                          <Plus className='w-4 h-4' />
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Single Price Item
              <div className="flex justify-between items-center mt-auto pt-3 border-t border-purple-700/50">
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
      </div>
    );
  };
  
  // --- Main Render Return ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-center sticky top-0 z-40 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-1">🎤 Sip & Sing Restobar</h1>
        <p className="text-purple-100 text-sm">Delicious Food • Refreshing Drinks • Great Vibes</p>
        {tableNumber && orderType === 'dine-in' && (
          <p className="text-yellow-300 text-base mt-2">
            Ordering for Table **{tableNumber}**
          </p>
        )}
      </div>

      {/* Item Count Display (NEW) */}
      {itemCount > 0 && (
          <div className="bg-purple-700/90 text-center py-2 sticky top-[88px] z-30">
              <span className="text-purple-200 text-sm font-medium">
                  {itemCount} Items Loaded (Check the {itemCount} codes for missing images!)
              </span>
          </div>
      )}

      {/* Success Banner */}
      {orderConfirmed && (
        <div className="bg-green-600 p-3 text-center sticky top-[120px] z-30 flex justify-center items-center gap-3">
          <Check className="w-5 h-5" />
          <span className="font-semibold text-white">Order placed successfully! Staff notified.</span>
          <button onClick={() => setOrderConfirmed(false)} className="text-white opacity-70 hover:opacity-100 ml-auto">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Category Nav */}
      <div className="sticky top-[120px] z-20 bg-purple-800/90 backdrop-blur-sm overflow-x-auto flex gap-2 p-3 scrollbar-hide">
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

      {/* Cart Button */}
      <button
        onClick={() => setShowCart(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-purple-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-30"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
            {cart.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        )}
      </button>

      {/* Cart Modal / Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-end md:items-center justify-center">
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
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                      : 'bg-purple-800 text-purple-300'
                  }`}
                >
                  Takeout
                </button>
              </div>

              {orderType === 'dine-in' && (
                <input
                  type="text"
                  placeholder="Table Number (e.g. A2)"
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
                  // This button opens the checkout modal
                  onClick={() => {
                      if (orderType === 'dine-in' && !tableNumber) {
                          // Logging error as per instructions
                          console.error('Validation failed: Please enter your table number for a dine-in order.');
                          return;
                      }
                      setShowCart(false);
                      setShowCheckoutModal(true);
                  }}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={cart.length === 0}
                >
                  Place Order
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Checkout Modal Render */}
      {showCheckoutModal && (
        <CheckoutModal 
            total={getCartTotal()}
            orderType={orderType}
            tableNumber={tableNumber}
            onClose={() => setShowCheckoutModal(false)}
            onSubmitOrder={handlePlaceOrder}
        />
      )}
    </div>
  );
}

