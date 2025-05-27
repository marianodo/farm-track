
import React from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard = ({ icon, title, description, className }: FeatureCardProps) => {
  return (
    <Card className={cn("h-full border-gray-100 transition-all duration-300 hover:shadow-md", className)}>
      <CardContent className="p-6 space-y-4">
        <div className="p-3 rounded-lg inline-block bg-farm-green/10 text-farm-green">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  );
};

export default FeatureCard;
