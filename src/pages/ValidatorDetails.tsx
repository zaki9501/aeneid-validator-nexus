import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchValidatorByAddress, fetchDelegatorsCount, fetchValidatorUptimeBlocks, fetchValidatorDelegators, fetchValidatorPowerEvents, fetchSlashingInfos, SlashingInfo, fetchValidatorSigningInfo, fetchEvmAddressInfo } from '../services/validatorApi';

// API function to get total network blocks for a specific time period
const fetchNetworkBlocksForPeriod = async (startTime: Date, endTime: Date) => {
  try {
    // This should call your network API to get total blocks generated in the time period
    const response = await fetch(`/api/blocks?startTime=${startTime.toISOString()}&endTime=${endTime.toISOString()}`);
    if (!response.ok) throw new Error('Failed to fetch network blocks');
    const data = await response.json();
    return data.totalBlocks || 0;
  } catch (error) {
    console.error('Error fetching network blocks:', error);
    return 0;
  }
};

// API function to get hourly network blocks
const fetchHourlyNetworkBlocks = async (hour: number, date: Date) => {
  const startTime = new Date(date);
  startTime.setHours(hour, 0, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(hour, 59, 59, 999);
  
  return await fetchNetworkBlocksForPeriod(startTime, endTime);
};

// API function to get daily network blocks
const fetchDailyNetworkBlocks = async (date: Date) => {
  const startTime = new Date(date);
  startTime.setHours(0, 0, 0, 0);
  
  const endTime = new Date(date);
  endTime.setHours(23, 59, 59, 999);
  
  return await fetchNetworkBlocksForPeriod(startTime, endTime);
};

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

  const { data: evmAddressInfo, isLoading: isEvmAddressLoading } = useQuery({
    queryKey: ['evmAddressInfo', validator?.evmAddress],
    queryFn: () => validator?.evmAddress ? fetchEvmAddressInfo(validator.evmAddress) : Promise.resolve({ totalTransactions: 0, totalGasUsage: 0, totalCoinBalance: '0' }),
    enabled: !!validator?.evmAddress,
  });

  const [slashingInfo, setSlashingInfo] = useState<SlashingInfo | null>(null);
  const [lastSignedBlock, setLastSignedBlock] = useState<string>('—');



  useEffect(() => {
    const loadSlashing = async () => {
      const infos = await fetchSlashingInfos();
      // Find the info for this validator
      const info = infos.find(i => i.address === validator?.consensusAddress);
      setSlashingInfo(info || null);
    };
    loadSlashing();
  }, [validator?.consensusAddress]);

  // Get last signed block from uptime blocks
  useEffect(() => {
    if (uptimeBlocks.length > 0) {
      const signedBlocks = uptimeBlocks.filter(block => block.signed);
      if (signedBlocks.length > 0) {
        const lastBlock = signedBlocks[signedBlocks.length - 1];
        setLastSignedBlock(lastBlock.height.toString());
      }
    }
  }, [uptimeBlocks]);



  if (isLoading) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <Card className="p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm text-center">
          <svg className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <h2 className="text-2xl font-bold text-white mb-4">Loading Validator</h2>
          <p className="text-gray-400">Fetching validator information...</p>
        </Card>
      </div>
    );
  }

  if (error || !validator) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <Card className="p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Validator Not Found</h2>
          <p className="text-gray-400 mb-4">The validator address you're looking for doesn't exist.</p>
          <p className="text-sm text-gray-500 mb-4">Address: {address}</p>
          <Button 
            onClick={() => window.location.href = '/validators'} 
            className="bg-gradient-to-r from-gray-600 to-red-900 hover:from-gray-700 hover:to-red-800"
          >
            Browse All Validators
          </Button>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600/50 text-green-300 border-green-500';
      case 'inactive': return 'bg-gray-600/50 text-gray-400 border-gray-500';
      case 'slashed': return 'bg-gray-800/50 text-gray-300 border-gray-700';
      default: return 'bg-gray-600/50 text-gray-400 border-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-red-900/20 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <Card className="p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm mb-8">
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
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-gray-600 to-red-900 flex items-center justify-center text-white text-2xl font-bold">
                    {validator.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-300 via-red-400 to-red-600 bg-clip-text text-transparent mb-2">{validator.name}</h1>
                  <p className="text-gray-400 font-mono break-all">{validator.address}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <Badge className={getStatusColor(validator.status)}>
                      {validator.status}
                    </Badge>
                    <Badge className="bg-gray-700/50 text-gray-300 border-gray-600">
                      {validator.validatorType}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-gray-600 to-red-900 hover:from-gray-700 hover:to-red-800">
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Download Report
              </Button>
            </div>
          </Card>

          {/* Addresses Section */}
          <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm mb-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
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
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76488 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Signed: {uptimeBlocks.slice(0, 60).filter(b => b.signed).length}
                    </span>
                    <span className="flex items-center gap-1 text-red-400 text-sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.76488 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      All time signed: {validator.successBlocks.toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1 text-red-400 text-sm">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                        <path d="M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 9L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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

            <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-gray-700/50">
                  <svg className="h-6 w-6 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
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



          {/* EVM Address Details Section */}
          <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">EVM Address Details</h3>
            {isEvmAddressLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : !validator.evmAddress ? (
              <span className="text-gray-400">No EVM address available for this validator.</span>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Transactions</p>
                        <p className="text-2xl font-bold text-white">
                          {evmAddressInfo?.totalTransactions?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Total Gas Usage</p>
                        <p className="text-2xl font-bold text-white">
                          {evmAddressInfo?.totalGasUsage?.toLocaleString() || '0'}
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M7 10L12 15L17 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M12 15V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-400">Coin Balance</p>
                        <p className="text-2xl font-bold text-white">
                          {evmAddressInfo?.totalCoinBalance ? 
                            (parseInt(evmAddressInfo.totalCoinBalance) / Math.pow(10, 18)).toFixed(6) : '0.000000'
                          }
                        </p>
                      </div>
                      <div className="w-12 h-12 bg-gray-700/50 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
                  <p className="text-sm text-gray-400 mb-2">EVM Address</p>
                  <p className="font-mono text-white break-all">{validator.evmAddress}</p>
                </div>
              </div>
            )}
          </Card>

          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-6">Validator Information</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Commission Rate</span>
                  <span className="text-white">{validator.commission.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Earliest Signed Block</span>
                  <span className="text-white">{validator.earliestSignedBlock || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Signed Block</span>
                  <span className="text-white">{lastSignedBlock}</span>
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

            <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white mb-6">Uptime Metrics</h3>
              <div className="space-y-4">
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
          <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm mb-8">
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
          <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Delegators</h3>
            {isDelegatorsTableLoading ? (
              <span className="text-gray-400">Loading...</span>
            ) : delegators.length === 0 ? (
              <span className="text-gray-400">No delegators found.</span>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-gray-400 border-b border-gray-700">
                      <th className="p-2 text-left">Address</th>
                      <th className="p-2 text-left">Moniker</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {delegators.map((d, i) => (
                      <tr key={d.address} className="border-b border-gray-800">
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

          {/* Slashing Info Section */}
          {slashingInfo && (
            <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
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

      {/* Custom Animations */}
      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ValidatorDetails;
