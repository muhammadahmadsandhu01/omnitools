import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
      {
        userAgent: [
          'Googlebot',
          'Mediapartners-Google',
          'Google-Display-Ads-Bot',
          'AdsBot-Google',
          'Google-Extended',
          'Google-Agent',
          'Bingbot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'GPTBot',
          'Claude-SearchBot',
          'Claude-User',
          'Claude-Web',
          'ClaudeBot',
          'anthropic-ai',
          'PerplexityBot',
          'Perplexity-User',
          'Applebot',
          'Applebot-Extended',
          'Amazonbot',
          'Amzn-SearchBot',
          'Amzn-User',
          'Meta-ExternalAgent',
          'FacebookBot',
          'MistralAI-User',
          'DuckAssistBot',
          'GitHubCopilotChat',
          'YouBot',
          'DeepseekBot',
          'xAI-Bot',
          'CCBot',
          'cohere-ai',
          'Bytespider',
          'Diffbot',
        ],
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}