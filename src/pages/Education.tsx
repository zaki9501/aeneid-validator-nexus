
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { BookOpen, Video, Users, ExternalLink, Play, Clock, Award } from 'lucide-react';

const Education = () => {
  const [activeCategory, setActiveCategory] = useState<'guides' | 'videos' | 'faq'>('guides');

  const guides = [
    {
      title: "Getting Started with Story Protocol",
      description: "A comprehensive introduction to Story Protocol and its validator ecosystem",
      readTime: "10 min read",
      difficulty: "Beginner",
      category: "Introduction",
      content: `Story Protocol is a revolutionary blockchain platform designed for intellectual property and creative content. This guide will walk you through the basics of how the network operates and the role of validators.`,
    },
    {
      title: "Setting Up Your Validator Node",
      description: "Step-by-step instructions for becoming a validator on the Aeneid testnet",
      readTime: "25 min read",
      difficulty: "Intermediate",
      category: "Technical",
      content: `Learn how to set up and configure your validator node, including hardware requirements, software installation, and network configuration.`,
    },
    {
      title: "Understanding Validator Economics",
      description: "Deep dive into rewards, staking, and the economic model",
      readTime: "15 min read",
      difficulty: "Intermediate",
      category: "Economics",
      content: `Explore the economic incentives and reward mechanisms that drive the Story Protocol validator ecosystem.`,
    },
    {
      title: "Security Best Practices",
      description: "Essential security measures for validator operations",
      readTime: "20 min read",
      difficulty: "Advanced",
      category: "Security",
      content: `Comprehensive security guidelines to protect your validator node and maintain network integrity.`,
    },
  ];

  const videos = [
    {
      title: "Story Protocol Overview",
      description: "High-level introduction to the protocol and its vision",
      duration: "12:34",
      difficulty: "Beginner",
      thumbnail: "photo-1605810230434-7631ac76ec81",
    },
    {
      title: "Validator Setup Tutorial",
      description: "Complete walkthrough of validator node setup",
      duration: "45:22",
      difficulty: "Intermediate",
      thumbnail: "photo-1498050108023-c5249f4df085",
    },
    {
      title: "Network Monitoring & Maintenance",
      description: "Best practices for ongoing validator operations",
      duration: "28:15",
      difficulty: "Advanced",
      thumbnail: "photo-1487058792275-0ad4aaf24ca7",
    },
  ];

  const faqData = [
    {
      question: "What is Story Protocol?",
      answer: "Story Protocol is a blockchain platform focused on intellectual property and creative content, designed to revolutionize how creators and brands interact with digital assets.",
    },
    {
      question: "How do I become a validator?",
      answer: "To become a validator, you need to set up a node, meet the minimum staking requirements, and follow the technical setup guide. Start with our validator setup tutorial.",
    },
    {
      question: "What are the hardware requirements?",
      answer: "Minimum requirements include 4 CPU cores, 16GB RAM, 500GB SSD storage, and a stable internet connection with at least 100 Mbps bandwidth.",
    },
    {
      question: "How are rewards calculated?",
      answer: "Rewards are based on your validator's performance, uptime, and stake. The more reliable and well-performing your validator, the higher your rewards.",
    },
    {
      question: "What happens if my validator goes offline?",
      answer: "If your validator goes offline, you may miss rewards and potentially face penalties. It's important to maintain high uptime and monitor your node continuously.",
    },
    {
      question: "Can I delegate to other validators?",
      answer: "Yes, token holders can delegate their stake to validators they trust. This helps secure the network while earning rewards for both delegators and validators.",
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Intermediate': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Advanced': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Education Center</h1>
          <p className="text-xl text-gray-300">Learn everything about Story Protocol and validator operations</p>
        </div>

        {/* Category Navigation */}
        <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
          <div className="flex gap-4 justify-center">
            {(['guides', 'videos', 'faq'] as const).map((category) => (
              <Button
                key={category}
                variant={activeCategory === category ? "default" : "outline"}
                onClick={() => setActiveCategory(category)}
                className={`capitalize flex items-center gap-2 ${
                  activeCategory === category 
                    ? 'bg-purple-600 hover:bg-purple-700' 
                    : 'border-white/20 text-gray-300 hover:bg-white/10'
                }`}
              >
                {category === 'guides' && <BookOpen className="w-4 h-4" />}
                {category === 'videos' && <Video className="w-4 h-4" />}
                {category === 'faq' && <Users className="w-4 h-4" />}
                {category}
              </Button>
            ))}
          </div>
        </Card>

        {/* Guides Section */}
        {activeCategory === 'guides' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {guides.map((guide, index) => (
                <Card key={index} className="p-6 bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{guide.title}</h3>
                        <p className="text-gray-300 mb-4">{guide.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getDifficultyColor(guide.difficulty)}>
                          {guide.difficulty}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Clock className="w-4 h-4" />
                          {guide.readTime}
                        </div>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        Read Guide
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Featured CTA */}
            <Card className="p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-lg border-purple-500/30">
              <div className="text-center space-y-4">
                <Award className="w-16 h-16 text-purple-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">Ready to Become a Validator?</h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Join the Story Protocol network and start earning rewards while securing the future of intellectual property on the blockchain.
                </p>
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700">
                  Start Your Validator Journey
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Videos Section */}
        {activeCategory === 'videos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <Card key={index} className="p-6 bg-white/5 backdrop-blur-lg border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="space-y-4">
                    <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                      <img 
                        src={`https://images.unsplash.com/${video.thumbnail}?w=400&h=225&fit=crop`}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <Play className="w-12 h-12 text-white" />
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-sm px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{video.title}</h3>
                      <p className="text-gray-300 text-sm mb-3">{video.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(video.difficulty)}>
                          {video.difficulty}
                        </Badge>
                        <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                          Watch Now
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* FAQ Section */}
        {activeCategory === 'faq' && (
          <div className="space-y-6">
            <Card className="p-6 bg-white/5 backdrop-blur-lg border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="space-y-4">
                {faqData.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-white/10">
                    <AccordionTrigger className="text-white hover:text-purple-400 text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-300">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>

            {/* Community CTA */}
            <Card className="p-8 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-lg border-blue-500/30">
              <div className="text-center space-y-4">
                <Users className="w-16 h-16 text-blue-400 mx-auto" />
                <h2 className="text-2xl font-bold text-white">Join Our Community</h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Connect with other validators, get support, and stay updated with the latest developments in the Story Protocol ecosystem.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                    Discord Community
                  </Button>
                  <Button variant="outline" className="border-white/20 text-gray-300 hover:bg-white/10">
                    Telegram Group
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Education;
