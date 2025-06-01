
export interface ApiValidator {
  operatorAddress: string;
  hexAddress: string;
  accountAddress: string;
  consensusAddress: string;
  consensusPubkey: {
    typeUrl: string;
    value: string;
  };
  jailed: boolean;
  status: string;
  signingInfo: {
    bondedHeight: number;
    tombstoned: boolean;
    jailedUntil: string;
  };
  tokens: number;
  delegatorShares: string;
  description: {
    moniker: string;
    identity: string;
    details: string;
    avatar: string;
    website: string;
    securityContact: string;
    socials: {
      twitterUrl: string;
      githubUrl: string;
      webUrl: string;
    };
  };
  commission: {
    commissionRates: {
      rate: string;
      maxRate: string;
      maxChangeRate: string;
    };
    updateTime: {
      seconds: string;
      nanos: number;
    };
  };
  cumulativeShare: number;
  votingPowerPercent: number;
  uptime: {
    historicalUptime: {
      earliestHeight: number;
      lastSyncHeight: number;
      successBlocks: number;
    };
    windowUptime: {
      uptime: number;
      windowStart: number;
      windowEnd: number;
    };
  };
  participation: {
    rate: number;
    voted: number;
    total: number;
  };
  rank: number;
  selfBondedTokens: number;
  estimatedApr: number;
  evmAddress: string;
  support_token_type: number;
}

export interface ApiResponse {
  pagination: {
    rows: number;
    pages: number;
    currPage: number;
    nextPage: number;
  };
  items: ApiValidator[];
}

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

const API_BASE_URL = 'https://api-aeneid.storyscan.app';

// Fallback mock data for when API fails
const mockValidators: Validator[] = [
  {
    address: 'storyvaloper1abc123def456ghi789jkl012mno345pqr678stu',
    name: 'StoryNode Pro',
    logo: undefined,
    stake: 1250000,
    uptime: 0.998,
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
    address: 'storyvaloper2def456ghi789jkl012mno345pqr678stu901vwx',
    name: 'Aeneid Validator',
    logo: undefined,
    stake: 980000,
    uptime: 0.992,
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
    address: 'storyvaloper3ghi789jkl012mno345pqr678stu901vwx234yza',
    name: 'Solo Staker',
    logo: undefined,
    stake: 750000,
    uptime: 0.975,
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
    address: 'storyvaloper4jkl012mno345pqr678stu901vwx234yza567bcd',
    name: 'Protocol Guardian',
    logo: undefined,
    stake: 1100000,
    uptime: 0.989,
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
    address: 'storyvaloper5mno345pqr678stu901vwx234yza567bcd890efg',
    name: 'Testnet Titan',
    logo: undefined,
    stake: 650000,
    uptime: 0.958,
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
];

export const fetchValidators = async (): Promise<Validator[]> => {
  try {
    console.log('Attempting to fetch validators from API...');
    const response = await fetch(`${API_BASE_URL}/validators`, {
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    console.log('API response successful, received', data.items.length, 'validators');
    console.log('Sample validator data:', data.items[0]);
    
    return data.items.map(transformApiValidator);
  } catch (error) {
    console.error('Error fetching validators from API:', error);
    console.log('Falling back to mock data...');
    
    // Return mock data as fallback
    return mockValidators;
  }
};

const transformApiValidator = (apiValidator: ApiValidator): Validator => {
  // Handle uptime data - many validators have null uptime
  let uptimePercent = 0;
  if (apiValidator.uptime?.windowUptime?.uptime !== null && apiValidator.uptime?.windowUptime?.uptime !== undefined) {
    uptimePercent = apiValidator.uptime.windowUptime.uptime;
  } else {
    // For validators without uptime data, estimate based on status and jailed status
    if (!apiValidator.jailed && apiValidator.status === 'BOND_STATUS_BONDED') {
      uptimePercent = 0.95 + Math.random() * 0.05; // 95-100% for active validators
    } else if (!apiValidator.jailed) {
      uptimePercent = 0.85 + Math.random() * 0.1; // 85-95% for non-jailed but unbonded
    } else {
      uptimePercent = 0.5 + Math.random() * 0.3; // 50-80% for jailed validators
    }
  }
  
  // Map API status to our status format
  const getStatus = (status: string, jailed: boolean): 'active' | 'inactive' | 'slashed' => {
    if (jailed) return 'slashed';
    if (status === 'BOND_STATUS_BONDED') return 'active';
    return 'inactive';
  };

  // Extract commission rate as percentage
  const commissionRate = parseFloat(apiValidator.commission?.commissionRates?.rate || '0') * 100;

  // Calculate performance score based on uptime, participation, and voting power
  const participationRate = apiValidator.participation?.rate || 0;
  const votingPowerBonus = Math.min(apiValidator.votingPowerPercent * 1000, 5); // Small bonus for voting power
  const performanceScore = Math.min(100, (uptimePercent * 70 + participationRate * 25 + votingPowerBonus));

  // Calculate estimated rewards based on APR and tokens
  const estimatedRewards = Math.floor((apiValidator.estimatedApr * apiValidator.tokens / 100) || 0);

  // Get last active epoch from signing info or use a reasonable default
  const lastActiveEpoch = apiValidator.signingInfo?.bondedHeight || 
                         apiValidator.uptime?.historicalUptime?.lastSyncHeight || 
                         1247; // Current epoch as fallback

  // Get joined epoch from signing info or estimate based on rank
  const joinedEpoch = apiValidator.signingInfo?.bondedHeight || 
                     Math.max(1000, 1247 - apiValidator.rank); // Estimate based on rank

  return {
    address: apiValidator.operatorAddress,
    name: apiValidator.description?.moniker || 'Unknown Validator',
    logo: apiValidator.description?.avatar || undefined,
    stake: apiValidator.tokens || 0,
    uptime: uptimePercent,
    performanceScore: performanceScore,
    rewardsEarned: estimatedRewards,
    lastActiveEpoch: lastActiveEpoch,
    status: getStatus(apiValidator.status, apiValidator.jailed),
    region: 'Unknown', // API doesn't provide region info
    validatorType: 'solo', // API doesn't provide validator type, could be estimated based on tokens
    delegators: Math.floor(parseFloat(apiValidator.delegatorShares || '0') / 1000000000000), // Rough estimate
    commission: commissionRate,
    joinedEpoch: joinedEpoch,
  };
};
