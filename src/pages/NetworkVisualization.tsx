
import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';

// Fix Leaflet default markers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Types
interface Validator {
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
  operatorAddress?: string;
}

interface BlockProposer {
  moniker: string;
  operatorAddress: string;
  hexAddress: string;
  avatar: string | null;
  height: number;
  time: string;
}

// Country coordinates mapping
const countryCoordinates: { [key: string]: [number, number] } = {
  'Germany': [51.1657, 10.4515],
  'Finland': [61.9241, 25.7482],
  'United States': [37.0902, -95.7129],
  'Singapore': [1.3521, 103.8198],
  'Austria': [47.5162, 14.5501],
  'France': [46.2276, 2.2137],
  'Poland': [51.9194, 19.1451],
  'United Kingdom': [55.3781, -3.4360],
  'Canada': [56.1304, -106.3468],
  'Belgium': [50.8503, 4.3517],
  'Hong Kong': [22.3193, 114.1694],
  'Ireland': [53.1424, -7.6921],
  'Lithuania': [55.1694, 23.8813],
  'Taiwan': [23.5937, 120.5833],
  'The Netherlands': [52.1326, 5.2913]
};

// Validators data
const validatorsData = [
  { id: '1', name: 'bangpateng', region: 'Europe', country: 'Germany', provider: 'AMAZON-02', operatorAddress: 'op1' },
  { id: '2', name: 'OneNov', region: 'Europe', country: 'Germany', provider: 'Contabo GmbH', operatorAddress: 'op2' },
  { id: '3', name: 'Strivenode', region: 'Europe', country: 'Germany', provider: 'Contabo GmbH' },
  { id: '4', name: 'wansnode', region: 'Europe', country: 'Germany', provider: 'Contabo GmbH' },
  { id: '5', name: 'Winnode', region: 'Europe', country: 'Germany', provider: 'Contabo GmbH' },
  { id: '6', name: 'gv-story', region: 'Europe', country: 'Germany', provider: 'Contabo GmbH' },
  { id: '7', name: 'node-story-aeneid-1', region: 'Europe', country: 'Germany', provider: 'DIGITALOCEAN-ASN' },
  { id: '8', name: '[NODERS]_SERVICES', region: 'Europe', country: 'Germany', provider: 'GOOGLE-CLOUD-PLATFORM' },
  { id: '9', name: 'Alchemy', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '10', name: 'Auranode', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '11', name: 'BlockPro', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '12', name: 'breskulpeak.com', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '13', name: 'c83c6280fcd2', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '14', name: 'charizard', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '15', name: 'Chicharito', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '16', name: 'deNodes', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '17', name: 'DTEAM | RPC', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '18', name: 'DTEAM | Snapshots', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '19', name: 'empirex', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '20', name: 'encapsulate', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '21', name: 'F7K3X3FfrrXrTrjK3K387VEt82ry8ab8', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '22', name: 'FuryNodes', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '23', name: 'imp', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '24', name: 'kaplan', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '25', name: 'l5tlong', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '26', name: 'LuckyStar', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '27', name: 'metilnodes', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '28', name: 'naruto', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '29', name: 'node', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '30', name: 'Nodeinfra', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '31', name: 'NodeSphere', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '32', name: 'openbitlab', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '33', name: 'polkachu', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '34', name: 'rpc-1.odyssey.story.nodes.guru', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '35', name: 'StakeUs', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '36', name: 'validator', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '37', name: 'Validator247', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '38', name: 'ValidatorVN', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '39', name: 'xxxigm', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '40', name: 'TrustedPoint', region: 'Europe', country: 'Germany', provider: 'Hetzner Online GmbH' },
  { id: '41', name: 'someone sentry node', region: 'Europe', country: 'Germany', provider: 'LATITUDE-SH' },
  { id: '42', name: '5Kage', region: 'Europe', country: 'Germany', provider: 'Tencent Building, Kejizhongyi Avenue' },
  { id: '43', name: 'devnet-1-seed', region: 'Europe', country: 'Germany', provider: 'Unknown' },
  { id: '44', name: 'Nodesforall', region: 'Europe', country: 'Germany', provider: 'Unknown' },
  { id: '45', name: 'Provalidator', region: 'Europe', country: 'Germany', provider: 'Unknown' },
  { id: '46', name: 'StoneGaze', region: 'Europe', country: 'Germany', provider: 'Unknown' },
  { id: '47', name: 'BlockHub', region: 'Europe', country: 'Germany', provider: 'Unknown' },
  { id: '48', name: '[NODERS]SERVICES_ARCHIVE', region: 'Europe', country: 'Germany', provider: 'netcup GmbH' },
  { id: '49', name: '1XP', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '50', name: 'Aldebaranode', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '51', name: 'ApexNodes', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '52', name: 'bitsturbine', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '53', name: 'BlockPI', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '54', name: 'CherryValidator', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '55', name: 'COCOCOPS', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '56', name: 'CoinHunters', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '57', name: 'corenode', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '58', name: 'CroutonDigital', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '59', name: 'HazenNetworkSolutions', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '60', name: 'hello-world', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '61', name: 'ITRocket', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '62', name: 'kgnodes', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '63', name: 'KruGGoK-Stakesnodes', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '64', name: 'Kyronode', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '65', name: 'MekongLabs', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '66', name: 'node', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '67', name: 'OriginStake', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '68', name: 'popsteam', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '69', name: 'service_unity_nodes', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '70', name: 'shachopra', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '71', name: 'snsn', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '72', name: 'Spider Node', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '73', name: 'ST-SERVER', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '74', name: 'ST-SERVER', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '75', name: 'STAVR', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '76', name: 'test', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '77', name: 'testis', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '78', name: 'ToToNode', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '79', name: 'Unity', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '80', name: 'UTSA_guide', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '81', name: 'ValidatorVNRPC', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '82', name: 'story-0', region: 'Europe', country: 'Finland', provider: 'Hetzner Online GmbH' },
  { id: '83', name: 'Cumulo', region: 'North America', country: 'United States', provider: 'AMAZON-AES' },
  { id: '84', name: 'DSRV', region: 'North America', country: 'United States', provider: 'AS-30083-GO-DADDY-COM-LLC' },
  { id: '85', name: 'use1-aeneid-bootnode1', region: 'North America', country: 'United States', provider: 'DIGITALOCEAN-ASN' },
  { id: '86', name: 'use1-aeneid-bootnode2', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '87', name: 'use1-aeneid-internal-archive-rpc1', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '88', name: 'use1-aeneid-internal-full-rpc1', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '89', name: 'use1-aeneid-public-rpc1', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '90', name: 'use1-aeneid-public-rpc2', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '91', name: 'use1-aeneid-public-rpc4', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '92', name: 'use1-aeneid-validator1', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '93', name: 'use1-aeneid-validator2', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '94', name: 'use1-aeneid-validator3', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '95', name: 'use1-aeneid-validator4.us-east1-d.c.story-aeneid.internal', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '96', name: 'Krews', region: 'North America', country: 'United States', provider: 'GOOGLE' },
  { id: '97', name: 'archive_rpc', region: 'North America', country: 'United States', provider: 'IS-AS-1' },
  { id: '98', name: 'snap', region: 'North America', country: 'United States', provider: 'LEVEL3' },
  { id: '99', name: 'InfStones', region: 'North America', country: 'United States', provider: 'LEVEL3' },
  { id: '100', name: 'story-aeneid-archive-ora-iad-a00', region: 'North America', country: 'United States', provider: 'ORACLE-BMC-31898' },
  { id: '101', name: 'story-aeneid-archive-ora-iad-a01', region: 'North America', country: 'United States', provider: 'ORACLE-BMC-31898' },
  { id: '102', name: 'story-aeneid-archive-ora-iad-b00', region: 'North America', country: 'United States', provider: 'ORACLE-BMC-31898' },
  { id: '103', name: 'story-aeneid-archive-ora-iad-b01', region: 'North America', country: 'United States', provider: 'ORACLE-BMC-31898' },
  { id: '104', name: 'story-aeneid-ronald-archive-ora-iad-a00', region: 'North America', country: 'United States', provider: 'ORACLE-BMC-31898' },
  { id: '105', name: 'Republic', region: 'North America', country: 'United States', provider: 'OVH SAS' },
  { id: '106', name: 'moonli.me', region: 'North America', country: 'United States', provider: 'OVH SAS' },
  { id: '107', name: '534099dde70b', region: 'North America', country: 'United States', provider: 'RELIABLESITE' },
  { id: '108', name: 'e01bb68df2ce', region: 'North America', country: 'United States', provider: 'SINGLEHOP-LLC' },
  { id: '109', name: 'bstg-ip-1', region: 'North America', country: 'United States', provider: 'TERASWITCH' },
  { id: '110', name: 'Technocrypt', region: 'Asia', country: 'Singapore', provider: 'AMAZON-02' },
  { id: '111', name: 'WHTech', region: 'Asia', country: 'Singapore', provider: 'DIGITALOCEAN-ASN' },
  { id: '112', name: 'abc', region: 'Asia', country: 'Singapore', provider: 'DIGITALOCEAN-ASN' },
  { id: '113', name: 'catsmile', region: 'Asia', country: 'Singapore', provider: 'GOOGLE-CLOUD-PLATFORM' },
  { id: '114', name: '534099dde70b', region: 'Asia', country: 'Singapore', provider: 'Hostinger International Limited' },
  { id: '115', name: 'ContributionDAO', region: 'Asia', country: 'Singapore', provider: 'INTERNAP-BLK4' },
  { id: '116', name: 'coinage_x_daic', region: 'Asia', country: 'Singapore', provider: 'OVH SAS' },
  { id: '117', name: 'Coha05', region: 'Europe', country: 'Austria', provider: 'IPAX GmbH' },
  { id: '118', name: 'micto-snap', region: 'Europe', country: 'Austria', provider: 'Unknown' },
  { id: '119', name: 'NodeSync', region: 'Europe', country: 'Austria', provider: 'Unknown' },
  { id: '120', name: 'StorySaya', region: 'Europe', country: 'Austria', provider: 'Unknown' },
  { id: '121', name: 'EquinoxDao', region: 'Europe', country: 'Austria', provider: 'Unknown' },
  { id: '122', name: 'DeSpread', region: 'Europe', country: 'Austria', provider: 'netcup GmbH' },
  { id: '123', name: 'Everstake', region: 'Europe', country: 'France', provider: 'OVH SAS' },
  { id: '124', name: 'Nodes.Guru', region: 'Europe', country: 'France', provider: 'OVH SAS' },
  { id: '125', name: 'ST-SERVER', region: 'Europe', country: 'France', provider: 'OVH SAS' },
  { id: '126', name: 'vacamare', region: 'Europe', country: 'France', provider: 'OVH SAS' },
  { id: '127', name: 'Cryptomolot', region: 'Europe', country: 'France', provider: 'OVH SAS' },
  { id: '128', name: 'HusoNode', region: 'Europe', country: 'Poland', provider: 'MEVSPACE sp. z o.o.' },
  { id: '129', name: 'OshVanK', region: 'Europe', country: 'Poland', provider: 'MEVSPACE sp. z o.o.' },
  { id: '130', name: 'testnetnodes', region: 'Europe', country: 'Poland', provider: 'MEVSPACE sp. z o.o.' },
  { id: '131', name: 'Grand', region: 'Europe', country: 'Poland', provider: 'OVH SAS' },
  { id: '132', name: 'Vitwit', region: 'Europe', country: 'Poland', provider: 'OVH SAS' },
  { id: '133', name: '0xjams', region: 'Europe', country: 'United Kingdom', provider: 'AS-CHOOPA' },
  { id: '134', name: 'blockscout_node_1', region: 'Europe', country: 'United Kingdom', provider: 'NL-811-40021' },
  { id: '135', name: 'b-aeneid-s0', region: 'Europe', country: 'United Kingdom', provider: 'Netwise Hosting Ltd' },
  { id: '136', name: 'Pro-Nodes75_testnet_archive', region: 'Europe', country: 'United Kingdom', provider: 'OVH SAS' },
  { id: '137', name: 'R1BXiJB3Uy', region: 'Europe', country: 'United Kingdom', provider: 'OVH SAS' },
  { id: '138', name: 'Pro-Nodes75_testnet', region: 'North America', country: 'Canada', provider: 'DIGITALOCEAN-ASN' },
  { id: '139', name: 'Relay1', region: 'North America', country: 'Canada', provider: 'OVH SAS' },
  { id: '140', name: 'HashBamboo', region: 'Europe', country: 'Belgium', provider: 'GOOGLE-CLOUD-PLATFORM' },
  { id: '141', name: 'ts-test-01', region: 'Asia', country: 'Hong Kong', provider: 'Scloud Pte Ltd' },
  { id: '142', name: 'piki-nodes', region: 'Europe', country: 'Ireland', provider: 'euNetworks GmbH' },
  { id: '143', name: 'story-001-stg', region: 'Europe', country: 'Lithuania', provider: 'Informacines sistemos ir technologijos, UAB' },
  { id: '144', name: 'MiawLabs', region: 'Asia', country: 'Taiwan', provider: 'Asia Pacific Broadband Fixed Lines Co., Ltd.' }
];

const createValidatorsData = (): Validator[] => {
  return validatorsData.map((v, idx) => {
    const [baseLat, baseLng] = countryCoordinates[v.country] || [0, 0];
    // Generate a stable random offset per validator
    const seed = parseInt(v.id, 36) || idx;
    const latOffset = ((Math.sin(seed) + 1) / 2 - 0.5) * 2;
    const lngOffset = ((Math.cos(seed) + 1) / 2 - 0.5) * 2;
    return {
      ...v,
      lat: baseLat,
      lng: baseLng,
      latOffset,
      lngOffset,
      status: 'active',
      performance: 98 + Math.random() * 2,
      operatorAddress: v.operatorAddress || v.id
    };
  });
};

// Create custom marker icon
const createCustomIcon = (color: string, size: number = 12) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 2px solid #fff;
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}80;
        position: relative;
        z-index: 1000;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const NetworkVisualization = () => {
  const [validators] = useState<Validator[]>(createValidatorsData());
  const [mapboxToken, setMapboxToken] = useState('');
  const [latestProposers, setLatestProposers] = useState<BlockProposer[]>([]);
  const [loadingProposer, setLoadingProposer] = useState(false);
  const [proposerError, setProposerError] = useState<string | null>(null);

  console.log('Validators data:', validators.length);

  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;
    
    const fetchLatestProposer = async () => {
      setLoadingProposer(true);
      setProposerError(null);
      try {
        const res = await fetch('http://94.131.9.121:3001/api/blocks');
        if (!res.ok) throw new Error('Failed to fetch latest block');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          if (isMounted) {
            setLatestProposers(data.slice(0, 3).map(block => ({
              moniker: block.proposer.moniker || block.proposer.operatorAddress,
              operatorAddress: block.proposer.operatorAddress,
              hexAddress: block.proposer.hexAddress,
              avatar: block.proposer.avatar,
              height: block.height,
              time: block.time,
            })));
          }
        }
      } catch (err: any) {
        if (isMounted) setProposerError(err.message || 'Unknown error');
      } finally {
        if (isMounted) setLoadingProposer(false);
      }
    };

    fetchLatestProposer();
    interval = setInterval(fetchLatestProposer, 2000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getValidatorColor = (status: string, performance: number): string => {
    if (status === 'slashed') return '#ef4444';
    if (performance > 99) return '#10b981';
    if (performance > 95) return '#3b82f6';
    if (performance > 90) return '#8b5cf6';
    return '#f59e0b';
  };

  const latestProposer = latestProposers[0];

  // Chart configurations
  const statusData = [
    { 
      value: validators.filter(v => v.status === 'active').length, 
      name: 'Active',
      itemStyle: { color: '#10b981' }
    },
    { 
      value: validators.filter(v => v.status === 'inactive').length, 
      name: 'Inactive',
      itemStyle: { color: '#6b7280' }
    },
    { 
      value: validators.filter(v => v.status === 'slashed').length, 
      name: 'Slashed',
      itemStyle: { color: '#ef4444' }
    }
  ];

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
      data: statusData
    }]
  };

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2 overflow-hidden">
      <style>{`
        .leaflet-container {
          background: #0f172a !important;
          height: 100%;
          width: 100%;
          border-radius: 0.5rem;
        }
        .leaflet-tile {
          filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
        }
        .leaflet-control-container {
          filter: invert(1);
        }
        .custom-marker {
          z-index: 1000 !important;
        }
        .leaflet-popup-content-wrapper {
          background: rgba(30, 41, 59, 0.95) !important;
          color: #fff !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px;
        }
        .leaflet-popup-tip {
          background: rgba(30, 41, 59, 0.95) !important;
        }
      `}</style>
      
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-2 h-[40px]">
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Story Testnet Network Dashboard
          </span>
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
      <div className="grid grid-cols-12 gap-2 h-[calc(100vh-50px)]">
        {/* Left Panel */}
        <div className="col-span-2 flex flex-col gap-2">
          <Card className="bg-white/5 border-white/10 p-4 h-[280px] flex flex-col">
            <div className="text-white text-sm font-medium mb-3">Recent Block Proposers</div>
            {loadingProposer && latestProposers.length === 0 ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-gray-400">Loading...</div>
              </div>
            ) : proposerError ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-red-400">{proposerError}</div>
              </div>
            ) : latestProposers.length > 0 ? (
              <div className="flex-1 overflow-y-auto space-y-2">
                {latestProposers.map((proposer, idx) => (
                  <div
                    key={proposer.height}
                    className={`p-2 bg-white/5 rounded-lg ${idx === 0 ? 'border border-purple-500/30' : ''}`}
                  >
                    <div className="text-sm font-semibold text-purple-300 truncate">
                      {proposer.moniker}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {proposer.operatorAddress}
                    </div>
                    <div className="text-xs text-white">
                      Height: {proposer.height.toLocaleString()}
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
          
          <Card className="bg-white/5 border-white/10 p-2 h-[200px]">
            <ReactECharts option={statusChartOption} style={{ height: '100%' }} />
          </Card>
        </div>

        {/* Center Panel (Map + Stats) */}
        <div className="col-span-8 flex flex-col gap-2">
          {/* Top Stats */}
          <div className="grid grid-cols-4 gap-2">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-2 text-center">
              <div className="text-xl font-bold text-purple-400">{validators.length}</div>
              <div className="text-gray-400 text-xs">Total Validators</div>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-2 text-center">
              <div className="text-xl font-bold text-green-400">
                {validators.filter(v => v.status === 'active').length}
              </div>
              <div className="text-gray-400 text-xs">Active</div>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-2 text-center">
              <div className="text-xl font-bold text-blue-400">
                {new Set(validators.map(v => v.region)).size}
              </div>
              <div className="text-gray-400 text-xs">Regions</div>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 p-2 text-center">
              <div className="text-xl font-bold text-yellow-400">
                {(validators.reduce((acc, v) => acc + v.performance, 0) / validators.length).toFixed(1)}%
              </div>
              <div className="text-gray-400 text-xs">Avg Performance</div>
            </Card>
          </div>
          
          {/* World Map */}
          <Card className="bg-white/5 border-white/10 p-2 flex-1">
            <MapContainer
              center={[20, 0]}
              zoom={2}
              minZoom={1}
              maxZoom={10}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <MarkerClusterGroup>
                {validators.map((validator) => {
                  const finalLat = validator.lat + validator.latOffset;
                  const finalLng = validator.lng + validator.lngOffset;
                  const isLatestProposer = validator.operatorAddress === latestProposer?.operatorAddress;
                  const color = isLatestProposer ? '#f59e0b' : getValidatorColor(validator.status, validator.performance);
                  const size = isLatestProposer ? 16 : 12;
                  
                  return (
                    <Marker
                      key={validator.id}
                      position={[finalLat, finalLng]}
                      icon={createCustomIcon(color, size)}
                    >
                      <Popup maxWidth={300}>
                        <div className="p-3 min-w-[250px]">
                          <h3 className="font-bold text-white mb-2">{validator.name}</h3>
                          <div className="text-sm space-y-1">
                            <div><span className="text-gray-300">Region:</span> <span className="text-white">{validator.region}</span></div>
                            <div><span className="text-gray-300">Country:</span> <span className="text-white">{validator.country}</span></div>
                            <div><span className="text-gray-300">Provider:</span> <span className="text-white text-xs">{validator.provider}</span></div>
                            <div><span className="text-gray-300">Status:</span> <span className="text-green-400">{validator.status}</span></div>
                            <div><span className="text-gray-300">Performance:</span> <span className="text-white">{validator.performance.toFixed(1)}%</span></div>
                            {isLatestProposer && (
                              <div className="text-yellow-400 font-bold">★ Latest Proposer</div>
                            )}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MarkerClusterGroup>
            </MapContainer>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="col-span-2 flex flex-col gap-2">
          <Card className="bg-white/5 border-white/10 p-4 flex-1">
            <div className="text-white text-sm font-medium mb-3">Network Stats</div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Nodes</span>
                <span className="text-white font-bold">{validators.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Nodes</span>
                <span className="text-green-400 font-bold">{validators.filter(v => v.status === 'active').length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Countries</span>
                <span className="text-blue-400 font-bold">{new Set(validators.map(v => v.country)).size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Providers</span>
                <span className="text-purple-400 font-bold">{new Set(validators.map(v => v.provider)).size}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;
