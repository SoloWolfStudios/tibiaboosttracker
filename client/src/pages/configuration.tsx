import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RotateCcw, TestTube } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function Configuration() {
  const queryClient = useQueryClient();
  const [isDirty, setIsDirty] = useState(false);
  
  const { data: botStatus } = useQuery({
    queryKey: ["/api/bot/status"],
  });

  const [config, setConfig] = useState({
    creatureChannel: "#boosted-creatures",
    bossChannel: "#boosted-bosses",
    primaryTime: "10:06",
    backupTime: "10:36",
    apiTimeout: 30,
    logLevel: "INFO",
    autoPost: true,
    embedColor: "#00ff00",
    timezone: "Europe/Berlin",
  });

  const updateConfig = useMutation({
    mutationFn: async (newConfig: any) => {
      return apiRequest("POST", "/api/bot/status", {
        ...botStatus,
        ...newConfig,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bot/status"] });
      toast({
        title: "Configuration Saved",
        description: "Bot configuration has been updated successfully.",
      });
      setIsDirty(false);
    },
    onError: () => {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration changes.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateConfig.mutate(config);
  };

  const handleReset = () => {
    setConfig({
      creatureChannel: "#boosted-creatures",
      bossChannel: "#boosted-bosses",
      primaryTime: "10:06",
      backupTime: "10:36",
      apiTimeout: 30,
      logLevel: "INFO",
      autoPost: true,
      embedColor: "#00ff00",
      timezone: "Europe/Berlin",
    });
    setIsDirty(false);
  };

  const handleConfigChange = (key: string, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleTestConnection = async () => {
    try {
      await apiRequest("POST", "/api/test/creature", { creature: "test" });
      toast({
        title: "Connection Test Successful",
        description: "Bot is able to connect to Discord and TibiaData API.",
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: "Failed to connect to external services.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-surface border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Configuration</h2>
            <p className="text-sm text-slate-400">Manage bot settings and behavior</p>
          </div>
          <div className="flex items-center space-x-4">
            {isDirty && (
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                Unsaved Changes
              </Badge>
            )}
            <Button onClick={handleTestConnection} variant="outline" className="bg-surface-light hover:bg-slate-600">
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
            <Button onClick={handleReset} variant="outline" className="bg-surface-light hover:bg-slate-600">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave} disabled={!isDirty} className="bg-success hover:bg-emerald-600">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Discord Settings */}
          <Card className="bg-surface border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Discord Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="creature-channel" className="text-slate-300">Creature Channel</Label>
                  <Input
                    id="creature-channel"
                    value={config.creatureChannel}
                    onChange={(e) => handleConfigChange("creatureChannel", e.target.value)}
                    className="bg-background border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="boss-channel" className="text-slate-300">Boss Channel</Label>
                  <Input
                    id="boss-channel"
                    value={config.bossChannel}
                    onChange={(e) => handleConfigChange("bossChannel", e.target.value)}
                    className="bg-background border-slate-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="embed-color" className="text-slate-300">Embed Color</Label>
                <Input
                  id="embed-color"
                  type="color"
                  value={config.embedColor}
                  onChange={(e) => handleConfigChange("embedColor", e.target.value)}
                  className="bg-background border-slate-600 text-white h-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Schedule Settings */}
          <Card className="bg-surface border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Schedule Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary-time" className="text-slate-300">Primary Check Time</Label>
                  <Input
                    id="primary-time"
                    type="time"
                    value={config.primaryTime}
                    onChange={(e) => handleConfigChange("primaryTime", e.target.value)}
                    className="bg-background border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="backup-time" className="text-slate-300">Backup Check Time</Label>
                  <Input
                    id="backup-time"
                    type="time"
                    value={config.backupTime}
                    onChange={(e) => handleConfigChange("backupTime", e.target.value)}
                    className="bg-background border-slate-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="timezone" className="text-slate-300">Timezone</Label>
                <Select value={config.timezone} onValueChange={(value) => handleConfigChange("timezone", value)}>
                  <SelectTrigger className="bg-background border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Berlin">Europe/Berlin (CEST)</SelectItem>
                    <SelectItem value="America/New_York">America/New_York (EST)</SelectItem>
                    <SelectItem value="America/Los_Angeles">America/Los_Angeles (PST)</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-post"
                  checked={config.autoPost}
                  onCheckedChange={(checked) => handleConfigChange("autoPost", checked)}
                />
                <Label htmlFor="auto-post" className="text-slate-300">
                  Enable automatic posting
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card className="bg-surface border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">API Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-timeout" className="text-slate-300">API Timeout (seconds)</Label>
                <Input
                  id="api-timeout"
                  type="number"
                  value={config.apiTimeout}
                  onChange={(e) => handleConfigChange("apiTimeout", parseInt(e.target.value))}
                  className="bg-background border-slate-600 text-white"
                  min="5"
                  max="120"
                />
              </div>
              
              <div>
                <Label htmlFor="log-level" className="text-slate-300">Log Level</Label>
                <Select value={config.logLevel} onValueChange={(value) => handleConfigChange("logLevel", value)}>
                  <SelectTrigger className="bg-background border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DEBUG">DEBUG</SelectItem>
                    <SelectItem value="INFO">INFO</SelectItem>
                    <SelectItem value="WARNING">WARNING</SelectItem>
                    <SelectItem value="ERROR">ERROR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Status Information */}
          <Card className="bg-surface border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 text-sm">Bot Status:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${botStatus?.isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-white">{botStatus?.isOnline ? 'Online' : 'Offline'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 text-sm">API Status:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${botStatus?.apiStatus === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                    <span className="text-white">{botStatus?.apiStatus || 'Unknown'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
