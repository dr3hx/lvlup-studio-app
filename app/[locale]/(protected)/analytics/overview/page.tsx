import Image from "next/image";
import { StatisticsBlock } from "@/components/blocks/statistics-block";
import { BlockBadge, WelcomeBlock } from "@/components/blocks/welcome-block";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import MarketingMetrics from "./components/marketing-metrics";
import SocialFeeds from "./components/social-feeds";
import AIContentGenerator from "./components/ai-content-generator";

const AnalyticsOverviewPage = () => {
  const t = useTranslations("MarketingDashboard");

  return (
    <div>
      <div className="grid grid-cols-12 items-center gap-5 mb-5">
        <div className="2xl:col-span-3 lg:col-span-4 col-span-12">
          <WelcomeBlock>
            <div className="max-w-[180px] relative z-10">
              <div className="text-xl font-medium text-default-900 dark:text-default-100 mb-2">
                {t("welcome_title")}
              </div>
              <p className="text-sm text-default-800 dark:text-default-100">
                {t("welcome_desc")}
              </p>
            </div>
            <BlockBadge className="end-3">{t("marketing_dashboard")}</BlockBadge>
            <Image
              src="/images/all-img/widget-bg-1.png"
              width={400}
              height={150}
              priority
              alt="Marketing Dashboard Background"
              className="absolute top-0 start-0 w-full h-full object-cover rounded-md"
            />
          </WelcomeBlock>
        </div>
        <div className="2xl:col-span-9 lg:col-span-8 col-span-12">
          <MarketingMetrics />
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="lg:col-span-8 col-span-12">
          <Tabs defaultValue="social" className="space-y-4">
            <TabsList>
              <TabsTrigger value="social">{t("social_media")}</TabsTrigger>
              <TabsTrigger value="content">{t("content_creation")}</TabsTrigger>
            </TabsList>

            <TabsContent value="social">
              <SocialFeeds />
            </TabsContent>

            <TabsContent value="content">
              <AIContentGenerator />
            </TabsContent>
          </Tabs>
        </div>

        <div className="lg:col-span-4 col-span-12">
          <Card>
            <CardHeader>
              <CardTitle>{t("quick_actions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 hover:bg-muted cursor-pointer transition-colors">
                  <div className="text-sm font-medium">{t("connect_platform")}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("connect_platform_desc")}
                  </p>
                </Card>
                <Card className="p-4 hover:bg-muted cursor-pointer transition-colors">
                  <div className="text-sm font-medium">{t("create_campaign")}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("create_campaign_desc")}
                  </p>
                </Card>
                <Card className="p-4 hover:bg-muted cursor-pointer transition-colors">
                  <div className="text-sm font-medium">{t("schedule_posts")}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("schedule_posts_desc")}
                  </p>
                </Card>
                <Card className="p-4 hover:bg-muted cursor-pointer transition-colors">
                  <div className="text-sm font-medium">{t("view_analytics")}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("view_analytics_desc")}
                  </p>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-5">
            <CardHeader>
              <CardTitle>{t("connected_platforms")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/images/all-img/google.png"
                      width={24}
                      height={24}
                      alt="Google"
                    />
                    <span>Google Analytics</span>
                  </div>
                  <div className="text-sm text-green-500">Connected</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/images/all-img/facebook.png"
                      width={24}
                      height={24}
                      alt="Facebook"
                    />
                    <span>Facebook</span>
                  </div>
                  <div className="text-sm text-green-500">Connected</div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Image
                      src="/images/all-img/linkedin.png"
                      width={24}
                      height={24}
                      alt="LinkedIn"
                    />
                    <span>LinkedIn</span>
                  </div>
                  <div className="text-sm text-yellow-500">Connect</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverviewPage;
