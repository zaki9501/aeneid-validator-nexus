import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import * as echarts from 'echarts';
import ReactECharts from 'echarts-for-react';
import 'leaflet/dist/leaflet.css';

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
}

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

// Add small random offset to prevent overlapping markers
const getOffsetCoordinates = (lat: number, lng: number): [number, number] => {
  const latOffset = (Math.random() - 0.5) * 2;
  const lngOffset = (Math.random() - 0.5) * 2;
  return [lat + latOffset, lng + lngOffset];
};

// Validators data from user
const validatorsData: Omit<Validator, 'lat' | 'lng' | 'status' | 'performance'>[] = [
  { id: '1', name: 'bangpateng', region: 'Europe', country: 'Germany', provider: 'AMAZON-02' },
  { id: '2', name: 'OneNov', region: 'Europe', country: 'Germany', provider: 'Contabo GmbH' },
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
    const [lat, lng] = getOffsetCoordinates(baseLat, baseLng);
    return {
      ...v,
      lat,
      lng,
      status: 'active', // or use real status if available
      performance: 98 + Math.random() * 2 // random performance for demo
    };
  });
};

// Create glowing icon function
const createGlowingIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="marker-pin" style="
        width: 12px;
        height: 12px;
        background: ${color};
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}, 0 0 20px ${color}40;
        animation: pulse 2s infinite;
      "></div>
    `,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
};

const NetworkVisualization = () => {
  const [validators] = useState<Validator[]>(createValidatorsData());

  // Calculate statistics
  const totalValidators = validators.length;
  const activeValidators = validators.filter(v => v.status === 'active').length;
  const averagePerformance = (validators.reduce((acc, v) => acc + v.performance, 0) / totalValidators).toFixed(1);

  // Group validators by region
  const validatorsByRegion = validators.reduce((acc, v) => {
    acc[v.region] = (acc[v.region] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate top validators
  const topValidators = useMemo(() => 
    validators
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5)
      .map(v => ({
        id: v.id,
        name: v.name,
        performance: v.performance,
        stake: `${(Math.random() * 1000 + 500).toFixed(0)}K` // Mock stake data
      })), [validators]);

  const getValidatorColor = (status: string, performance: number): string => {
    if (status === 'slashed') return '#ef4444';
    if (performance > 95) return '#10b981';
    if (performance > 90) return '#3b82f6';
    if (performance > 85) return '#8b5cf6';
    return '#f59e0b';
  };

  // Mock data for charts
  const activityData = {
    dates: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    events: [120, 132, 101, 134, 90, 230, 210],
    performance: [98.5, 97.8, 99.1, 98.7, 96.5, 98.9, 99.2],
    uptime: [99.9, 99.8, 99.9, 99.7, 99.8, 99.9, 100],
  };

  const statusData = [
    { 
      value: 100, 
      name: 'Active',
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#10b981' },
          { offset: 1, color: '#059669' }
        ])
      }
    },
    { 
      value: 20, 
      name: 'Inactive',
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#6b7280' },
          { offset: 1, color: '#4b5563' }
        ])
      }
    },
    { 
      value: 3, 
      name: 'Slashed',
      itemStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#ef4444' },
          { offset: 1, color: '#dc2626' }
        ])
      }
    }
  ];

  const eventTypes = [
    { name: 'Proposals', value: 85, color: '#8b5cf6' },
    { name: 'Attestations', value: 92, color: '#3b82f6' },
    { name: 'Sync', value: 78, color: '#10b981' }
  ];

  const recentEvents: RecentEvent[] = [
    { id: 1, type: 'Proposal', validator: 'Validator Alpha', time: '2m ago', status: 'success' },
    { id: 2, type: 'Attestation', validator: 'Validator Beta', time: '5m ago', status: 'success' },
    { id: 3, type: 'Sync', validator: 'Validator Gamma', time: '8m ago', status: 'warning' },
    { id: 4, type: 'Proposal', validator: 'Validator Delta', time: '12m ago', status: 'success' },
    { id: 5, type: 'Attestation', validator: 'Validator Epsilon', time: '15m ago', status: 'error' },
  ];

  const performanceTrendData = {
    times: ['12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    values: [96.5, 97.8, 98.2, 97.5, 98.8, 99.1, 98.7],
    target: Array(7).fill(98)
  };

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
      data: activityData.dates,
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
        data: activityData.events,
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
        data: activityData.performance,
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
        data: activityData.uptime,
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

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-2">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-2 h-[40px]">
        <div className="flex items-center gap-3">
          {/* TODO: Add logo if needed */}
          <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Story Testnet Network Dashboard</span>
        </div>
        <div className="text-gray-400 text-sm">{new Date().toLocaleString()}</div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-2 h-[calc(100vh-50px)]">
        {/* Left Panel */}
        <div className="col-span-12 md:col-span-2 flex flex-col gap-2">
          <Card className="bg-white/5 border-white/10 p-2 h-[150px]">
            <ReactECharts option={activityChartOption} style={{ height: '100%' }} theme="dark" />
          </Card>
          <Card className="bg-white/5 border-white/10 p-2 h-[150px]">
            <ReactECharts option={statusChartOption} style={{ height: '100%' }} theme="dark" />
          </Card>
          <Card className="bg-white/5 border-white/10 p-2 flex-1">
            <div className="text-white text-sm font-medium mb-2">Top Validators</div>
            <div className="space-y-2">
              {topValidators.map((validator, index) => (
                <div
                  key={validator.id}
                  className="bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-gray-400">#{index + 1}</div>
                      <div className="text-sm text-gray-200">{validator.name}</div>
                    </div>
                    <div className="text-xs text-gray-400">{validator.stake}</div>
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 flex-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500"
                        style={{ width: `${validator.performance}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400">{validator.performance}%</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Center Panel (Map + Top Stats) */}
        <div className="col-span-12 md:col-span-8 flex flex-col gap-2">
          {/* Top Stats */}
          <div className="grid grid-cols-4 gap-2">
            <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 p-2 text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{validators.length}</div>
              <div className="text-gray-400 text-xs">Total Validators</div>
            </Card>
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 p-2 text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                {validators.filter(v => v.status === 'active').length}
              </div>
              <div className="text-gray-400 text-xs">Active</div>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 p-2 text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {new Set(validators.map(v => v.region)).size}
              </div>
              <div className="text-gray-400 text-xs">Regions</div>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20 p-2 text-center">
              <div className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {(validators.reduce((acc, v) => acc + v.performance, 0) / validators.length).toFixed(1)}%
              </div>
              <div className="text-gray-400 text-xs">Avg Performance</div>
            </Card>
          </div>
          {/* World Map Visualization */}
          <Card className="bg-white/5 border-white/10 p-2 flex-1 overflow-hidden">
            <style>{`
              .leaflet-container {
                background: #0f172a;
                height: 100%;
                width: 100%;
                border-radius: 0.5rem;
              }
              .leaflet-tile {
                filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
              }
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
              }
              .custom-marker {
                animation: pulse 2s infinite;
              }
              .leaflet-popup-content-wrapper {
                background: rgba(30, 41, 59, 0.95);
                color: #fff;
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(8px);
              }
              .leaflet-popup-tip {
                background: rgba(30, 41, 59, 0.95);
              }
            `}</style>
            <MapContainer
              center={[45, 10]}
              zoom={3}
              minZoom={2}
              maxZoom={18}
              scrollWheelZoom={true}
              style={{ height: '100%', width: '100%', background: '#0f172a' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {validators.map((validator) => {
                const [baseLat, baseLng] = countryCoordinates[validator.country] || [0, 0];
                const latOffset = (Math.random() - 0.5) * 4;
                const lngOffset = (Math.random() - 0.5) * 4;
                return (
                  <Marker
                    key={validator.id}
                    position={[baseLat + latOffset, baseLng + lngOffset]}
                    icon={createGlowingIcon(getValidatorColor(validator.status, validator.performance))}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-bold text-white mb-2">{validator.name}</h3>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-300">Region: <span className="text-white">{validator.region}</span></p>
                          <p className="text-gray-300">Country: <span className="text-white">{validator.country}</span></p>
                          <p className="text-gray-300">Provider: <span className="text-white">{validator.provider}</span></p>
                          <p className="text-gray-300">Status: <span className="text-white">{validator.status}</span></p>
                          <p className="text-gray-300">Performance: <span className="text-white">{validator.performance}%</span></p>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
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
