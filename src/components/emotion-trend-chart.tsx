"use client";

import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useAppContext } from "@/hooks/use-app-context";
import type { Conversation } from "@/lib/types";
import { TrendingUp, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ChartData = {
  day: string;
  Positive: number;
  Neutral: number;
  Negative: number;
};

const chartConfig = {
  Positive: {
    label: "Positive",
    color: "hsl(var(--primary))",
  },
  Neutral: {
    label: "Neutral",
    color: "hsl(var(--chart-4))",
  },
  Negative: {
    label: "Negative",
    color: "hsl(var(--destructive))",
  },
};

const SAMPLE_DATA: ChartData[] = [
  { day: "Sun", Positive: 2, Neutral: 1, Negative: 0 },
  { day: "Mon", Positive: 4, Neutral: 2, Negative: 1 },
  { day: "Tue", Positive: 3, Neutral: 5, Negative: 2 },
  { day: "Wed", Positive: 5, Neutral: 3, Negative: 1 },
  { day: "Thu", Positive: 4, Neutral: 2, Negative: 0 },
  { day: "Fri", Positive: 6, Neutral: 1, Negative: 0 },
  { day: "Sat", Positive: 3, Neutral: 2, Negative: 1 },
];

export default function EmotionTrendChart() {
  const { history } = useAppContext();

  const isDemo = history.length === 0;

  const chartData = useMemo(() => {
    if (isDemo) return SAMPLE_DATA;

    const data: ChartData[] = [
      { day: "Sun", Positive: 0, Neutral: 0, Negative: 0 },
      { day: "Mon", Positive: 0, Neutral: 0, Negative: 0 },
      { day: "Tue", Positive: 0, Neutral: 0, Negative: 0 },
      { day: "Wed", Positive: 0, Neutral: 0, Negative: 0 },
      { day: "Thu", Positive: 0, Neutral: 0, Negative: 0 },
      { day: "Fri", Positive: 0, Neutral: 0, Negative: 0 },
      { day: "Sat", Positive: 0, Neutral: 0, Negative: 0 },
    ];

    history.forEach((conv: Conversation) => {
      const date = new Date(conv.timestamp);
      const dayIndex = date.getDay();
      const sentiment = conv.sentiment;
      if (sentiment && data[dayIndex]) {
        data[dayIndex][sentiment]++;
      }
    });

    return data;
  }, [history, isDemo]);

  return (
    <Card className="rounded-[2rem] border-none shadow-2xl bg-white/60 backdrop-blur-md overflow-hidden relative">
      {isDemo && (
        <div className="absolute top-4 right-4 z-20">
          <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="size-3" />
            Sample Trends
          </Badge>
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black tracking-tight text-foreground flex items-center gap-2">
              <TrendingUp className="size-5 text-primary" />
              Emotional Well-being
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Weekly sentiment analysis
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer config={chartConfig} className="h-64 w-full">
          <BarChart accessibilityLayer data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fontWeight: 700, fill: 'hsl(var(--muted-foreground))' }}
            />
            <ChartTooltip
              cursor={{ fill: 'rgba(0,0,0,0.02)' }}
              content={<ChartTooltipContent className="rounded-xl border-none shadow-xl" />}
            />
            <ChartLegend content={<ChartLegendContent className="text-[10px] font-bold uppercase" />} />
            <Bar 
              dataKey="Positive" 
              stackId="a" 
              fill="var(--color-Positive)" 
              radius={[0, 0, 4, 4]} 
              barSize={20}
            />
            <Bar 
              dataKey="Neutral" 
              stackId="a" 
              fill="var(--color-Neutral)" 
              barSize={20}
            />
            <Bar 
              dataKey="Negative" 
              stackId="a" 
              fill="var(--color-Negative)" 
              radius={[4, 4, 0, 0]}
              barSize={20}
            />
          </BarChart>
        </ChartContainer>
        {isDemo && (
          <p className="text-center text-[10px] font-medium text-muted-foreground/60 mt-4 italic">
            Visualizing sample data. Start mediating messages to see real trends.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
