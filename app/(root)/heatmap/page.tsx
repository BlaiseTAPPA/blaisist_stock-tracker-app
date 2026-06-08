import TradingViewWidget from '@/components/TradingViewWidget'
import { HEATMAP_WIDGET_CONFIG} from "@/lib/constants";


const scriptUrl = `https://s3.tradingview.com/external-embedding/embed-widget-`;

const HeatMapPage = () => {
  return (
            <div className="md:col-span-1 xl:col-span-2">
          <TradingViewWidget
            title="Stock Heatmap"
            scriptUrl={`${scriptUrl}stock-heatmap.js`}
            config={HEATMAP_WIDGET_CONFIG}
            className="custom-chart"
            height={600}
          />
        </div>
  )
}

export default HeatMapPage