import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  className?: string;
  onClick?: () => void;
}

export function StatCard({ title, value, icon: Icon, className, onClick }: StatCardProps) {
  return (
    <Card 
      className={`group transition-colors hover:bg-auxiliary hover:text-white ${onClick ? 'cursor-pointer' : ''} ${className || ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground" />
          <h3 className="text-sm font-medium text-muted-foreground group-hover:text-accent-foreground">{title}</h3>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold group-hover:text-accent-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}