import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function SocialMediaPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Social Media Management</h1>
        <Button asChild>
          <Link href="/social-media/create-post">Create Post</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Content Calendar</h2>
          <p className="text-muted-foreground">Plan and schedule your social media posts.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/social-media/calendar">View Calendar</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Engagement Metrics</h2>
          <p className="text-muted-foreground">Analyze your social media performance and engagement.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/social-media/analytics">View Analytics</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Connected Platforms</h2>
          <p className="text-muted-foreground">Manage your connected social media accounts.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/social-media/platforms">Manage Platforms</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
