import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Award, Activity, Download, Loader2, CheckCircle, XCircle, ArrowUpRight, ArrowDownLeft, Repeat } from 'lucide-react';
import { fetchValidatorByAddress, fetchDelegatorsCount, fetchValidatorUptimeBlocks, fetchValidatorDelegators, fetchValidatorPowerEvents, fetchSlashingInfos, SlashingInfo } from '../services/validatorApi';

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '-' : d.toLocaleString();
}

const ValidatorDetails = () => {
  const { address } = useParams();
  
  const { data: validator, isLoading, error } = useQuery({
    queryKey: ['validator', address],
    queryFn: () => address ? fetchValidatorByAddress(address) : Promise.reject('No address'),
    enabled: !!address,
    retry: 2,
    retryDelay: 1000,
  });

  const { data: delegatorsCount, isLoading: isDelegatorsLoading } = useQuery({
    queryKey: ['delegators', address],
    queryFn: () => address ? fetchDelegatorsCount(address) : Promise.resolve(0),
    enabled: !!address,
  });

  const { data: uptimeBlocks = [], isLoading: isUptimeLoading } = useQuery({
    queryKey: ['uptimeBlocks', validator?.address],
    queryFn: () => validator?.address ? fetchValidatorUptimeBlocks(validator.address) : Promise.resolve([]),
    enabled: !!validator?.address,
    refetchInterval: 5000, // 5 seconds
  });

  const { data: delegators = [], isLoading: isDelegatorsTableLoading } = useQuery({
    queryKey: ['validatorDelegators', validator?.address],
    queryFn: () => validator?.address ? fetchValidatorDelegators(validator.address) : Promise.resolve([]),
    enabled: !!validator?.address,
  });

  const { data: powerEvents = [], isLoading: isPowerEventsLoading } = useQuery({
    queryKey: ['validatorPowerEvents', validator?.address],
    queryFn: () => validator?.address ? fetchValidatorPowerEvents(validator.address) : Promise.resolve([]),
    enabled: !!validator?.address,
  });

  const [slashingInfo, setSlashingInfo] = useState<SlashingInfo | null>(null);

  useEffect(() => {
    const loadSlashing = async () => {
      const infos = await fetchSlashingInfos();
      // Find the info for this validator
      const info = infos.find(i => i.address === validator?.consensusAddress);
      setSlashingInfo(info || null);
    };
    loadSlashing();
  }, [validator?.consensusAddress]);

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

  if (error || !validator) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Validator Not Found</h2>
          <p className="text-gray-400 mb-4">The validator address you're looking for doesn't exist.</p>
          <p className="text-sm text-gray-500 mb-4">Address: {address}</p>
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

        {/* Addresses Section */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <h3 className="text-xl font-semibold text-white mb-6">Addresses</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <span className="text-gray-400">Address</span>
              <div className="text-white font-mono break-all">
                {validator.accountAddress || '—'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">EVM</span>
              <div className="text-white font-mono break-all">
                {validator.evmAddress || '—'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Operator</span>
              <div className="text-white font-mono break-all">
                {validator.address || '—'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">Consensus</span>
              <div className="text-white font-mono break-all">
                {validator.consensusAddress || '—'}
              </div>
            </div>
            <div>
              <span className="text-gray-400">HEX</span>
              <div className="text-white font-mono break-all">
                {validator.hexAddress || '—'}
              </div>
            </div>
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
            <div>
              <p className="text-sm text-gray-400 mb-1">Uptime</p>
              {/* Last 60 blocks uptime percentage */}
              <p className="text-3xl font-bold text-white mb-2">
                {isUptimeLoading || uptimeBlocks.length === 0
                  ? '—'
                  : `${(
                      (uptimeBlocks.slice(0, 60).filter(b => b.signed).length / Math.min(60, uptimeBlocks.length)) * 100
                    ).toFixed(0)}%`}
              </p>
              {/* Signed/Missed blocks count */}
              {!(isUptimeLoading || uptimeBlocks.length === 0) && (
                <div className="flex gap-4 mb-2">
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    Signed: {uptimeBlocks.slice(0, 60).filter(b => b.signed).length}
                  </span>
                  <span className="flex items-center gap-1 text-red-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    Missed: {uptimeBlocks.slice(0, 60).filter(b => !b.signed).length}
                  </span>
                </div>
              )}
              {/* Uptime grid */}
              <div className="grid grid-cols-12 grid-rows-5 gap-1 mb-4" style={{maxWidth: 'fit-content'}}>
                {isUptimeLoading ? (
                  Array.from({ length: 60 }).map((_, i) => (
                    <span key={i} className="inline-block w-3 h-3 rounded bg-gray-700 animate-pulse" />
                  ))
                ) : (
                  uptimeBlocks.slice(0, 60).map((block, i) => (
                    <span
                      key={block.height}
                      title={`Block ${block.height}: ${block.signed ? 'Signed' : 'Missed'}`}
                      className={`inline-block w-3 h-3 rounded ${block.signed ? 'bg-green-400' : 'bg-red-400'}`}
                    />
                  ))
                )}
              </div>
              {/* All-time signed/missed blocks */}
              {(validator.successBlocks !== undefined && validator.missedBlocks !== undefined) && (
                <div className="flex gap-4 mb-2">
                  <span className="flex items-center gap-1 text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    All time signed: {validator.successBlocks.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-red-400 text-sm">
                    <XCircle className="w-4 h-4" />
                    All time missed: {validator.missedBlocks.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400">
                <span>All time uptime</span>
                <span className="text-white">{(validator.uptime * 100).toFixed(1)}%</span>
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
                <p className="text-2xl font-bold text-white">
                  {isDelegatorsLoading ? 'Loading...' : (delegatorsCount === 0 ? 'No delegators' : delegatorsCount)}
                </p>
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
                <span className="text-white">
                  {isDelegatorsLoading ? 'Loading...' : (delegatorsCount === 0 ? 'No delegators' : delegatorsCount)}
                </span>
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
            </div>
          </Card>
        </div>

        {/* Commission Info Section */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Commission Info</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Current Rate</span>
              <span className="text-white">{validator.commission.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Rate</span>
              <span className="text-white">{validator.maxCommissionRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Max Change Rate</span>
              <span className="text-white">{validator.maxChangeRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Updated</span>
              <span className="text-white">{formatDate(validator.commissionUpdateTime)}</span>
            </div>
          </div>
        </Card>

        {/* Delegators Table Section */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Delegators</h3>
          {isDelegatorsTableLoading ? (
            <span className="text-gray-400">Loading...</span>
          ) : delegators.length === 0 ? (
            <span className="text-gray-400">No delegators found.</span>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="p-2 text-left">Address</th>
                    <th className="p-2 text-left">Moniker</th>
                    <th className="p-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {delegators.map((d, i) => (
                    <tr key={d.address} className="border-b border-white/5">
                      <td className="p-2 font-mono break-all">{d.address}</td>
                      <td className="p-2">{d.moniker || '-'}</td>
                      <td className="p-2 text-right">{d.amount.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Power Events Table Section */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10 mt-8">
          <h3 className="text-xl font-semibold text-white mb-4">Power Events</h3>
          {isPowerEventsLoading ? (
            <span className="text-gray-400">Loading...</span>
          ) : powerEvents.length === 0 ? (
            <span className="text-gray-400">No power events found.</span>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Delegator</th>
                    <th className="p-2 text-right">Amount</th>
                    <th className="p-2 text-left">Time</th>
                    <th className="p-2 text-left">Tx Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {powerEvents.map((e, i) => (
                    <tr key={e.txHash + i} className="border-b border-white/5">
                      <td className="p-2 capitalize">
                        <span className="inline-flex items-center gap-1">
                          {e.type === 'delegate' && (
                            <span title="Delegate">
                              <ArrowUpRight className="w-4 h-4 text-green-400" />
                            </span>
                          )}
                          {e.type === 'undelegate' && (
                            <span title="Undelegate">
                              <ArrowDownLeft className="w-4 h-4 text-red-400" />
                            </span>
                          )}
                          {e.type === 'redelegate' && (
                            <span title="Redelegate">
                              <Repeat className="w-4 h-4 text-yellow-400" />
                            </span>
                          )}
                          <span className={
                            e.type === 'delegate' ? 'text-green-400' :
                            e.type === 'undelegate' ? 'text-red-400' :
                            e.type === 'redelegate' ? 'text-yellow-400' : 'text-gray-300'
                          }>
                            {e.type}
                          </span>
                        </span>
                      </td>
                      <td className="p-2 font-mono break-all">{e.delegator}</td>
                      <td className="p-2 text-right">{e.amount.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
                      <td className="p-2">{formatDate(e.time)}</td>
                      <td className="p-2 font-mono break-all">
                        {e.txHash ? (
                          <a
                            href={`/transactions/${e.txHash}`}
                            className="text-purple-400 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                            title={e.txHash}
                          >
                            {`${e.txHash.slice(0, 8)}...${e.txHash.slice(-6)}`}
                          </a>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Slashing Info Section */}
        {slashingInfo && (
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10 mt-8">
            <h3 className="text-xl font-semibold text-white mb-4">Slashing Info</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Missed Blocks</span>
                <span className="text-white">{slashingInfo.missed_blocks_counter ?? 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Jailed Until</span>
                <span className="text-white">{slashingInfo.jailed_until}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tombstoned</span>
                <span className="text-white">{slashingInfo.tombstoned ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Start Height</span>
                <span className="text-white">{slashingInfo.start_height}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Index Offset</span>
                <span className="text-white">{slashingInfo.index_offset}</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ValidatorDetails;
