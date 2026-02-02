"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface RevenueChartProps {
  data: {
    date: string;
    gross: number;
    net: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Revenue Overview</CardTitle>
        <CardDescription>
          Comparing Gross Volume vs Net Platform Revenue (Last 30 days)
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis
              dataKey="date"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: number | undefined | string | Array<number | string>) => {
                if (typeof value === 'number') {
                  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(value);
                }
                return value;
              }}
            />
            <Legend />
            <Bar dataKey="gross" name="Gross Volume" fill="#adfa1d" radius={[4, 4, 0, 0]} />
            <Bar dataKey="net" name="Net Revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
