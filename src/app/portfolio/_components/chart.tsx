import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TokenQuote } from "../server_actions/TokenBalances";

interface PortfolioChartProps {
  tokens:
    | {
        chainId: number;
        logo: string | undefined;
        name: string;
        address: string | undefined;
        symbol: string | undefined;
        balance: number;
        id: number | undefined;
        positive: boolean;
        quote: TokenQuote | undefined;
      }[]
    | undefined;
}

export function PortfolioChart({ tokens }: PortfolioChartProps) {
  if (!tokens || tokens.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center flex-col">
          <p className="text-muted-foreground mb-2">No token data available</p>
          <p className="text-xs text-center text-muted-foreground">
            Add tokens to your portfolio to see your distribution
          </p>
        </CardContent>
      </Card>
    );
  }

  const tokenData = tokens
    .filter((token) => token.quote && token.balance > 0)
    .map((token) => ({
      name: token.symbol || token.name,
      value: token.balance * (token.quote?.quote?.USD?.price || 0),
      priceChange: token.quote?.quote?.USD?.percent_change_24h || 0,
      performance:
        (token.balance *
          (token.quote?.quote?.USD?.price || 0) *
          (token.quote?.quote?.USD?.percent_change_24h || 0)) /
        100,
      positive: token.positive,
    }))
    .filter((item) => item.value > 0);

  if (tokenData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Distribution</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center flex-col">
          <p className="text-muted-foreground mb-2">No value found in tokens</p>
          <p className="text-xs text-center text-muted-foreground">
            Your tokens don&apos;t have any value or price data
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = [...tokenData].sort((a, b) => b.value - a.value);

  // Calculate total portfolio value and performance
  const totalValue = tokenData.reduce((sum, token) => sum + token.value, 0);
  const totalPerformance = tokenData.reduce(
    (sum, token) => sum + token.performance,
    0
  );
  const totalPerformancePercent =
    totalValue > 0 ? (totalPerformance / totalValue) * 100 : 0;

  // Sort tokens by performance for top performers and losers
  const topPerformers = tokenData
    .filter((token) => token.performance > 0)
    .sort((a, b) => b.performance - a.performance)
    .slice(0, 3);

  const topLosers = tokenData
    .filter((token) => token.performance < 0)
    .sort((a, b) => a.performance - b.performance)
    .slice(0, 3);

  // Professional color palette
  const colorPalette = [
    "#3498db", // Blue
    "#2ecc71", // Green
    "#e74c3c", // Red
    "#f39c12", // Yellow
    "#9b59b6", // Purple
    "#1abc9c", // Teal
    "#e67e22", // Orange
    "#e84393", // Pink
    "#27ae60", // Lime
    "#5f27cd", // Indigo
  ];

  // Assign colors consistently
  const tokenColors = chartData.map(
    (_, index) => colorPalette[index % colorPalette.length]
  );

  const formatValue = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  //   const CustomTooltip = ({ active, payload }: any) => {
  //     if (active && payload && payload.length) {
  //       return (
  //         <div className="bg-card p-3 border rounded-md shadow-sm">
  //           <p className="font-medium">{payload[0].name}</p>
  //           <p className="text-sm">{formatValue(payload[0].value)}</p>
  //           <p
  //             className={`text-sm ${
  //               payload[0].payload.priceChange >= 0
  //                 ? "text-green-500"
  //                 : "text-red-500"
  //             }`}
  //           >
  //             {formatPercent(payload[0].payload.priceChange)}
  //           </p>
  //         </div>
  //       );
  //     }
  //     return null;
  //   };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Portfolio Performance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="md:w-1/2 space-y-3">
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">Total Value</p>
            <p
              className={`text-2xl font-bold ${
                totalPerformance >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatValue(totalValue)}
            </p>
          </div>
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium">24h Performance</p>
            <p
              className={`text-lg font-bold ${
                totalPerformancePercent >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {formatValue(totalPerformance)} (
              {formatPercent(totalPerformancePercent)})
            </p>
          </div>
          <div className="flex justify-between p-2">
            <div>
              <p className="text-sm font-medium">Top Performers</p>
              {topPerformers.map((token, index) => (
                <div
                  key={`top-${index}`}
                  className="flex justify-between gap-3"
                >
                  <span className="text-green-500">{token.name}</span>
                  <span className="text-green-500">
                    {formatPercent(token.priceChange)}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-medium">Top Losers</p>
              {topLosers.map((token, index) => (
                <div
                  key={`loss-${index}`}
                  className="flex justify-between gap-3"
                >
                  <span className="text-red-500">{token.name}</span>
                  <span className="text-red-500">
                    {formatPercent(token.priceChange)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="md:w-1/2 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {chartData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={tokenColors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
