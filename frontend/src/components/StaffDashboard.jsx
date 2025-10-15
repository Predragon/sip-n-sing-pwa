import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Clock, Check, X, ChefHat, Bell, RefreshCw, LogOut, Loader, User } from "lucide-react";

// Get environment variables from the build system
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Since the page loaded, we assume variables are present, but we keep the robust check
// for good measure and prevent silent crashes.
if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
  const ErrorScreen = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 text-white">
      <div className="bg-red-900/90 p-8 rounded-xl shadow-2xl border-2 border-red-500 max-w-md w-full animate-pulse-slow">
        <h1 className="text-3xl font-extrabold mb-4 text-yellow-300 flex items-center">
          <X className="w-6 h-6 mr-3"/> Configuration Failure
        </h1>
        <p className="text-lg mb-4">
          The application cannot start because the Supabase credentials are missing from the hosting environment.
        </p>
        <p className="mt-2 text-sm opacity-90 font-mono">
          Please check the Cloudflare Pages environment variables for:
          <code className="block bg-red-800 p-2 mt-2 rounded break-words">VITE_SUPABASE_URL</code>
          <code className="block bg-red-800 p-2 mt-1 rounded break-words">VITE_SUPABASE_ANON_KEY</code>
        </p>
        <p className="mt-4 text-xs italic text-gray-300">
          This is an environment setup issue, not a code error.
        </p>
      </div>
    </div>
  );
  const Wrapper = () => <ErrorScreen />;
  Wrapper.default = Wrapper; 
  return Wrapper;
}

// Initialize Supabase
const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);

// State Management for Staff Authentication
const StaffAuth = ({ children }) => {
    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
                setIsLoading(false);
            }
        );

        // Fetch initial session state
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => {
            if (authListener) authListener.unsubscribe();
        };
    }, []);

    const handleLogin = useCallback(async (email, password) => {
        setError(null);
        setIsLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (authError) {
                // Supabase error message
                throw new Error(authError.message);
            }
        } catch (e) {
            console.error("Login error:", e.message);
            // Set a clear, Supabase-centric error message
            setError("Login failed. Please check email/password and ensure the user exists.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);
    
    // Pass the session and handlers down to children
    const authContextValue = useMemo(() => ({
        session,
        isLoading,
        error,
        handleLogin,
        handleLogout,
    }), [session, isLoading, error, handleLogin, handleLogout]);


    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <Loader className="w-10 h-10 animate-spin text-purple-400 mb-4" />
                <p>Checking staff credentials...</p>
            </div>
        );
    }

    if (!session || !session.user) {
        return <LoginScreen handleLogin={handleLogin} error={error} isLoading={isLoading} />;
    }

    return children;
};

// Simple Login Screen Component
const LoginScreen = ({ handleLogin, error, isLoading }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        handleLogin(email, password);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
            <div className="w-full max-w-md bg-purple-800/60 p-8 rounded-2xl shadow-2xl border border-pink-500/50 backdrop-blur-sm">
                <h2 className="text-3xl font-bold text-center text-white mb-6 flex items-center justify-center">
                    <User className="w-6 h-6 mr-2 text-pink-300"/> Staff Login
                </h2>
                
                {/* --- FIX APPLIED HERE: Only display the dynamic 'error' state --- */}
                {error && (
                    <div className="bg-red-500 text-white text-sm p-3 rounded-lg mb-4 text-center border-l-4 border-red-300">
                        {error}
                    </div>
                )}
                {/* The old "Firebase Authentication service is unavailable..." 
                    message is now safely removed or overwritten by this dynamic block.
                */}
                {/* --- END FIX --- */}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="staff@sipandsing.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 rounded-xl bg-purple-900/70 border border-purple-600 focus:ring-pink-500 focus:border-pink-500 text-white transition duration-200"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-semibold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 rounded-xl bg-purple-900/70 border border-purple-600 focus:ring-pink-500 focus:border-pink-500 text-white transition duration-200"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-pink-600 hover:bg-pink-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition duration-300 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isLoading ? (
                            <Loader className="w-5 h-5 animate-spin mr-2" />
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};


// Main Component (Order Manager)
const OrderManager = ({ handleLogout, session }) => {
    const [orders, setOrders] = useState([]);
    const [stats, setStats] = useState({ totalOrders: 0, openOrders: 0, revenue: 0 });
    const [refreshing, setRefreshing] = useState(false);
    const [notifications, setNotifications] = useState([]);

    // --- Data Fetching and Realtime Listener ---
    const fetchOrdersAndSubscribe = useCallback(async () => {
        setRefreshing(true);
        // 1. Fetch initial orders
        const { data: initialOrders, error: fetchError } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });

        if (fetchError) {
            console.error("Error fetching orders:", fetchError);
            setRefreshing(false);
            return;
        }

        setOrders(initialOrders);
        updateStats(initialOrders);
        setRefreshing(false);

        // 2. Set up Realtime Listener
        const channel = supabase.channel('order_changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    setOrders(prevOrders => {
                        const newOrders = [...prevOrders];
                        const index = newOrders.findIndex(o => o.id === payload.old.id);

                        if (payload.eventType === 'INSERT') {
                            newOrders.unshift(payload.new);
                            // New Order Notification
                            setNotifications(prev => [...prev, { id: Date.now(), message: "New Order received!", type: 'new' }]);
                        } else if (payload.eventType === 'UPDATE' && index !== -1) {
                            newOrders[index] = payload.new;
                        } else if (payload.eventType === 'DELETE' && index !== -1) {
                            newOrders.splice(index, 1);
                        }
                        updateStats(newOrders);
                        return newOrders;
                    });
                }
            )
            .subscribe();

        return () => {
            channel.unsubscribe();
        };
    }, []);

    useEffect(() => {
        // The auth listener handles getting the initial session state
        // Only run the subscription once the session is available
        if (session) {
            const cleanup = fetchOrdersAndSubscribe();
            return () => {
                 if (cleanup) cleanup();
            };
        }
    }, [session, fetchOrdersAndSubscribe]); // Depend on session to ensure user is logged in before subscribing

    // --- State and UI Logic ---

    const updateStats = (currentOrders) => {
        const total = currentOrders.length;
        const open = currentOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length;
        const totalRevenue = currentOrders
            .filter(o => o.status === 'completed')
            .reduce((sum, o) => sum + (o.total_price || 0), 0);
        
        setStats({
            totalOrders: total,
            openOrders: open,
            revenue: totalRevenue,
        });
    };

    const handleStatusUpdate = async (orderId, newStatus) => {
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq('id', orderId);

        if (error) {
            console.error("Error updating status:", error);
            // Revert state if necessary, or rely on realtime to fix
        }
    };

    const StatusBadge = ({ status }) => {
        let color = "bg-gray-500";
        let text = status;
        if (status === 'pending') { color = "bg-yellow-500/20 text-yellow-300 border-yellow-500"; text = "New"; }
        else if (status === 'preparing') { color = "bg-blue-500/20 text-blue-300 border-blue-500"; text = "In Progress"; }
        else if (status === 'ready') { color = "bg-green-500/20 text-green-300 border-green-500"; text = "Ready for Pickup"; }
        else if (status === 'completed') { color = "bg-green-700/50 text-white border-green-700"; text = "Completed"; }
        else if (status === 'cancelled') { color = "bg-red-700/50 text-white border-red-700"; text = "Cancelled"; }

        return (
            <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full border ${color}`}>
                {text}
            </span>
        );
    };

    const NotificationBell = () => {
        const [isOpen, setIsOpen] = useState(false);
        const unreadCount = notifications.length;

        const clearNotification = (id) => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        };

        return (
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 rounded-full bg-pink-600 hover:bg-pink-700 transition duration-150 relative shadow-lg"
                    aria-label="Notifications"
                >
                    <Bell className="w-6 h-6 text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block h-3 w-3 rounded-full ring-2 ring-gray-900 bg-red-500 text-xs font-bold text-white leading-none flex items-center justify-center">
                        </span>
                    )}
                </button>
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl z-50 border border-gray-700">
                        <div className="p-4 border-b border-gray-700 font-semibold text-lg text-white">
                            Alerts ({unreadCount})
                        </div>
                        {notifications.length === 0 ? (
                            <p className="p-4 text-gray-400 text-sm">No new alerts.</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="p-3 border-b border-gray-700 flex justify-between items-center hover:bg-gray-700/50 transition">
                                    <p className="text-sm text-white">
                                        <Clock className="inline w-3 h-3 mr-1 text-yellow-400" /> {n.message}
                                    </p>
                                    <button onClick={() => clearNotification(n.id)} className="text-gray-400 hover:text-white transition">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        );
    };

    const OrderCard = ({ order }) => {
        const [isExpanded, setIsExpanded] = useState(false);
        const { items, table_number, total_price, status, created_at } = order;
        const creationTime = new Date(created_at).toLocaleTimeString();
        const customerId = order.user_id.substring(0, 8); // Display first 8 chars of UID

        const actionButton = (currentStatus, nextStatus, label, icon) => (
            <button
                onClick={() => handleStatusUpdate(order.id, nextStatus)}
                className={`flex-1 flex items-center justify-center p-3 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md ${
                    currentStatus === 'completed' || currentStatus === 'cancelled'
                        ? 'bg-gray-600 text-gray-300 cursor-not-allowed opacity-50'
                        : nextStatus === 'preparing' ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : nextStatus === 'ready' ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                disabled={currentStatus === 'completed' || currentStatus === 'cancelled'}
            >
                {icon} {label}
            </button>
        );

        return (
            <div className={`bg-gray-800 p-4 rounded-xl shadow-lg border-l-4 ${status === 'pending' ? 'border-yellow-500' : status === 'ready' ? 'border-green-500' : 'border-purple-600'}`}>
                <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-extrabold text-white mb-1 truncate">
                            Table #{table_number || 'N/A'} - <span className="text-gray-400 font-medium text-sm">Customer: {customerId}</span>
                        </h3>
                        <div className="text-sm text-gray-400 flex items-center mb-2">
                            <Clock className="w-4 h-4 mr-1 text-purple-400" /> {creationTime}
                        </div>
                        <StatusBadge status={status} />
                    </div>
                    <div className="text-right ml-4">
                        <p className="text-2xl font-bold text-pink-400">${total_price?.toFixed(2) || '0.00'}</p>
                        <button className="text-gray-500 hover:text-white transition mt-1">
                            {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="text-lg font-semibold text-white mb-2">Items Ordered:</h4>
                        <ul className="space-y-2">
                            {Array.isArray(items) && items.map((item, index) => (
                                <li key={index} className="flex justify-between items-center text-sm text-gray-300 bg-gray-700/50 p-2 rounded-lg">
                                    <span className="font-semibold text-white">{item.name}</span>
                                    <span>Qty: {item.quantity}</span>
                                </li>
                            ))}
                        </ul>

                        <h4 className="text-lg font-semibold text-white mt-4 mb-2">Actions:</h4>
                        <div className="flex space-x-2">
                            {status !== 'preparing' && status !== 'ready' && actionButton(status, 'preparing', 'Start Prep', <ChefHat className="w-4 h-4 mr-2" />)}
                            {status === 'preparing' && actionButton(status, 'ready', 'Mark Ready', <Check className="w-4 h-4 mr-2" />)}
                            {status === 'ready' && actionButton(status, 'completed', 'Mark Completed', <Check className="w-4 h-4 mr-2" />)}
                            {status !== 'completed' && status !== 'cancelled' && actionButton(status, 'cancelled', 'Cancel', <X className="w-4 h-4 mr-2" />)}
                        </div>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-gray-900 text-white">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-gray-800/90 backdrop-blur-sm shadow-xl border-b border-purple-700">
                <div className="max-w-7xl mx-auto p-4 flex justify-between items-center">
                    <h1 className="text-2xl font-extrabold text-white tracking-widest flex items-center">
                        <Bell className="w-6 h-6 mr-2 text-pink-400"/> Sip & Sing DASHBOARD
                    </h1>
                    <div className="flex space-x-3 items-center">
                        <NotificationBell />
                        <button
                            onClick={() => fetchOrdersAndSubscribe()}
                            disabled={refreshing}
                            className={`p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition duration-150 shadow-lg ${refreshing ? 'animate-spin opacity-70' : ''}`}
                            aria-label="Refresh Orders"
                        >
                            <RefreshCw className="w-6 h-6 text-white" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-xl shadow-lg transition duration-300"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 space-y-8">
                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800 p-5 rounded-xl shadow-xl border-l-4 border-yellow-500">
                        <p className="text-sm font-medium text-gray-400">Total Orders</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.totalOrders}</p>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-xl shadow-xl border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-gray-400">Open Orders</p>
                        <p className="text-3xl font-bold text-white mt-1">{stats.openOrders}</p>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-xl shadow-xl border-l-4 border-green-500">
                        <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                        <p className="text-3xl font-bold text-green-400 mt-1">${stats.revenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-800 p-5 rounded-xl shadow-xl border-l-4 border-pink-500">
                        <p className="text-sm font-medium text-gray-400">Staff ID</p>
                        <p className="text-sm font-mono text-white mt-1 truncate">{session?.user?.id || 'N/A'}</p>
                    </div>
                </div>

                {/* Orders List */}
                <h2 className="text-3xl font-extrabold text-white border-b border-purple-700 pb-2">Live Orders</h2>
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="text-center p-10 bg-gray-800 rounded-xl text-gray-500">
                            <ChefHat className="w-12 h-12 mx-auto mb-4" />
                            <p className="text-xl font-semibold">No active orders yet. Take a break!</p>
                        </div>
                    ) : (
                        orders.map(order => (
                            <OrderCard key={order.id} order={order} />
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

// Top-level App component
const App = () => {
    // We pass the session object from StaffAuth down to OrderManager
    return (
        <StaffAuth>
            {(session, handleLogout) => (
                <OrderManager 
                    handleLogout={handleLogout} 
                    session={session}
                />
            )}
        </StaffAuth>
    );
};

export default App;

