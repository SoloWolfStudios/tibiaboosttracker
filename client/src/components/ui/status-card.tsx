import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatusCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: "success" | "error" | "warning" | "primary";
  subtitle?: string;
  isLoading?: boolean;
}

const colorClasses = {
  success: "text-green-500 bg-green-500/10",
  error: "text-red-500 bg-red-500/10",
  warning: "text-yellow-500 bg-yellow-500/10",
  primary: "text-blue-500 bg-blue-500/10",
};

export function StatusCard({ title, value, icon: Icon, color, subtitle, isLoading }: StatusCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
          {subtitle && <Skeleton className="h-3 w-24 mt-4" />}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-surface border-slate-700">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {subtitle && (
          <div className="mt-4 flex items-center text-sm">
            <span className="text-slate-400">{subtitle}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
