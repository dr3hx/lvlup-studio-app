'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { Loader2, Wand2 } from "lucide-react";

interface ContentRequest {
  platform: string;
  contentType: string;
  prompt: string;
  metadata: {
    targetAudience: string;
    tone: string;
    keywords: string[];
    length: number;
  };
}

export default function AIContentGenerator() {
  const t = useTranslations("MarketingDashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [request, setRequest] = useState<ContentRequest>({
    platform: '',
    contentType: '',
    prompt: '',
    metadata: {
      targetAudience: '',
      tone: 'professional',
      keywords: [],
      length: 280,
    },
  });

  const handleGenerate = async () => {
    if (!request.platform || !request.contentType || !request.prompt) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/ai/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      const data = await response.json();
      setGeneratedContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) return;

    try {
      const response = await fetch('/api/ai/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: generatedContent,
          status: 'approved',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save content');
      }

      // Reset form after successful save
      setGeneratedContent('');
      setRequest({
        platform: '',
        contentType: '',
        prompt: '',
        metadata: {
          targetAudience: '',
          tone: 'professional',
          keywords: [],
          length: 280,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save content');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{t("ai_content_generator")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Select
                value={request.platform}
                onValueChange={(value) => 
                  setRequest(prev => ({ ...prev, platform: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select_platform")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={request.contentType}
                onValueChange={(value) =>
                  setRequest(prev => ({ ...prev, contentType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select_content_type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="post">Post</SelectItem>
                  <SelectItem value="article">Article</SelectItem>
                  <SelectItem value="thread">Thread</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Input
                placeholder={t("target_audience")}
                value={request.metadata.targetAudience}
                onChange={(e) =>
                  setRequest(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, targetAudience: e.target.value }
                  }))
                }
              />

              <Input
                placeholder={t("keywords")}
                value={request.metadata.keywords.join(', ')}
                onChange={(e) =>
                  setRequest(prev => ({
                    ...prev,
                    metadata: {
                      ...prev.metadata,
                      keywords: e.target.value.split(',').map(k => k.trim())
                    }
                  }))
                }
              />

              <Select
                value={request.metadata.tone}
                onValueChange={(value) =>
                  setRequest(prev => ({
                    ...prev,
                    metadata: { ...prev.metadata, tone: value }
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("select_tone")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="humorous">Humorous</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Textarea
              placeholder={t("content_prompt")}
              value={request.prompt}
              onChange={(e) =>
                setRequest(prev => ({ ...prev, prompt: e.target.value }))
              }
              className="min-h-[100px]"
            />

            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Wand2 className="mr-2 h-4 w-4" />
              )}
              {t("generate_content")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle>{t("generated_content")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="min-h-[200px] mb-4"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setGeneratedContent('')}
              >
                {t("discard")}
              </Button>
              <Button onClick={handleSave}>
                {t("save_content")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
