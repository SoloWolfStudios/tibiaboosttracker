import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  BarChart3, 
  Zap, 
  Settings, 
  FileText, 
  Cog,
  Activity
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  
  const { data: botStatus } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 30000,
  });

  const navigation = [
    { name: "Dashboard", href: "/", icon: BarChart3 },
    { name: "Boosted Creatures", href: "/creatures", icon: Zap },
    { name: "Configuration", href: "/configuration", icon: Settings },
    { name: "Logs", href: "/logs", icon: FileText },
    { name: "Settings", href: "/settings", icon: Cog },
  ];

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  return (
    <div className="w-64 bg-surface border-r border-slate-700 flex flex-col">
      {/* Logo Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 8.172V5L8 4z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-white">TibiaBot</h1>
            <p className="text-sm text-slate-400">Discord Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start h-12 px-4 text-slate-300 hover:bg-surface-light hover:text-white",
                  isActive && "bg-primary/10 text-primary border border-primary/20"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* Bot Status */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${botStatus?.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <div>
            <p className="text-sm font-medium text-white">
              {botStatus?.isOnline ? 'Bot Online' : 'Bot Offline'}
            </p>
            <p className="text-xs text-slate-400">
              {botStatus?.uptime ? `Uptime: ${formatUptime(botStatus.uptime)}` : 'Uptime: Unknown'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
