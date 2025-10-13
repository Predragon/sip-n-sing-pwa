import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X } from 'lucide-react';

// Supabase client (you'll configure this)
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// Category config
const CATEGORIES = [
  { id: 'grilled', icon: '🥩', label: 'Grilled' },
  { id: 'bestsellers', icon: '⭐', label: 'Best Sellers' },
  { id: 'seafood', icon: '🐟', label: 'Seafood' },
  { id: 'noodles', icon: '🍜', label: 'Noodles' },
  { id: 'silog', icon: '🍳', label: 'Silog' },
  { id: 'appetizers', icon: '🍟', label: 'Appetizers' },
  { id: 'soup', icon: '🍲', label: 'Soup' },
  { id: 'lemonade', icon: '🍋', label: 'Lemonade' },
  { id: 'smoothies', icon: '🍓', label: 'Smoothies' },
  { id: 'coffee', icon: '☕', label: 'Coffee' },
  { id: 'alcohol', icon: '🍺', label: 'Alcohol' },
  { id: 'nonalcohol', icon: '🧃', label: 'Drinks' },
  { id: 'buckets', icon: '🍻', label: 'Buckets' },
];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState('grilled');
  const [loading, setLoading] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' or 'takeout'
  const [tableNumber, setTableNumber] = useState('');

  // Load menu from Supabase
  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select(`
          *,
          options:menu_item_options(*)
        `)
        .eq('available', true)
        .order('code');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (err) {
      console.error('Error loading menu:', err);
      // Fallback to localStorage for offline
      const cached = localStorage.getItem('sipnsing_menu');
      if (cached) setMenuItems(JSON.parse(cached));
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item, option = null) => {
    const cartItem = {
      id: `${item.id}-${option?.id || 'base'}`,
      item_id: item.id,
      code: item.code,
      name: item.name,
      option_label: option?.label || 'Regular',
      price: option?.price || item.base_price,
      quantity: 1,
    };

    setCart(prev => {
      const existing = prev.find(i => i.id === cartItem.id);
      if (existing) {
        return prev.map(i => 
          i.id === cartItem.id 
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

  const submitOrder = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Please sign in to place an order');
        return;
      }

      const orderData = {
        customer_id: user.id,
        order_type: orderType,
        table_number: orderType === 'dine-in' ? tableNumber : null,
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
        payment_method: 'cash',
        payment_status: 'pending',
      };

      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      // Clear cart
      setCart([]);
      setShowCart(false);
      
      alert(`Order placed! Order #${data.order_number}`);
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    }
  };

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

  // Group items by category
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 text-center sticky top-0 z-50 shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-1">🎤 Sip & Sing Restobar</h1>
        <p className="text-purple-100 text-sm">Delicious Food • Refreshing Drinks • Great Vibes</p>
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
                {items.map(item => (
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

                    {/* Options/Prices */}
                    {item.options && item.options.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        {item.options.map(opt => (
                          <div
                            key={opt.id}
                            className="flex justify-between items-center bg-purple-900/30 rounded-lg p-3"
                          >
                            <span className="text-purple-100 text-sm">{opt.label}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-green-400 font-bold">₱{opt.price}</span>
                              <button
                                onClick={() => addToCart(item, opt)}
                                className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-2 rounded-lg hover:shadow-lg transition-all"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
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
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart Button */}
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

      {/* Cart Modal */}
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
                      <p className="text-green-400 font-semibold">₱{item.price}</p>
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