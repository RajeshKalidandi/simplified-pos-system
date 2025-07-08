import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Minus, ShoppingCart, ArrowLeft } from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
  notes?: string;
}

interface Table {
  id: string;
  table_number: number;
  seats: number;
  status: string;
}

interface MenuSelectionProps {
  selectedTable: Table;
  onBack: () => void;
  onOrderComplete: () => void;
}

const MenuSelection = ({ selectedTable, onBack, onOrderComplete }: MenuSelectionProps) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .eq('available', true)
        .order('category, name');

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem => 
          cartItem.id === item.id 
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => {
      const existing = prev.find(cartItem => cartItem.id === itemId);
      if (existing && existing.quantity > 1) {
        return prev.map(cartItem => 
          cartItem.id === itemId 
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter(cartItem => cartItem.id !== itemId);
    });
  };

  const updateCartItemNotes = (itemId: string, notes: string) => {
    setCart(prev => prev.map(cartItem => 
      cartItem.id === itemId ? { ...cartItem, notes } : cartItem
    ));
  };

  const getTotalAmount = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Error",
        description: "Please add items to your order",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          table_id: selectedTable.id,
          total_amount: getTotalAmount(),
          notes: orderNotes,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map(item => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        subtotal: item.price * item.quantity,
        notes: item.notes || null
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Update table status to occupied
      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'occupied' })
        .eq('id', selectedTable.id);

      if (tableError) throw tableError;

      toast({
        title: "Order Placed!",
        description: `Order for Table ${selectedTable.table_number} has been submitted successfully.`,
      });

      onOrderComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [...new Set(menuItems.map(item => item.category))];

  if (loading) {
    return <div className="text-white text-center">Loading menu...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" className="bg-white/10 border-white/20 text-white">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tables
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-white">Order for Table {selectedTable.table_number}</h2>
          <p className="text-gray-300">{selectedTable.seats} seats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Menu Items */}
        <div className="lg:col-span-2 space-y-6">
          {categories.map(category => (
            <div key={category}>
              <h3 className="text-xl font-semibold text-white mb-4">{category}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {menuItems
                  .filter(item => item.category === category)
                  .map(item => (
                    <Card key={item.id} className="backdrop-blur-sm bg-white/10 border-white/20">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-white text-lg">{item.name}</CardTitle>
                          <Badge variant="secondary" className="text-green-600 bg-green-100">
                            ${item.price.toFixed(2)}
                          </Badge>
                        </div>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          onClick={() => addToCart(item)}
                          className="w-full"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add to Order
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cart */}
        <div className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/10 border-white/20 sticky top-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No items in cart</p>
              ) : (
                <>
                  {cart.map(item => (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <p className="text-white font-medium">{item.name}</p>
                          <p className="text-gray-300 text-sm">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 p-0"
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-white w-8 text-center">{item.quantity}</span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 p-0"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      <Input
                        placeholder="Special instructions..."
                        value={item.notes || ''}
                        onChange={(e) => updateCartItemNotes(item.id, e.target.value)}
                        className="text-sm bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                      <div className="text-right">
                        <span className="text-white font-medium">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-white/20 pt-4">
                    <Textarea
                      placeholder="Order notes..."
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>
                  
                  <div className="border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center text-lg font-bold text-white">
                      <span>Total:</span>
                      <span>${getTotalAmount().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={submitOrder}
                    disabled={submitting}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {submitting ? 'Placing Order...' : 'Place Order'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MenuSelection;