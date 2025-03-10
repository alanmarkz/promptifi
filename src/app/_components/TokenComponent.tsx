import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { CmcApiResponse } from "../portfolio/server_actions/TokenBalances";
import numeral from "numeral";
import Image from "next/image";

const TokenComponent = ({ token }: { token: CmcApiResponse }) => {
  const tokenData = Object.values(token.data)[0];
  const { name, symbol, cmc_rank, quote } = tokenData;
  const price = quote.USD.price.toFixed(2);
  const percentChange24h = quote.USD.percent_change_24h;
  const marketCap = quote.USD.market_cap;
  const formattedMarketCap = numeral(marketCap).format("0.00a").toUpperCase();
  const volume24h = quote.USD.volume_24h;
  const formattedVolume = numeral(volume24h).format("0.00a").toUpperCase();
  const isPositive = percentChange24h >= 0;

  const total_supply = numeral(tokenData.max_supply)
    .format("0.00a")
    .toUpperCase();

  const circulating = numeral(tokenData.circulating_supply)
    .format("0.00a")
    .toUpperCase();

  return (
    <div className="w-full  p-2 shadow-md rounded-xl border border-gray-200 bg-white text-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Image
            src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${tokenData.id}.png`}
            className="w-5 h-5"
            alt={name}
          />
          <div className="font-medium">
            {name}
            <span className="text-xs text-gray-600 ml-1">{symbol}</span>
            <span className="ml-1 text-xs px-1 bg-gray-500 text-white rounded">
              #{cmc_rank}
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-semibold">${price}</div>
          <div
            className={`flex items-center text-xs ${
              isPositive ? "text-green-500" : "text-red-500"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            <span>{percentChange24h.toFixed(2)}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg text-xs">
        <div
          className={`p-1.5 rounded-lg border ${
            isPositive ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="text-gray-600 font-medium">Market Cap</div>
          <div className="flex items-center gap-1">
            {formattedMarketCap}
            <span className={isPositive ? "text-green-500" : "text-red-500"}>
              {percentChange24h > 0 ? "+" : ""}
              {percentChange24h.toFixed(1)}%
            </span>
          </div>
        </div>
        <div
          className={`p-1.5 rounded-lg border ${
            quote.USD.volume_change_24h > 0 ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <div className="text-gray-600 font-medium">24h Volume</div>
          <div className="flex items-center gap-1">
            {formattedVolume}
            <span
              className={
                quote.USD.volume_change_24h > 0
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {quote.USD.volume_change_24h > 0 ? "+" : ""}
              {quote.USD.volume_change_24h.toFixed(1)}%
            </span>
          </div>
        </div>
        <div className="p-1.5 rounded-lg border">
          <div className="text-gray-600 font-medium">Supply</div>
          <div className="truncate">
            {circulating}/{total_supply}
          </div>
        </div>
        <div className="p-1.5 rounded-lg border">
          <Image
            src={`https://s3.coinmarketcap.com/generated/sparklines/web/7d/2781/${tokenData.id}.svg`}
            className="h-8 w-full object-contain"
            style={{
              filter: isPositive
                ? "invert(50%) sepia(100%) saturate(500%) hue-rotate(90deg)"
                : "hue-rotate(300deg) saturate(210%) brightness(0.7) contrast(170%)",
            }}
            alt={`${name} 7-day trend`}
          />
        </div>
      </div>
    </div>
  );
};

export default TokenComponent;
