
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { mockRewardHistory, mockValidators } from '../data/mockData';

const RewardsAnalytics = () => {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartType, setChartType] = useState<'total' | 'individual' | 'distribution'>('total');

  const getFilteredData = () => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    return mockRewardHistory.slice(-days);
  };

  const filteredData = getFilteredData();

  // Individual validator rewards for the selected period
  const validatorRewards = mockValidators.map(validator => ({
    name: validator.name,
    rewards: filteredData.reduce((sum, epoch) => sum + (epoch.validatorRewards[validator.address] || 0), 0),
    color: `hsl(${Math.random() * 360}, 70%, 60%)`,
  })).sort((a, b) => b.rewards - a.rewards);

  // Network growth projection
  const projectionData = Array.from({ length: 30 }, (_, i) => {
    const baseReward = 85000;
    const growth = 1.02; // 2% growth rate
    const randomVariation = 0.9 + Math.random() * 0.2;
    return {
      day: i + 1,
      projected: baseReward * Math.pow(growth, i) * randomVariation,
      actual: i < 15 ? baseReward * Math.pow(growth, i) * randomVariation : null,
    };
  });

  const totalRewards = filteredData.reduce((sum, epoch) => sum + epoch.totalRewards, 0);
  const avgRewardPerEpoch = totalRewards / filteredData.length;
  const rewardGrowth = filteredData.length > 1 ? 
    ((filteredData[filteredData.length - 1].totalRewards - filteredData[0].totalRewards) / filteredData[0].totalRewards) * 100 : 0;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Rewards Analytics</h1>
          <p className="text-xl text-gray-300">Comprehensive rewards tracking and future projections</p>
        </div>

        {/* Controls */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <div className="flex flex-col md:flex-row gap-6 justify-between">
            <div>
              <h3 className="text-white font-medium mb-3">Timeframe</h3>
              <div className="flex gap-2">
                {(['7d', '30d', '90d'] as const).map((period) => (
                  <Button
                    key={period}
                    variant={timeframe === period ? "default" : "outline"}
                    onClick={() => setTimeframe(period)}
                    className={`${
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
              <h3 className="text-white font-medium mb-3">Chart Type</h3>
              <div className="flex gap-2">
                {(['total', 'individual', 'distribution'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={chartType === type ? "default" : "outline"}
                    onClick={() => setChartType(type)}
                    className={`capitalize ${
                      chartType === type 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <DollarSign className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Total Rewards</p>
                <p className="text-2xl font-bold text-white">{(totalRewards / 1000).toFixed(0)}K</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Target className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Avg per Epoch</p>
                <p className="text-2xl font-bold text-white">{(avgRewardPerEpoch / 1000).toFixed(1)}K</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <TrendingUp className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Growth Rate</p>
                <p className="text-2xl font-bold text-white">{rewardGrowth > 0 ? '+' : ''}{rewardGrowth.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <Calendar className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Epochs Tracked</p>
                <p className="text-2xl font-bold text-white">{filteredData.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Chart */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">
            {chartType === 'total' && 'Total Network Rewards'}
            {chartType === 'individual' && 'Top Validator Rewards'}
            {chartType === 'distribution' && 'Rewards Distribution'}
          </h3>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'total' && (
                <AreaChart data={filteredData}>
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
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Total Rewards']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="totalRewards" 
                    stroke="#8b5cf6" 
                    fill="url(#rewardGradient)"
                    strokeWidth={2}
                  />
                  <defs>
                    <linearGradient id="rewardGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              )}

              {chartType === 'individual' && (
                <BarChart data={validatorRewards.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="rgba(255,255,255,0.6)"
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={80}
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
                  <Bar dataKey="rewards" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}

              {chartType === 'distribution' && (
                <PieChart>
                  <Pie
                    data={validatorRewards.slice(0, 8)}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    dataKey="rewards"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                  >
                    {validatorRewards.slice(0, 8).map((entry, index) => (
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
                    formatter={(value: number) => [`${value.toLocaleString()}`, 'Rewards']}
                  />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Future Projections */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Future Rewards Projection</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={projectionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="day" 
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
                  dataKey="actual" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="projected" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-green-500"></div>
              <span className="text-sm text-gray-400">Historical Data</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-purple-500 border-dashed"></div>
              <span className="text-sm text-gray-400">Projected Growth</span>
            </div>
          </div>
        </Card>

        {/* Top Performers */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Top Reward Earners ({timeframe})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {validatorRewards.slice(0, 6).map((validator, index) => (
              <div key={validator.name} className="p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-white font-medium">{validator.name}</p>
                      <p className="text-sm text-gray-400">{validator.rewards.toLocaleString()} rewards</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RewardsAnalytics;
