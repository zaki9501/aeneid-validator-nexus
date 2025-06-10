export interface NetworkStats {
  blockTime: {
    startHeight: number;
    endHeight: number;
    diffTime: number;
  };
  network: string;
  latestBlock: {
    height: number;
    time: string;
  };
  token: {
    denom: string;
    alias: string;
  };
  validators: {
    active: number;
    total: number;
  };
  window: {
    round: number;
    windowStart: number;
    windowEnd: number;
  };
  valPrefix: string;
}

const API_BASE_URL = 'https://api-aeneid.storyscan.app';

export const fetchNetworkStats = async (): Promise<NetworkStats> => {
  console.log('Fetching network stats from:', `${API_BASE_URL}/chain/network`);
  
  try {
    const response = await fetch('/api/chain/network', {
      method: 'GET',
      headers: {
        'accept': 'application/json',
      },
      mode: 'cors',
    });

    console.log('Network stats response status:', response.status);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: NetworkStats = await response.json();
    console.log('Network stats fetched successfully:', data);
    
    return data;
  } catch (error) {
    console.error('Error fetching network stats:', error);
    
    // Fallback data based on the API structure
    const fallbackData: NetworkStats = {
      blockTime: {
        startHeight: 4819001,
        endHeight: 4820000,
        diffTime: 2.16
      },
      network: "devnet-1",
      latestBlock: {
        height: 4820097,
        time: "2025-05-27T00:30:11.864Z"
      },
      token: {
        denom: "stake",
        alias: "IP"
      },
      validators: {
        active: 64,
        total: 146
      },
      window: {
        round: 168,
        windowStart: 4809601,
        windowEnd: 4838400
      },
      valPrefix: "story"
    };
    
    console.log('Using fallback network stats due to API error');
    return fallbackData;
  }
};
