import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fetchValidators, Validator, fetchSlashingInfos, SlashingInfo, fetchAllValidatorsProposedBlocks } from '../services/validatorApi';

export const fetchSlashingParams = async () => {
  const url = 'https://api-story-testnet.itrocket.net/cosmos/slashing/v1beta1/params';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch slashing params');
  return (await response.json()).params;
};

const ValidatorsExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'slashed'>('active');
  const [sortField, setSortField] = useState<keyof Validator | 'missedBlocksCounter' | 'proposedBlocks'>('uptime');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 64;
  const [compareA, setCompareA] = useState<string>('');
  const [compareB, setCompareB] = useState<string>('');
  const navigate = useNavigate();
  const [showMissedBlocksInfo, setShowMissedBlocksInfo] = useState(false);
  const missedBlocksInfoRef = React.useRef<HTMLDivElement>(null);
  const [proposedBlocks, setProposedBlocks] = useState<Record<string, number>>({});
  const [isLoadingProposedBlocks, setIsLoadingProposedBlocks] = useState(false);

  const { data: validators = [], isLoading, error } = useQuery({
    queryKey: ['validators', statusFilter],
    queryFn: () => fetchValidators(statusFilter),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch slashing info for all validators
  const { data: slashingInfos = [], isLoading: isSlashingLoading } = useQuery({
    queryKey: ['slashingInfos'],
    queryFn: () => fetchSlashingInfos(0, 200), // adjust limit if needed
    staleTime: 60000, // 1 min
    refetchInterval: 60000,
  });

  // Fetch slashing params
  const { data: slashingParams, isLoading: isParamsLoading } = useQuery({
    queryKey: ['slashingParams'],
    queryFn: fetchSlashingParams,
    staleTime: 600000, // 10 min
  });

  // Fetch proposed blocks count using new API
  React.useEffect(() => {
    if (validators.length > 0) {
      setIsLoadingProposedBlocks(true);
      fetchAllValidatorsProposedBlocks(validators)
        .then(setProposedBlocks)
        .catch((error) => {
          console.error('Error fetching proposed blocks:', error);
          setProposedBlocks({});
        })
        .finally(() => {
          setIsLoadingProposedBlocks(false);
        });
    }
  }, [validators]);

  // Merge missed_blocks_counter into validators
  const validatorsWithMissedBlocks = useMemo(() => {
    if (!validators || !slashingInfos) return validators;
    const slashingMap = new Map<string, SlashingInfo>();
    slashingInfos.forEach(info => {
      if (info.address) slashingMap.set(info.address, info);
    });
    return validators.map(v => ({
      ...v,
      missedBlocksCounter: slashingMap.get(v.consensusAddress)?.missed_blocks_counter
    }));
  }, [validators, slashingInfos]);

  // Add missedBlocksCounter to Validator type for sorting
  type ValidatorWithMissed = Validator & { missedBlocksCounter?: string };

  const handleSort = (field: keyof ValidatorWithMissed | 'missedBlocksCounter' | 'proposedBlocks') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field as keyof Validator);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedValidators = useMemo(() => {
    let filtered = (validatorsWithMissedBlocks as ValidatorWithMissed[]).filter(validator => {
      const matchesSearch = 
        validator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        validator.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (validator.consensusAddress?.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = validator.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    filtered.sort((a, b) => {
      let aValue: any = a[sortField as keyof ValidatorWithMissed];
      let bValue: any = b[sortField as keyof ValidatorWithMissed];
      if (sortField === 'missedBlocksCounter') {
        aValue = a.missedBlocksCounter ? parseInt(a.missedBlocksCounter) : -1;
        bValue = b.missedBlocksCounter ? parseInt(b.missedBlocksCounter) : -1;
      }
      if (sortField === 'proposedBlocks') {
        aValue = proposedBlocks[a.address] ?? 0;
        bValue = proposedBlocks[b.address] ?? 0;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      const aStr = String(aValue ?? '').toLowerCase();
      const bStr = String(bValue ?? '').toLowerCase();
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
    return filtered;
  }, [validatorsWithMissedBlocks, searchTerm, statusFilter, sortField, sortDirection, proposedBlocks]);

  const totalPages = Math.ceil(filteredAndSortedValidators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedValidators = filteredAndSortedValidators.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field }: { field: keyof ValidatorWithMissed | 'missedBlocksCounter' | 'proposedBlocks' }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ) : (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600/50 text-green-300 border-green-500';
      case 'inactive': return 'bg-gray-600/50 text-gray-400 border-gray-500';
      case 'slashed': return 'bg-gray-800/50 text-gray-300 border-gray-700';
      default: return 'bg-gray-600/50 text-gray-400 border-gray-500';
    }
  };

  // Close popover when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (missedBlocksInfoRef.current && !missedBlocksInfoRef.current.contains(event.target as Node)) {
        setShowMissedBlocksInfo(false);
      }
    }
    if (showMissedBlocksInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMissedBlocksInfo]);

  if (error) {
    return (
      <div className="min-h-screen bg-black p-6 flex items-center justify-center">
        <Card className="p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Validators</h2>
          <p className="text-gray-400">Failed to fetch validator data. Please try again later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gray-800 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gray-700 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gray-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-gray-600 to-red-900 rounded-3xl flex items-center justify-center mr-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-red-900 animate-pulse opacity-50"></div>
                  <svg className="w-10 h-10 text-white relative z-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="12" r="2" fill="currentColor"/>
                  </svg>
                </div>
              </div>
              <div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-gray-300 via-red-400 to-red-600 bg-clip-text text-transparent mb-2">
                  Validators Explorer
                </h1>
                <p className="text-gray-400 text-xl">Discover and analyze Story Protocol validators</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-4 mb-8">
              <Badge variant="secondary" className="bg-gray-800/50 text-gray-300 border-gray-600 backdrop-blur-sm">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2 animate-pulse"></div>
                {filteredAndSortedValidators.length} Validators
              </Badge>
              <Badge variant="secondary" className="bg-gray-800/50 text-gray-300 border-gray-600 backdrop-blur-sm">
                <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {(filteredAndSortedValidators.reduce((sum, v) => sum + v.stake, 0) / 1_000_000_000).toFixed(1)}M Stake
              </Badge>
              <Button
                className="bg-gradient-to-r from-gray-600 to-gray-800 hover:from-gray-700 hover:to-gray-900 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all duration-300"
                onClick={() => navigate('/compare')}
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 11H7C5.89543 11 5 11.8954 5 13V20C5 21.1046 5.89543 22 7 22H9C10.1046 22 11 21.1046 11 20V13C11 11.8954 10.1046 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 11H15C13.8954 11 13 11.8954 13 13V20C13 21.1046 13.8954 22 15 22H17C18.1046 22 19 21.1046 19 20V13C19 11.8954 18.1046 11 17 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M13 8L11 6L9 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M11 6V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Compare Validators
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <Input
                  placeholder="Search by name or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2">
                {(['active', 'inactive', 'slashed'] as const).map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    onClick={() => setStatusFilter(status)}
                    className={`capitalize ${
                      statusFilter === status 
                        ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
                        : 'border-gray-600 text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className="p-8 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-6 h-6 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-white">Loading validators...</span>
              </div>
            </Card>
          )}

          {/* Validators Table */}
          {!isLoading && (
            <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-4 text-gray-300">#</th>
                      <th 
                        className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-2">
                          Validator
                          <SortIcon field="name" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('stake')}
                      >
                        <div className="flex items-center gap-2">
                          Stake
                          <SortIcon field="stake" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('uptime')}
                      >
                        <div className="flex items-center gap-2">
                          Uptime
                          <SortIcon field="uptime" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('commission')}
                      >
                        <div className="flex items-center gap-2">
                          Commission
                          <SortIcon field="commission" />
                        </div>
                      </th>
                      <th 
                        className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors relative"
                        onClick={() => handleSort('missedBlocksCounter')}
                      >
                        <div className="flex items-center gap-2">
                          Missed Blocks
                          <svg
                            className="ml-1 cursor-pointer text-gray-400 hover:text-gray-300 w-4 h-4"
                            onClick={e => { e.stopPropagation(); setShowMissedBlocksInfo(v => !v); }}
                            viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
                          >
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                            <path d="M12 16V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 8H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                        {showMissedBlocksInfo && slashingParams && (
                          <div
                            ref={missedBlocksInfoRef}
                            className="absolute z-50 left-0 mt-8 w-80 bg-gray-800 text-white rounded-lg shadow-lg border border-gray-600 p-4 text-sm"
                            style={{ minWidth: '260px' }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-semibold text-gray-300">Missed Blocks Policy</span>
                              <button
                                className="text-gray-400 hover:text-gray-300 text-lg font-bold px-2"
                                onClick={e => { e.stopPropagation(); setShowMissedBlocksInfo(false); }}
                                aria-label="Close info"
                              >
                                ×
                              </button>
                            </div>
                            <div className="mb-2 text-gray-300">
                              In the last <span className="font-mono text-gray-200">{slashingParams.signed_blocks_window}</span> blocks, a validator must sign at least <span className="font-mono text-gray-200">{(parseFloat(slashingParams.min_signed_per_window) * 100).toFixed(2)}%</span> of blocks.<br />
                              If they miss more than <span className="font-mono text-gray-200">{parseInt(slashingParams.signed_blocks_window) - Math.floor(parseFloat(slashingParams.signed_blocks_window) * parseFloat(slashingParams.min_signed_per_window))}</span> blocks, they will be jailed for <span className="font-mono text-gray-200">{Math.round(parseInt(slashingParams.downtime_jail_duration) / 60) || slashingParams.downtime_jail_duration}</span> minutes.
                            </div>
                            <div className="text-xs text-gray-400">
                              <span className="font-semibold">Window:</span> {slashingParams.signed_blocks_window} blocks | 
                              <span className="font-semibold ml-2">Min Signed:</span> {(parseFloat(slashingParams.min_signed_per_window) * 100).toFixed(2)}% | 
                              <span className="font-semibold ml-2">Jail:</span> {slashingParams.downtime_jail_duration}
                            </div>
                          </div>
                        )}
                      </th>
                      <th 
                        className="text-left p-4 text-gray-300 cursor-pointer hover:text-white transition-colors"
                        onClick={() => handleSort('proposedBlocks')}
                      >
                        <div className="flex items-center gap-2">
                          Proposed Blocks
                          <SortIcon field="proposedBlocks" />
                        </div>
                      </th>
                      <th className="text-left p-4 text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedValidators.map((validator, idx) => (
                      <tr key={validator.address} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                        <td className="p-4 text-gray-400 font-mono">{startIndex + idx + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center space-x-2">
                            <Link 
                              to={`/validators/${validator.address}`}
                              className="hover:text-gray-300 transition-colors"
                            >
                              <div className="flex items-center space-x-3">
                                {validator.logo && (
                                  <img 
                                    src={validator.logo} 
                                    alt={validator.name}
                                    className="w-8 h-8 rounded-full"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div>
                                  <p className="text-white font-medium">{validator.name}</p>
                                  <p className="text-sm text-gray-400">
                                    {validator.address.slice(0, 10)}...{validator.address.slice(-8)}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          </div>
                        </td>
                        <td className="p-4 text-white">
                          <span className="text-white">{validator.stake.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                        </td>
                        <td className="p-4 text-white">
                          {(validator.uptime * 100).toFixed(1)}%
                        </td>
                        <td className="p-4 text-white">
                          {validator.commission.toFixed(1)}%
                        </td>
                        <td className="p-4 text-white">
                          {parseInt(validator.missedBlocksCounter ?? '0')}
                        </td>
                        <td className="p-4 text-white">
                          {isLoadingProposedBlocks ? (
                            <div className="flex items-center space-x-1">
                              <svg className="w-3 h-3 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4.93 4.93L7.76 7.76" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16.24 16.24L19.07 19.07" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M2 12H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M18 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M4.93 19.07L7.76 16.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              <span className="text-xs text-gray-400">Loading...</span>
                            </div>
                          ) : (
                            proposedBlocks[validator.address] ?? 0
                          )}
                        </td>
                        <td className="p-4">
                          <Badge className={getStatusColor(validator.status)}>
                            {validator.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 ${
                          currentPage === page 
                            ? 'bg-gray-700 hover:bg-gray-600 border-gray-600' 
                            : 'border-gray-600 text-gray-300 hover:bg-gray-800/50'
                        }`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800/50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </Card>
          )}

          {/* Stats Summary */}
          {!isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3 text-gray-300">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                      <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-white">{filteredAndSortedValidators.length}</p>
                  <p className="text-gray-400">Matching Validators</p>
                </div>
              </Card>
              
              <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3 text-gray-300">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 3L19.5 6L22 6.5L19.5 7L19 10L18.5 7L16 6.5L18.5 6L19 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M5 3L5.5 6L8 6.5L5.5 7L5 10L4.5 7L2 6.5L4.5 6L5 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {(filteredAndSortedValidators.reduce((sum, v) => sum + v.stake, 0) / 1_000_000_000).toFixed(1)}M
                  </p>
                  <p className="text-gray-400">Total Stake</p>
                </div>
              </Card>
              
              <Card className="p-6 bg-gray-900/50 border-gray-700 backdrop-blur-sm">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3 text-gray-300">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2"/>
                      <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <p className="text-3xl font-bold text-white">
                    {filteredAndSortedValidators.length > 0 
                      ? ((filteredAndSortedValidators.reduce((sum, v) => sum + v.uptime, 0) / filteredAndSortedValidators.length) * 100).toFixed(1)
                      : '0'
                    }%
                  </p>
                  <p className="text-gray-400">Avg Uptime</p>
                </div>
              </Card>
            </div>
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

export default ValidatorsExplorer;
