'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatisticsBlock } from "@/components/blocks/statistics-block";
import FilterDropdown from "./filter-dropdown";
import { useTranslations } from "next-intl";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface MarketingData {
  platform: string;
  analytics?: {
    pageViews: number;
    sessions: number;
    users: number;
    bounceRate: number;
  };
  socialMetrics?: {
    followers: number;
    engagement: number;
    impressions: number;
    clicks: number;
  };
  adsMetrics?: {
    spend: number;
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
  };
}

export default function MarketingMetrics() {
  const t = useTranslations("MarketingDashboard");
  const [data, setData] = useState<MarketingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/marketing');
        if (!response.ok) throw new Error('Failed to fetch data');
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  // Aggregate metrics across platforms
  const aggregateMetrics = data.reduce((acc, curr) => {
    if (curr.analytics) {
      acc.totalPageViews = (acc.totalPageViews || 0) + curr.analytics.pageViews;
      acc.totalUsers = (acc.totalUsers || 0) + curr.analytics.users;
    }
    if (curr.socialMetrics) {
      acc.totalEngagement = (acc.totalEngagement || 0) + curr.socialMetrics.engagement;
      acc.totalFollowers = (acc.totalFollowers || 0) + curr.socialMetrics.followers;
    }
    if (curr.adsMetrics) {
      acc.totalSpend = (acc.totalSpend || 0) + curr.adsMetrics.spend;
      acc.totalConversions = (acc.totalConversions || 0) + curr.adsMetrics.conversions;
    }
    return acc;
  }, {} as any);

  const platformOptions = [
    { label: 'All Platforms', value: 'all' },
    { label: 'Google', value: 'google' },
    { label: 'Facebook', value: 'facebook' },
    { label: 'LinkedIn', value: 'linkedin' },
  ];

  return (
    <div className="space-y-4">
      {/* Overview Statistics */}
      <Card>
        <CardContent className="p-4">
          <div className="grid md:grid-cols-4 gap-4">
            <StatisticsBlock
              title={t("total_page_views")}
              total={aggregateMetrics.totalPageViews?.toLocaleString() || "0"}
              className="bg-primary/10 border-none shadow-none"
            />
            <StatisticsBlock
              title={t("total_followers")}
              total={aggregateMetrics.totalFollowers?.toLocaleString() || "0"}
              className="bg-info/10 border-none shadow-none"
              chartColor="#0ea5e9"
            />
            <StatisticsBlock
              title={t("total_engagement")}
              total={aggregateMetrics.totalEngagement?.toLocaleString() || "0"}
              className="bg-warning/10 border-none shadow-none"
              chartColor="#FB8F65"
            />
            <StatisticsBlock
              title={t("total_conversions")}
              total={aggregateMetrics.totalConversions?.toLocaleString() || "0"}
              className="bg-success/10 border-none shadow-none"
              chartColor="#22c55e"
            />
          </div>
        </CardContent>
      </Card>

      {/* Platform Performance */}
      <Card>
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="flex-1">{t("platform_performance")}</CardTitle>
          <FilterDropdown
            value={selectedPlatform}
            onChange={setSelectedPlatform}
            options={platformOptions}
          />
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data.filter(d => 
                  selectedPlatform === 'all' || d.platform === selectedPlatform
                )}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="platform" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="socialMetrics.engagement" 
                  stroke="#8884d8" 
                  name="Engagement"
                />
                <Line 
                  type="monotone" 
                  dataKey="socialMetrics.impressions" 
                  stroke="#82ca9d" 
                  name="Impressions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
