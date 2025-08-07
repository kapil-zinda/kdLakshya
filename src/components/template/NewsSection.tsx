'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { OrganizationConfig } from '@/types/organization';

interface NewsSectionProps {
  data: OrganizationConfig['news'];
  branding: OrganizationConfig['branding'];
}

export function NewsSection({ data, branding }: NewsSectionProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <section className="py-16" style={{ backgroundColor: '#f9fafb' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: branding.primaryColor }}
          >
            {data.title}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.items.map((newsItem, index) => (
            <Card
              key={index}
              className="shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden"
            >
              <CardHeader className="p-0">
                <div className="relative overflow-hidden">
                  <img
                    src={newsItem.image}
                    alt={newsItem.title}
                    className="w-full h-48 object-cover hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        '/images/placeholder.jpg';
                    }}
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                    <span
                      className="text-sm font-medium"
                      style={{ color: branding.primaryColor }}
                    >
                      {formatDate(newsItem.date)}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <h3
                  className="text-xl font-semibold mb-3 line-clamp-2"
                  style={{ color: branding.primaryColor }}
                >
                  {newsItem.title}
                </h3>
                <p
                  className="leading-relaxed line-clamp-3"
                  style={{ color: '#4b5563' }}
                >
                  {newsItem.excerpt}
                </p>
              </CardContent>

              <CardFooter className="p-6 pt-0">
                <Button
                  variant="outline"
                  className="w-full transition-all duration-300"
                  style={{
                    borderColor: branding.secondaryColor,
                    color: branding.secondaryColor,
                    backgroundColor: 'white',
                  }}
                  onClick={() => window.open(newsItem.link, '_self')}
                >
                  Read More
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button
            size="lg"
            className="px-8 py-4"
            style={{
              backgroundColor: branding.primaryColor,
              borderColor: branding.primaryColor,
            }}
          >
            View All News
          </Button>
        </div>
      </div>
    </section>
  );
}
