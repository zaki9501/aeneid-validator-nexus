// Real validator location data from decentralization map - Fixed
export interface ValidatorLocation {
  moniker: string;
  ip: string;
  originalIp: string;
  latitude: number;
  longitude: number;
  countryName: string;
  cityName: string;
  continentName: string;
  port?: string;
}

export interface ProviderData {
  monikers: ValidatorLocation[];
}

export interface CountryData {
  amount: number;
  providers: {
    [providerName: string]: ProviderData;
  };
}

export interface MapData {
  total_monikers: number;
  [countryName: string]: CountryData | number;
}

// Real validator location data from decentralization map
export const validatorLocationData: MapData = {
  total_monikers: 180,

             
  "Germany": {
    "amount": 54,
    "providers": {
        "AMAZON-02": {
            "monikers": [
                {
                    "moniker": "FourPillars",
                    "ip": "18.185.85.143",
                    "originalIp": "18.185.85.143",
                    "latitude": 50.1187,
                    "longitude": 8.6842,
                    "countryName": "Germany",
                    "cityName": "Frankfurt am Main",
                    "continentName": "Europe"
                }
            ]
        },
        "Aixit GmbH": {
            "monikers": [
                {
                    "moniker": "TOKRICH",
                    "ip": "193.24.210.4",
                    "originalIp": "193.24.210.4",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                }
            ]
        },
        "Contabo GmbH": {
            "monikers": [
                {
                    "moniker": "OneNov",
                    "ip": "144.91.107.167",
                    "originalIp": "144.91.107.167",
                    "latitude": 49.405,
                    "longitude": 11.1617,
                    "countryName": "Germany",
                    "cityName": "Nuremberg",
                    "continentName": "Europe"
                },
                {
                    "moniker": "roberta",
                    "ip": "38.242.203.144",
                    "originalIp": "38.242.203.144",
                    "latitude": 51.2184,
                    "longitude": 6.7734,
                    "countryName": "Germany",
                    "cityName": "Düsseldorf",
                    "continentName": "Europe"
                },
                {
                    "moniker": "wansnode",
                    "ip": "161.97.123.165",
                    "originalIp": "161.97.123.165",
                    "latitude": 49.405,
                    "longitude": 11.1617,
                    "countryName": "Germany",
                    "cityName": "Nuremberg",
                    "continentName": "Europe"
                }
            ]
        },
        "GOOGLE-CLOUD-PLATFORM": {
            "monikers": [
                {
                    "moniker": "node-story-aeneid-1",
                    "ip": "34.89.189.225",
                    "originalIp": "34.89.189.225",
                    "latitude": 50.1187,
                    "longitude": 8.6842,
                    "countryName": "Germany",
                    "cityName": "Frankfurt am Main",
                    "continentName": "Europe"
                },
                {
                    "moniker": "node-story-aeneid-1",
                    "ip": "34.40.60.124",
                    "originalIp": "34.40.60.124",
                    "latitude": 50.1187,
                    "longitude": 8.6842,
                    "countryName": "Germany",
                    "cityName": "Frankfurt am Main",
                    "continentName": "Europe"
                }
            ]
        },
        "Hetzner Online GmbH": {
            "monikers": [
                {
                    "moniker": "[NODERS]",
                    "ip": "116.202.219.112",
                    "originalIp": "116.202.219.112",
                    "latitude": 49.4419,
                    "longitude": 11.0797,
                    "countryName": "Germany",
                    "cityName": "Nuremberg",
                    "continentName": "Europe"
                },
                {
                    "moniker": "[NODERS]_SERVICES",
                    "ip": "94.130.164.82",
                    "originalIp": "94.130.164.82",
                    "latitude": 49.4071,
                    "longitude": 8.6879,
                    "countryName": "Germany",
                    "cityName": "Heidelberg",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Alchemy",
                    "ip": "176.9.54.69",
                    "originalIp": "176.9.54.69",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Auranode",
                    "ip": "23.88.18.240",
                    "originalIp": "23.88.18.240",
                    "latitude": 49.1156,
                    "longitude": 10.7511,
                    "countryName": "Germany",
                    "cityName": "Gunzenhausen",
                    "continentName": "Europe"
                },
                {
                    "moniker": "BlockNth",
                    "ip": "162.55.83.254",
                    "originalIp": "162.55.83.254",
                    "latitude": 50.6584,
                    "longitude": 7.8268,
                    "countryName": "Germany",
                    "cityName": "Hachenburg",
                    "continentName": "Europe"
                },
                {
                    "moniker": "BlockPro",
                    "ip": "88.198.27.51",
                    "originalIp": "88.198.27.51",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "charizard",
                    "ip": "162.55.85.143",
                    "originalIp": "162.55.85.143",
                    "latitude": 50.6584,
                    "longitude": 7.8268,
                    "countryName": "Germany",
                    "cityName": "Hachenburg",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Chicharito",
                    "ip": "148.251.66.35",
                    "originalIp": "148.251.66.35",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "devnet-1-seed",
                    "ip": "195.201.130.235",
                    "originalIp": "195.201.130.235",
                    "latitude": 49.1156,
                    "longitude": 10.7511,
                    "countryName": "Germany",
                    "cityName": "Gunzenhausen",
                    "continentName": "Europe"
                },
                {
                    "moniker": "DTEAM | RPC",
                    "ip": "116.202.217.20",
                    "originalIp": "116.202.217.20",
                    "latitude": 49.4419,
                    "longitude": 11.0797,
                    "countryName": "Germany",
                    "cityName": "Nuremberg",
                    "continentName": "Europe"
                },
                {
                    "moniker": "empirex",
                    "ip": "144.76.103.142",
                    "originalIp": "144.76.103.142",
                    "latitude": 51.6452,
                    "longitude": 7.7351,
                    "countryName": "Germany",
                    "cityName": "Hamm",
                    "continentName": "Europe"
                },
                {
                    "moniker": "encapsulate",
                    "ip": "176.9.8.81",
                    "originalIp": "176.9.8.81",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "FuryNodes",
                    "ip": "78.46.58.241",
                    "originalIp": "78.46.58.241",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "ISI_Node",
                    "ip": "148.251.135.178",
                    "originalIp": "148.251.135.178",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "kaplan",
                    "ip": "144.76.106.228",
                    "originalIp": "144.76.106.228",
                    "latitude": 51.6452,
                    "longitude": 7.7351,
                    "countryName": "Germany",
                    "cityName": "Hamm",
                    "continentName": "Europe"
                },
                {
                    "moniker": "krews-snapshot-archive",
                    "ip": "188.40.102.137",
                    "originalIp": "188.40.102.137",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "l5tlong",
                    "ip": "142.132.209.236",
                    "originalIp": "142.132.209.236",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "LuckyStar",
                    "ip": "88.99.137.138",
                    "originalIp": "88.99.137.138",
                    "latitude": 53.5665,
                    "longitude": 9.9132,
                    "countryName": "Germany",
                    "cityName": "Hamburg",
                    "continentName": "Europe"
                },
                {
                    "moniker": "metilnodes",
                    "ip": "94.130.39.181",
                    "originalIp": "94.130.39.181",
                    "latitude": 48.5751,
                    "longitude": 12.1807,
                    "countryName": "Germany",
                    "cityName": "Ergolding",
                    "continentName": "Europe"
                },
                {
                    "moniker": "naruto",
                    "ip": "148.251.44.103",
                    "originalIp": "148.251.44.103",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "node",
                    "ip": "188.40.85.207",
                    "originalIp": "188.40.85.207",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "node",
                    "ip": "46.4.80.48",
                    "originalIp": "46.4.80.48",
                    "latitude": 52.5201,
                    "longitude": 13.4425,
                    "countryName": "Germany",
                    "cityName": "Berlin",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Nodeinfra",
                    "ip": "144.76.111.9",
                    "originalIp": "144.76.111.9",
                    "latitude": 51.6452,
                    "longitude": 7.7351,
                    "countryName": "Germany",
                    "cityName": "Hamm",
                    "continentName": "Europe"
                },
                {
                    "moniker": "NodeSphere",
                    "ip": "176.9.126.78",
                    "originalIp": "176.9.126.78",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "obl",
                    "ip": "178.63.184.132",
                    "originalIp": "178.63.184.132",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "PathrockNetwork",
                    "ip": "167.235.183.110",
                    "originalIp": "167.235.183.110",
                    "latitude": 49.4922,
                    "longitude": 8.464,
                    "countryName": "Germany",
                    "cityName": "Mannheim",
                    "continentName": "Europe"
                },
                {
                    "moniker": "polkachu",
                    "ip": "188.40.66.173",
                    "originalIp": "188.40.66.173",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "rpc-1.odyssey.story.nodes.guru",
                    "ip": "49.12.92.82",
                    "originalIp": "49.12.92.82",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "StakeUs",
                    "ip": "213.239.213.212",
                    "originalIp": "213.239.213.212",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Ubuntu-2204-jammy-64-allnodes",
                    "ip": "136.243.13.60",
                    "originalIp": "136.243.13.60",
                    "latitude": 49.7435,
                    "longitude": 10.1615,
                    "countryName": "Germany",
                    "cityName": "Kitzingen",
                    "continentName": "Europe"
                },
                {
                    "moniker": "validator",
                    "ip": "144.76.202.120",
                    "originalIp": "144.76.202.120",
                    "latitude": 51.6452,
                    "longitude": 7.7351,
                    "countryName": "Germany",
                    "cityName": "Hamm",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Validator.eth",
                    "ip": "144.76.70.103",
                    "originalIp": "144.76.70.103",
                    "latitude": 51.6452,
                    "longitude": 7.7351,
                    "countryName": "Germany",
                    "cityName": "Hamm",
                    "continentName": "Europe"
                },
                {
                    "moniker": "validatorsg",
                    "ip": "168.119.11.176",
                    "originalIp": "168.119.11.176",
                    "latitude": 51.5603,
                    "longitude": 7.0063,
                    "countryName": "Germany",
                    "cityName": "Gladbeck",
                    "continentName": "Europe"
                },
                {
                    "moniker": "ValidatorVN",
                    "ip": "213.239.198.181",
                    "originalIp": "213.239.198.181",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "xxxigm",
                    "ip": "178.63.79.214",
                    "originalIp": "178.63.79.214",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                }
            ]
        },
        "IP-Projects GmbH \u0026 Co. KG": {
            "monikers": [
                {
                    "moniker": "Synergy_Nodes",
                    "ip": "103.241.50.17",
                    "originalIp": "103.241.50.17",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                }
            ]
        },
        "LATITUDE-SH": {
            "monikers": [
                {
                    "moniker": "TrustedPoint",
                    "ip": "160.202.131.55",
                    "originalIp": "160.202.131.55",
                    "latitude": 50.1187,
                    "longitude": 8.6842,
                    "countryName": "Germany",
                    "cityName": "Frankfurt am Main",
                    "continentName": "Europe"
                }
            ]
        },
        "Leaseweb Deutschland GmbH": {
            "monikers": [
                {
                    "moniker": "liquify-validator",
                    "ip": "212.95.53.135",
                    "originalIp": "212.95.53.135",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                }
            ]
        },
        "Unknown": {
            "monikers": [
                {
                    "moniker": "5Kage",
                    "ip": "157.180.3.36",
                    "originalIp": "157.180.3.36",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "devnet-1-seed",
                    "ip": "138.199.161.58",
                    "originalIp": "138.199.161.58",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "OgNodes",
                    "ip": "157.180.48.138",
                    "originalIp": "157.180.48.138",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Provalidator",
                    "ip": "157.180.3.14",
                    "originalIp": "157.180.3.14",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                },
                {
                    "moniker": "StoneGaze",
                    "ip": "157.180.8.121",
                    "originalIp": "157.180.8.121",
                    "latitude": 51.2993,
                    "longitude": 9.491,
                    "countryName": "Germany",
                    "cityName": "Unknown",
                    "continentName": "Europe"
                }
            ]
        },
        "netcup GmbH": {
            "monikers": [
                {
                    "moniker": "BlockHub",
                    "ip": "185.232.68.94",
                    "originalIp": "185.232.68.94",
                    "latitude": 49.4423,
                    "longitude": 11.0191,
                    "countryName": "Germany",
                    "cityName": "Nuremberg",
                    "continentName": "Europe"
                },
                {
                    "moniker": "CoinHunters",
                    "ip": "202.61.201.79",
                    "originalIp": "202.61.201.79",
                    "latitude": 49.4423,
                    "longitude": 11.0191,
                    "countryName": "Germany",
                    "cityName": "Nuremberg",
                    "continentName": "Europe"
                },
                {
                    "moniker": "test",
                    "ip": "89.58.5.231",
                    "originalIp": "89.58.5.231",
                    "latitude": 49.4423,
                    "longitude": 11.0191,
                    "countryName": "Germany",
                    "cityName": "Nuremberg",
                    "continentName": "Europe"
                }
            ]
        },
        "velia.net Internetdienste GmbH": {
            "monikers": [
                {
                    "moniker": "node",
                    "ip": "85.195.94.57",
                    "originalIp": "85.195.94.57",
                    "latitude": 50.1187,
                    "longitude": 8.6842,
                    "countryName": "Germany",
                    "cityName": "Frankfurt am Main",
                    "continentName": "Europe"
                }
            ]
        }
    }
},
"Finland": {
    "amount": 44,
    "providers": {
        "Hetzner Online GmbH": {
            "monikers": [
                {
                    "moniker": "[NODERS]SERVICES_ARCHIVE",
                    "ip": "65.108.226.44",
                    "originalIp": "65.108.226.44",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "1XP",
                    "ip": "95.217.119.251",
                    "originalIp": "95.217.119.251",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "aeneid",
                    "ip": "65.21.130.42",
                    "originalIp": "65.21.130.42",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "AllnodesOne",
                    "ip": "65.108.45.176",
                    "originalIp": "65.108.45.176",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "ApexNodes",
                    "ip": "65.108.233.73",
                    "originalIp": "65.108.233.73",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "bitsturbine",
                    "ip": "95.217.35.120",
                    "originalIp": "95.217.35.120",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "BlockPI",
                    "ip": "65.108.45.34",
                    "originalIp": "65.108.45.34",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "breskulpeak.com",
                    "ip": "65.109.84.37",
                    "originalIp": "65.109.84.37",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Caliber",
                    "ip": "65.109.69.188",
                    "originalIp": "65.109.69.188",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "COCOCOPS",
                    "ip": "65.108.129.173",
                    "originalIp": "65.108.129.173",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "corenode",
                    "ip": "37.27.127.145",
                    "originalIp": "37.27.127.145",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "cosmic-validator",
                    "ip": "37.27.235.159",
                    "originalIp": "37.27.235.159",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "CroutonDigital",
                    "ip": "65.108.128.251",
                    "originalIp": "65.108.128.251",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Darksun",
                    "ip": "135.181.63.30",
                    "originalIp": "135.181.63.30",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Decadanceux",
                    "ip": "95.216.69.94",
                    "originalIp": "95.216.69.94",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "encipher",
                    "ip": "65.109.50.125",
                    "originalIp": "65.109.50.125",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Enigma",
                    "ip": "65.21.29.250",
                    "originalIp": "65.21.29.250",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "ESERCKR",
                    "ip": "65.108.125.237",
                    "originalIp": "65.108.125.237",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "F2Validator",
                    "ip": "65.109.142.183",
                    "originalIp": "65.109.142.183",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "hello-world",
                    "ip": "65.108.30.59",
                    "originalIp": "65.108.30.59",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "ITRocket",
                    "ip": "65.109.22.211",
                    "originalIp": "65.109.22.211",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "kgnodes",
                    "ip": "65.109.30.147",
                    "originalIp": "65.109.30.147",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "KruGGoK-Stakesnodes",
                    "ip": "65.108.75.52",
                    "originalIp": "65.108.75.52",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Kyronode",
                    "ip": "135.181.79.101",
                    "originalIp": "135.181.79.101",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "MekongLabs",
                    "ip": "65.21.192.60",
                    "originalIp": "65.21.192.60",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "MiawLabs",
                    "ip": "65.21.79.121",
                    "originalIp": "65.21.79.121",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "node",
                    "ip": "65.108.141.109",
                    "originalIp": "65.108.141.109",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "OriginStake",
                    "ip": "65.21.237.124",
                    "originalIp": "65.21.237.124",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "popsteam",
                    "ip": "135.181.216.166",
                    "originalIp": "135.181.216.166",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "shachopra",
                    "ip": "95.216.54.249",
                    "originalIp": "95.216.54.249",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "smartinvest",
                    "ip": "65.109.88.162",
                    "originalIp": "65.109.88.162",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "snsn",
                    "ip": "65.21.97.155",
                    "originalIp": "65.21.97.155",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "ST-SERVER",
                    "ip": "135.181.240.57",
                    "originalIp": "135.181.240.57",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "ST-SERVER",
                    "ip": "95.217.193.144",
                    "originalIp": "95.217.193.144",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "STAVR",
                    "ip": "65.109.112.148",
                    "originalIp": "65.109.112.148",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Synergy_Nodes",
                    "ip": "65.108.226.200",
                    "originalIp": "65.108.226.200",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "UfA9m4ht5dG74ed88hAiyY7VG72ZJv6P",
                    "ip": "135.181.117.37",
                    "originalIp": "135.181.117.37",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "unity",
                    "ip": "65.108.72.239",
                    "originalIp": "65.108.72.239",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "Unity",
                    "ip": "65.21.67.40",
                    "originalIp": "65.21.67.40",
                    "latitude": 60.1719,
                    "longitude": 24.9347,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"
                },
                {
                    "moniker": "UTSA_guide",
                    "ip": "65.108.111.225",
                    "originalIp": "65.108.111.225",
                    "latitude": 60.1797,
                    "longitude": 24.9344,
                    "countryName": "Finland",
                    "cityName": "Helsinki",
                    "continentName": "Europe"},
                    {
                        "moniker": "ValidatorVNRPC",
                        "ip": "135.181.215.60",
                        "originalIp": "135.181.215.60",
                        "latitude": 60.1719,
                        "longitude": 24.9347,
                        "countryName": "Finland",
                        "cityName": "Helsinki",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "Validatus",
                        "ip": "65.109.59.19",
                        "originalIp": "65.109.59.19",
                        "latitude": 60.1797,
                        "longitude": 24.9344,
                        "countryName": "Finland",
                        "cityName": "Helsinki",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "www",
                        "ip": "65.108.0.231",
                        "originalIp": "65.108.0.231",
                        "latitude": 60.1797,
                        "longitude": 24.9344,
                        "countryName": "Finland",
                        "cityName": "Helsinki",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "zulna",
                        "ip": "65.109.89.243",
                        "originalIp": "65.109.89.243",
                        "latitude": 60.1797,
                        "longitude": 24.9344,
                        "countryName": "Finland",
                        "cityName": "Helsinki",
                        "continentName": "Europe"
                    }
                ]
            }
        }
    },
    "United States": {
        "amount": 38,
        "providers": {
            "AMAZON-02": {
                "monikers": [
                    {
                        "moniker": "story-validator-story-client-0",
                        "ip": "52.88.160.134",
                        "originalIp": "52.88.160.134",
                        "latitude": 45.8234,
                        "longitude": -119.7257,
                        "countryName": "United States",
                        "cityName": "Boardman",
                        "continentName": "North America"
                    }
                ]
            },
            "AMAZON-AES": {
                "monikers": [
                    {
                        "moniker": "story-0",
                        "ip": "54.82.200.23",
                        "originalIp": "54.82.200.23",
                        "latitude": 39.0469,
                        "longitude": -77.4903,
                        "countryName": "United States",
                        "cityName": "Ashburn",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "story-1",
                        "ip": "3.231.68.59",
                        "originalIp": "3.231.68.59",
                        "latitude": 39.0469,
                        "longitude": -77.4903,
                        "countryName": "United States",
                        "cityName": "Ashburn",
                        "continentName": "North America"
                    }
                ]
            },
            "AS-30083-GO-DADDY-COM-LLC": {
                "monikers": [
                    {
                        "moniker": "Cumulo",
                        "ip": "148.72.167.173",
                        "originalIp": "148.72.167.173",
                        "latitude": 38.6287,
                        "longitude": -90.1988,
                        "countryName": "United States",
                        "cityName": "St Louis",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "stk-619",
                        "ip": "148.72.141.31",
                        "originalIp": "148.72.141.31",
                        "latitude": 38.6287,
                        "longitude": -90.1988,
                        "countryName": "United States",
                        "cityName": "St Louis",
                        "continentName": "North America"
                    }
                ]
            },
            "COGENT-174": {
                "monikers": [
                    {
                        "moniker": "Aldebaranode",
                        "ip": "38.129.138.75",
                        "originalIp": "38.129.138.75",
                        "latitude": 37.751,
                        "longitude": -97.822,
                        "countryName": "United States",
                        "cityName": "Unknown",
                        "continentName": "North America"
                    }
                ]
            },
            "DIGITALOCEAN-ASN": {
                "monikers": [
                    {
                        "moniker": "DSRV",
                        "ip": "138.197.210.143",
                        "originalIp": "138.197.210.143",
                        "latitude": 37.3417,
                        "longitude": -121.9753,
                        "countryName": "United States",
                        "cityName": "Santa Clara",
                        "continentName": "North America"
                    }
                ]
            },
            "GOOGLE": {
                "monikers": [
                    {
                        "moniker": "DELIGHT",
                        "ip": "35.212.240.39",
                        "originalIp": "35.212.240.39",
                        "latitude": 45.6056,
                        "longitude": -121.1807,
                        "countryName": "United States",
                        "cityName": "The Dalles",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-bootnode1",
                        "ip": "35.211.57.203",
                        "originalIp": "35.211.57.203",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-bootnode2",
                        "ip": "35.211.167.181",
                        "originalIp": "35.211.167.181",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-internal-archive-rpc1",
                        "ip": "35.211.230.141",
                        "originalIp": "35.211.230.141",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-internal-full-rpc1",
                        "ip": "35.211.167.218",
                        "originalIp": "35.211.167.218",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-public-rpc2",
                        "ip": "35.211.62.101",
                        "originalIp": "35.211.62.101",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-public-rpc4",
                        "ip": "35.211.168.244",
                        "originalIp": "35.211.168.244",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-public-rpc4",
                        "ip": "35.211.53.224",
                        "originalIp": "35.211.53.224",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-validator1",
                        "ip": "35.207.39.228",
                        "originalIp": "35.207.39.228",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-validator2",
                        "ip": "35.211.9.151",
                        "originalIp": "35.211.9.151",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "use1-aeneid-validator3",
                        "ip": "35.211.77.198",
                        "originalIp": "35.211.77.198",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    }
                ]
            },
            "GOOGLE-2": {
                "monikers": [
                    {
                        "moniker": "BCW Technologies",
                        "ip": "34.1.224.237",
                        "originalIp": "34.1.224.237",
                        "latitude": 37.751,
                        "longitude": -97.822,
                        "countryName": "United States",
                        "cityName": "Unknown",
                        "continentName": "North America"
                    }
                ]
            },
            "GOOGLE-CLOUD-PLATFORM": {
                "monikers": [
                    {
                        "moniker": "abc",
                        "ip": "34.51.178.12",
                        "originalIp": "34.51.178.12",
                        "latitude": 37.751,
                        "longitude": -97.822,
                        "countryName": "United States",
                        "cityName": "Unknown",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "NeverEnding",
                        "ip": "34.14.30.214",
                        "originalIp": "34.14.30.214",
                        "latitude": 37.751,
                        "longitude": -97.822,
                        "countryName": "United States",
                        "cityName": "Unknown",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "yao-aeneid",
                        "ip": "34.139.37.101",
                        "originalIp": "34.139.37.101",
                        "latitude": 32.8608,
                        "longitude": -79.9746,
                        "countryName": "United States",
                        "cityName": "North Charleston",
                        "continentName": "North America"
                    }
                ]
            },
            "HURRICANE": {
                "monikers": [
                    {
                        "moniker": "warnernode",
                        "ip": "65.49.60.190",
                        "originalIp": "65.49.60.190",
                        "latitude": 39.5241,
                        "longitude": -111.5179,
                        "countryName": "United States",
                        "cityName": "Mount Pleasant",
                        "continentName": "North America"
                    }
                ]
            },
            "LEVEL3": {
                "monikers": [
                    {
                        "moniker": "archive_rpc",
                        "ip": "207.120.52.220",
                        "originalIp": "207.120.52.220",
                        "latitude": 37.751,
                        "longitude": -97.822,
                        "countryName": "United States",
                        "cityName": "Unknown",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "POSTHUMAN",
                        "ip": "216.202.214.4",
                        "originalIp": "216.202.214.4",
                        "latitude": 40.8492,
                        "longitude": -73.9735,
                        "countryName": "United States",
                        "cityName": "Fort Lee",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "snap",
                        "ip": "8.52.196.180",
                        "originalIp": "8.52.196.180",
                        "latitude": 37.751,
                        "longitude": -97.822,
                        "countryName": "United States",
                        "cityName": "Unknown",
                        "continentName": "North America"
                    }
                ]
            },
            "ORACLE-BMC-31898": {
                "monikers": [
                    {
                        "moniker": "InfStones",
                        "ip": "193.122.141.78",
                        "originalIp": "193.122.141.78",
                        "latitude": 39.018,
                        "longitude": -77.539,
                        "countryName": "United States",
                        "cityName": "Ashburn",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "story-aeneid-archive-ora-iad-a00",
                        "ip": "150.136.128.196",
                        "originalIp": "150.136.128.196",
                        "latitude": 39.018,
                        "longitude": -77.539,
                        "countryName": "United States",
                        "cityName": "Ashburn",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "story-aeneid-archive-ora-iad-a01",
                        "ip": "129.80.220.65",
                        "originalIp": "129.80.220.65",
                        "latitude": 39.018,
                        "longitude": -77.539,
                        "countryName": "United States",
                        "cityName": "Ashburn",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "story-aeneid-archive-ora-iad-b00",
                        "ip": "150.136.162.69",
                        "originalIp": "150.136.162.69",
                        "latitude": 39.018,
                        "longitude": -77.539,
                        "countryName": "United States",
                        "cityName": "Ashburn",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "story-aeneid-archive-ora-iad-b01",
                        "ip": "132.145.171.245",
                        "originalIp": "132.145.171.245",
                        "latitude": 39.018,
                        "longitude": -77.539,
                        "countryName": "United States",
                        "cityName": "Ashburn",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "story-aeneid-ronald-archive-ora-iad-a00",
                        "ip": "150.136.146.46",
                        "originalIp": "150.136.146.46",
                        "latitude": 39.018,
                        "longitude": -77.539,
                        "countryName": "United States",
                        "cityName": "Ashburn",
                        "continentName": "North America"
                    }
                ]
            },
            "OVH SAS": {
                "monikers": [
                    {
                        "moniker": "Republic",
                        "ip": "147.135.65.24",
                        "originalIp": "147.135.65.24",
                        "latitude": 38.6583,
                        "longitude": -77.2481,
                        "countryName": "United States",
                        "cityName": "Unknown",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "story-aeneid-archive-use1-0",
                        "ip": "40.160.27.241",
                        "originalIp": "40.160.27.241",
                        "latitude": 37.751,
                        "longitude": -97.822,
                        "countryName": "United States",
                        "cityName": "Unknown",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "story-aeneid-archive-use1-1",
                        "ip": "40.160.27.205",
                        "originalIp": "40.160.27.205",
                        "latitude": 37.751,
                        "longitude": -97.822,
                        "countryName": "United States",
                        "cityName": "Unknown",
                        "continentName": "North America"
                    }
                ]
            },
            "RELIABLESITE": {
                "monikers": [
                    {
                        "moniker": "moonli.me",
                        "ip": "104.243.40.221",
                        "originalIp": "104.243.40.221",
                        "latitude": 40.5511,
                        "longitude": -74.4606,
                        "countryName": "United States",
                        "cityName": "Piscataway",
                        "continentName": "North America"
                    }
                ]
            },
            "SINGLEHOP-LLC": {
                "monikers": [
                    {
                        "moniker": "534099dde70b",
                        "ip": "23.92.177.81",
                        "originalIp": "23.92.177.81",
                        "latitude": 40.7876,
                        "longitude": -74.06,
                        "countryName": "United States",
                        "cityName": "Secaucus",
                        "continentName": "North America"
                    }
                ]
            },
            "WEBNX": {
                "monikers": [
                    {
                        "moniker": "RHINO",
                        "ip": "64.185.226.202",
                        "originalIp": "64.185.226.202",
                        "latitude": 40.7157,
                        "longitude": -74,
                        "countryName": "United States",
                        "cityName": "New York",
                        "continentName": "North America"
                    }
                ]
            }
        }
    },
    "Austria": {
        "amount": 10,
        "providers": {
            "IPAX GmbH": {
                "monikers": [
                    {
                        "moniker": "coinage_x_daic",
                        "ip": "37.252.184.235",
                        "originalIp": "37.252.184.235",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    }
                ]
            },
            "Unknown": {
                "monikers": [
                    {
                        "moniker": "Auranode - Backup",
                        "ip": "152.53.163.158",
                        "originalIp": "152.53.163.158",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "Coha05",
                        "ip": "152.53.87.97",
                        "originalIp": "152.53.87.97",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "CosmonautStakes",
                        "ip": "152.53.94.61",
                        "originalIp": "152.53.94.61",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "elessar",
                        "ip": "152.53.121.170",
                        "originalIp": "152.53.121.170",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "J-Node | Aeneid",
                        "ip": "152.53.102.226",
                        "originalIp": "152.53.102.226",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "micto-snap",
                        "ip": "152.53.230.81",
                        "originalIp": "152.53.230.81",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "Node",
                        "ip": "152.53.254.201",
                        "originalIp": "152.53.254.201",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "pi69",
                        "ip": "152.53.240.138",
                        "originalIp": "152.53.240.138",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "Winnode",
                        "ip": "152.53.182.143",
                        "originalIp": "152.53.182.143",
                        "latitude": 48.2048,
                        "longitude": 16.3801,
                        "countryName": "Austria",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    }
                ]
            }
        }
    },
    "United Kingdom": {
        "amount": 7,
        "providers": {
            "AS-CHOOPA": {
                "monikers": [
                    {
                        "moniker": "Vitwit",
                        "ip": "95.179.195.219",
                        "originalIp": "95.179.195.219",
                        "latitude": 51.5026,
                        "longitude": -0.0668,
                        "countryName": "United Kingdom",
                        "cityName": "Whitechapel",
                        "continentName": "Europe"
                    }
                ]
            },
            "Impelling Solutions Ltd": {
                "monikers": [
                    {
                        "moniker": "xAthzid",
                        "ip": "185.206.148.37",
                        "originalIp": "185.206.148.37",
                        "latitude": 51.4964,
                        "longitude": -0.1224,
                        "countryName": "United Kingdom",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "zStarkw",
                        "ip": "185.83.152.143",
                        "originalIp": "185.83.152.143",
                        "latitude": 51.4964,
                        "longitude": -0.1224,
                        "countryName": "United Kingdom",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    }
                ]
            },
            "NL-811-40021": {
                "monikers": [
                    {
                        "moniker": "0xjams",
                        "ip": "157.173.194.33",
                        "originalIp": "157.173.194.33",
                        "latitude": 51.4964,
                        "longitude": -0.1224,
                        "countryName": "United Kingdom",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    }
                ]
            },
            "Netwise Hosting Ltd": {
                "monikers": [
                    {
                        "moniker": "blockscout_node_1",
                        "ip": "91.210.101.130",
                        "originalIp": "91.210.101.130",
                        "latitude": 51.4964,
                        "longitude": -0.1224,
                        "countryName": "United Kingdom",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    }
                ]
            },
            "OVH SAS": {
                "monikers": [
                    {
                        "moniker": "b-aeneid-s0",
                        "ip": "57.128.184.4",
                        "originalIp": "57.128.184.4",
                        "latitude": 51.4964,
                        "longitude": -0.1224,
                        "countryName": "United Kingdom",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "Pro-Nodes75_testnet_archive",
                        "ip": "198.244.176.206",
                        "originalIp": "198.244.176.206",
                        "latitude": 51.5074,
                        "longitude": -0.1196,
                        "countryName": "United Kingdom",
                        "cityName": "London",
                        "continentName": "Europe"
                    }
                ]
            }
        }
    },
    "France": {
        "amount": 6,
        "providers": {
            "OVH SAS": {
                "monikers": [
                    {
                        "moniker": "curiosity",
                        "ip": "57.129.52.116",
                        "originalIp": "57.129.52.116",
                        "latitude": 48.8582,
                        "longitude": 2.3387,
                        "countryName": "France",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "curiosity",
                        "ip": "57.129.88.113",
                        "originalIp": "57.129.88.113",
                        "latitude": 48.8582,
                        "longitude": 2.3387,
                        "countryName": "France",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "Everstake",
                        "ip": "57.129.87.212",
                        "originalIp": "57.129.87.212",
                        "latitude": 48.8582,
                        "longitude": 2.3387,
                        "countryName": "France",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "needlecast",
                        "ip": "141.95.126.144",
                        "originalIp": "141.95.126.144",
                        "latitude": 48.8582,
                        "longitude": 2.3387,
                        "countryName": "France",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "Nodes.Guru",
                        "ip": "141.94.143.203",
                        "originalIp": "141.94.143.203",
                        "latitude": 48.8582,
                        "longitude": 2.3387,
                        "countryName": "France",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "vacamare",
                        "ip": "37.187.135.53",
                        "originalIp": "37.187.135.53",
                        "latitude": 48.8323,
                        "longitude": 2.4075,
                        "countryName": "France",
                        "cityName": "Paris",
                        "continentName": "Europe"
                    }
                ]
            }
        }
    },
    "Poland": {
        "amount": 6,
        "providers": {
            "MEVSPACE sp. z o.o.": {
                "monikers": [
                    {
                        "moniker": "coinsspor",
                        "ip": "149.50.108.112",
                        "originalIp": "149.50.108.112",
                        "latitude": 52.2296,
                        "longitude": 21.0067,
                        "countryName": "Poland",
                        "cityName": "Warsaw",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "Cryptomolot",
                        "ip": "149.86.227.242",
                        "originalIp": "149.86.227.242",
                        "latitude": 52.2296,
                        "longitude": 21.0067,
                        "countryName": "Poland",
                        "cityName": "Warsaw",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "GO2Pro",
                        "ip": "195.3.223.11",
                        "originalIp": "195.3.223.11",
                        "latitude": 52.2394,
                        "longitude": 21.0362,
                        "countryName": "Poland",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "Nodevism",
                        "ip": "193.34.212.38",
                        "originalIp": "193.34.212.38",
                        "latitude": 52.2394,
                        "longitude": 21.0362,
                        "countryName": "Poland",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "tekin86",
                        "ip": "95.214.54.196",
                        "originalIp": "95.214.54.196",
                        "latitude": 52.2394,
                        "longitude": 21.0362,
                        "countryName": "Poland",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    },
                    {
                        "moniker": "testnetnodes",
                        "ip": "95.214.55.123",
                        "originalIp": "95.214.55.123",
                        "latitude": 52.2394,
                        "longitude": 21.0362,
                        "countryName": "Poland",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    }
                ]
            }
        }
    },
    "Singapore": {
        "amount": 4,
        "providers": {
            "AMAZON-02": {
                "monikers": [
                    {
                        "moniker": "bstg-ip-1",
                        "ip": "13.212.61.95",
                        "originalIp": "13.212.61.95",
                        "latitude": 1.2868,
                        "longitude": 103.8503,
                        "countryName": "Singapore",
                        "cityName": "Singapore",
                        "continentName": "Asia"
                    }
                ]
            },
            "DIGITALOCEAN-ASN": {
                "monikers": [
                    {
                        "moniker": "grandvalley-lightnode",
                        "ip": "159.89.201.23",
                        "originalIp": "159.89.201.23",
                        "latitude": 1.3078,
                        "longitude": 103.6818,
                        "countryName": "Singapore",
                        "cityName": "Singapore",
                        "continentName": "Asia"
                    }
                ]
            },
            "Hostinger International Limited": {
                "monikers": [
                    {
                        "moniker": "blocknth-rpc",
                        "ip": "153.92.4.33",
                        "originalIp": "153.92.4.33",
                        "latitude": 1.2868,
                        "longitude": 103.8503,
                        "countryName": "Singapore",
                        "cityName": "Singapore",
                        "continentName": "Asia"
                    }
                ]
            },
            "OVH SAS": {
                "monikers": [
                    {
                        "moniker": "ContributionDAO",
                        "ip": "15.235.224.129",
                        "originalIp": "15.235.224.129",
                        "latitude": 1.3673,
                        "longitude": 103.8014,
                        "countryName": "Singapore",
                        "cityName": "Unknown",
                        "continentName": "Asia"
                    }
                ]
            }
        }
    },
    "Canada": {
        "amount": 3,
        "providers": {
            "DIGITALOCEAN-ASN": {
                "monikers": [
                    {
                        "moniker": "R1BXiJB3Uy",
                        "ip": "138.197.151.1",
                        "originalIp": "138.197.151.1",
                        "latitude": 43.6547,
                        "longitude": -79.3623,
                        "countryName": "Canada",
                        "cityName": "Toronto",
                        "continentName": "North America"
                    }
                ]
            },
            "OVH SAS": {
                "monikers": [
                    {
                        "moniker": "cuasinodo",
                        "ip": "15.235.9.118",
                        "originalIp": "15.235.9.118",
                        "latitude": 45.5075,
                        "longitude": -73.5887,
                        "countryName": "Canada",
                        "cityName": "Montreal",
                        "continentName": "North America"
                    },
                    {
                        "moniker": "Pro-Nodes75_testnet",
                        "ip": "15.235.112.107",
                        "originalIp": "15.235.112.107",
                        "latitude": 45.3161,
                        "longitude": -73.8736,
                        "countryName": "Canada",
                        "cityName": "Beauharnois",
                        "continentName": "North America"
                    }
                ]
            }
        }
    },
    "Lithuania": {
        "amount": 2,
        "providers": {
            "Informacines sistemos ir technologijos, UAB": {
                "monikers": [
                    {
                        "moniker": "piki-nodes",
                        "ip": "85.206.161.14",
                        "originalIp": "85.206.161.14",
                        "latitude": 55.9318,
                        "longitude": 23.3289,
                        "countryName": "Lithuania",
                        "cityName": "Šiauliai",
                        "continentName": "Europe"
                    }
                ]
            },
            "UAB Cherry Servers": {
                "monikers": [
                    {
                        "moniker": "Chainbase",
                        "ip": "5.199.164.89",
                        "originalIp": "5.199.164.89",
                        "latitude": 55.4167,
                        "longitude": 24,
                        "countryName": "Lithuania",
                        "cityName": "Unknown",
                        "continentName": "Europe"
                    }
                ]
            }
        }
    },
    "India": {
        "amount": 1,
        "providers": {
            "OVH SAS": {
                "monikers": [
                    {
                        "moniker": "dhozil",
                        "ip": "148.113.16.9",
                        "originalIp": "148.113.16.9",
                        "latitude": 19.0748,
                        "longitude": 72.8856,
                        "countryName": "India",
                        "cityName": "Mumbai",
                        "continentName": "Asia"
                    }
                ]
            }
        }
    },
    "Italy": {
        "amount": 1,
        "providers": {
            "Aruba S.p.A.": {
                "monikers": [
                  {
                        "moniker": "test-validator",
                        "ip": "192.168.1.1",
                        "originalIp": "192.168.1.1",
                        "latitude": 41.9028,
                        "longitude": 12.4964,
                        "countryName": "Italy",
                        "cityName": "Rome",
                        "continentName": "Europe"
                    }
]
}
}
}
};

// Helper function to find validator by moniker
export function findValidatorByMoniker(moniker: string): ValidatorLocation | null {
  for (const countryName in validatorLocationData) {
    if (countryName === 'total_monikers') continue;
    
    const countryData = validatorLocationData[countryName] as CountryData;
    for (const providerName in countryData.providers) {
      const provider = countryData.providers[providerName];
      const validator = provider.monikers.find(v => v.moniker === moniker);
      if (validator) {
        return validator;
      }
    }
  }
  return null;
}

// Helper function to get all validators
export function getAllValidators(): ValidatorLocation[] {
  const validators: ValidatorLocation[] = [];
  
  for (const countryName in validatorLocationData) {
    if (countryName === 'total_monikers') continue;
    
    const countryData = validatorLocationData[countryName] as CountryData;
    for (const providerName in countryData.providers) {
      const provider = countryData.providers[providerName];
      validators.push(...provider.monikers);
    }
  }
  
  return validators;
}

// Helper function to get validators by country
export function getValidatorsByCountry(countryName: string): ValidatorLocation[] {
  const validators: ValidatorLocation[] = [];
  
  if (validatorLocationData[countryName] && typeof validatorLocationData[countryName] === 'object') {
    const countryData = validatorLocationData[countryName] as CountryData;
    for (const providerName in countryData.providers) {
      const provider = countryData.providers[providerName];
      validators.push(...provider.monikers);
    }
  }
  
  return validators;
}

// Helper function to get validators by provider
export function getValidatorsByProvider(providerName: string): ValidatorLocation[] {
  const validators: ValidatorLocation[] = [];
  
  for (const countryName in validatorLocationData) {
    if (countryName === 'total_monikers') continue;
    
    const countryData = validatorLocationData[countryName] as CountryData;
    if (countryData.providers[providerName]) {
      validators.push(...countryData.providers[providerName].monikers);
    }
  }
  
  return validators;
}
