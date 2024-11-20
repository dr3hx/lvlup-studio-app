'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import FilterDropdown from "./filter-dropdown";
import { useTranslations } from "next-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Facebook, Linkedin, Twitter } from "lucide-react";

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  engagement: number;
  impressions: number;
  clicks: number;
  createdAt: string;
  author: {
    name: string;
    image?: string;
  };
}

export default function SocialFeeds() {
  const t = useTranslations("MarketingDashboard");
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch('/api/marketing?dataType=social');
        if (!response.ok) throw new Error('Failed to fetch posts');
        const result = await response.json();
        setPosts(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const platformOptions = [
    { label: 'All Platforms', value: 'all' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'LinkedIn', value: 'linkedin' },
    { label: 'Twitter', value: 'twitter' },
  ];

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'facebook':
        return <Facebook className="h-4 w-4" />;
      case 'linkedin':
        return <Linkedin className="h-4 w-4" />;
      case 'twitter':
        return <Twitter className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatEngagement = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center">
        <CardTitle className="flex-1">{t("social_feeds")}</CardTitle>
        <FilterDropdown
          value={selectedPlatform}
          onChange={setSelectedPlatform}
          options={platformOptions}
        />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="posts" className="space-y-4">
          <TabsList>
            <TabsTrigger value="posts">{t("posts")}</TabsTrigger>
            <TabsTrigger value="analytics">{t("analytics")}</TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="space-y-4">
              {posts
                .filter(post => selectedPlatform === 'all' || post.platform === selectedPlatform)
                .map((post) => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-start space-x-4">
                      <Avatar>
                        <img
                          src={post.author.image || '/images/avatar/default.png'}
                          alt={post.author.name}
                        />
                      </Avatar>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{post.author.name}</span>
                            {getPlatformIcon(post.platform)}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm">{post.content}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span>{formatEngagement(post.engagement)} engagements</span>
                          <span>{formatEngagement(post.impressions)} impressions</span>
                          <span>{formatEngagement(post.clicks)} clicks</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platformOptions.slice(1).map((platform) => (
                <Card key={platform.value} className="p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    {getPlatformIcon(platform.value)}
                    <h3 className="font-medium">{platform.label}</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Posts</span>
                      <span className="font-medium">
                        {posts.filter(p => p.platform === platform.value).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Engagement</span>
                      <span className="font-medium">
                        {formatEngagement(
                          posts
                            .filter(p => p.platform === platform.value)
                            .reduce((sum, post) => sum + post.engagement, 0)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Impressions</span>
                      <span className="font-medium">
                        {formatEngagement(
                          posts
                            .filter(p => p.platform === platform.value)
                            .reduce((sum, post) => sum + post.impressions, 0)
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
