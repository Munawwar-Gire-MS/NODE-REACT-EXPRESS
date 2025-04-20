import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="bg-purple-50 -mx-8 px-8 py-6 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl text-accent font-bold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
}
