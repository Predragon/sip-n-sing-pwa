import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Clock, Check, X, ChefHat, Bell, RefreshCw, LogOut, Loader, User } from "lucide-react";

// Get environment variables from the build system
const VITE_SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const VITE_SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Component to display configuration errors
const ErrorScreen = () => (
    <div className="min-h-screen flex items-center justify-center p-4 text-white bg-gray-900">
      <div className="w-full max-w-md p-8 rounded-xl shadow-2xl border-2 border-red-500 bg-red-900/90">
        <h1 className="flex items-center mb-4 text-3xl font-extrabold text-yellow-300">
          <X className="w-6 h-6 mr-3"/> Configuration Failure
        </h1>
        <p className="mb-4 text-lg">
          The application cannot start because the Supabase credentials are missing.
        </p>
        <p className="mt-2 text-sm font-mono opacity-90">
          Please set <code className="block p-2 mt-2 rounded break-words bg-red-800">VITE_SUPABASE_URL</code> and 
          <code className="block p-2 mt-1 rounded break-words bg-red-800">VITE_SUPABASE_ANON_KEY</code> in your environment or <code className="font-semibold">.env.local</code> file for local development.
        </p>
      </div>
    </div>
);


// Function to create the client (called inside components)
const getSupabaseClient = () => {
    // Return null if configuration is missing, letting the components handle the ErrorScreen
    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
        return null;
    }
    return createClient(VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY);
};

// State Management for Staff Authentication
const StaffAuth = ({ children }) => {
    // Initialize client once per component mount using useMemo
    const supabase = useMemo(() => {
        console.log("StaffAuth: 1. Attempting to initialize Supabase client...");
        return getSupabaseClient();
    }, []); 
    
    // Safety check: If client failed to initialize (local dev), show error.
    if (!supabase) {
        console.error("StaffAuth: 2. Supabase client is NULL. Rendering ErrorScreen.");
        return <ErrorScreen />;
    }
    
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

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsLoading(false);
        });

        return () => {
            if (authListener) authListener.unsubscribe();
        };
    }, [supabase]); 

    const handleLogin = useCallback(async (email, password) => {
        setError(null);
        setIsLoading(true);
        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password,
            });

            if (authError) {
                throw new Error(authError.message);
            }
        } catch (e) {
            console.error("Login error:", e.message);
            setError("Login failed. Please check email/password and ensure the user exists.");
        } finally {
            setIsLoading(false);
        }
    }, [supabase]); 

    const handleLogout = useCallback(async () => {
        await supabase.auth.signOut();
    }, [supabase]); 
    
    // Pass the session and handlers down to children
    const authContextValue = useMemo(() => ({
        session,
        isLoading,
        error,
        handleLogin,
        handleLogout,
    }), [session, isLoading, error, handleLogin, handleLogout]);


    if (isLoading) {
        console.log("StaffAuth: 3. isLoading is TRUE. Rendering Loading screen.");
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-900">
                <Loader className="w-10 h-10 mb-4 animate-spin text-purple-400" />
                <p>Checking staff credentials...</p>
            </div>
        );
    }

    if (!session || !session.user) {
        console.log("StaffAuth: 4. No active session found. Rendering LoginScreen.");
        return <LoginScreen handleLogin={handleLogin} error={error} isLoading={isLoading} />;
    }
    
    console.log("StaffAuth: 5. Session ACTIVE. Rendering OrderManager.");
    return children({ session, handleLogout, supabase });
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
        <div className="flex items-center justify-center min-h-screen p-4 text-white bg-gray-900">
            <div className="w-full max-w-md p-8 rounded-2xl shadow-2xl backdrop-blur-sm bg-purple-800/60 border border-pink-500/50">
                <h2 className="flex items-center justify-center mb-6 text-3xl font-bold text-center text-white">
                    <User className="w-6 h-6 mr-2 text-pink-300"/> Staff Login
                </h2>
                
                {error && (
                    <div className="p-3 mb-4 text-sm text-center text-white rounded-lg bg-red-500 border-l-4 border-red-300">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-semibold text-gray-300" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="staff@sipandsing.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 text-white transition duration-200 rounded-xl bg-purple-900/70 border border-purple-600 focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block mb-2 text-sm font-semibold text-gray-300" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 text-white transition duration-200 rounded-xl bg-purple-900/70 border border-purple-600 focus:ring-pink-500 focus:border-pink-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex items-center justify-center w-full px-4 py-3 font-bold text-white transition duration-300 transform rounded-xl shadow-lg bg-pink-600 hover:bg-pink-700 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
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
const OrderManager = ({ handleLogout, session, supabase }) => {
    
    // Safety check for local dev
    if (!supabase) {
        return <ErrorScreen />;
    }
    
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
    }, [supabase]);

    useEffect(() => {
        // Only run the subscription once the session is available
        if (session) {
            const cleanup = fetchOrdersAndSubscribe();
            return () => {
                 if (cleanup) cleanup();
            };
        }
    }, [session, fetchOrdersAndSubscribe]); 

    // --- State and UI Logic (rest of code) ---
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
                    className="relative p-2 transition duration-150 rounded-full shadow-lg bg-pink-600 hover:bg-pink-700"
                    aria-label="Notifications"
                >
                    <Bell className="w-6 h-6 text-white" />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 block w-3 h-3 text-xs font-bold leading-none text-white bg-red-500 rounded-full ring-2 ring-gray-900 flex items-center justify-center">
                        </span>
                    )}
                </button>
                {isOpen && (
                    <div className="absolute right-0 z-50 w-72 mt-2 rounded-lg shadow-xl bg-gray-800 border border-gray-700">
                        <div className="p-4 text-lg font-semibold text-white border-b border-gray-700">
                            Alerts ({unreadCount})
                        </div>
                        {notifications.length === 0 ? (
                            <p className="p-4 text-sm text-gray-400">No new alerts.</p>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className="flex justify-between items-center p-3 transition border-b border-gray-700 hover:bg-gray-700/50">
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
            <div className={`p-4 rounded-xl shadow-lg bg-gray-800 border-l-4 ${status === 'pending' ? 'border-yellow-500' : status === 'ready' ? 'border-green-500' : 'border-purple-600'}`}>
                <div className="flex justify-between items-start cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                    <div className="flex-1 min-w-0">
                        <h3 className="mb-1 text-xl font-extrabold text-white truncate">
                            Table #{table_number || 'N/A'} - <span className="text-sm font-medium text-gray-400">Customer: {customerId}</span>
                        </h3>
                        <div className="flex items-center mb-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4 mr-1 text-purple-400" /> {creationTime}
                        </div>
                        <StatusBadge status={status} />
                    </div>
                    <div className="ml-4 text-right">
                        <p className="text-2xl font-bold text-pink-400">${total_price?.toFixed(2) || '0.00'}</p>
                        <button className="mt-1 transition text-gray-500 hover:text-white">
                            {isExpanded ? 'Hide Details' : 'View Details'}
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="pt-4 mt-4 border-t border-gray-700">
                        <h4 className="mb-2 text-lg font-semibold text-white">Items Ordered:</h4>
                        <ul className="space-y-2">
                            {Array.isArray(items) && items.map((item, index) => (
                                <li key={index} className="flex justify-between items-center p-2 text-sm text-gray-300 rounded-lg bg-gray-700/50">
                                    <span className="font-semibold text-white">{item.name}</span>
                                    <span>Qty: {item.quantity}</span>
                                </li>
                            ))}
                        </ul>

                        <h4 className="mt-4 mb-2 text-lg font-semibold text-white">Actions:</h4>
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
        <div className="min-h-screen text-white bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-10 shadow-xl backdrop-blur-sm bg-gray-800/90 border-b border-purple-700">
                <div className="flex items-center justify-between p-4 mx-auto max-w-7xl">
                    <h1 className="flex items-center text-2xl font-extrabold tracking-widest text-white">
                        <Bell className="w-6 h-6 mr-2 text-pink-400"/> Sip & Sing DASHBOARD
                    </h1>
                    <div className="flex items-center space-x-3">
                        <NotificationBell />
                        <button
                            onClick={() => fetchOrdersAndSubscribe()}
                            disabled={refreshing}
                            className={`p-2 rounded-full shadow-lg transition duration-150 bg-purple-600 hover:bg-purple-700 ${refreshing ? 'animate-spin opacity-70' : ''}`}
                            aria-label="Refresh Orders"
                        >
                            <RefreshCw className="w-6 h-6 text-white" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-2 font-semibold text-white transition duration-300 rounded-xl shadow-lg bg-red-600 hover:bg-red-700"
                        >
                            <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-4 mx-auto space-y-8 max-w-7xl">
                {/* Stats Section */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="p-5 rounded-xl shadow-xl bg-gray-800 border-l-4 border-yellow-500">
                        <p className="text-sm font-medium text-gray-400">Total Orders</p>
                        <p className="mt-1 text-3xl font-bold text-white">{stats.totalOrders}</p>
                    </div>
                    <div className="p-5 rounded-xl shadow-xl bg-gray-800 border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-gray-400">Open Orders</p>
                        <p className="mt-1 text-3xl font-bold text-white">{stats.openOrders}</p>
                    </div>
                    <div className="p-5 rounded-xl shadow-xl bg-gray-800 border-l-4 border-green-500">
                        <p className="text-sm font-medium text-gray-400">Total Revenue</p>
                        <p className="mt-1 text-3xl font-bold text-green-400">${stats.revenue.toFixed(2)}</p>
                    </div>
                    <div className="p-5 rounded-xl shadow-xl bg-gray-800 border-l-4 border-pink-500">
                        <p className="text-sm font-medium text-gray-400">Staff ID</p>
                        <p className="mt-1 text-sm font-mono text-white truncate">{session?.user?.id || 'N/A'}</p>
                    </div>
                </div>

                {/* Orders List */}
                <h2 className="pb-2 text-3xl font-extrabold text-white border-b border-purple-700">Live Orders</h2>
                <div className="space-y-4">
                    {orders.length === 0 ? (
                        <div className="p-10 text-center text-gray-500 rounded-xl bg-gray-800">
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
    // Check if configuration exists
    if (!VITE_SUPABASE_URL || !VITE_SUPABASE_ANON_KEY) {
        return <ErrorScreen />;
    }

    // Now we know config is present, we can safely proceed.
    return (
        <StaffAuth>
            {({ session, handleLogout, supabase }) => (
                <OrderManager 
                    handleLogout={handleLogout} 
                    session={session}
                    supabase={supabase}
                />
            )}
        </StaffAuth>
    );
};

export default App;

