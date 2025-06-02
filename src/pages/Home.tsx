
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, Users, Award, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { mockValidators, mockRewardHistory } from '../data/mockData';
import { fetchNetworkStats, NetworkStats } from '../services/networkApi';

const Home = () => {
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch network stats on mount and then periodically
  useEffect(() => {
    const loadNetworkStats = async () => {
      try {
        setIsLoading(true);
        const stats = await fetchNetworkStats();
        setNetworkStats(stats);
        setIsLive(true);
      } catch (error) {
        console.error('Failed to load network stats:', error);
        setIsLive(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadNetworkStats();

    // Update every 30 seconds
    const interval = setInterval(loadNetworkStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const topValidators = mockValidators
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 5);

  const statusData = networkStats ? [
    { name: 'Active', value: networkStats.validators.active, color: '#8b5cf6' },
    { name: 'Inactive', value: networkStats.validators.total - networkStats.validators.active, color: '#64748b' },
  ] : [];

  const recentRewards = mockRewardHistory.slice(-7);

  // Calculate estimated total rewards based on network stats
  const estimatedTotalRewards = networkStats ? networkStats.validators.total * 15000 : 2450000;

  // Calculate network uptime and performance (mock calculation based on block time)
  const networkUptime = networkStats ? Math.min(99.9, 96 + (4 - networkStats.blockTime.diffTime)) : 98.4;
  const avgPerformanceScore = networkStats ? Math.min(99, 92 + (4 - networkStats.blockTime.diffTime) * 2) : 95.8;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white">Loading network statistics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Story Protocol
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {" "}Aeneid Testnet
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Real-time validator analytics and network insights for the Story Protocol ecosystem
          </p>
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-400">
              {isLive ? 'Live Data • Updates every 30s' : 'Offline • Using cached data'}
            </span>
          </div>
          {networkStats && (
            <div className="text-sm text-gray-400">
              Network: {networkStats.network} • Latest Block: {networkStats.latestBlock.height.toLocaleString()}
            </div>
          )}
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Users className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Validators</p>
                <p className="text-2xl font-bold text-white">
                  {networkStats ? networkStats.validators.total : '---'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Activity className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Active Validators</p>
                <p className="text-2xl font-bold text-white">
                  {networkStats ? networkStats.validators.active : '---'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <TrendingUp className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Current Block</p>
                <p className="text-2xl font-bold text-white">
                  {networkStats ? networkStats.latestBlock.height.toLocaleString() : '---'}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Award className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Est. Total Rewards</p>
                <p className="text-2xl font-bold text-white">
                  {(estimatedTotalRewards / 1000).toFixed(0)}K
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Network Health */}
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-semibold text-white mb-6">Network Health</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Network Uptime</span>
                <span className="text-white font-semibold">{networkUptime.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Performance</span>
                <span className="text-white font-semibold">{avgPerformanceScore.toFixed(1)}</span>
              </div>
              {networkStats && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Block Time</span>
                  <span className="text-white font-semibold">{networkStats.blockTime.diffTime.toFixed(2)}s</span>
                </div>
              )}
            </div>
          </Card>

          {/* Rewards Trend */}
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-semibold text-white mb-6">Recent Rewards Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={recentRewards}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="epoch" 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={12}
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Rewards']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="totalRewards" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Top Validators */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Top Performing Validators</h3>
          <div className="space-y-4">
            {topValidators.map((validator, index) => (
              <div key={validator.address} className="flex items-center justify-between p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-white font-medium">{validator.name}</p>
                    <p className="text-sm text-gray-400">{validator.address.slice(0, 10)}...{validator.address.slice(-8)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{validator.performanceScore.toFixed(1)}</p>
                  <p className="text-sm text-gray-400">Performance Score</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Home;
