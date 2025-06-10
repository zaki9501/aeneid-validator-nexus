import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Trophy, Medal, Award } from 'lucide-react';
import { fetchValidators, Validator } from '../services/validatorApi';

const Leaderboard = () => {
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'epoch'>('weekly');
  const [metric, setMetric] = useState<'performance' | 'uptime' | 'rewards' | 'stake'>('performance');
  const [validators, setValidators] = useState<Validator[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const all = await fetchValidators('active');
        setValidators(all);
      } catch (e) {
        setValidators([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const getSortedValidators = () => {
    let sortField: keyof Validator;
    switch (metric) {
      case 'performance': sortField = 'performanceScore'; break;
      case 'uptime': sortField = 'uptime'; break;
      case 'rewards': sortField = 'rewardsEarned'; break;
      case 'stake': sortField = 'stake'; break;
      default: sortField = 'performanceScore';
    }
    return [...validators].sort((a, b) => (b[sortField] as number) - (a[sortField] as number));
  };

  const sortedValidators = getSortedValidators();

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400/20 to-yellow-600/20 border-yellow-400/30';
    if (rank === 2) return 'from-gray-300/20 to-gray-500/20 border-gray-300/30';
    if (rank === 3) return 'from-amber-600/20 to-amber-800/20 border-amber-600/30';
    return 'from-white/5 to-white/10 border-white/10';
  };

  const getMetricValue = (validator: Validator) => {
    switch (metric) {
      case 'performance': return `${validator.performanceScore.toFixed(1)}`;
      case 'uptime': return `${validator.uptime.toFixed(1)}%`;
      case 'rewards': return validator.rewardsEarned.toLocaleString();
      case 'stake': return `${(validator.stake / 1000).toFixed(0)}K`;
      default: return validator.performanceScore.toFixed(1);
    }
  };

  const getMetricLabel = () => {
    switch (metric) {
      case 'performance': return 'Performance Score';
      case 'uptime': return 'Uptime';
      case 'rewards': return 'Rewards Earned';
      case 'stake': return 'Total Stake';
      default: return 'Performance Score';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Validator Leaderboard</h1>
          <p className="text-xl text-gray-300">Top performing validators on Story Protocol Aeneid Testnet</p>
        </div>

        {/* Controls */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div>
              <h3 className="text-white font-medium mb-3">Timeframe</h3>
              <div className="flex gap-2">
                {(['weekly', 'monthly', 'epoch'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    onClick={() => setTimeframe(period)}
                    className={`capitalize ${
                      timeframe === period 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {period}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-medium mb-3">Ranking Metric</h3>
              <div className="flex gap-2">
                {(['performance', 'uptime', 'rewards', 'stake'] as const).map((metricType) => (
                  <Button
                    key={metricType}
                    variant={metric === metricType ? "default" : "outline"}
                    onClick={() => setMetric(metricType)}
                    className={`capitalize ${
                      metric === metricType 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {metricType}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            <Card className="p-6 text-gray-400">Loading...</Card>
          ) : sortedValidators.slice(0, 3).map((validator, index) => {
            const rank = index + 1;
            return (
              <Card 
                key={validator.address} 
                className={`p-6 bg-gradient-to-br ${getRankColor(rank)} backdrop-blur-lg transition-all duration-300 hover:scale-105`}
              >
                <div className="text-center space-y-4">
                  <div className="flex justify-center">
                    {getRankIcon(rank)}
                  </div>
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xl font-bold">
                    {validator.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{validator.name}</h3>
                    <p className="text-sm text-gray-400">{validator.address.slice(0, 10)}...{validator.address.slice(-8)}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-white">{getMetricValue(validator)}</p>
                    <p className="text-sm text-gray-400">{getMetricLabel()}</p>
                  </div>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    {validator.validatorType}
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Full Leaderboard */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Complete Rankings
          </h3>
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-gray-400">Loading...</div>
            ) : sortedValidators.map((validator, index) => {
              const rank = index + 1;
              return (
                <div 
                  key={validator.address}
                  className={`flex items-center justify-between p-4 rounded-lg bg-gradient-to-r ${getRankColor(rank)} hover:scale-[1.02] transition-all duration-200`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10">
                      {getRankIcon(rank)}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                      {validator.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium">{validator.name}</p>
                      <p className="text-sm text-gray-400">{validator.address.slice(0, 10)}...{validator.address.slice(-8)}</p>
                    </div>
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                      {validator.validatorType}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">{getMetricValue(validator)}</p>
                    <p className="text-sm text-gray-400">{getMetricLabel()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Leaderboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {sortedValidators[0] ? getMetricValue(sortedValidators[0]) : 'N/A'}
              </p>
              <p className="text-gray-400">Top {getMetricLabel()}</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {(() => {
                  const values = sortedValidators.map(v => {
                    switch (metric) {
                      case 'performance': return v.performanceScore;
                      case 'uptime': return v.uptime;
                      case 'rewards': return v.rewardsEarned;
                      case 'stake': return v.stake;
                      default: return v.performanceScore;
                    }
                  });
                  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
                  return metric === 'rewards' ? avg.toLocaleString() : 
                         metric === 'stake' ? `${(avg / 1000).toFixed(0)}K` : 
                         avg.toFixed(1);
                })()}
              </p>
              <p className="text-gray-400">Average {getMetricLabel()}</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{sortedValidators.length}</p>
              <p className="text-gray-400">Total Validators</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
