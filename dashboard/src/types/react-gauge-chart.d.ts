declare module 'react-gauge-chart' {
    import { FC } from 'react';
    
    interface GaugeChartProps {
        id: string;
        nrOfLevels?: number;
        colors?: string[];
        arcWidth?: number;
        percent?: number;
        textColor?: string;
        formatTextValue?: (value: number) => string;
        style?: React.CSSProperties;
    }
    
    const GaugeChart: FC<GaugeChartProps>;
    export default GaugeChart;
}
