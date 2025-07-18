import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreatureCard } from "@/components/ui/creature-card";
import { Search, Star, Crown } from "lucide-react";
import { useState } from "react";

export default function Creatures() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: creatures, isLoading } = useQuery({
    queryKey: ["/api/creatures"],
  });

  const { data: boostedCreatures } = useQuery({
    queryKey: ["/api/creatures/boosted"],
  });

  const filteredCreatures = creatures?.filter((creature: any) =>
    creature.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-surface border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Boosted Creatures</h2>
            <p className="text-sm text-slate-400">Manage and monitor boosted creatures and bosses</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search creatures..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-slate-600 text-white"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {/* Current Boosted Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-white">Currently Boosted</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {boostedCreatures?.map((creature: any) => (
              <CreatureCard
                key={creature.id}
                creature={creature}
                type={creature.name.toLowerCase().includes("boss") ? "boss" : "creature"}
                isLoading={isLoading}
              />
            ))}
          </div>
        </div>

        {/* All Creatures Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">All Creatures</h3>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="border-slate-600 text-slate-300">
                {filteredCreatures?.length || 0} creatures
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreatures?.map((creature: any) => (
              <Card key={creature.id} className="bg-surface border-slate-700">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-base">{creature.name}</CardTitle>
                    {creature.isBoosted && (
                      <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                        <Star className="w-3 h-3 mr-1" />
                        Boosted
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">HP:</span>
                      <span className="text-white ml-1">{creature.hitpoints.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">EXP:</span>
                      <span className="text-white ml-1">{creature.experience.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="mt-3 text-xs text-slate-400">
                    Last seen: {new Date(creature.lastSeen).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
