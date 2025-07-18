
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Shield, Clock, Users, ChefHat } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import TableGrid from './TableGrid';
import MenuSelection from './MenuSelection';
import AdminOrders from './AdminOrders';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface DashboardProps {
  onLogout: () => void;
  user: SupabaseUser;
}

interface Table {
  id: string;
  table_number: number;
  seats: number;
  status: string;
}

const Dashboard = ({ onLogout, user }: DashboardProps) => {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'main' | 'tables' | 'menu' | 'admin'>('main');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    fetchUserProfile();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
      
      setUserProfile(data);
    } catch (error) {
      console.error('Profile fetch error:', error);
    }
  };

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
    onLogout();
  };

  const handleSelectTable = (table: Table) => {
    setSelectedTable(table);
    setCurrentView('menu');
  };

  const handleOrderComplete = () => {
    setCurrentView('main');
    setSelectedTable(null);
    toast({
      title: "Order Completed!",
      description: "The order has been placed successfully.",
    });
  };

  const handleBackToTables = () => {
    setCurrentView('tables');
    setSelectedTable(null);
  };

  const token = localStorage.getItem('authToken');
  const userData = token ? JSON.parse(atob(token.split('.')[1])) : null;

  // Determine if user is admin
  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Restaurant Management</h1>
            <p className="text-gray-300">
              Welcome, {userProfile?.full_name || user.email}! 
              {userProfile?.role && (
                <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-300 rounded text-sm">
                  {userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {currentView !== 'main' && (
              <Button
                onClick={() => setCurrentView('main')}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <User className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {currentView === 'main' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card 
                className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                onClick={() => setCurrentView('tables')}
              >
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Users className="w-5 h-5 mr-2" />
                    Table Management
                  </CardTitle>
                  <CardDescription className="text-gray-300">
                    View tables and place orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">
                    View Tables
                  </Button>
                </CardContent>
              </Card>

              {(isAdmin || !userProfile) && (
                <Card 
                  className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                  onClick={() => setCurrentView('admin')}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center text-white">
                      <ChefHat className="w-5 h-5 mr-2" />
                      Admin Orders
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      Manage active orders and kitchen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      View Orders
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Card className="backdrop-blur-sm bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <User className="w-5 h-5 mr-2" />
                    User Info
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-gray-300">
                      <span className="font-medium">Email:</span> {user?.email || 'N/A'}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Role:</span> {userProfile?.role?.charAt(0).toUpperCase() + userProfile?.role?.slice(1) || 'Loading...'}
                    </p>
                    <p className="text-gray-300">
                      <span className="font-medium">Status:</span> 
                      <span className="text-green-400 ml-1">Authenticated</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentView === 'tables' && (
          <TableGrid onSelectTable={handleSelectTable} />
        )}

        {currentView === 'menu' && selectedTable && (
          <MenuSelection 
            selectedTable={selectedTable}
            onBack={handleBackToTables}
            onOrderComplete={handleOrderComplete}
          />
        )}

        {currentView === 'admin' && (isAdmin || !userProfile) && (
          <AdminOrders />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
