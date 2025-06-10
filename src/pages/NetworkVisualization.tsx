import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ZoomIn, ZoomOut, RotateCcw, Loader2, MapPin } from 'lucide-react';
import { fetchValidators, Validator } from '../services/validatorApi';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
  pulsePhase: number;
}

const NetworkVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [viewType, setViewType] = useState<'network' | 'geographic' | 'clusters'>('network');
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);
  const [hoveredValidator, setHoveredValidator] = useState<string | null>(null);

  const { data: validators = [], isLoading, error } = useQuery({
    queryKey: ['validators'],
    queryFn: () => fetchValidators('all'),
    refetchInterval: 30000,
  });

  // Memoize node generation to prevent recalculation on every render
  const generateNodes = useMemo(() => {
    return () => {
      return validators.map((validator, index) => {
        let x, y;
        if (viewType === 'geographic') {
          // For geographic view, coordinates will be handled by Mapbox markers, so assign dummy values
          x = 0;
          y = 0;
        } else if (viewType === 'clusters') {
          const performanceGroup = Math.floor(validator.performanceScore / 20);
          const angle = (index / validators.length) * 2 * Math.PI;
          const radius = 120 + performanceGroup * 60;
          x = Math.cos(angle) * radius;
          y = Math.sin(angle) * radius;
        } else {
          // Enhanced circular layout for network
          const layers = Math.ceil(Math.sqrt(validators.length));
          const layer = Math.floor(index / layers);
          const posInLayer = index % layers;
          const angle = (posInLayer / layers) * 2 * Math.PI + (layer * 0.5);
          const radius = 150 + layer * 80;
          x = Math.cos(angle) * radius + (Math.random() - 0.5) * 30;
          y = Math.sin(angle) * radius + (Math.random() - 0.5) * 30;
        }
        
        return {
          id: validator.address,
          name: validator.name,
          x,
          y,
          size: Math.max(8, Math.min(25, (validator.stake / 5000000) * 12)),
          performance: validator.performanceScore,
          status: validator.status,
          connections: Math.floor(Math.random() * 6) + 3,
          region: validator.region || 'Unknown',
          uptime: validator.uptime,
          stake: validator.stake,
          commission: validator.commission,
          pulsePhase: Math.random() * Math.PI * 2,
        };
      });
    };
  }, [validators, viewType]);

  const [nodes, setNodes] = useState<Node[]>([]);

  useEffect(() => {
    setNodes(generateNodes());
  }, [generateNodes]);

  const regionCoords: { [key: string]: { lat: number; lng: number } } = {
    'North America': { lat: 39.8283, lng: -98.5795 },
    'Europe': { lat: 54.5260, lng: 15.2551 },
    'Asia': { lat: 34.0479, lng: 100.6197 },
    'Africa': { lat: -8.7832, lng: 34.5085 },
    'South America': { lat: -14.2350, lng: -51.9253 },
    'Australia': { lat: -25.2744, lng: 133.7751 },
  };

  const getNodeColor = (node: Node) => {
    if (node.status === 'slashed') return { primary: '#ef4444', secondary: '#fca5a5' };
    if (node.performance > 95) return { primary: '#10b981', secondary: '#6ee7b7' };
    if (node.performance > 90) return { primary: '#3b82f6', secondary: '#93c5fd' };
    if (node.performance > 85) return { primary: '#8b5cf6', secondary: '#c4b5fd' };
    return { primary: '#f59e0b', secondary: '#fcd34d' };
  };

  const drawNetwork = (time: number = 0) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add subtle grid pattern
    ctx.strokeStyle = 'rgba(139, 92, 246, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 50 * zoom;
    for (let x = (offset.x % gridSize); x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = (offset.y % gridSize); y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
    ctx.scale(zoom, zoom);

    // Draw connections with enhanced styling
    if (viewType === 'network') {
      nodes.forEach((node, i) => {
        for (let j = 0; j < Math.min(node.connections, 4); j++) {
          const targetIndex = (i + j + 1) % nodes.length;
          const target = nodes[targetIndex];
          
          const gradient = ctx.createLinearGradient(node.x, node.y, target.x, target.y);
          const colors = getNodeColor(node);
          gradient.addColorStop(0, colors.primary + '40');
          gradient.addColorStop(0.5, colors.primary + '20');
          gradient.addColorStop(1, getNodeColor(target).primary + '40');
          
          ctx.strokeStyle = gradient;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(target.x, target.y);
          ctx.stroke();
        }
      });
    }

    // Draw nodes with enhanced styling
    nodes.forEach((node) => {
      const colors = getNodeColor(node);
      const isSelected = selectedValidator === node.id;
      const isHovered = hoveredValidator === node.id;
      
      // Animated pulse for active nodes
      if (node.status === 'active') {
        const pulseIntensity = Math.sin(time * 0.003 + node.pulsePhase) * 0.3 + 0.7;
        const pulseSize = node.size + (Math.sin(time * 0.005 + node.pulsePhase) * 3);
        
        // Outer glow
        const glowGradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, pulseSize + 15);
        glowGradient.addColorStop(0, colors.primary + Math.floor(pulseIntensity * 40).toString(16).padStart(2, '0'));
        glowGradient.addColorStop(0.7, colors.primary + '20');
        glowGradient.addColorStop(1, colors.primary + '00');
        
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseSize + 15, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Main node with gradient
      const nodeGradient = ctx.createRadialGradient(
        node.x - node.size * 0.3, 
        node.y - node.size * 0.3, 
        0, 
        node.x, 
        node.y, 
        node.size
      );
      nodeGradient.addColorStop(0, colors.secondary);
      nodeGradient.addColorStop(0.7, colors.primary);
      nodeGradient.addColorStop(1, colors.primary + 'cc');

      ctx.fillStyle = nodeGradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
      ctx.fill();

      // Node border
      ctx.strokeStyle = isSelected || isHovered ? '#ffffff' : colors.primary;
      ctx.lineWidth = isSelected ? 4 : isHovered ? 3 : 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size, 0, 2 * Math.PI);
      ctx.stroke();

      // Performance indicator ring
      if (node.performance > 0) {
        const ringRadius = node.size + 5;
        const performanceAngle = (node.performance / 100) * 2 * Math.PI;
        
        ctx.strokeStyle = colors.secondary;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(node.x, node.y, ringRadius, -Math.PI / 2, -Math.PI / 2 + performanceAngle);
        ctx.stroke();
      }

      // Status indicator
      if (node.status === 'slashed') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(node.x + node.size * 0.6, node.y - node.size * 0.6, 4, 0, 2 * Math.PI);
        ctx.fill();
      }

      // Node label for larger nodes or selected/hovered
      if (node.size > 15 || isSelected || isHovered) {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          node.name.length > 10 ? node.name.substring(0, 10) + '...' : node.name,
          node.x,
          node.y + node.size + 15
        );
      }
    });

    ctx.restore();
  };

  const animate = (time: number) => {
    drawNetwork(time);
    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [zoom, offset, selectedValidator, hoveredValidator, viewType, nodes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - offset.x) / zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - offset.y) / zoom;

    // Check for hovered node
    const hoveredNode = nodes.find((node) => {
      const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
      return distance <= node.size + 5;
    });

    setHoveredValidator(hoveredNode ? hoveredNode.id : null);

    if (isDragging) {
      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;
      setOffset((prev) => {
        const newOffset = { x: prev.x + deltaX, y: prev.y + deltaY };
        return {
          x: Math.max(-canvas.width, Math.min(canvas.width, newOffset.x)),
          y: Math.max(-canvas.height, Math.min(canvas.height, newOffset.y)),
        };
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
      return distance <= node.size + 5;
    });

    setSelectedValidator(clickedNode ? clickedNode.id : null);
  };

  const resetView = () => {
    setZoom(1);
    setOffset({ x: 0, y: 0 });
    setSelectedValidator(null);
    setHoveredValidator(null);
  };

  const zoomIn = () => setZoom((prev) => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom((prev) => Math.max(prev / 1.2, 0.3));

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
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
      <div className="min-h-screen p-6 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
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
      <div className="min-h-screen p-6 flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Card className="p-8 bg-white/5 backdrop-blur-lg border-white/10 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Network</h2>
          <p className="text-gray-400">Failed to fetch network data. Please try again later.</p>
        </Card>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .mapbox-marker {
          animation: pulse 2s infinite;
        }
      `}</style>
      <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Network Visualization
            </h1>
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
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          : 'border-white/20 text-gray-300 hover:bg-white/10'
                      }
                      aria-pressed={viewType === type}
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {viewType !== 'geographic' && (
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
              )}
            </div>
          </Card>

          {/* Network Canvas / Map */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <Card className="lg:col-span-3 p-6 bg-white/5 backdrop-blur-lg border-white/10">
              {viewType === 'geographic' && (
                <div className="w-full h-[600px] rounded-xl overflow-hidden border border-white/10 mb-8">
                  <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {nodes.map((node) => {
                      const coords = regionCoords[node.region] || { lat: 0, lng: 0 };
                      return (
                        <Marker key={node.id} position={[coords.lat, coords.lng]}>
                          <Popup>
                            <div className="text-sm">
                              <div className="font-bold text-purple-400">{node.name}</div>
                              <div className="text-gray-300">Status: <span className="font-semibold">{node.status}</span></div>
                              <div className="text-gray-300">Stake: <span className="font-semibold">{node.stake.toLocaleString()} IP</span></div>
                              <div className="text-gray-300">Uptime: <span className="font-semibold">{(node.uptime * 100).toFixed(2)}%</span></div>
                              <div className="text-gray-300">Commission: <span className="font-semibold">{node.commission.toFixed(2)}%</span></div>
                              <div className="text-gray-300">Region: <span className="font-semibold">{node.region}</span></div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              )}

              {/* Enhanced Legend */}
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
                  <span className="text-xs text-gray-400">Excellent (95%+)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                  <span className="text-xs text-gray-400">Good (90-95%)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-400 to-pink-400"></div>
                  <span className="text-xs text-gray-400">Fair (85-90%)</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                  <span className="text-xs text-gray-400">Poor (Less than 85%)</span>
                </div>
              </div>
            </Card>

            {/* Enhanced Node Details */}
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
                      <span className="text-white font-medium">{selectedValidatorData.performanceScore.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Uptime</span>
                      <span className="text-white font-medium">{(selectedValidatorData.uptime * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Stake</span>
                      <span className="text-white font-medium">{(selectedValidatorData.stake / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Commission</span>
                      <span className="text-white font-medium">{selectedValidatorData.commission.toFixed(1)}%</span>
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
                <p className="text-gray-400">
                  {viewType === 'geographic' 
                    ? 'Click on a marker to view details' 
                    : 'Click on a node to view details'
                  }
                </p>
              )}
            </Card>
          </div>

          {/* Enhanced Network Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg border-purple-500/20">
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {nodes.length}
                </p>
                <p className="text-gray-400">Total Nodes</p>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg border-green-500/20">
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {nodes.filter((n) => n.status === 'active').length}
                </p>
                <p className="text-gray-400">Active Nodes</p>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg border-blue-500/20">
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {(nodes.reduce((sum, n) => sum + n.connections, 0) / 2).toFixed(0)}
                </p>
                <p className="text-gray-400">Connections</p>
              </div>
            </Card>
            <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-lg border-yellow-500/20">
              <div className="text-center">
                <p className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {nodes.length > 0 ? (nodes.reduce((sum, n) => sum + n.performance, 0) / nodes.length).toFixed(1) : '0'}
                </p>
                <p className="text-gray-400">Avg Performance</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default NetworkVisualization;
