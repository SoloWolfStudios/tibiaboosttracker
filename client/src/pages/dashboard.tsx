import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusCard } from "@/components/ui/status-card";
import { CreatureCard } from "@/components/ui/creature-card";
import { Activity, Zap, MessageSquare, Clock, RefreshCw, TestTube } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Dashboard() {
  const { data: botStatus, isLoading: statusLoading } = useQuery({
    queryKey: ["/api/bot/status"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/bot/logs"],
    queryFn: async () => {
      const res = await fetch("/api/bot/logs?limit=5");
      return res.json();
    },
  });

  const { data: boostedCreatures, isLoading: creaturesLoading } = useQuery({
    queryKey: ["/api/creatures/boosted"],
  });

  const { data: apiTests, isLoading: testsLoading } = useQuery({
    queryKey: ["/api/tests"],
    queryFn: async () => {
      const res = await fetch("/api/tests?limit=3");
      return res.json();
    },
  });

  const handleForceUpdate = async () => {
    try {
      await apiRequest("POST", "/api/bot/update");
      toast({
        title: "Update Triggered",
        description: "Manual update has been triggered successfully.",
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to trigger manual update.",
        variant: "destructive",
      });
    }
  };

  const handleTestAPI = async () => {
    try {
      await apiRequest("POST", "/api/test/creature", { creature: "ice witch" });
      toast({
        title: "API Test Successful",
        description: "TibiaData API test completed successfully.",
      });
    } catch (error) {
      toast({
        title: "API Test Failed",
        description: "TibiaData API test failed.",
        variant: "destructive",
      });
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getNextServerSave = () => {
    const now = new Date();
    const nextSave = new Date(now);
    nextSave.setHours(10, 0, 0, 0);
    
    if (now.getHours() >= 10) {
      nextSave.setDate(nextSave.getDate() + 1);
    }
    
    const timeDiff = nextSave.getTime() - now.getTime();
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, time: nextSave };
  };

  const nextSave = getNextServerSave();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-surface border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Dashboard Overview</h2>
            <p className="text-sm text-slate-400">Monitor your Tibia Discord bot performance</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={handleForceUpdate} className="bg-primary hover:bg-blue-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Force Update
            </Button>
            <Button onClick={handleTestAPI} variant="outline" className="bg-surface-light hover:bg-slate-600">
              <TestTube className="w-4 h-4 mr-2" />
              Test API
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatusCard
            title="Bot Status"
            value={botStatus?.isOnline ? "Online" : "Offline"}
            icon={Activity}
            color={botStatus?.isOnline ? "success" : "error"}
            subtitle={`Last update: ${botStatus?.lastUpdate ? new Date(botStatus.lastUpdate).toLocaleTimeString() : "Unknown"}`}
            isLoading={statusLoading}
          />
          
          <StatusCard
            title="TibiaData API"
            value={botStatus?.apiStatus || "Unknown"}
            icon={Zap}
            color={botStatus?.apiStatus === "healthy" ? "success" : "warning"}
            subtitle={`Response time: ${botStatus?.apiResponseTime || 0}ms`}
            isLoading={statusLoading}
          />
          
          <StatusCard
            title="Posts Today"
            value={botStatus?.postsToday?.toString() || "0"}
            icon={MessageSquare}
            color="primary"
            subtitle="+2 from yesterday"
            isLoading={statusLoading}
          />
          
          <StatusCard
            title="Next Server Save"
            value={`${nextSave.hours}h ${nextSave.minutes}m`}
            icon={Clock}
            color="warning"
            subtitle={`At ${nextSave.time.toLocaleTimeString()}`}
            isLoading={false}
          />
        </div>

        {/* Current Boosted Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {boostedCreatures?.map((creature: any) => (
            <CreatureCard
              key={creature.id}
              creature={creature}
              type={creature.name.toLowerCase().includes("boss") ? "boss" : "creature"}
              isLoading={creaturesLoading}
            />
          ))}
        </div>

        {/* Recent Activity & API Status */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-surface border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentLogs?.map((log: any) => (
                    <div key={log.id} className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        log.level === "ERROR" ? "bg-red-500" :
                        log.level === "WARNING" ? "bg-yellow-500" :
                        log.level === "INFO" ? "bg-green-500" :
                        "bg-blue-500"
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-white">{log.message}</p>
                        <p className="text-xs text-slate-400">
                          {log.component} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* API Testing */}
          <div>
            <Card className="bg-surface border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">API Testing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {apiTests?.map((test: any) => (
                    <div key={test.id} className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">{test.endpoint}</span>
                      <Badge variant={test.status === "success" ? "default" : "destructive"}>
                        {test.status === "success" ? "200 OK" : "ERROR"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
