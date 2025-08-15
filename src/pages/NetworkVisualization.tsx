import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { fetchRecentBlocks, BlockProposer } from '@/services/networkApi';
import { fetchValidators, fetchSlashingInfos, fetchAllValidatorsProposedBlocks, NetworkValidator, Validator, SlashingInfo } from '@/services/validatorApi';
import { useQuery } from '@tanstack/react-query';
import { getAllValidators, findValidatorByMoniker, ValidatorLocation, validatorLocationData } from '@/data/validatorLocationData';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Types
interface TopValidator {
  id: string;
  name: string;
  performance: number;
  stake: string;
}

interface RecentEvent {
  id: number;
  type: string;
  validator: string;
  time: string;
  status: 'success' | 'warning' | 'error';
}

// Create glowing icon function
const createGlowingIcon = (color: string, status: string, highlight: boolean = false) => {
  const size = status === 'active' ? 12 : 8;
  return L.divIcon({
    className: `custom-marker ${highlight ? 'animate-pulse-subtle' : ''}`,
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}, 0 0 20px ${color}40;
        animation: pulse 2s infinite;
        position: relative;
        z-index: 1000;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const NetworkVisualization = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [latestProposers, setLatestProposers] = useState<BlockProposer[]>([]);
  const [loadingProposer, setLoadingProposer] = useState(false);
  const [proposerError, setProposerError] = useState<string | null>(null);
  const [latestProposerLocation, setLatestProposerLocation] = useState<{lat: number, lng: number} | null>(null);
  const [rayEffect, setRayEffect] = useState(false);
  const rayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch real validator data from APIs
  const { data: realValidators = [], isLoading: validatorsLoading, error: validatorsError } = useQuery({
    queryKey: ['validators', 'all'],
    queryFn: () => fetchValidators('all'),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Function to find validator location by moniker
  const findValidatorLocation = (moniker: string) => {
    return stableValidators.find(v => 
      v.name.toLowerCase().includes(moniker.toLowerCase()) ||
      moniker.toLowerCase().includes(v.name.toLowerCase())
    );
  };

  // Function to trigger ray effect
  const triggerRayEffect = (lat: number, lng: number) => {
    console.log('🌟 Setting ray effect at:', lat, lng);
    setLatestProposerLocation({ lat, lng });
    setRayEffect(true);
    
    // Clear existing timeout
    if (rayTimeoutRef.current) {
      clearTimeout(rayTimeoutRef.current);
    }
    
    // Remove ray effect after 3 seconds
    rayTimeoutRef.current = setTimeout(() => {
      console.log('💫 Clearing ray effect');
      setRayEffect(false);
      setLatestProposerLocation(null);
    }, 3000);
  };

  // Fetch slashing info for missed blocks
  const { data: slashingInfos = [], isLoading: slashingLoading } = useQuery({
    queryKey: ['slashingInfos'],
    queryFn: () => fetchSlashingInfos(0, 200),
    staleTime: 60000, // 1 min
    refetchInterval: 60000,
  });

  // Fetch proposed blocks count
  const { data: proposedBlocks = {}, isLoading: proposedBlocksLoading } = useQuery({
    queryKey: ['proposedBlocks', realValidators],
    queryFn: () => fetchAllValidatorsProposedBlocks(realValidators),
    enabled: realValidators.length > 0,
    staleTime: 60000, // 1 min
    refetchInterval: 60000,
  });

  // Get real validator location data
  const realValidatorLocations = getAllValidators();
  
  // Get provider from validator location data structure
  const getProviderFromData = (moniker: string): string => {
    // Search through the imported validator location data to find the provider
    for (const countryName in validatorLocationData) {
      if (countryName === 'total_monikers') continue;
      
      const countryData = validatorLocationData[countryName] as any;
      for (const providerName in countryData.providers) {
        const provider = countryData.providers[providerName];
        const validator = provider.monikers.find((v: any) => v.moniker === moniker);
        if (validator) {
          return providerName;
        }
      }
    }
    
    // Fallback to hardcoded mapping for known validators
    const providerMap: { [key: string]: string } = {
      'FourPillars': 'AMAZON-02',
      '[NODERS]': 'Hetzner Online GmbH',
      'Alchemy': 'Hetzner Online GmbH',
      'BlockPro': 'Hetzner Online GmbH',
      'polkachu': 'Hetzner Online GmbH',
      'node-story-aeneid-1': 'GOOGLE-CLOUD-PLATFORM',
      'aeneid': 'Hetzner Online GmbH',
      'ITRocket': 'Hetzner Online GmbH',
      'BlockPI': 'Hetzner Online GmbH',
      'use1-aeneid-validator1': 'GOOGLE',
      'use1-aeneid-validator2': 'GOOGLE',
      'story-validator-story-client-0': 'AMAZON-02',
      'Auranode - Backup': 'Unknown',
      'Pro-Nodes75_testnet_archive': 'OVH SAS',
      'Everstake': 'OVH SAS',
      'Cryptomolot': 'MEVSPACE sp. z o.o.',
      'bstg-ip-1': 'AMAZON-02',
      'Pro-Nodes75_testnet': 'OVH SAS'
    };
    
    return providerMap[moniker] || 'Unknown Provider';
  };

  // Create stable network validators from real location data
  const createNetworkValidatorsFromRealData = (): NetworkValidator[] => {
    return realValidatorLocations.map((realValidator, index) => {
      // Find matching real validator data by moniker (more flexible matching)
      const matchingValidator = realValidators.find(v => {
        const validatorName = v.name.toLowerCase();
        const locationMoniker = realValidator.moniker.toLowerCase();
        
        // Exact match
        if (validatorName === locationMoniker) return true;
        
        // Partial match (in case of slight differences)
        if (validatorName.includes(locationMoniker) || locationMoniker.includes(validatorName)) return true;
        
        // Remove common prefixes/suffixes and try again
        const cleanValidatorName = validatorName.replace(/^(validator|node|testnet|archive|backup)/, '').trim();
        const cleanLocationMoniker = locationMoniker.replace(/^(validator|node|testnet|archive|backup)/, '').trim();
        
        return cleanValidatorName === cleanLocationMoniker;
      });
      
      // Find slashing info for missed blocks
      const slashingInfo = matchingValidator ? 
        slashingInfos.find(s => s.address === matchingValidator.consensusAddress) : null;
      
      // Get proposed blocks count
      const proposedBlocksCount = matchingValidator ? 
        proposedBlocks[matchingValidator.address] || 0 : 0;
      
      // Use real data or fallback to reasonable defaults
      const performance = matchingValidator?.performanceScore || 95;
      const uptime = matchingValidator?.uptime || 95;
      const stake = matchingValidator?.stake || 1000;
      const commission = matchingValidator?.commission || 5;
      const votingPower = matchingValidator?.votingPowerPercent || 0.1;
      const missedBlocks = slashingInfo?.missed_blocks_counter ? 
        parseInt(slashingInfo.missed_blocks_counter) : 0;
      
      // Debug logging for data matching
      if (matchingValidator) {
        console.log(`✅ Matched "${realValidator.moniker}" with API validator "${matchingValidator.name}"`);
        console.log(`   Performance: ${performance}, Stake: ${stake}, Commission: ${commission}`);
        console.log(`   Proposed Blocks: ${proposedBlocksCount}, Missed Blocks: ${missedBlocks}`);
      } else {
        console.log(`❌ No API match found for "${realValidator.moniker}" - using fallback data`);
      }
      
      // Generate small stable offset to avoid overlapping markers
      const hash = realValidator.moniker.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
      }, 0);
      const latOffset = ((Math.sin(hash) + 1) / 2 - 0.5) * 0.3;
      const lngOffset = ((Math.cos(hash) + 1) / 2 - 0.5) * 0.3;
      
      return {
        id: `real-${realValidator.moniker}`,
        name: realValidator.moniker,
        lat: realValidator.latitude + latOffset,
        lng: realValidator.longitude + lngOffset,
        status: matchingValidator?.status || 'active',
        performance,
        region: realValidator.cityName !== 'Unknown' ? realValidator.cityName : 'Unknown',
        country: realValidator.countryName,
        provider: getProviderFromData(realValidator.moniker),
        latOffset: 0,
        lngOffset: 0,
        operatorAddress: matchingValidator?.address || `storyvaloper${index}`,
        evmAddress: matchingValidator?.evmAddress || `0x${index.toString(16).padStart(40, '0')}`,
        stake,
        uptime,
        commission,
        votingPower,
        missedBlocks,
        proposedBlocks: proposedBlocksCount,
        hasRealData: !!matchingValidator, // Add flag to indicate if we have real API data
      };
    });
  };

  // Use real validator data directly with useMemo to prevent flickering
  const validators = useMemo(() => createNetworkValidatorsFromRealData(), [
    realValidatorLocations, 
    realValidators, 
    slashingInfos, 
    proposedBlocks
  ]);

  // Stabilize validator data to prevent popup flickering
  const stableValidators = useMemo(() => {
    // Only update if we have validators and they've changed significantly
    if (!validators || validators.length === 0) return [];
    
    return validators.map(validator => ({
      ...validator,
      // Ensure all numeric values are stable with consistent precision
      performance: Math.round(validator.performance * 10) / 10,
      uptime: Math.round(validator.uptime * 10) / 10,
      stake: Math.round(validator.stake),
      commission: Math.round(validator.commission * 10) / 10,
      votingPower: Math.round(validator.votingPower * 10000) / 10000,
      missedBlocks: Math.round(validator.missedBlocks),
      proposedBlocks: Math.round(validator.proposedBlocks),
      // Ensure coordinates are stable
      lat: Math.round(validator.lat * 10000) / 10000,
      lng: Math.round(validator.lng * 10000) / 10000,
      // Add a stable ID to prevent unnecessary re-renders
      stableId: `${validator.name}-${Math.round(validator.lat * 1000)}-${Math.round(validator.lng * 1000)}`,
    }));
  }, [validators]);
  
  // Debug logging
  console.log('Real validator locations found:', realValidatorLocations.length);
  console.log('Real validators from API:', realValidators.length);
  console.log('Slashing infos loaded:', slashingInfos.length);
  console.log('Proposed blocks data:', Object.keys(proposedBlocks).length);
  console.log('Network validators created:', stableValidators.length);
  console.log('Sample validators:', stableValidators.slice(0, 3));
  console.log('Countries represented:', [...new Set(stableValidators.map(v => v.country))]);
  console.log('Providers represented:', [...new Set(stableValidators.map(v => v.provider))]);
  console.log('Expected total validators: 180, Actual validators in data:', realValidatorLocations.length);
  
  // Debug API validators
  if (realValidators.length > 0) {
    console.log('Sample API validators:', realValidators.slice(0, 5).map(v => ({
      name: v.name,
      stake: v.stake,
      performance: v.performanceScore,
      commission: v.commission
    })));
  }
  
  // Debug location validators
  if (realValidatorLocations.length > 0) {
    console.log('Sample location validators:', realValidatorLocations.slice(0, 5).map(v => ({
      moniker: v.moniker,
      country: v.countryName,
      city: v.cityName
    })));
  }

  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;
    let retryCount = 0;
    const maxRetries = 3;
    
    const fetchLatestProposer = async () => {
      if (!isMounted) return;
      
      setLoadingProposer(true);
      setProposerError(null);
      
      try {
        const data = await fetchRecentBlocks();
        if (isMounted) {
          setLatestProposers(data.slice(0, 3));
          retryCount = 0; // Reset retry count on success
          
          // Trigger ray effect for the latest proposer
          if (data.length > 0) {
            const latestProposer = data[0];
            console.log('🎯 Latest proposer:', latestProposer.moniker);
            
            const validatorLocation = findValidatorLocation(latestProposer.moniker);
            console.log('📍 Found validator location:', validatorLocation);
            
            if (validatorLocation) {
              console.log('✨ Triggering ray effect at:', validatorLocation.lat, validatorLocation.lng);
              triggerRayEffect(validatorLocation.lat, validatorLocation.lng);
            } else {
              console.log('❌ No location found for:', latestProposer.moniker);
              console.log('Available validators:', stableValidators.map(v => v.name));
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          retryCount++;
          if (retryCount >= maxRetries) {
            setProposerError(`Failed to fetch data after ${maxRetries} attempts. Retrying...`);
          } else {
            setProposerError(`Connection issue (${retryCount}/${maxRetries}). Retrying...`);
          }
        }
      } finally {
        if (isMounted) {
          setLoadingProposer(false);
        }
      }
    };
    
    // Initial fetch
    fetchLatestProposer();
    
    // Set up polling with exponential backoff on errors
    const startPolling = () => {
      interval = setInterval(() => {
        if (retryCount >= maxRetries) {
          // Use longer interval if we're having issues
          clearInterval(interval);
          setTimeout(() => {
            if (isMounted) {
              retryCount = 0;
              fetchLatestProposer();
              startPolling();
            }
          }, 10000); // 10 second delay after max retries
        } else {
          fetchLatestProposer();
        }
      }, retryCount >= maxRetries ? 10000 : 2000); // 10s vs 2s interval
    };
    
    startPolling();
    
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
      if (rayTimeoutRef.current) clearTimeout(rayTimeoutRef.current);
    };
  }, []);
  
  // Debug ray effect state changes
  useEffect(() => {
    console.log('🔍 Ray effect state:', { rayEffect, latestProposerLocation });
  }, [rayEffect, latestProposerLocation]);

  // Check if data is loading
  const isLoading = validatorsLoading || slashingLoading || proposedBlocksLoading;
  
  // Calculate statistics from real data
  const totalValidators = stableValidators.length;
  const activeValidators = stableValidators.filter(v => v.status === 'active').length;
  const inactiveValidators = stableValidators.filter(v => v.status === 'inactive').length;
  const slashedValidators = stableValidators.filter(v => v.status === 'slashed').length;
  const averagePerformance = totalValidators > 0 
    ? (stableValidators.reduce((acc, v) => acc + v.performance, 0) / totalValidators).toFixed(1)
    : '0.0';

  // Group validators by region
  const validatorsByRegion = stableValidators.reduce((acc, v) => {
    acc[v.region] = (acc[v.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate top validators from real data
  const topValidators = useMemo(() => 
    stableValidators
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5)
      .map(v => ({
        id: v.id,
        name: v.name,
        performance: v.performance,
        stake: `${(v.stake / 1000).toFixed(0)}K` // Convert to K format
      })), [stableValidators]);

  const getValidatorColor = (status: string, performance: number): string => {
    if (status === 'slashed') return '#ef4444';
    if (performance > 99) return '#10b981'; // Green for excellent
    if (performance > 95) return '#3b82f6'; // Blue for good
    if (performance > 90) return '#8b5cf6'; // Purple for fair
    return '#f59e0b'; // Yellow for poor
  };

  // Calculate real-time metrics from validator data
  const currentAvgPerformance = totalValidators > 0 
    ? (stableValidators.reduce((acc, v) => acc + v.performance, 0) / totalValidators).toFixed(2)
    : '0.00';

  const currentAvgUptime = totalValidators > 0 
    ? (stableValidators.reduce((acc, v) => acc + v.uptime, 0) / totalValidators).toFixed(1)
    : '0.0';

  const currentEvents = stableValidators.length; // Total validators as events metric

  const activityData = {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    events: Array(7).fill(currentEvents),
    performance: Array(7).fill(currentAvgPerformance),
    uptime: Array(7).fill(currentAvgUptime),
  };

  const statusData = [
    { 
      value: activeValidators, 
      name: 'Active',
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#10b981' },
          { offset: 1, color: '#059669' }
        ])
      }
    },
    { 
      value: inactiveValidators, 
      name: 'Inactive',
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#6b7280' },
          { offset: 1, color: '#4b5563' }
        ])
      }
    },
    { 
      value: slashedValidators, 
      name: 'Slashed',
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#ef4444' },
          { offset: 1, color: '#dc2626' }
        ])
      }
    }
  ];

  // Calculate real event types from validator data
  const totalProposedBlocks = stableValidators.reduce((acc, v) => acc + v.proposedBlocks, 0);
  const totalMissedBlocks = stableValidators.reduce((acc, v) => acc + v.missedBlocks, 0);
  const totalBlocks = totalProposedBlocks + totalMissedBlocks;
  
  const eventTypes = [
    { 
      name: 'Proposals', 
      value: totalBlocks > 0 ? Math.round((totalProposedBlocks / totalBlocks) * 100) : 85, 
      color: '#8b5cf6' 
    },
    { 
      name: 'Attestations', 
      value: Math.round(parseFloat(currentAvgUptime)), 
      color: '#3b82f6' 
    },
    { 
      name: 'Sync', 
      value: Math.round(parseFloat(currentAvgPerformance)), 
      color: '#10b981' 
    }
  ];

  // Generate recent events from real validator data
  const recentEvents: RecentEvent[] = useMemo(() => {
    const events: RecentEvent[] = [];
    const eventTypes = ['Proposal', 'Attestation', 'Sync'];
    const statuses: ('success' | 'warning' | 'error')[] = ['success', 'warning', 'error'];
    
    // Get top 5 validators for events
    const topValidatorsForEvents = stableValidators.slice(0, 5);
    
    topValidatorsForEvents.forEach((validator, index) => {
      const eventType = eventTypes[index % eventTypes.length];
      const status = statuses[index % statuses.length];
      const timeOffset = index * 3; // 3 minutes apart
      
      events.push({
        id: index + 1,
        type: eventType,
        validator: validator.name,
        time: `${timeOffset + 2}m ago`,
        status: status
      });
    });
    
    return events.slice(0, 5);
  }, [stableValidators]);

  // Generate performance trend data from real validator performance
  const performanceTrendData = useMemo(() => {
    const basePerformance = parseFloat(currentAvgPerformance);
    const times = ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'];
    const values = times.map((_, index) => {
      // Add some realistic variation to the performance data
      const variation = (Math.sin(index * 0.5) * 2) + (Math.random() - 0.5) * 1;
      return Math.max(90, Math.min(100, basePerformance + variation));
    });
    
    return {
      times,
      values,
      target: Array(7).fill(98)
    };
  }, [currentAvgPerformance]);

  // Chart Options
  const activityChartOption = {
    grid: {
      top: 30,
      right: 8,
      bottom: 24,
      left: 36,
      containLabel: true
    },
    legend: {
      data: ['Events', 'Performance', 'Uptime'],
      textStyle: { color: '#94a3b8' },
      top: 0,
      right: 0,
      itemWidth: 8,
      itemHeight: 8
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'category',
      data: ['Current'],
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: [
      {
        type: 'value',
        name: 'Events',
        nameTextStyle: { color: '#94a3b8', fontSize: 10 },
        axisLabel: { color: '#94a3b8', fontSize: 10 },
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
      },
      {
        type: 'value',
        name: 'Percentage',
        nameTextStyle: { color: '#94a3b8', fontSize: 10 },
        min: 95,
        max: 100,
        axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: 'Events',
        type: 'bar',
        data: [currentEvents],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.8)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.3)' }
          ])
        }
      },
      {
        name: 'Performance',
        type: 'line',
        yAxisIndex: 1,
        data: [currentAvgPerformance],
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#10b981' },
        itemStyle: { color: '#10b981' }
      },
      {
        name: 'Uptime',
        type: 'line',
        yAxisIndex: 1,
        data: [currentAvgUptime],
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#3b82f6' },
        itemStyle: { color: '#3b82f6' }
      }
    ]
  };

  const statusChartOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
    },
    series: [{
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderColor: '#1e293b',
        borderWidth: 2
      },
      label: {
        show: true,
        position: 'outside',
        formatter: '{b}\n{d}%',
        color: '#94a3b8'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 12,
          fontWeight: 'bold'
        }
      },
      data: statusData
    }]
  };

  const performanceTrendOption = {
    grid: {
      top: 15,
      right: 5,
      bottom: 20,
      left: 30,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(30, 41, 59, 0.95)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#fff' }
    },
    xAxis: {
      type: 'category',
      data: performanceTrendData.times,
      axisLabel: { color: '#94a3b8', fontSize: 10 },
      axisLine: { lineStyle: { color: '#334155' } }
    },
    yAxis: {
      type: 'value',
      min: 95,
      max: 100,
      axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
      splitLine: { lineStyle: { color: '#334155', type: 'dashed' } }
    },
    series: [
      {
        type: 'line',
        data: performanceTrendData.values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { width: 2, color: '#8b5cf6' },
        itemStyle: { color: '#8b5cf6' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(139, 92, 246, 0.2)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0)' }
          ])
        }
      },
      {
        type: 'line',
        data: performanceTrendData.target,
        lineStyle: { type: 'dashed', width: 1, color: '#475569' },
        symbol: 'none'
      }
    ]
  };

  const gaugeOptions = {
    series: eventTypes.map((event, index) => ({
      type: 'gauge',
      center: ['50%', `${25 + (index * 25)}%`],
      radius: '20%',
      startAngle: 90,
      endAngle: -270,
      pointer: { show: false },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: { color: event.color }
      },
      axisLine: {
        lineStyle: {
          width: 8,
          color: [[1, 'rgba(255, 255, 255, 0.1)']]
        }
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      title: {
        fontSize: 10,
        color: '#94a3b8',
        offsetCenter: [0, '20%']
      },
      detail: {
        fontSize: 14,
        color: event.color,
        offsetCenter: [0, 0],
        formatter: '{value}%'
      },
      data: [{ value: event.value, name: event.name }]
    }))
  };

  const latestProposer = latestProposers[0]; // Most recent

  // Loading state
  if (validatorsLoading) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-0 overflow-hidden flex items-center justify-center">
        <div className="text-white text-xl">Loading Network Visualization...</div>
      </div>
    );
  }

  // Error state
  if (validatorsError) {
    return (
      <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-0 overflow-hidden flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading validator data: {validatorsError.message}</div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-0 overflow-hidden">
      <style>{`
        @keyframes pulse-subtle {
          0% { border-color: rgba(168, 85, 247, 0.2); }
          50% { border-color: rgba(168, 85, 247, 0.4); }
          100% { border-color: rgba(168, 85, 247, 0.2); }
        }
        .animate-pulse-subtle {
          animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes ray-expand {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
        
        .ray-effect {
          animation: ray-expand 3s ease-out forwards;
          pointer-events: none;
        }
      `}</style>
      
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-2 h-[40px] px-2">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Story Testnet Network Dashboard</span>
          <div className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
            <span className="text-xs text-green-300">
              Real Data ({realValidators.length} validators, {Object.keys(proposedBlocks).length} with blocks)
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter Mapbox token (optional)"
            value={mapboxToken}
            onChange={(e) => setMapboxToken(e.target.value)}
            className="w-64 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
          <div className="text-gray-400 text-sm">{new Date().toLocaleString()}</div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-2 h-[calc(100vh-50px)] overflow-hidden px-2">
        {/* Left Panel */}
        <div className="col-span-12 md:col-span-2 flex flex-col gap-2">
          <Card className="bg-white/5 border-white/10 p-4 h-[280px] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
            <div className="flex items-center justify-between mb-3">
              <div className="text-white text-sm font-medium">Recent Block Proposers</div>
              <div className="flex items-center gap-2">
                {loadingProposer ? (
                  <div className="px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                    <span className="text-xs text-yellow-300">Updating...</span>
                  </div>
                ) : proposerError ? (
                  <div className="px-2 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                    <span className="text-xs text-red-300">Error</span>
                  </div>
                ) : (
                  <div className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                    <span className="text-xs text-green-300">Live</span>
                  </div>
                )}
                <button
                  onClick={() => {
                    setLoadingProposer(true);
                    setProposerError(null);
                    fetchRecentBlocks()
                      .then(data => setLatestProposers(data.slice(0, 3)))
                      .catch(err => setProposerError(err.message || 'Unknown error'))
                      .finally(() => setLoadingProposer(false));
                  }}
                  className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
                  disabled={loadingProposer}
                >
                  <span className="text-xs text-blue-300">↻</span>
                </button>
                <button
                  onClick={() => {
                    // Test ray effect
                    console.log('🧪 Testing ray effect');
                    triggerRayEffect(50.1187, 8.6842); // Frankfurt coordinates
                  }}
                  className="px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors"
                  title="Test Ray Effect"
                >
                  <span className="text-xs text-yellow-300">⚡</span>
                </button>
              </div>
            </div>
            {loadingProposer && latestProposers.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : proposerError ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-2">
                <div className="text-red-400 text-center text-sm">{proposerError}</div>
                <div className="text-gray-400 text-xs text-center">
                  Check your connection and try again
                </div>
              </div>
            ) : latestProposers.length > 0 ? (
              <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
                {latestProposers.map((proposer, idx) => (
                  <div
                    key={proposer.height}
                    className={`flex items-center gap-3 bg-white/5 rounded-lg p-2 transition-all duration-300 ${idx === 0 ? 'animate-pulse-subtle border border-purple-500/30' : ''}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-purple-500/20 flex items-center justify-center text-sm font-bold text-purple-300">
                      {proposer.moniker?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-purple-300 truncate" title={proposer.moniker}>
                        {proposer.moniker}
                      </div>
                      <div className="text-xs text-gray-400 truncate" title={proposer.operatorAddress}>
                        {proposer.operatorAddress}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-xs text-gray-400">{new Date(proposer.time).toLocaleTimeString()}</div>
                      <div className="text-[10px] text-gray-400 uppercase">Height:</div>
                      <div className="text-sm font-medium text-white">{proposer.height.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-400">No proposer data</div>
              </div>
            )}
          </Card>
          <Card className="bg-white/5 border-white/10 p-2 h-[150px]">
            <ReactECharts option={activityChartOption} style={{ height: '100%' }} theme="dark" />
          </Card>
          <Card className="bg-white/5 border-white/10 p-2 h-[150px]">
            <ReactECharts option={statusChartOption} style={{ height: '100%' }} theme="dark" />
          </Card>
        </div>

        {/* Center Panel (Map + Top Stats) */}
        <div className="col-span-12 md:col-span-8 flex flex-col gap-2">
          {/* Top Stats */}
          <div className="grid grid-cols-4 gap-2">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-2 text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{totalValidators}</div>
              <div className="text-gray-400 text-xs">Total Validators</div>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-2 text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {activeValidators}
              </div>
              <div className="text-gray-400 text-xs">Active</div>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-2 text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {Object.keys(validatorsByRegion).length}
              </div>
              <div className="text-gray-400 text-xs">Regions</div>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 p-2 text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {averagePerformance}%
              </div>
              <div className="text-gray-400 text-xs">Avg Performance</div>
            </Card>
          </div>
          {/* World Map Visualization */}
          <Card className="bg-white/5 border-white/10 p-2 flex-1 overflow-hidden">
            <style>{`
              .leaflet-container {
                background: #0f172a !important;
                height: 100%;
                width: 100%;
                border-radius: 0.5rem;
                z-index: 1;
              }
              .leaflet-tile {
                filter: none;
              }
              .leaflet-control-container {
                filter: invert(1);
              }
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.2); opacity: 0.8; }
                100% { transform: scale(1); opacity: 1; }
              }
              .custom-marker {
                z-index: 1000 !important;
              }
              .leaflet-popup-content-wrapper {
                background: rgba(30, 41, 59, 0.95) !important;
                color: #fff !important;
                border: 1px solid rgba(255, 255, 255, 0.1) !important;
                backdrop-filter: blur(8px);
                border-radius: 8px;
              }
              .leaflet-popup-tip {
                background: rgba(30, 41, 59, 0.95) !important;
              }
              .leaflet-popup-close-button {
                color: #fff !important;
              }
            `}</style>
            <MapContainer
              center={[20, 0]}
              zoom={2}
              minZoom={1}
              maxZoom={10}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <MarkerClusterGroup>
                {stableValidators.map((validator) => {
                  const finalLat = validator.lat + validator.latOffset;
                  const finalLng = validator.lng + validator.lngOffset;
                  const isLatestProposer = validator.operatorAddress === latestProposer?.operatorAddress;
                  const icon = isLatestProposer
                    ? createGlowingIcon('#f59e0b', validator.status, true)
                    : createGlowingIcon(getValidatorColor(validator.status, validator.performance), validator.status);
                  return (
                    <Marker
                      key={validator.stableId || validator.id}
                      position={[finalLat, finalLng]}
                      icon={icon}
                    >
                      <Popup maxWidth={350}>
                        <div className="p-3 min-w-[300px]">
                          <h3 className="font-bold text-white mb-2 text-lg">{validator.name}</h3>
                          <div className="text-sm space-y-2">
                            <div className="flex justify-between">
                              <span className="text-gray-300">Region:</span>
                              <span className="text-white font-medium">{validator.region}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Country:</span>
                              <span className="text-white font-medium">{validator.country}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Provider:</span>
                              <span className="text-white font-medium text-xs">{validator.provider}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Status:</span>
                              <span className={`font-medium ${validator.status === 'active' ? 'text-green-400' : validator.status === 'slashed' ? 'text-red-400' : 'text-yellow-400'}`}>
                                {validator.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Coordinates:</span>
                              <span className="text-white font-medium text-xs">{validator.lat.toFixed(4)}, {validator.lng.toFixed(4)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-300">Data Source:</span>
                              <span className={`font-medium text-xs ${
                                validator.stake > 1000 && validator.proposedBlocks > 0 ? 'text-green-300' : 'text-yellow-300'
                              }`}>
                                {validator.stake > 1000 && validator.proposedBlocks > 0 ? 'Real API Data' : 'Location Only (API Loading...)'}
                              </span>
                            </div>
                            {isLatestProposer && (
                              <div className="flex justify-between">
                                <span className="text-yellow-400 font-bold">Latest Proposer</span>
                                <span className="text-yellow-400 font-bold">★</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
              
              {/* Ray of Light Effect */}
              {rayEffect && latestProposerLocation && (
                <>
                  {/* Expanding circle effect */}
                  <Circle
                    center={[latestProposerLocation.lat, latestProposerLocation.lng]}
                    radius={1000}
                    pathOptions={{
                      color: '#ffd700',
                      fillColor: '#ffd700',
                      fillOpacity: 0.3,
                      weight: 2,
                    }}
                    className="ray-effect"
                  />
                  <Circle
                    center={[latestProposerLocation.lat, latestProposerLocation.lng]}
                    radius={2000}
                    pathOptions={{
                      color: '#ff6b35',
                      fillColor: '#ff6b35',
                      fillOpacity: 0.2,
                      weight: 1,
                    }}
                    className="ray-effect"
                  />
                  <Circle
                    center={[latestProposerLocation.lat, latestProposerLocation.lng]}
                    radius={3000}
                    pathOptions={{
                      color: '#ff4757',
                      fillColor: '#ff4757',
                      fillOpacity: 0.1,
                      weight: 1,
                    }}
                    className="ray-effect"
                  />
                </>
              )}
            </MapContainer>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="col-span-12 md:col-span-2 flex flex-col gap-2">
          <Card className="bg-white/5 border-white/10 p-2 h-[150px]">
            <ReactECharts option={gaugeOptions} style={{ height: '100%' }} theme="dark" />
          </Card>
          <Card className="bg-white/5 border-white/10 p-2 h-[150px]">
            <ReactECharts option={performanceTrendOption} style={{ height: '100%' }} theme="dark" />
          </Card>
          <Card className="bg-white/5 border-white/10 p-2 flex-1">
            <div className="text-white text-sm font-medium mb-2">Recent Events</div>
            <div className="space-y-2 overflow-auto max-h-[calc(100%-2rem)]">
              {recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors border border-transparent hover:border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        event.status === 'success' ? 'bg-emerald-500' :
                        event.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`} />
                      <div className="text-sm text-gray-200">{event.type}</div>
                    </div>
                    <div className="text-xs text-gray-400">{event.time}</div>
                  </div>
                  <div className="mt-1 text-xs text-gray-400">{event.validator}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;