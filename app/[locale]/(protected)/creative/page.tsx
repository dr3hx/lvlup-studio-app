import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/routing";

export default function CreativePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Creative AI Tools</h1>
        <Button asChild>
          <Link href="/creative/generate">Generate Content</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Content Generation</h2>
          <p className="text-muted-foreground">Create AI-powered marketing content, blog posts, and social media copy.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/creative/content">Generate Content</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Image Creation</h2>
          <p className="text-muted-foreground">Generate and edit marketing visuals using AI technology.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/creative/images">Create Images</Link>
          </Button>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Content Library</h2>
          <p className="text-muted-foreground">Manage and organize your AI-generated content.</p>
          <Button className="mt-4" variant="outline" asChild>
            <Link href="/creative/library">View Library</Link>
          </Button>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Content Assistant</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Get AI-powered suggestions and improvements for your marketing content.
          </p>
          <Button asChild>
            <Link href="/creative/assistant">Open AI Assistant</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
