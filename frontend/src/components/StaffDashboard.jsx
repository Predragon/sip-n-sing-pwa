import React, { useState, useEffect } from 'react';
import { Clock, Check, X, ChefHat, Bell, RefreshCw } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const STATUS_CONFIG = {
  pending: { label: 'New Order', color: 'bg-yellow-500', icon: Bell },
  preparing: { label: 'Preparing', color: 'bg-blue-500', icon: ChefHat },
  ready: { label: 'Ready', color: 'bg-green-500', icon: Check },
  completed: { label: 'Completed', color: 'bg-gray-500', icon: Check },
  cancelled: { label: 'Cancelled', color: 'bg-red-500', icon: X },
};

export default function StaffDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [stats, setStats] = useState({
    pending: 0,
    preparing: 0,
    ready: 0,
    todayTotal: 0,
    todayRevenue: 0,
  });

  useEffect(() => {
    loadOrders();
    
    const subscription = supabase
      .channel('orders')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          playNotificationSound();
          setOrders(prev => [payload.new, ...prev]);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          setOrders(prev => 
            prev.map(order => 
              order.id === payload.new.id ? payload.new : order
            )
          );
        }
      )
      .subscribe();

    return () => subscription.unsubscribe();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders(data || []);
      updateStats(data);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (ordersData = null) => {
    const data = ordersData || orders;
    const today = new Date().toISOString().split('T')[0];
    
    const todayOrders = data.filter(o => 
      o.created_at?.startsWith(today) && o.status !== 'cancelled'
    );

    setStats({
      pending: data.filter(o => o.status === 'pending').length,
      preparing: data.filter(o => o.status === 'preparing').length,
      ready: data.filter(o => o.status === 'ready').length,
      todayTotal: todayOrders.length,
      todayRevenue: todayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
    });
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating order:', err);
      alert('Failed to update order status');
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjGH0fPTgjMGHm7A7+OZURE');
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'active') {
      return ['pending', 'preparing', 'ready'].includes(order.status);
    }
    if (filter === 'completed') {
      return order.status === 'completed';
    }
    return true;
  });

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getTimeSince = (timestamp) => {
    if (!timestamp) return '';
    const minutes = Math.floor((Date.now() - new Date(timestamp)) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 min ago';
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-white">🎤 Staff Dashboard</h1>
            <button
              onClick={loadOrders}
              className="bg-purple-700 text-white p-2 rounded-lg hover:bg-purple-600"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-yellow-500/20 rounded-lg p-3 border border-yellow-500/50">
              <div className="text-yellow-300 text-sm">Pending</div>
              <div className="text-2xl font-bold text-white">{stats.pending}</div>
            </div>
            <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/50">
              <div className="text-blue-300 text-sm">Preparing</div>
              <div className="text-2xl font-bold text-white">{stats.preparing}</div>
            </div>
            <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/50">
              <div className="text-green-300 text-sm">Ready</div>
              <div className="text-2xl font-bold text-white">{stats.ready}</div>
            </div>
            <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/50">
              <div className="text-purple-300 text-sm">Today</div>
              <div className="text-2xl font-bold text-white">{stats.todayTotal}</div>
            </div>
            <div className="bg-pink-500/20 rounded-lg p-3 border border-pink-500/50">
              <div className="text-pink-300 text-sm">Revenue</div>
              <div className="text-2xl font-bold text-white">₱{stats.todayRevenue}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-purple-800/50 p-3">
        <div className="max-w-7xl mx-auto flex gap-2">
          {['active', 'completed', 'all'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-semibold capitalize ${
                filter === f
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                  : 'bg-purple-700 text-purple-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-300 text-lg">No orders</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map(order => {
              const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={order.id}
                  className="bg-gradient-to-br from-purple-800/50 to-indigo-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl p-5"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`${statusConfig.color} text-white px-3 py-1 rounded-full text-sm font-bold inline-flex items-center gap-1`}>
                        <StatusIcon className="w-4 h-4" />
                        {statusConfig.label}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-2">
                        {order.customer_name}
                        {order.table_number && <span className="text-pink-400"> • Table {order.table_number}</span>}
                      </h3>
                      <p className="text-purple-300 text-sm">
                        {formatTime(order.created_at)} ({getTimeSince(order.created_at)})
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-400">₱{order.total}</div>
                    </div>
                  </div>

                  <div className="bg-purple-900/30 rounded-lg p-3 mb-4">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm mb-1">
                        <span className="text-purple-200">{item.quantity}x {item.name}</span>
                        <span className="text-green-400">₱{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'preparing')}
                        className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="flex-1 bg-purple-500 text-white py-2 rounded-lg font-semibold"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}