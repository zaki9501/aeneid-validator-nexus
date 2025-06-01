
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
    console.log('API response successful, transforming data...');
    
    return data.items.map(transformApiValidator);
  } catch (error) {
    console.error('Error fetching validators from API:', error);
    console.log('Falling back to mock data...');
    
    // Return mock data as fallback
    return mockValidators;
  }
};

const transformApiValidator = (apiValidator: ApiValidator): Validator => {
  // Calculate uptime percentage from the API data
  const uptimePercent = apiValidator.uptime?.windowUptime?.uptime || 0;
  
  // Map API status to our status format
  const getStatus = (status: string, jailed: boolean): 'active' | 'inactive' | 'slashed' => {
    if (jailed) return 'slashed';
    if (status === 'BOND_STATUS_BONDED') return 'active';
    return 'inactive';
  };

  // Extract commission rate as percentage
  const commissionRate = parseFloat(apiValidator.commission?.commissionRates?.rate || '0') * 100;

  // Calculate performance score based on uptime and participation
  const participationRate = apiValidator.participation?.rate || 0;
  const performanceScore = (uptimePercent * 0.7 + participationRate * 0.3);

  return {
    address: apiValidator.operatorAddress,
    name: apiValidator.description?.moniker || 'Unknown Validator',
    logo: apiValidator.description?.avatar || undefined,
    stake: apiValidator.tokens || 0,
    uptime: uptimePercent,
    performanceScore: performanceScore,
    rewardsEarned: Math.floor(apiValidator.estimatedApr * apiValidator.tokens / 100) || 0,
    lastActiveEpoch: apiValidator.uptime?.historicalUptime?.lastSyncHeight || 0,
    status: getStatus(apiValidator.status, apiValidator.jailed),
    region: 'Unknown', // API doesn't provide region info
    validatorType: 'solo', // API doesn't provide validator type
    delegators: Math.floor(parseFloat(apiValidator.delegatorShares || '0')), // Approximate
    commission: commissionRate,
    joinedEpoch: apiValidator.signingInfo?.bondedHeight || 0,
  };
};
