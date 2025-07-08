
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, User, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });
    onLogout();
  };

  const token = localStorage.getItem('authToken');
  const userData = token ? JSON.parse(atob(token.split('.')[1])) : null;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Welcome to Dashboard</h1>
            <p className="text-gray-300">You are successfully authenticated!</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  <span className="font-medium">Email:</span> {userData?.email || 'N/A'}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Role:</span> {userData?.role || 'User'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Shield className="w-5 h-5 mr-2" />
                Authentication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="font-medium">Status:</span> 
                  <span className="text-green-400 ml-1">Authenticated</span>
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Token:</span> Valid JWT
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Clock className="w-5 h-5 mr-2" />
                Session Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-gray-300">
                  <span className="font-medium">Login Time:</span> {userData?.iat ? new Date(userData.iat * 1000).toLocaleTimeString() : 'N/A'}
                </p>
                <p className="text-gray-300">
                  <span className="font-medium">Expires:</span> {userData?.exp ? new Date(userData.exp * 1000).toLocaleTimeString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 backdrop-blur-sm bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white">JWT Token (First 100 characters)</CardTitle>
            <CardDescription className="text-gray-300">
              Your authentication token is stored in localStorage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <code className="text-sm text-blue-300 bg-black/20 p-3 rounded block break-all">
              {token ? token.substring(0, 100) + '...' : 'No token found'}
            </code>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
