import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Users, Clock } from 'lucide-react';

interface Table {
  id: string;
  table_number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
}

interface TableGridProps {
  onSelectTable: (table: Table) => void;
}

const TableGrid = ({ onSelectTable }: TableGridProps) => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('table_number');

      if (error) throw error;
      setTables(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch tables",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'occupied':
        return 'bg-red-500/20 text-red-700 border-red-500/30';
      case 'reserved':
        return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-700 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <Users className="w-4 h-4" />;
      case 'occupied':
        return <Clock className="w-4 h-4" />;
      case 'reserved':
        return <Clock className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Restaurant Tables</h2>
        <div className="flex gap-2">
          <Badge variant="secondary" className="bg-green-500/20 text-green-700 border-green-500/30">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
            Available
          </Badge>
          <Badge variant="secondary" className="bg-red-500/20 text-red-700 border-red-500/30">
            <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
            Occupied
          </Badge>
          <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-700 border-yellow-500/30">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
            Reserved
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tables.map((table) => (
          <Card 
            key={table.id} 
            className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20 transition-all cursor-pointer"
          >
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="text-2xl font-bold text-white">
                  Table {table.table_number}
                </div>
                
                <Badge 
                  variant="secondary" 
                  className={`${getStatusColor(table.status)} flex items-center gap-1`}
                >
                  {getStatusIcon(table.status)}
                  {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                </Badge>
                
                <div className="text-sm text-gray-300 flex items-center justify-center gap-1">
                  <Users className="w-3 h-3" />
                  {table.seats} seats
                </div>
                
                <Button
                  onClick={() => onSelectTable(table)}
                  disabled={table.status === 'occupied'}
                  className="w-full"
                  variant={table.status === 'available' ? 'default' : 'outline'}
                >
                  {table.status === 'available' ? 'Select Table' : 
                   table.status === 'occupied' ? 'Occupied' : 'Reserved'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default TableGrid;