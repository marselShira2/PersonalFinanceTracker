import { ChartOptions } from 'chart.js';

export interface CustomChartOptions extends ChartOptions {
  plugins: {
    doughnutlabel?: {
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
