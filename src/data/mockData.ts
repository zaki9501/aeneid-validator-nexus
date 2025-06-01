// Keep existing interfaces for backward compatibility and fallback data
export interface Validator {
  address: string;
  name: string;
  logo?: string;
  stake: number;
  uptime: number;
  performanceScore: number;
  rewardsEarned: number;
  lastActiveEpoch: number;
  status: 'active' | 'inactive' | 'slashed';
  region: string;
  validatorType: 'solo' | 'team' | 'org';
  delegators: number;
  commission: number;
  joinedEpoch: number;
}

export interface NetworkStats {
  totalValidators: number;
  activeValidators: number;
  currentEpoch: number;
  totalRewards: number;
  networkUptime: number;
  avgPerformanceScore: number;
}

export interface RewardData {
  epoch: number;
  totalRewards: number;
  validatorRewards: { [address: string]: number };
}

// Fallback mock data in case API fails
export const mockValidators: Validator[] = [
  {
    address: '0x1234567890abcdef1234567890abcdef12345678',
    name: 'StoryNode Pro',
    stake: 1250000,
    uptime: 99.8,
    performanceScore: 98.5,
    rewardsEarned: 45230,
    lastActiveEpoch: 1247,
    status: 'active',
    region: 'North America',
    validatorType: 'org',
    delegators: 234,
    commission: 5,
    joinedEpoch: 1200,
  },
  {
    address: '0x2345678901bcdef12345678901bcdef123456789',
    name: 'Aeneid Validator',
    stake: 980000,
    uptime: 99.2,
    performanceScore: 96.8,
    rewardsEarned: 38920,
    lastActiveEpoch: 1247,
    status: 'active',
    region: 'Europe',
    validatorType: 'team',
    delegators: 156,
    commission: 7,
    joinedEpoch: 1180,
  },
  {
    address: '0x3456789012cdef123456789012cdef1234567890',
    name: 'Solo Staker',
    stake: 750000,
    uptime: 97.5,
    performanceScore: 94.2,
    rewardsEarned: 29840,
    lastActiveEpoch: 1246,
    status: 'active',
    region: 'Asia',
    validatorType: 'solo',
    delegators: 89,
    commission: 10,
    joinedEpoch: 1150,
  },
  {
    address: '0x4567890123def1234567890123def12345678901',
    name: 'Protocol Guardian',
    stake: 1100000,
    uptime: 98.9,
    performanceScore: 97.3,
    rewardsEarned: 41250,
    lastActiveEpoch: 1247,
    status: 'active',
    region: 'North America',
    validatorType: 'org',
    delegators: 298,
    commission: 4,
    joinedEpoch: 1190,
  },
  {
    address: '0x5678901234ef12345678901234ef123456789012',
    name: 'Testnet Titan',
    stake: 650000,
    uptime: 95.8,
    performanceScore: 92.1,
    rewardsEarned: 25670,
    lastActiveEpoch: 1245,
    status: 'active',
    region: 'Europe',
    validatorType: 'solo',
    delegators: 67,
    commission: 8,
    joinedEpoch: 1170,
  },
  {
    address: '0x6789012345f123456789012345f1234567890123',
    name: 'Story Validator Co',
    stake: 890000,
    uptime: 99.1,
    performanceScore: 96.5,
    rewardsEarned: 34560,
    lastActiveEpoch: 1247,
    status: 'active',
    region: 'Asia',
    validatorType: 'team',
    delegators: 178,
    commission: 6,
    joinedEpoch: 1160,
  },
];

export const mockNetworkStats: NetworkStats = {
  totalValidators: 156,
  activeValidators: 142,
  currentEpoch: 1247,
  totalRewards: 2450000,
  networkUptime: 98.4,
  avgPerformanceScore: 95.8,
};

export const mockRewardHistory: RewardData[] = Array.from({ length: 30 }, (_, i) => ({
  epoch: 1218 + i,
  totalRewards: 78000 + Math.random() * 10000,
  validatorRewards: Object.fromEntries(
    mockValidators.map(v => [v.address, Math.random() * 2000 + 500])
  ),
}));
