import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Log } from '@/types';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Hash, TrendingUp, Users } from 'lucide-react';

interface TagAnalyticsProps {
  log: Log;
}

export const TagAnalytics = ({ log }: TagAnalyticsProps) => {
  const [searchTag, setSearchTag] = useState('');

  const analytics = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    const tagCoOccurrence: Record<string, Record<string, number>> = {};
    
    // Count tag frequency and co-occurrences
    log.events.forEach(event => {
      event.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        
        // Initialize co-occurrence map for this tag
        if (!tagCoOccurrence[tag]) {
          tagCoOccurrence[tag] = {};
        }
        
        // Count co-occurrences with other tags in the same event
        event.tags.forEach(otherTag => {
          if (tag !== otherTag) {
            tagCoOccurrence[tag][otherTag] = (tagCoOccurrence[tag][otherTag] || 0) + 1;
          }
        });
      });
    });

    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([tag, count]) => ({ tag, count }));

    const chartData = sortedTags.slice(0, 8).map(({ tag, count }) => ({
      tag,
      count,
    }));

    const pieData = sortedTags.slice(0, 6).map(({ tag, count }, index) => ({
      name: tag,
      value: count,
      fill: `hsl(var(--primary) / ${1 - index * 0.15})`,
    }));

    return { tagCounts, tagCoOccurrence, sortedTags, chartData, pieData };
  }, [log.events]);

  const searchResults = useMemo(() => {
    if (!searchTag.trim()) return null;
    
    const tag = searchTag.toLowerCase().trim();
    const coTags = analytics.tagCoOccurrence[tag] || {};
    
    return Object.entries(coTags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([coTag, count]) => ({ tag: coTag, count }));
  }, [searchTag, analytics.tagCoOccurrence]);

  if (log.events.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Hash className="w-8 h-8 mx-auto mb-2" />
          <p>No events yet. Add some events with tags to see analytics!</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tag Frequency Chart */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Most Used Tags</h3>
          </div>
          <ChartContainer config={{}} className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.chartData}>
                <XAxis 
                  dataKey="tag" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>

        {/* Tag Distribution Pie */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Tag Distribution</h3>
          </div>
          <ChartContainer config={{}} className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  fontSize={12}
                >
                  {analytics.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </Card>
      </div>

      {/* Tag Search */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Tag Co-occurrence</h3>
        </div>
        <Input
          placeholder="Search for a tag to see what it commonly appears with..."
          value={searchTag}
          onChange={(e) => setSearchTag(e.target.value)}
          className="mb-4"
        />
        {searchResults && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Tags that commonly appear with "{searchTag}":
            </p>
            <div className="flex flex-wrap gap-2">
              {searchResults.length > 0 ? (
                searchResults.map(({ tag, count }) => (
                  <Badge key={tag} variant="outline">
                    {tag} ({count}x)
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No co-occurring tags found for "{searchTag}"
                </p>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* All Tags Overview */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">All Tags ({analytics.sortedTags.length})</h3>
        <div className="flex flex-wrap gap-2">
          {analytics.sortedTags.map(({ tag, count }) => (
            <Badge key={tag} variant="secondary" className="cursor-pointer hover:bg-secondary/80">
              {tag} ({count})
            </Badge>
          ))}
        </div>
      </Card>
    </div>
  );
};