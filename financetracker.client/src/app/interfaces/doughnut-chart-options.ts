import { ChartOptions } from 'chart.js';

export interface DoughnutChartOptions extends ChartOptions {
  plugins: {
    doughnutLabelList?: {
      labels: {
        text: string;
        font: {
          size: number;
          weight: string;
        };
        color: string;
      }[];
    };
    legend: {
      display: boolean;
    };
    tooltip: {
      enabled: boolean;
    };
  };
}
