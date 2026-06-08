"use client";

type StockLogoProps = {
  symbol: string;
};

const StockLogo = ({ symbol }: StockLogoProps) => {
  return (
    <div className="w-10 h-10 rounded-lg bg-transparent border border-transparent flex items-center justify-center overflow-hidden">
      <img
        src={`https://assets.parqet.com/logos/symbol/${symbol}?format=svg`}
        alt={symbol}
        className="w-8 h-8 object-contain"
        onError={(e) => {
          (e.target as HTMLImageElement).replaceWith(
            Object.assign(document.createElement("span"), {
              className: "text-xs font-bold text-gray-400",
              textContent: symbol.slice(0, 2),
            })
          );
        }}
      />
    </div>
  );
};

export default StockLogo;