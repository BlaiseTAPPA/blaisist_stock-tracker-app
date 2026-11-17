"use client";

type StockLogoProps = {
  symbol: string;
};

const StockLogo = ({ symbol }: StockLogoProps) => {
  return (
    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-transparent bg-transparent">
      <img
        src={`https://assets.parqet.com/logos/symbol/${symbol}?format=svg`}
        alt={symbol}
        className="h-8 w-8 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).replaceWith(
            Object.assign(document.createElement("span"), {
              className: "text-xs font-bold text-gray-400",
              textContent: symbol.slice(0, 2),
            }),
          );
        }}
      />
    </div>
  );
};

export default StockLogo;
