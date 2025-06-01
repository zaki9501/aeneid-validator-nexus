
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw, Loader2 } from 'lucide-react';
import { fetchValidators, Validator } from '../services/validatorApi';

interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  size: number;
  performance: number;
  status: 'active' | 'inactive' | 'slashed';
  connections: number;
  region: string;
  uptime: number;
  stake: number;
  commission: number;
}

const NetworkVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [viewType, setViewType] = useState<'network' | 'geographic' | 'clusters'>('network');
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);

  const { data: validators = [], isLoading, error } = useQuery({
    queryKey: ['validators'],
    queryFn: fetchValidators,
    refetchInterval: 30000,
  });

  // Memoize node generation to prevent recalculation on every render
  const generateNodes = useMemo(() => {
    return () => {
      return validators.map((validator, index) => {
        let x, y;
        if (viewType === 'geographic') {
          // Since API doesn't provide region, distribute randomly
          const regions = ['North America', 'Europe', 'Asia', 'Africa', 'South America', 'Australia'];
          const randomRegion = regions[index % regions.length];
          const regionCoords: { [key: string]: { x: number; y: number } } = {
            'North America': { x: -200, y: 0 },
            'Europe': { x: 0, y: -100 },
            'Asia': { x: 200, y: 0 },
            'Africa': { x: 0, y: 100 },
            'South America': { x: -100, y: 200 },
            'Australia': { x: 200, y: 200 },
          };
          const coords = regionCoords[randomRegion] || { x: 0, y: 0 };
          x = coords.x + (Math.random() - 0.5) * 50;
          y = coords.y + (Math.random() - 0.5) * 50;
        } else if (viewType === 'clusters') {
          // Cluster by performance score
          const performanceGroup = Math.floor(validator.performanceScore / 25);
          const angle = (index / validators.length) * 2 * Math.PI;
          const radius = 100 + performanceGroup * 50;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius;
        } else {
          // Circular layout for network
          const angle = (index / validators.length) * 2 * Math.PI;
          const radius = 200 + Math.random() * 100;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius;
        }
        
        return {
          id: validator.address,
          name: validator.name,
          x,
          y,
          size: Math.max(5, Math.min(20, (validator.stake / 10000000) * 15)), // Scale based on stake
          performance: validator.performanceScore,
          status: validator.status,
          connections: Math.floor(Math.random() * 5) + 2,
          region: validator.region || 'Unknown',
          uptime: validator.uptime,
          stake: validator.stake,
          commission: validator.commission,
        };
      });
    };
  }, [validators, viewType]);

  const [nodes, setNodes] = useState<Node[]>([]);

  // Update nodes when validators or viewType changes
  useEffect(() => {
    setNodes(generateNodes());
  }, [generateNodes]);

  const drawNetwork = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context
    ctx.save();

    // Apply transformations
    ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
    ctx.scale(zoom, zoom);

    // Draw connections
    if (viewType === 'network') {
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 1;

      nodes.forEach((node, i) => {
        for (let j = 0; j < node.connections && j < nodes.length; j++) {
          const targetIndex = (i + j + 1) % nodes.length;
          const target = nodes[targetIndex];

          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });
    }

    // Draw nodes
    nodes.forEach((node) => {
      // Node color based on performance
      let color = '#ef4444'; // Poor
      if (node.performance > 95) color = '#10b981'; // Excellent
      else if (node.performance > 90) color = '#f59e0b'; // Good
      else if (node.performance > 85) color = '#8b5cf6'; // Fair

      // Draw node
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();

      // Draw border for selected node
      if (selectedValidator === node.id) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Draw pulse effect for active validators
      if (node.status === 'active') {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size + 5, 0, 2 * Math.PI);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Restore context
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setOffset((prev) => {
        const newOffset = { x: prev.x + deltaX, y: prev.y + deltaY };
        const canvas = canvasRef.current;
        if (canvas) {
          return {
            x: Math.max(-canvas.width / 2, Math.min(canvas.width / 2, newOffset.x)),
            y: Math.max(-canvas.height / 2, Math.min(canvas.height / 2, newOffset.y)),
          };
        }
        return newOffset;
      });
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isDragging || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - offset.x) / zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - offset.y) / zoom;

    const clickedNode = nodes.find((node) => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.size;
    });

    setSelectedValidator(clickedNode ? clickedNode.id : null);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedValidator(null);
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.3));

  useEffect(() => {
    drawNetwork();
  }, [zoom, offset, selectedValidator, viewType, nodes]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        drawNetwork();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectedValidatorData = selectedValidator
    ? validators.find((v) => v.address === selectedValidator)
    : null;

  if (isLoading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Loading Network</h2>
          <p className="text-gray-400">Fetching validator network data...</p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Network</h2>
          <p className="text-gray-400">Failed to fetch network data. Please try again later.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Network Visualization</h1>
          <p className="text-xl text-gray-300">Interactive view of validator network topology</p>
        </div>

        {/* Controls */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center">
            <div>
              <h3 className="text-white font-medium mb-3">View Type</h3>
              <div className="flex gap-2">
                {(['network', 'geographic', 'clusters'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={viewType === type ? 'default' : 'outline'}
                    onClick={() => setViewType(type)}
                    className={
                      viewType === type
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }
                    aria-pressed={viewType === type}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={zoomIn}
                className="border-white/20 text-gray-300 hover:bg-white/10"
                aria-label="Zoom in"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={zoomOut}
                className="border-white/20 text-gray-300 hover:bg-white/10"
                aria-label="Zoom out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={resetView}
                className="border-white/20 text-gray-300 hover:bg-white/10"
                aria-label="Reset view"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Network Canvas */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Card className="lg:col-span-3 p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <canvas
              ref={canvasRef}
              className="w-full h-96 cursor-grab active:cursor-grabbing border border-white/10 rounded-lg bg-black/20"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onClick={handleCanvasClick}
              aria-label="Network visualization canvas"
            />

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-400">Excellent (95%+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span className="text-xs text-gray-400">Good (90-95%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs text-gray-400">Fair (85-90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-gray-400">Poor (Less than 85%)</span>
              </div>
            </div>
          </Card>

          {/* Node Details */}
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4">Node Details</h3>
            {selectedValidatorData ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-white font-medium">{selectedValidatorData.name}</h4>
                  <p className="text-xs text-gray-400 font-mono break-all">
                    {selectedValidatorData.address}
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Performance</span>
                    <span className="text-white">{selectedValidatorData.performanceScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-white">{(selectedValidatorData.uptime * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stake</span>
                    <span className="text-white">{(selectedValidatorData.stake / 1000000).toFixed(1)}M</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Commission</span>
                    <span className="text-white">{selectedValidatorData.commission.toFixed(1)}%</span>
                  </div>
                </div>
                <Badge
                  className={
                    selectedValidatorData.status === 'active'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : selectedValidatorData.status === 'slashed' 
                        ? 'bg-red-500/20 text-red-400 border-red-500/30'
                        : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }
                >
                  {selectedValidatorData.status}
                </Badge>
              </div>
            ) : (
              <p className="text-gray-400">Click on a node to view details</p>
            )}
          </Card>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{nodes.length}</p>
              <p className="text-gray-400">Total Nodes</p>
            </div>
          </Card>
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{nodes.filter((n) => n.status === 'active').length}</p>
              <p className="text-gray-400">Active Nodes</p>
            </div>
          </Card>
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {(nodes.reduce((sum, n) => sum + n.connections, 0) / 2).toFixed(0)}
              </p>
              <p className="text-gray-400">Connections</p>
            </div>
          </Card>
          <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">
                {nodes.length > 0 ? (nodes.reduce((sum, n) => sum + n.performance, 0) / nodes.length).toFixed(1) : '0'}
              </p>
              <p className="text-gray-400">Avg Performance</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NetworkVisualization;
