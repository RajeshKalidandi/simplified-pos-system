import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Clock, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  notes: string | null;
  menu_items: {
    name: string;
    category: string;
  };
}

interface Order {
  id: string;
  total_amount: number;
  status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled';
  notes: string | null;
  created_at: string;
  tables: {
    table_number: number;
    seats: number;
  };
  order_items: OrderItem[];
}

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription for order updates
    const subscription = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        () => {
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          tables (table_number, seats),
          order_items (
            id,
            quantity,
            unit_price,
            subtotal,
            notes,
            menu_items (name, category)
          )
        `)
        .neq('status', 'served')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled', shouldUpdateTable: boolean = false) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) throw error;

      // If marking as served, update table status to available
      if (status === 'served' && shouldUpdateTable) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          const { error: tableError } = await supabase
            .from('tables')
            .update({ status: 'available' })
            .eq('table_number', order.tables.table_number);

          if (tableError) throw tableError;
        }
      }

      toast({
        title: "Success",
        description: `Order status updated to ${status}`,
      });

      fetchOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'preparing':
        return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'ready':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'served':
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'preparing':
        return <RefreshCw className="w-4 h-4" />;
      case 'ready':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return <div className="text-white text-center">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Active Orders</h2>
        <Button onClick={fetchOrders} variant="outline" className="bg-white/10 border-white/20 text-white">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="backdrop-blur-sm bg-white/10 border-white/20">
          <CardContent className="p-8 text-center">
            <p className="text-gray-300">No active orders</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <Card key={order.id} className="backdrop-blur-sm bg-white/10 border-white/20">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-white text-lg">
                    Table {order.tables.table_number}
                  </CardTitle>
                  <Badge 
                    variant="secondary" 
                    className={`${getStatusColor(order.status)} flex items-center gap-1`}
                  >
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm">
                  {new Date(order.created_at).toLocaleTimeString()}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-white font-medium">Items:</h4>
                  {order.order_items.map((item) => (
                    <div key={item.id} className="text-sm">
                      <div className="flex justify-between text-white">
                        <span>{item.quantity}x {item.menu_items.name}</span>
                        <span>${item.subtotal.toFixed(2)}</span>
                      </div>
                      {item.notes && (
                        <p className="text-gray-400 text-xs italic ml-4">
                          Note: {item.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {order.notes && (
                  <div>
                    <h4 className="text-white font-medium text-sm">Order Notes:</h4>
                    <p className="text-gray-300 text-sm italic">{order.notes}</p>
                  </div>
                )}

                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center text-white font-bold">
                    <span>Total:</span>
                    <span>${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {order.status === 'pending' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'preparing')}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Start Preparing
                    </Button>
                  )}
                  
                  {order.status === 'preparing' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'ready')}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Mark Ready
                    </Button>
                  )}
                  
                  {order.status === 'ready' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'served', true)}
                      className="w-full bg-gray-600 hover:bg-gray-700"
                    >
                      Mark Served
                    </Button>
                  )}
                  
                  {order.status !== 'served' && order.status !== 'cancelled' && (
                    <Button 
                      onClick={() => updateOrderStatus(order.id, 'cancelled')}
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/20"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;