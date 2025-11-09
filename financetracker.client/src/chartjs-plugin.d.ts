import { ChartOptions, PluginOptionsByType, ChartTypeRegistry } from 'chart.js';

declare module 'chart.js' {
  // Extend the chart options with custom plugin options
  interface ChartOptions {
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
      doughnutlabelList?: {
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
}
