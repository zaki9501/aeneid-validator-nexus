import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronUp, ChevronDown, Loader2, X, Info } from 'lucide-react';
import { fetchValidators, Validator, fetchSlashingInfos, SlashingInfo, fetchProposedBlocksCount } from '../services/validatorApi';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

export const fetchSlashingParams = async () => {
  const url = 'https://api-story-testnet.itrocket.net/cosmos/slashing/v1beta1/params';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch slashing params');
  return (await response.json()).params;
};

const ValidatorsExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | 'slashed'>('active');
  const [sortField, setSortField] = useState<keyof Validator | 'missedBlocksCounter' | 'proposedBlocks'>('performanceScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 64;
  const [compareA, setCompareA] = useState<string>('');
  const [compareB, setCompareB] = useState<string>('');
  const navigate = useNavigate();
  const [showMissedBlocksInfo, setShowMissedBlocksInfo] = useState(false);
  const missedBlocksInfoRef = React.useRef<HTMLDivElement>(null);
  const [proposedBlocks, setProposedBlocks] = useState<Record<string, number>>({});

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

  // Fetch proposed blocks count
  React.useEffect(() => {
    fetchProposedBlocksCount().then(setProposedBlocks).catch(() => setProposedBlocks({}));
  }, []);

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
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'slashed': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
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
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Validators</h2>
          <p className="text-gray-400">Failed to fetch validator data. Please try again later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-center space-y-4 md:space-y-0">
          <div>
            <h1 className="text-4xl font-bold text-white">Validators Explorer</h1>
            <p className="text-xl text-gray-300">Discover and analyze Story Protocol validators</p>
          </div>
          <Button
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-2 rounded-lg shadow-lg mt-4 md:mt-0"
            onClick={() => navigate('/compare')}
          >
            Compare
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by name or address..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder-gray-400"
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
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'border-white/20 text-gray-300 hover:bg-white/10'
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
          <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
              <span className="text-white">Loading validators...</span>
            </div>
          </Card>
        )}

        {/* Validators Table */}
        {!isLoading && (
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
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
                      onClick={() => handleSort('performanceScore')}
                    >
                      <div className="flex items-center gap-2">
                        Performance
                        <SortIcon field="performanceScore" />
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
                        <span
                          className="ml-1 cursor-pointer text-blue-400 hover:text-blue-600"
                          onClick={e => { e.stopPropagation(); setShowMissedBlocksInfo(v => !v); }}
                          tabIndex={0}
                          role="button"
                          aria-label="Show missed blocks policy info"
                        >
                          <Info className="w-4 h-4 inline" />
                        </span>
                      </div>
                      {showMissedBlocksInfo && slashingParams && (
                        <div
                          ref={missedBlocksInfoRef}
                          className="absolute z-50 left-0 mt-8 w-80 bg-white text-gray-900 rounded shadow-lg border border-gray-200 p-4 text-sm"
                          style={{ minWidth: '260px' }}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-purple-700">Missed Blocks Policy</span>
                            <button
                              className="text-gray-400 hover:text-gray-700 text-lg font-bold px-2"
                              onClick={e => { e.stopPropagation(); setShowMissedBlocksInfo(false); }}
                              aria-label="Close info"
                            >
                              ×
                            </button>
                          </div>
                          <div className="mb-2">
                            In the last <span className="font-mono text-purple-700">{slashingParams.signed_blocks_window}</span> blocks, a validator must sign at least <span className="font-mono text-purple-700">{(parseFloat(slashingParams.min_signed_per_window) * 100).toFixed(2)}%</span> of blocks.<br />
                            If they miss more than <span className="font-mono text-purple-700">{parseInt(slashingParams.signed_blocks_window) - Math.floor(parseFloat(slashingParams.signed_blocks_window) * parseFloat(slashingParams.min_signed_per_window))}</span> blocks, they will be jailed for <span className="font-mono text-purple-700">{Math.round(parseInt(slashingParams.downtime_jail_duration) / 60) || slashingParams.downtime_jail_duration}</span> minutes.
                          </div>
                          <div className="text-xs text-gray-600">
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
                    <tr key={validator.address} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4 text-gray-400 font-mono">{startIndex + idx + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Link 
                            to={`/validators/${validator.address}`}
                            className="hover:text-purple-400 transition-colors"
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
                        {validator.performanceScore.toFixed(1)}
                      </td>
                      <td className="p-4 text-white">
                        {validator.commission.toFixed(1)}%
                      </td>
                      <td className="p-4 text-white">
                        {parseInt(validator.missedBlocksCounter ?? '0')}
                      </td>
                      <td className="p-4 text-white">
                        {proposedBlocks[validator.address] ?? 0}
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
                  className="border-white/20 text-gray-300 hover:bg-white/10"
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
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'border-white/20 text-gray-300 hover:bg-white/10'
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
                  className="border-white/20 text-gray-300 hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            )}
          </Card>
        )}

        {/* Stats Summary */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{filteredAndSortedValidators.length}</p>
                <p className="text-gray-400">Matching Validators</p>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {(filteredAndSortedValidators.reduce((sum, v) => sum + v.stake, 0) / 1_000_000_000).toFixed(1)}M
                </p>
                <p className="text-gray-400">Total Stake</p>
              </div>
            </Card>
            
            <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
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
  );
};

export default ValidatorsExplorer;
