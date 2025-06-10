import React, { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchValidators, Validator } from '../services/validatorApi';
import { Card } from '@/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

const CompareValidators = () => {
  const { data: validators = [], isLoading } = useQuery({
    queryKey: ['validators', 'all'],
    queryFn: () => fetchValidators('active'), // or fetch all statuses if needed
    refetchInterval: 30000,
  });
  const [left, setLeft] = useState<string>('');
  const [right, setRight] = useState<string>('');
  const [leftSearch, setLeftSearch] = useState('');
  const [rightSearch, setRightSearch] = useState('');
  const [leftDropdownOpen, setLeftDropdownOpen] = useState(false);
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false);
  const leftInputRef = useRef<HTMLInputElement>(null);
  const rightInputRef = useRef<HTMLInputElement>(null);

  // Filtered lists for search
  const filteredLeft = validators.filter(v =>
    v.name.toLowerCase().includes(leftSearch.toLowerCase()) ||
    v.address.toLowerCase().includes(leftSearch.toLowerCase())
  );
  const filteredRight = validators.filter(v =>
    v.name.toLowerCase().includes(rightSearch.toLowerCase()) ||
    v.address.toLowerCase().includes(rightSearch.toLowerCase())
  );

  const leftValidator = validators.find(v => v.address === left);
  const rightValidator = validators.find(v => v.address === right);

  return (
    <div className="min-h-screen p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8 text-center">Compare Validators</h1>
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        {/* Searchable select for Validator A */}
        <div className="relative w-72">
          <label className="text-gray-300 mr-2">Validator A:</label>
          <input
            ref={leftInputRef}
            type="text"
            className="w-full bg-gray-800 text-white rounded p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Search by name or address..."
            value={leftSearch}
            onChange={e => {
              setLeftSearch(e.target.value);
              setLeftDropdownOpen(true);
            }}
            onFocus={() => setLeftDropdownOpen(true)}
            onBlur={() => setTimeout(() => setLeftDropdownOpen(false), 150)}
          />
          {leftDropdownOpen && (
            <div className="absolute z-20 w-full bg-gray-900 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto mt-1">
              {filteredLeft.length === 0 && (
                <div className="p-3 text-gray-400">No validators found</div>
              )}
              {filteredLeft.map(v => (
                <div
                  key={v.address}
                  className={`p-3 cursor-pointer hover:bg-purple-700/30 ${left === v.address ? 'bg-purple-800/40' : ''}`}
                  onMouseDown={() => {
                    setLeft(v.address);
                    setLeftSearch(v.name);
                    setLeftDropdownOpen(false);
                  }}
                >
                  <span className="font-medium text-white">{v.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{v.address.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Searchable select for Validator B */}
        <div className="relative w-72">
          <label className="text-gray-300 mr-2">Validator B:</label>
          <input
            ref={rightInputRef}
            type="text"
            className="w-full bg-gray-800 text-white rounded p-2 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Search by name or address..."
            value={rightSearch}
            onChange={e => {
              setRightSearch(e.target.value);
              setRightDropdownOpen(true);
            }}
            onFocus={() => setRightDropdownOpen(true)}
            onBlur={() => setTimeout(() => setRightDropdownOpen(false), 150)}
          />
          {rightDropdownOpen && (
            <div className="absolute z-20 w-full bg-gray-900 border border-gray-700 rounded shadow-lg max-h-60 overflow-y-auto mt-1">
              {filteredRight.length === 0 && (
                <div className="p-3 text-gray-400">No validators found</div>
              )}
              {filteredRight.map(v => (
                <div
                  key={v.address}
                  className={`p-3 cursor-pointer hover:bg-orange-700/30 ${right === v.address ? 'bg-orange-800/40' : ''}`}
                  onMouseDown={() => {
                    setRight(v.address);
                    setRightSearch(v.name);
                    setRightDropdownOpen(false);
                  }}
                >
                  <span className="font-medium text-white">{v.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{v.address.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {(leftValidator && rightValidator) && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full max-w-2xl mx-auto text-base mb-12 bg-white/10 rounded-xl border border-white/10 shadow-lg">
              <thead className="bg-white/10 sticky top-0 z-10">
                <tr className="text-gray-400 border-b border-white/10">
                  <th className="p-4 text-left text-lg font-semibold">Metric</th>
                  <th className="p-4 text-center text-purple-300 text-lg font-bold">{leftValidator.name}</th>
                  <th className="p-4 text-center text-orange-300 text-lg font-bold">{rightValidator.name}</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  // Helper to highlight best value
                  const highlight = (a: number, b: number, higherIsBetter = true) => {
                    if (a === b) return ["", ""];
                    if (higherIsBetter) {
                      return a > b ? ["bg-green-900 text-green-300 font-bold", ""] : ["", "bg-green-900 text-green-300 font-bold"];
                    } else {
                      return a < b ? ["bg-green-900 text-green-300 font-bold", ""] : ["", "bg-green-900 text-green-300 font-bold"];
                    }
                  };
                  const rows = [
                    {
                      label: "Address",
                      a: <span className="text-xs break-all">{leftValidator.address}</span>,
                      b: <span className="text-xs break-all">{rightValidator.address}</span>,
                      key: "address"
                    },
                    {
                      label: "Stake",
                      a: `${(leftValidator.stake).toLocaleString(undefined, { maximumFractionDigits: 2 })} IP`,
                      b: `${(rightValidator.stake).toLocaleString(undefined, { maximumFractionDigits: 2 })} IP`,
                      key: "stake",
                      highlight: highlight(leftValidator.stake, rightValidator.stake, true)
                    },
                    {
                      label: "Uptime",
                      a: `${(leftValidator.uptime * 100).toFixed(2)}%`,
                      b: `${(rightValidator.uptime * 100).toFixed(2)}%`,
                      key: "uptime",
                      highlight: highlight(leftValidator.uptime, rightValidator.uptime, true)
                    },
                    {
                      label: "Performance",
                      a: leftValidator.performanceScore.toFixed(2),
                      b: rightValidator.performanceScore.toFixed(2),
                      key: "performanceScore",
                      highlight: highlight(leftValidator.performanceScore, rightValidator.performanceScore, true)
                    },
                    {
                      label: "Commission",
                      a: `${leftValidator.commission.toFixed(2)}%`,
                      b: `${rightValidator.commission.toFixed(2)}%`,
                      key: "commission",
                      highlight: highlight(leftValidator.commission, rightValidator.commission, false)
                    },
                    {
                      label: "Delegators",
                      a: leftValidator.delegators,
                      b: rightValidator.delegators,
                      key: "delegators",
                      highlight: highlight(leftValidator.delegators, rightValidator.delegators, true)
                    },
                    {
                      label: "Status",
                      a: <span className={`px-2 py-1 rounded text-xs font-semibold ${leftValidator.status === 'active' ? 'bg-green-700 text-green-200' : leftValidator.status === 'slashed' ? 'bg-red-700 text-red-200' : 'bg-gray-700 text-gray-200'}`}>{leftValidator.status}</span>,
                      b: <span className={`px-2 py-1 rounded text-xs font-semibold ${rightValidator.status === 'active' ? 'bg-green-700 text-green-200' : rightValidator.status === 'slashed' ? 'bg-red-700 text-red-200' : 'bg-gray-700 text-gray-200'}`}>{rightValidator.status}</span>,
                      key: "status"
                    },
                  ];
                  return rows.map((row, i) => (
                    <tr key={row.key} className={i % 2 === 0 ? "bg-white/5" : "bg-white/0"}>
                      <td className="p-4 font-medium text-gray-300 whitespace-nowrap">{row.label}</td>
                      <td className={`p-4 text-center ${row.highlight ? row.highlight[0] : ''}`}>{row.a}</td>
                      <td className={`p-4 text-center ${row.highlight ? row.highlight[1] : ''}`}>{row.b}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </table>
          </div>
          <div className="mt-12">
            <Card className="bg-white/5 p-8 rounded-xl border border-white/10 text-center shadow-lg">
              <h2 className="text-2xl font-bold text-white mb-4">Analytics & Radar Chart</h2>
              <div className="flex justify-center">
                <ResponsiveContainer width={400} height={300}>
                  <RadarChart cx="50%" cy="50%" outerRadius={110} width={400} height={300} data={[
                    { metric: 'Uptime', A: (leftValidator.uptime ?? 0) * 100, B: (rightValidator.uptime ?? 0) * 100 },
                    { metric: 'Stake', A: leftValidator.stake, B: rightValidator.stake },
                    { metric: 'Performance', A: leftValidator.performanceScore ?? 0, B: rightValidator.performanceScore ?? 0 },
                    { metric: 'Commission', A: 100 - (leftValidator.commission ?? 0), B: 100 - (rightValidator.commission ?? 0) },
                    { metric: 'Delegators', A: leftValidator.delegators ?? 0, B: rightValidator.delegators ?? 0 },
                    { metric: 'Rewards', A: leftValidator.rewardsEarned ?? 0, B: rightValidator.rewardsEarned ?? 0 },
                    { metric: 'Success Blocks', A: leftValidator.successBlocks ?? 0, B: rightValidator.successBlocks ?? 0 },
                    { metric: 'Missed Blocks', A: leftValidator.missedBlocks ?? 0, B: rightValidator.missedBlocks ?? 0 },
                    { metric: 'Self-Bonded', A: leftValidator.selfBondedTokens ?? 0, B: rightValidator.selfBondedTokens ?? 0 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" stroke="#ccc" />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} stroke="#444" />
                    <Radar name={leftValidator.name || 'A'} dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                    <Radar name={rightValidator.name || 'B'} dataKey="B" stroke="#f59e42" fill="#f59e42" fillOpacity={0.4} />
                    <Tooltip formatter={(value: number, name: string, props: any) => [`${value.toLocaleString()}`, name]} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-8 mt-4">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: '#8b5cf6' }}></span>
                  <span className="text-purple-200 font-semibold">{leftValidator.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 rounded-full" style={{ background: '#f59e42' }}></span>
                  <span className="text-orange-200 font-semibold">{rightValidator.name}</span>
                </div>
              </div>
              <div className="mt-8 text-left max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-white mb-4">Detailed Analytics</h3>
                <table className="w-full text-sm bg-white/5 rounded-lg">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/10">
                      <th className="p-3 text-left">Metric</th>
                      <th className="p-3 text-center">Better</th>
                      <th className="p-3 text-center">Difference</th>
                      <th className="p-3 text-left">Explanation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const metrics = [
                        { label: 'Uptime', a: (leftValidator.uptime ?? 0) * 100, b: (rightValidator.uptime ?? 0) * 100, higher: true, explain: 'Higher is better. Shows reliability.' },
                        { label: 'Stake (IP)', a: leftValidator.stake, b: rightValidator.stake, higher: true, explain: 'Higher means more tokens staked.' },
                        { label: 'Performance', a: leftValidator.performanceScore ?? 0, b: rightValidator.performanceScore ?? 0, higher: true, explain: 'Overall validator performance score.' },
                        { label: 'Commission (%)', a: leftValidator.commission ?? 0, b: rightValidator.commission ?? 0, higher: false, explain: 'Lower is better for delegators.' },
                        { label: 'Delegators', a: leftValidator.delegators ?? 0, b: rightValidator.delegators ?? 0, higher: true, explain: 'More delegators can indicate trust.' },
                        { label: 'Rewards Earned', a: leftValidator.rewardsEarned ?? 0, b: rightValidator.rewardsEarned ?? 0, higher: true, explain: 'Total rewards earned by validator.' },
                        { label: 'Success Blocks', a: leftValidator.successBlocks ?? 0, b: rightValidator.successBlocks ?? 0, higher: true, explain: 'Blocks successfully signed.' },
                        { label: 'Missed Blocks', a: leftValidator.missedBlocks ?? 0, b: rightValidator.missedBlocks ?? 0, higher: false, explain: 'Lower is better. Fewer missed blocks.' },
                        { label: 'Self-Bonded', a: leftValidator.selfBondedTokens ?? 0, b: rightValidator.selfBondedTokens ?? 0, higher: true, explain: 'Tokens self-bonded by validator.' },
                      ];
                      return metrics.map((m, i) => {
                        let better: React.ReactNode = '-';
                        let diff = m.a - m.b;
                        let diffStr = '';
                        if (m.a === m.b) {
                          better = 'Equal';
                          diffStr = '0';
                        } else if ((m.higher && m.a > m.b) || (!m.higher && m.a < m.b)) {
                          better = (<span className="text-green-400 font-bold">{leftValidator.name}</span>);
                          diffStr = m.higher ? `+${(m.a - m.b).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `-${(m.b - m.a).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
                        } else {
                          better = (<span className="text-green-400 font-bold">{rightValidator.name}</span>);
                          diffStr = m.higher ? `+${(m.b - m.a).toLocaleString(undefined, { maximumFractionDigits: 2 })}` : `-${(m.a - m.b).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
                        }
                        return (
                          <tr key={m.label} className={i % 2 === 0 ? 'bg-white/5' : ''}>
                            <td className="p-3 font-medium text-gray-300 whitespace-nowrap">{m.label}</td>
                            <td className="p-3 text-center">{better}</td>
                            <td className="p-3 text-center">{diffStr}</td>
                            <td className="p-3 text-left text-gray-400">{m.explain}</td>
                          </tr>
                        );
                      });
                    })()}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default CompareValidators; 