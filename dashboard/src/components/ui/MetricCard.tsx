
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
  className?: string;
}

const MetricCard = ({ icon, title, value, description, className }: MetricCardProps) => {
  return (
    <Card className={cn("transition-all duration-300 hover:shadow-lg border-gray-100", className)}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-full bg-farm-green/10 text-farm-green">
            {icon}
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">{title}</p>
            <h4 className="text-2xl font-bold tracking-tight">{value}</h4>
            <p className="text-sm text-gray-500">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
