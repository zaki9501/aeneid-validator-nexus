
import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Award, Activity, Download, Loader2 } from 'lucide-react';
import { fetchValidators } from '../services/validatorApi';

const ValidatorDetails = () => {
  const { address } = useParams();
  
  const { data: validators = [], isLoading, error } = useQuery({
    queryKey: ['validators'],
    queryFn: fetchValidators,
    retry: 2,
    retryDelay: 1000,
  });

  // Try to find validator by address (could be operatorAddress, accountAddress, or consensusAddress)
  const validator = validators.find(v => 
    v.address === address || 
    v.address.toLowerCase() === address?.toLowerCase()
  );

  console.log('Looking for validator with address:', address);
  console.log('Available validators:', validators.map(v => ({ name: v.name, address: v.address })));
  console.log('Found validator:', validator);
  console.log('API Error:', error);

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Loading Validator</h2>
          <p className="text-gray-400">Fetching validator information...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Validators</h2>
          <p className="text-gray-400 mb-4">Failed to fetch validator data. Please try again later.</p>
          <p className="text-sm text-gray-500 mb-4">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <div className="space-y-2">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-purple-600 hover:bg-purple-700 mr-2"
            >
              Retry
            </Button>
            <Button 
              onClick={() => window.location.href = '/validators'} 
              variant="outline"
              className="border-white/20 text-gray-300 hover:bg-white/10"
            >
              Browse All Validators
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!validator) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Validator Not Found</h2>
          <p className="text-gray-400 mb-4">The validator address you're looking for doesn't exist.</p>
          <p className="text-sm text-gray-500 mb-4">Address: {address}</p>
          <p className="text-sm text-gray-400 mb-4">
            Available validators: {validators.length}
          </p>
          <Button 
            onClick={() => window.location.href = '/validators'} 
            className="bg-purple-600 hover:bg-purple-700"
          >
            Browse All Validators
          </Button>
        </Card>
      </div>
    );
  }

  // Mock historical data for charts (API doesn't provide historical data)
  const stakeHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    stake: validator.stake + (Math.random() - 0.5) * (validator.stake * 0.1),
  }));

  const uptimeHistory = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    uptime: Math.max(0.9, Math.min(1, validator.uptime + (Math.random() - 0.5) * 0.05)) * 100,
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'slashed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const rank = validators
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .findIndex(v => v.address === validator.address) + 1;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center space-x-6">
              {validator.logo ? (
                <img 
                  src={validator.logo} 
                  alt={validator.name}
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
                  {validator.name.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{validator.name}</h1>
                <p className="text-gray-400 font-mono break-all">{validator.address}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <Badge className={getStatusColor(validator.status)}>
                    {validator.status}
                  </Badge>
                  <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                    Rank #{rank}
                  </Badge>
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                    {validator.validatorType}
                  </Badge>
                </div>
              </div>
            </div>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Performance Score</p>
                <p className="text-2xl font-bold text-white">{validator.performanceScore.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Uptime</p>
                <p className="text-2xl font-bold text-white">{(validator.uptime * 100).toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Delegators</p>
                <p className="text-2xl font-bold text-white">{validator.delegators}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Rewards</p>
                <p className="text-2xl font-bold text-white">{validator.rewardsEarned.toLocaleString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Stake History */}
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-semibold text-white mb-6">Stake History (30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stakeHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Stake']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="stake" 
                    stroke="#8b5cf6" 
                    fill="url(#stakeGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="stakeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Uptime History */}
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-semibold text-white mb-6">Uptime History (30 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={uptimeHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="day" 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                    domain={[90, 100]}
                    tickFormatter={(value) => `${value.toFixed(0)}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, 'Uptime']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uptime" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-semibold text-white mb-6">Validator Information</h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Commission Rate</span>
                <span className="text-white">{validator.commission.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Joined Epoch</span>
                <span className="text-white">{validator.joinedEpoch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Last Active Epoch</span>
                <span className="text-white">{validator.lastActiveEpoch}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Stake</span>
                <span className="text-white">{validator.stake.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Delegators</span>
                <span className="text-white">{validator.delegators}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-semibold text-white mb-6">Performance Metrics</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Performance Score</span>
                  <span className="text-white">{validator.performanceScore.toFixed(1)}/100</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" 
                    style={{ width: `${validator.performanceScore}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Uptime</span>
                  <span className="text-white">{(validator.uptime * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" 
                    style={{ width: `${validator.uptime * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-gray-400 mb-2">Leaderboard Position</p>
                <p className="text-2xl font-bold text-white">#{rank}</p>
                <p className="text-sm text-gray-400">out of {validators.length} validators</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ValidatorDetails;
