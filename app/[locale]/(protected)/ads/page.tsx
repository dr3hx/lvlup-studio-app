import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function AdsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Ads Management</h1>
        <Button asChild>
          <Link href="/ads/campaigns">Create Campaign</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Active Campaigns</h2>
          <p className="text-muted-foreground">View and manage your current advertising campaigns.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/ads/active">View Campaigns</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Analytics</h2>
          <p className="text-muted-foreground">Track ad performance and ROI across platforms.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/ads/analytics">View Analytics</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Budget Management</h2>
          <p className="text-muted-foreground">Monitor and optimize your advertising spend.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/ads/budget">Manage Budget</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
