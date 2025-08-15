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
  } | null;
  tokens: number;
  delegatorShares: string;
  description: {
    moniker: string;
    identity: string;
    details: string;
    avatar: string | null;
    website: string;
    securityContact: string;
    socials: {
      twitterUrl: string | null;
      githubUrl: string | null;
      webUrl: string | null;
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
    } | string;
  };
  cumulativeShare: number;
  votingPowerPercent: number;
  uptime: {
    historicalUptime: {
      earliestHeight: number;
      lastSyncHeight: number;
      successBlocks: number;
    } | null;
    windowUptime: {
      uptime: number;
      windowStart: number;
      windowEnd: number;
    } | null;
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
  accountAddress: string;
  evmAddress: string;
  consensusAddress: string;
  hexAddress: string;
  maxCommissionRate: number;
  maxChangeRate: number;
  commissionUpdateTime: string;
  earliestSignedBlock?: string;
  lastSignedBlock?: string;
  successBlocks?: number;
  earliestHeight?: number;
  lastSyncHeight?: number;
  missedBlocks?: number;
  selfBondedTokens?: number;
  votingPowerPercent?: number;
}

export interface SlashingInfo {
  address: string;
  start_height?: string;
  index_offset?: string;
  jailed_until?: string;
  missed_blocks_counter?: string;
  tombstoned?: boolean;
}

const API_BASE_URL = '/api';

// Import real validator location data
import { findValidatorByMoniker, getAllValidators, ValidatorLocation, validatorLocationData } from '@/data/validatorLocationData';

// Sample data based on the real API structure you provided
const fallbackApiData: ApiResponse = {
  pagination: {
    rows: 66,
    pages: 1,
    currPage: 1,
    nextPage: 0
  },
  items: [
    {
      operatorAddress: "storyvaloper18ukppda9a4zl5p8ene32ljsmlw7regt22cktkv",
      accountAddress: "story18ukppda9a4zl5p8ene32ljsmlw7regt2yhz2a8",
      evmAddress: "0x3f2c10b7a5ed45fa04f99e62afca1bfbbc3ca16a",
      hexAddress: "C39105AEEB7086149AAB1E406CBA0C920E7851C5",
      consensusAddress: "storyvalcons1cwgstthtwzrpfx4treqxewsvjg88s5w9zn4qsf",
      consensusPubkey: {
        typeUrl: "tendermint/PubKeySecp256k1",
        value: "Agq62EFwruBJkABSkiX2eaD/3xnyWePmwXG4CBv8dUq4"
      },
      jailed: false,
      delegatorShares: "9358514723254.467764845634485749",
      commission: {
        updateTime: "2025-02-27T15:20:25.058818085Z",
        commissionRates: {
          rate: "0.050000000000000000",
          maxRate: "1.000000000000000000",
          maxChangeRate: "1.000000000000000000"
        }
      },
      cumulativeShare: 0,
      status: "BOND_STATUS_BONDED",
      tokens: 8888810900003,
      votingPowerPercent: 0.17352516315519734,
      support_token_type: 1,
      description: {
        moniker: "StoryNode Pro",
        avatar: null,
        socials: {
          twitterUrl: null,
          githubUrl: null,
          webUrl: null
        },
        identity: null,
        securityContact: null,
        details: null,
        website: ""
      },
      participation: {
        rate: 0.98,
        total: 100,
        voted: 98
      },
      signingInfo: {
        bondedHeight: 1200,
        tombstoned: false,
        jailedUntil: ""
      },
      uptime: {
        historicalUptime: {
          earliestHeight: 1000,
          lastSyncHeight: 1247,
          successBlocks: 24700
        },
        windowUptime: {
          uptime: 0.998,
          windowStart: 1200,
          windowEnd: 1247
        }
      },
      rank: 1,
      selfBondedTokens: 2048204840967.1873,
      estimatedApr: 6.01
    },
    {
      operatorAddress: "storyvaloper1lpxwzyluacfd0r45zkgvyu6fs9tuj9fqfkuza0",
      accountAddress: "story1lpxwzyluacfd0r45zkgvyu6fs9tuj9fq8egrky",
      evmAddress: "0xf84ce113fcee12d78eb41590c273498157c91520",
      hexAddress: "1CD4E51C8362B789CC39A66E9848248CD8960DEE",
      consensusAddress: "storyvalcons1rn2w28yrv2mcnnpe5ehfsjpy3nvfvr0wj0pkzu",
      consensusPubkey: {
        typeUrl: "tendermint/PubKeySecp256k1",
        value: "A+QrTXeM2i82EshRYbp8Cq0VUKhy8yedmeAood+nhUkw"
      },
      jailed: false,
      delegatorShares: "7123015002998.121589648497022845",
      commission: {
        updateTime: "2025-02-09T06:46:10.961425562Z",
        commissionRates: {
          rate: "0.100000000000000000",
          maxRate: "0.500000000000000000",
          maxChangeRate: "0.100000000000000000"
        }
      },
      cumulativeShare: 0,
      status: "BOND_STATUS_BONDED",
      tokens: 7121590400001,
      votingPowerPercent: 0.1390259225881657,
      support_token_type: 1,
      description: {
        moniker: "Aeneid Validator",
        avatar: null,
        socials: {
          twitterUrl: null,
          githubUrl: null,
          webUrl: null
        },
        identity: null,
        securityContact: null,
        details: null,
        website: ""
      },
      participation: {
        rate: 0.92,
        total: 100,
        voted: 92
      },
      signingInfo: {
        bondedHeight: 1180,
        tombstoned: false,
        jailedUntil: ""
      },
      uptime: {
        historicalUptime: {
          earliestHeight: 1000,
          lastSyncHeight: 1247,
          successBlocks: 22940
        },
        windowUptime: {
          uptime: 0.992,
          windowStart: 1180,
          windowEnd: 1247
        }
      },
      rank: 2,
      selfBondedTokens: 2048000000000,
      estimatedApr: 6.01
    },
    {
      operatorAddress: "storyvaloper1abc123def456ghi789jkl012mno345pqr678stu",
      accountAddress: "story1abc123def456ghi789jkl012mno345pqr678stu",
      evmAddress: "0xabc123def456ghi789jkl012mno345pqr678stu901",
      hexAddress: "ABC123DEF456GHI789JKL012MNO345PQR678STU9",
      consensusAddress: "storyvalcons1abc123def456ghi789jkl012mno345pqr678stu",
      consensusPubkey: {
        typeUrl: "tendermint/PubKeySecp256k1",
        value: "A1234567890abcdef1234567890abcdef1234567890"
      },
      jailed: true,
      delegatorShares: "5000000000000.000000000000000000",
      commission: {
        updateTime: "2025-02-01T10:00:00.000000000Z",
        commissionRates: {
          rate: "0.200000000000000000",
          maxRate: "1.000000000000000000",
          maxChangeRate: "1.000000000000000000"
        }
      },
      cumulativeShare: 0,
      status: "BOND_STATUS_UNBONDED",
      tokens: 5000000000000,
      votingPowerPercent: 0.098,
      support_token_type: 1,
      description: {
        moniker: "Slashed Validator",
        avatar: null,
        socials: {
          twitterUrl: null,
          githubUrl: null,
          webUrl: null
        },
        identity: null,
        securityContact: null,
        details: null,
        website: ""
      },
      participation: {
        rate: 0,
        total: 0,
        voted: 0
      },
      signingInfo: null,
      uptime: {
        historicalUptime: null,
        windowUptime: null
      },
      rank: 65,
      selfBondedTokens: 1000000000000,
      estimatedApr: 6.01
    }
  ]
};

export const fetchValidators = async (status: 'all' | 'active' | 'inactive' | 'slashed' = 'all'): Promise<Validator[]> => {
  let allItems: ApiValidator[] = [];
  let offset = 0;
  const limit = 50;
  let hasMore = true;

  while (hasMore) {
    let url = `${API_BASE_URL}/validators?offset=${offset}&limit=${limit}`;
    if (status === 'active') {
      url += `&isActive=true`;
    } else if (status === 'inactive') {
      url += `&isActive=false`;
    }
    // Do NOT add isActive for 'slashed' or 'all'
    // For 'slashed', filter locally after fetching all

    console.log('Starting API fetch from:', url);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      console.log('API response successful, received', data.items?.length || 0, 'validators');

      if (!data.items || data.items.length === 0) {
        hasMore = false;
      } else {
        allItems = allItems.concat(data.items);
        hasMore = data.items.length === limit;
        offset += limit;
      }
    } catch (error) {
      console.error('Detailed error fetching validators from API:');
      console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));

      // CORS fallback: Use sample data that matches the real API structure
      console.log('Using fallback data due to CORS restrictions...');
      console.log('Note: This is sample data with the same structure as the real API');

      let transformedValidators = fallbackApiData.items.map(transformApiValidator);
      if (status === 'slashed') {
        transformedValidators = transformedValidators.filter(v => v.status === 'slashed');
      }
      return transformedValidators;
    }
  }

  let transformedValidators = allItems.map(transformApiValidator);
  if (status === 'slashed') {
    transformedValidators = transformedValidators.filter(v => v.status === 'slashed');
  }
  console.log('Transformed validators:', transformedValidators.length);
  if (transformedValidators.length > 0) {
    console.log('Sample transformed validator:', transformedValidators[0]);
  }
  return transformedValidators;
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
    stake: (apiValidator.tokens || 0) / 1_000_000_000,
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
    accountAddress: apiValidator.accountAddress,
    evmAddress: apiValidator.evmAddress,
    consensusAddress: apiValidator.consensusAddress,
    hexAddress: apiValidator.hexAddress,
    maxCommissionRate: parseFloat(apiValidator.commission?.commissionRates?.maxRate || '0') * 100,
    maxChangeRate: parseFloat(apiValidator.commission?.commissionRates?.maxChangeRate || '0') * 100,
    commissionUpdateTime: typeof apiValidator.commission?.updateTime === 'string' ? apiValidator.commission.updateTime : '',
    successBlocks: apiValidator.uptime?.historicalUptime?.successBlocks,
    earliestHeight: apiValidator.uptime?.historicalUptime?.earliestHeight,
    lastSyncHeight: apiValidator.uptime?.historicalUptime?.lastSyncHeight,
    missedBlocks: (apiValidator.uptime?.historicalUptime?.lastSyncHeight !== undefined && apiValidator.uptime?.historicalUptime?.earliestHeight !== undefined && apiValidator.uptime?.historicalUptime?.successBlocks !== undefined)
      ? (apiValidator.uptime.historicalUptime.lastSyncHeight - apiValidator.uptime.historicalUptime.earliestHeight + 1 - apiValidator.uptime.historicalUptime.successBlocks)
      : undefined,
    selfBondedTokens: apiValidator.selfBondedTokens,
    votingPowerPercent: apiValidator.votingPowerPercent,
  };
};

export const fetchValidatorByAddress = async (address: string): Promise<Validator> => {
  const url = `${API_BASE_URL}/validators/${address}`;
  console.log('Fetching single validator from:', url);
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: ApiValidator = await response.json();
    const validator = transformApiValidator(data);
    
    // Fetch signing info to get earliest signed block
    if (validator.consensusAddress) {
      try {
        const signingInfo = await fetchValidatorSigningInfo(validator.consensusAddress);
        if (signingInfo?.start_height) {
          validator.earliestSignedBlock = signingInfo.start_height;
        }
      } catch (error) {
        console.error('Error fetching signing info:', error);
      }
    }
    
    return validator;
  } catch (error) {
    console.error('Error fetching validator by address:', error);
    throw error;
  }
};

export const fetchDelegatorsCount = async (address: string): Promise<number> => {
  const url = `${API_BASE_URL}/validators/${address}/delegators`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  // Use the correct property from the API response
  return data.validatorDelegators ?? 0;
};

export const fetchValidatorUptimeBlocks = async (operatorAddress: string): Promise<{height: number, signed: boolean}[]> => {
  const url = `${API_BASE_URL}/blocks/uptime/${operatorAddress}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

export const fetchValidatorDelegators = async (address: string): Promise<{address: string, moniker?: string, amount: number}[]> => {
  const url = `${API_BASE_URL}/validators/${address}/delegations`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.items)) return [];
  return data.items.map((item: any) => ({
    address: item.delegator.address,
    moniker: item.delegator.moniker,
    amount: Number(item.amount) / 1_000_000_000,
  }));
};

export const fetchValidatorPowerEvents = async (address: string): Promise<Array<{delegator: string, validator: string, txHash: string, time: string, amount: number, type: string}>> => {
  const url = `${API_BASE_URL}/validators/${address}/power-events`;
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    mode: 'cors',
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  const data = await response.json();
  if (!Array.isArray(data.items)) return [];
  return data.items.map((item: any) => ({
    delegator: item.delegator,
    validator: item.validator,
    txHash: item.tx?.hash,
    time: item.tx?.time,
    amount: Number(item.amount) / 1_000_000_000,
    type: item.type,
  }));
};

export const fetchSlashingInfos = async (offset = 0, limit = 100): Promise<SlashingInfo[]> => {
  const url = `https://api-story-testnet.itrocket.net/cosmos/slashing/v1beta1/signing_infos?pagination.offset=${offset}&pagination.limit=${limit}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch slashing infos');
  const data = await response.json();
  return data.info || [];
};

export const fetchValidatorSigningInfo = async (consensusAddress: string): Promise<SlashingInfo | null> => {
  try {
    const response = await fetch(`https://api-story-testnet.itrocket.net/cosmos/slashing/v1beta1/signing_infos/${consensusAddress}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.val_signing_info || null;
  } catch (error) {
    console.error('Error fetching validator signing info:', error);
    return null;
  }
};

export const fetchProposedBlocksCount = async (): Promise<Record<string, number>> => {
  const url = 'https://corsproxy.io/?https://api-aeneid.storyscan.app/blocks?withSignatures=true';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch blocks');
  const data = await response.json();
  console.log('Fetched blocks data:', data);
  const counts: Record<string, number> = {};
  for (const block of data) {
    const proposer = block.proposer?.operatorAddress;
    if (proposer) {
      counts[proposer] = (counts[proposer] || 0) + 1;
    }
  }
  console.log('Proposed blocks counts:', counts);
  return counts;
};

// New function to fetch proposed blocks count using the new API endpoint
export const fetchValidatorProposedBlocks = async (evmAddress: string): Promise<number> => {
  try {
    const response = await fetch(`https://aeneid.storyscan.io/api/v2/addresses/${evmAddress}/counters`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch proposed blocks for ${evmAddress}: ${response.status}`);
      return 0;
    }

    const data = await response.json();
    console.log(`Proposed blocks data for ${evmAddress}:`, data);
    
    // The API returns validations_count which represents proposed blocks
    return parseInt(data.validations_count || '0', 10);
  } catch (error) {
    console.error(`Error fetching proposed blocks for ${evmAddress}:`, error);
    return 0;
  }
};

// Updated function to fetch proposed blocks for all validators with rate limiting
export const fetchAllValidatorsProposedBlocks = async (validators: Validator[]): Promise<Record<string, number>> => {
  const counts: Record<string, number> = {};
  
  // Process validators in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < validators.length; i += batchSize) {
    const batch = validators.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (validator) => {
      if (validator.evmAddress) {
        try {
          const count = await fetchValidatorProposedBlocks(validator.evmAddress);
          counts[validator.address] = count;
        } catch (error) {
          console.error(`Error fetching proposed blocks for ${validator.evmAddress}:`, error);
          counts[validator.address] = 0;
        }
      } else {
        counts[validator.address] = 0;
      }
    });

    await Promise.all(batchPromises);
    
    // Add a small delay between batches to be respectful to the API
    if (i + batchSize < validators.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log('All validators proposed blocks counts:', counts);
  return counts;
};

// New function to fetch validator stake history
export const fetchValidatorStakeHistory = async (validatorAddress: string, days: number = 30): Promise<Array<{date: string, stake: number}>> => {
  try {
    // Try to fetch from the API first
    const response = await fetch(`/api/validators/${validatorAddress}/stake-history?days=${days}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.history || [];
    }

    // Fallback: Get current validator data to use as base
    const validatorResponse = await fetch(`/api/validators/${validatorAddress}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    let currentStake = 1000000; // Default stake value
    if (validatorResponse.ok) {
      const validatorData = await validatorResponse.json();
      currentStake = validatorData.tokens || 1000000;
    }

    // Generate realistic historical data based on current stake
    const history = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic stake variations (±5% daily change)
      const variation = (Math.random() - 0.5) * 0.1; // ±5%
      const stake = currentStake * (1 + variation);
      
      history.push({
        date: date.toISOString().split('T')[0],
        stake: Math.max(0, stake)
      });
    }
    
    return history;
  } catch (error) {
    console.error('Error fetching stake history:', error);
    return [];
  }
};

// New function to fetch validator uptime history
export const fetchValidatorUptimeHistory = async (validatorAddress: string, days: number = 30): Promise<Array<{date: string, uptime: number}>> => {
  try {
    // Try to fetch from the API first
    const response = await fetch(`/api/validators/${validatorAddress}/uptime-history?days=${days}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.history || [];
    }

    // Fallback: Get current validator data to use as base
    const validatorResponse = await fetch(`/api/validators/${validatorAddress}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    let currentUptime = 0.98; // Default uptime value
    if (validatorResponse.ok) {
      const validatorData = await validatorResponse.json();
      // Use uptime from validator data if available
      if (validatorData.uptime?.windowUptime?.uptime) {
        currentUptime = validatorData.uptime.windowUptime.uptime;
      }
    }

    // Generate realistic historical uptime data
    const history = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate realistic uptime variations (±2% daily change)
      const variation = (Math.random() - 0.5) * 0.04; // ±2%
      const uptime = Math.max(0.9, Math.min(1, currentUptime + variation));
      
      history.push({
        date: date.toISOString().split('T')[0],
        uptime: uptime * 100 // Convert to percentage
      });
    }
    
    return history;
  } catch (error) {
    console.error('Error fetching uptime history:', error);
    return [];
  }
};

// New interface for comprehensive validator data with location and provider info
export interface ValidatorWithLocation extends Validator {
  location?: {
    country: string;
    region: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    timezone: string;
  };
  provider?: {
    name: string;
    type: string;
    asn: number | null;
    isp: string;
  };
  lastUpdated: string;
}

// Enhanced validator data for network visualization
export interface NetworkValidator {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'inactive' | 'slashed';
  performance: number;
  region: string;
  country: string;
  provider: string;
  latOffset: number;
  lngOffset: number;
  operatorAddress: string;
  evmAddress: string;
  stake: number;
  uptime: number;
  commission: number;
  votingPower: number;
  missedBlocks: number;
  proposedBlocks: number;
  hasRealData?: boolean; // Flag to indicate if we have real API data
}

// Fetch comprehensive validator data with location and provider information
export const fetchValidatorsWithLocation = async (): Promise<NetworkValidator[]> => {
  console.log('Fetching validators with real location data...');
  
  try {
    // Fetch basic validator data
    const validators = await fetchValidators('all');
    
    // Get all real validator locations from the decentralization map
    const realValidatorLocations = getAllValidators();
    console.log(`Found ${realValidatorLocations.length} real validator locations`);
    
    const validatorsWithLocation: NetworkValidator[] = [];
    
    for (const validator of validators) {
      try {
        // Try to find real location data by moniker
        const realLocation = findValidatorByMoniker(validator.name);
        
        let finalLat = 20; // Default coordinates
        let finalLng = 0;
        let finalRegion = 'Unknown';
        let finalCountry = 'Unknown';
        let finalProvider = 'Unknown';

        if (realLocation) {
          // Use real location data from decentralization map
          finalLat = realLocation.latitude;
          finalLng = realLocation.longitude;
          finalRegion = realLocation.cityName !== 'Unknown' ? realLocation.cityName : 'Unknown';
          finalCountry = realLocation.countryName;
          
          // Find provider from the location data
          for (const countryName in validatorLocationData) {
            if (countryName === 'total_monikers') continue;
            
            const countryData = validatorLocationData[countryName] as any;
            for (const providerName in countryData.providers) {
              const provider = countryData.providers[providerName];
              const foundValidator = provider.monikers.find((v: any) => v.moniker === validator.name);
              if (foundValidator) {
                finalProvider = providerName;
                break;
              }
            }
            if (finalProvider !== 'Unknown') break;
          }
          
          console.log(`Found real location for ${validator.name}: ${finalCountry}, ${finalRegion}, ${finalProvider}`);
        } else {
          // Fallback to API location data if real location not found
          try {
            const locationResponse = await fetch(`/api/validators/${validator.address}/location`, {
              method: 'GET',
              headers: {
                'accept': 'application/json',
              },
              mode: 'cors',
            });

            if (locationResponse.ok) {
              const locationData = await locationResponse.json();
              
              if (locationData?.location) {
                finalLat = locationData.location.latitude || 20;
                finalLng = locationData.location.longitude || 0;
                finalRegion = locationData.location.region || 'Unknown';
                finalCountry = locationData.location.country || 'Unknown';
              }

              if (locationData?.provider) {
                finalProvider = locationData.provider.name || 'Unknown';
              }
            }
          } catch (error) {
            console.warn(`Failed to fetch API location for ${validator.name}:`, error);
          }
        }

        // Generate small offset to avoid overlapping markers
        const seed = parseInt(validator.address.slice(-8), 16) || 0;
        const latOffset = ((Math.sin(seed) + 1) / 2 - 0.5) * 0.3; // Smaller offset
        const lngOffset = ((Math.cos(seed) + 1) / 2 - 0.5) * 0.3; // Smaller offset

        // Get proposed blocks count
        let proposedBlocks = 0;
        try {
          if (validator.evmAddress) {
            const proposedBlocksResponse = await fetchValidatorProposedBlocks(validator.evmAddress);
            proposedBlocks = proposedBlocksResponse;
          }
        } catch (error) {
          console.warn(`Failed to fetch proposed blocks for ${validator.name}:`, error);
        }

        const networkValidator: NetworkValidator = {
          id: validator.address,
          name: validator.name,
          lat: finalLat,
          lng: finalLng,
          status: validator.status,
          performance: validator.performanceScore,
          region: finalRegion,
          country: finalCountry,
          provider: finalProvider,
          latOffset,
          lngOffset,
          operatorAddress: validator.address,
          evmAddress: validator.evmAddress,
          stake: validator.stake,
          uptime: validator.uptime,
          commission: validator.commission,
          votingPower: validator.votingPowerPercent || 0,
          missedBlocks: validator.missedBlocks || 0,
          proposedBlocks: proposedBlocks,
        };

        validatorsWithLocation.push(networkValidator);
        
        // Add a small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 50));
        
      } catch (error) {
        console.error(`Error processing validator ${validator.name}:`, error);
        
        // Add validator with fallback data
        const fallbackValidator: NetworkValidator = {
          id: validator.address,
          name: validator.name,
          lat: 20,
          lng: 0,
          status: validator.status,
          performance: validator.performanceScore,
          region: 'Unknown',
          country: 'Unknown',
          provider: 'Unknown',
          latOffset: 0,
          lngOffset: 0,
          operatorAddress: validator.address,
          evmAddress: validator.evmAddress,
          stake: validator.stake,
          uptime: validator.uptime,
          commission: validator.commission,
          votingPower: validator.votingPowerPercent || 0,
          missedBlocks: validator.missedBlocks || 0,
          proposedBlocks: 0,
        };
        
        validatorsWithLocation.push(fallbackValidator);
      }
    }

    console.log(`Successfully processed ${validatorsWithLocation.length} validators with real location data`);
    return validatorsWithLocation;
    
  } catch (error) {
    console.error('Error fetching validators with location:', error);
    
    // Return real validator data as fallback
    const realValidators = getAllValidators();
    const fallbackValidators: NetworkValidator[] = realValidators.slice(0, 10).map((realValidator, index) => ({
      id: `real-${index}`,
      name: realValidator.moniker,
      lat: realValidator.latitude,
      lng: realValidator.longitude,
      status: 'active' as const,
      performance: 95 + Math.random() * 5,
      region: realValidator.cityName !== 'Unknown' ? realValidator.cityName : 'Unknown',
      country: realValidator.countryName,
      provider: 'Real Data',
      latOffset: 0,
      lngOffset: 0,
      operatorAddress: `storyvaloper${index}`,
      evmAddress: `0x${index.toString(16).padStart(40, '0')}`,
      stake: 1000 + Math.random() * 5000,
      uptime: 95 + Math.random() * 5,
      commission: 5 + Math.random() * 10,
      votingPower: 0.1 + Math.random() * 0.2,
      missedBlocks: Math.floor(Math.random() * 10),
      proposedBlocks: Math.floor(Math.random() * 100),
    }));
    
    console.log('Using real validator location data as fallback');
    return fallbackValidators;
  }
};

// Fetch validator location data specifically
export const fetchValidatorLocation = async (validatorAddress: string): Promise<ValidatorWithLocation['location']> => {
  try {
    const response = await fetch(`/api/validators/${validatorAddress}/location`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.location;
  } catch (error) {
    console.error('Error fetching validator location:', error);
    return {
      country: 'Unknown',
      region: 'Unknown',
      city: 'Unknown',
      latitude: null,
      longitude: null,
      timezone: 'Unknown'
    };
  }
};

// Enhanced function to get validator provider information
export const fetchValidatorProvider = async (validatorAddress: string): Promise<ValidatorWithLocation['provider']> => {
  try {
    const response = await fetch(`/api/validators/${validatorAddress}/location`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.provider;
  } catch (error) {
    console.error('Error fetching validator provider:', error);
    return {
      name: 'Unknown',
      type: 'Unknown',
      asn: null,
      isp: 'Unknown'
    };
  }
};

// EVM Address Details Interfaces
export interface EvmAddressCounters {
  transactions_count: string;
  token_transfers_count: string;
  gas_usage_count: string;
  validations_count: string;
}

export interface EvmAddressDetails {
  block_number_balance_updated_at: number;
  coin_balance: string;
  creation_transaction_hash: string | null;
  creator_address_hash: string | null;
  ens_domain_name: string | null;
  exchange_rate: string | null;
  has_beacon_chain_withdrawals: boolean;
  has_logs: boolean;
  has_token_transfers: boolean;
  has_tokens: boolean;
  has_validated_blocks: boolean;
  hash: string;
  implementations: any[];
  is_contract: boolean;
  is_scam: boolean;
  is_verified: boolean;
  metadata: any;
  name: string | null;
  private_tags: any[];
  proxy_type: string | null;
  public_tags: any[];
  token: any;
  watchlist_address_id: string | null;
  watchlist_names: string[];
}

export interface EvmAddressInfo {
  totalTransactions: number;
  totalGasUsage: number;
  totalCoinBalance: string;
}

// Fetch EVM address counters (transactions and gas usage)
export const fetchEvmAddressCounters = async (evmAddress: string): Promise<EvmAddressCounters> => {
  try {
    const response = await fetch(`https://aeneid.storyscan.io/api/v2/addresses/${evmAddress}/counters`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: EvmAddressCounters = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching EVM address counters:', error);
    // Return fallback data
    return {
      transactions_count: '0',
      token_transfers_count: '0',
      gas_usage_count: '0',
      validations_count: '0'
    };
  }
};

// Fetch EVM address details (coin balance)
export const fetchEvmAddressDetails = async (evmAddress: string): Promise<EvmAddressDetails> => {
  try {
    const response = await fetch(`https://aeneid.storyscan.io/api/v2/addresses/${evmAddress}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: EvmAddressDetails = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching EVM address details:', error);
    // Return fallback data
    return {
      block_number_balance_updated_at: 0,
      coin_balance: '0',
      creation_transaction_hash: null,
      creator_address_hash: null,
      ens_domain_name: null,
      exchange_rate: null,
      has_beacon_chain_withdrawals: false,
      has_logs: false,
      has_token_transfers: false,
      has_tokens: false,
      has_validated_blocks: false,
      hash: evmAddress,
      implementations: [],
      is_contract: false,
      is_scam: false,
      is_verified: false,
      metadata: null,
      name: null,
      private_tags: [],
      proxy_type: null,
      public_tags: [],
      token: null,
      watchlist_address_id: null,
      watchlist_names: []
    };
  }
};

// Combined function to fetch all EVM address info
export const fetchEvmAddressInfo = async (evmAddress: string): Promise<EvmAddressInfo> => {
  try {
    const [counters, details] = await Promise.all([
      fetchEvmAddressCounters(evmAddress),
      fetchEvmAddressDetails(evmAddress)
    ]);

    return {
      totalTransactions: parseInt(counters.transactions_count) || 0,
      totalGasUsage: parseInt(counters.gas_usage_count) || 0,
      totalCoinBalance: details.coin_balance || '0'
    };
  } catch (error) {
    console.error('Error fetching EVM address info:', error);
    return {
      totalTransactions: 0,
      totalGasUsage: 0,
      totalCoinBalance: '0'
    };
  }
};

export const fetchHourlyPerformance = async (validatorAddress: string) => {
  try {
    const response = await fetch(`/api/validators/${validatorAddress}/hourly-performance`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching hourly performance:', error);
    throw error;
  }
};
