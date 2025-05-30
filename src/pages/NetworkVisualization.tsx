
import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { mockValidators } from '../data/mockData';

const NetworkVisualization = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [viewType, setViewType] = useState<'network' | 'geographic' | 'clusters'>('network');
  const [selectedValidator, setSelectedValidator] = useState<string | null>(null);

  // Generate node positions for validators
  const generateNodes = () => {
    return mockValidators.map((validator, index) => {
      const angle = (index / mockValidators.length) * 2 * Math.PI;
      const radius = 200 + Math.random() * 100;
      return {
        id: validator.address,
        name: validator.name,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
        size: Math.max(5, (validator.stake / 200000) * 15),
        performance: validator.performanceScore,
        status: validator.status,
        connections: Math.floor(Math.random() * 5) + 2,
      };
    });
  };

  const [nodes, setNodes] = useState(generateNodes());

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

    // Draw connections between nodes
    if (viewType === 'network') {
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 1;
      
      nodes.forEach((node, i) => {
        // Connect each node to a few random other nodes
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
      let color = '#ef4444'; // Red for poor performance
      if (node.performance > 95) color = '#10b981'; // Green for excellent
      else if (node.performance > 90) color = '#f59e0b'; // Yellow for good
      else if (node.performance > 85) color = '#8b5cf6'; // Purple for fair

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
      setOffset(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - canvas.width / 2 - offset.x) / zoom;
    const y = (e.clientY - rect.top - canvas.height / 2 - offset.y) / zoom;

    // Find clicked node
    const clickedNode = nodes.find(node => {
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

  const zoomIn = () => setZoom(prev => Math.min(prev * 1.2, 3));
  const zoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.3));

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

  const selectedValidatorData = selectedValidator ? mockValidators.find(v => v.address === selectedValidator) : null;

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
                    variant={viewType === type ? "default" : "outline"}
                    onClick={() => setViewType(type)}
                    className={`capitalize ${
                      viewType === type 
                        ? 'bg-purple-600 hover:bg-purple-700' 
                        : 'border-white/20 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {type}
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
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={zoomOut}
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={resetView}
                className="border-white/20 text-gray-300 hover:bg-white/10"
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
                <span className="text-xs text-gray-400">Poor (<85%)</span>
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
                  <p className="text-xs text-gray-400 font-mono break-all">{selectedValidatorData.address}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Performance</span>
                    <span className="text-white">{selectedValidatorData.performanceScore.toFixed(1)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime</span>
                    <span className="text-white">{selectedValidatorData.uptime.toFixed(1)}%</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Stake</span>
                    <span className="text-white">{(selectedValidatorData.stake / 1000).toFixed(0)}K</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-400">Region</span>
                    <span className="text-white">{selectedValidatorData.region}</span>
                  </div>
                </div>
                
                <Badge 
                  className={
                    selectedValidatorData.status === 'active' 
                      ? 'bg-green-500/20 text-green-400 border-green-500/30' 
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
              <p className="text-2xl font-bold text-white">{nodes.filter(n => n.status === 'active').length}</p>
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
                {(nodes.reduce((sum, n) => sum + n.performance, 0) / nodes.length).toFixed(1)}
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
