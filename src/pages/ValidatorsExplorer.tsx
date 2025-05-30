
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { mockValidators, Validator } from '../data/mockData';

const ValidatorsExplorer = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'slashed'>('all');
  const [sortField, setSortField] = useState<keyof Validator>('performanceScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleSort = (field: keyof Validator) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedValidators = useMemo(() => {
    let filtered = mockValidators.filter(validator => {
      const matchesSearch = 
        validator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        validator.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || validator.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredAndSortedValidators.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedValidators = filteredAndSortedValidators.slice(startIndex, startIndex + itemsPerPage);

  const SortIcon = ({ field }: { field: keyof Validator }) => {
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

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Validators Explorer</h1>
          <p className="text-xl text-gray-300">Discover and analyze Story Protocol validators</p>
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
              {(['all', 'active', 'inactive', 'slashed'] as const).map((status) => (
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

        {/* Validators Table */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
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
                    onClick={() => handleSort('rewardsEarned')}
                  >
                    <div className="flex items-center gap-2">
                      Rewards
                      <SortIcon field="rewardsEarned" />
                    </div>
                  </th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedValidators.map((validator) => (
                  <tr key={validator.address} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <Link 
                        to={`/validators/${validator.address}`}
                        className="hover:text-purple-400 transition-colors"
                      >
                        <div>
                          <p className="text-white font-medium">{validator.name}</p>
                          <p className="text-sm text-gray-400">
                            {validator.address.slice(0, 10)}...{validator.address.slice(-8)}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4 text-white">
                      {(validator.stake / 1000).toFixed(0)}K
                    </td>
                    <td className="p-4 text-white">
                      {validator.uptime.toFixed(1)}%
                    </td>
                    <td className="p-4 text-white">
                      {validator.performanceScore.toFixed(1)}
                    </td>
                    <td className="p-4 text-white">
                      {validator.rewardsEarned.toLocaleString()}
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

        {/* Stats Summary */}
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
                {(filteredAndSortedValidators.reduce((sum, v) => sum + v.stake, 0) / 1000000).toFixed(1)}M
              </p>
              <p className="text-gray-400">Total Stake</p>
            </div>
          </Card>
          
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {(filteredAndSortedValidators.reduce((sum, v) => sum + v.uptime, 0) / filteredAndSortedValidators.length).toFixed(1)}%
              </p>
              <p className="text-gray-400">Avg Uptime</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ValidatorsExplorer;
