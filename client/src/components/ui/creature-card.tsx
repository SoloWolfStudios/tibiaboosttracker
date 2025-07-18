import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, Crown } from "lucide-react";

interface CreatureCardProps {
  creature: {
    id: number;
    name: string;
    race: string;
    hitpoints: number;
    experience: number;
    imageUrl?: string;
    description?: string;
    level?: number;
    armor?: number;
    speed?: number;
    isBoosted?: boolean;
    lastSeen: string;
  };
  type: "creature" | "boss";
  isLoading?: boolean;
}

export function CreatureCard({ creature, type, isLoading }: CreatureCardProps) {
  if (isLoading) {
    return (
      <Card className="bg-surface border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-6 w-16" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-4">
            <Skeleton className="w-16 h-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isCreatureType = type === "creature";
  const title = isCreatureType ? "🌟 BOOSTED CREATURE 🌟" : "👑 BOOSTED BOSS 👑";
  const color = isCreatureType ? "bg-green-500/10 text-green-500" : "bg-orange-500/10 text-orange-500";
  const benefits = isCreatureType 
    ? ["2x EXP", "2x Loot"] 
    : ["Rare Loot", "Boss"];

  return (
    <Card className="bg-surface border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">{title}</CardTitle>
          <Badge className={`${color} border-current/20`}>
            {isCreatureType ? <Star className="w-3 h-3 mr-1" /> : <Crown className="w-3 h-3 mr-1" />}
            Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-start space-x-4">
          {/* Creature Image */}
          <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
            {creature.imageUrl ? (
              <img src={creature.imageUrl} alt={creature.name} className="w-full h-full rounded-lg object-cover" />
            ) : (
              <div className="text-slate-400 text-xs text-center">{creature.name.substring(0, 2)}</div>
            )}
          </div>
          
          <div className="flex-1">
            <h4 className="text-xl font-bold text-white">{creature.name}</h4>
            <p className="text-sm text-slate-400 mb-2">{creature.race}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-400">Hit Points:</span>
                <span className="text-white ml-1">{creature.hitpoints.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-400">Experience:</span>
                <span className="text-white ml-1">{creature.experience.toLocaleString()}</span>
              </div>
              {creature.level && (
                <div>
                  <span className="text-slate-400">Level:</span>
                  <span className="text-white ml-1">{creature.level}</span>
                </div>
              )}
              {creature.armor && (
                <div>
                  <span className="text-slate-400">Armor:</span>
                  <span className="text-white ml-1">{creature.armor}</span>
                </div>
              )}
            </div>
            
            <div className="mt-3 flex items-center space-x-2">
              {benefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className={`${color} border-current/20 text-xs`}>
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Last seen:</span>
            <span className="text-slate-300">{new Date(creature.lastSeen).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
