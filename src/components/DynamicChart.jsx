import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

import { Bar, Line, Pie, Doughnut, Scatter } from "react-chartjs-2";

import TableChart from "./TableChart";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

// Color palette for multiple datasets
const CHART_COLORS = [
  'rgba(75, 192, 192, 0.8)',
  'rgba(255, 99, 132, 0.8)',
  'rgba(54, 162, 235, 0.8)',
  'rgba(255, 206, 86, 0.8)',
  'rgba(153, 102, 255, 0.8)',
  'rgba(255, 159, 64, 0.8)',
  'rgba(199, 199, 199, 0.8)',
  'rgba(83, 102, 255, 0.8)',
];

const CHART_BORDER_COLORS = [
  'rgba(75, 192, 192, 1)',
  'rgba(255, 99, 132, 1)',
  'rgba(54, 162, 235, 1)',
  'rgba(255, 206, 86, 1)',
  'rgba(153, 102, 255, 1)',
  'rgba(255, 159, 64, 1)',
  'rgba(199, 199, 199, 1)',
  'rgba(83, 102, 255, 1)',
];

function buildChartJSData(type, data, label = "Value") {
  // Check if data has multiple datasets (multi-series)
  const hasMultipleDatasets = data.datasets && Array.isArray(data.datasets);

  // Normalize labels for display (handle array of arrays for multiple x columns)
  const displayLabels = data.labels.map(l => 
    Array.isArray(l) ? l.join(' | ') : l
  );

  switch (type) {
    case "pie":
    case "doughnut":
      // Pie/Doughnut only supports single dataset - use first if multiple
      const pieValues = hasMultipleDatasets ? data.datasets[0].values : data.values;
      return {
        labels: displayLabels,
        datasets: [{ 
          label: hasMultipleDatasets ? data.datasets[0].label : label, 
          data: pieValues,
          backgroundColor: CHART_COLORS,
          borderColor: CHART_BORDER_COLORS,
          borderWidth: 1
        }],
      };

    case "scatter":
      if (hasMultipleDatasets) {
        // Multiple scatter series
        return {
          datasets: data.datasets.map((ds, idx) => ({
            label: ds.label,
            data: ds.values.map((v, i) => ({
              x: Array.isArray(data.labels[i]) ? data.labels[i][0] : data.labels[i],
              y: v,
            })),
            backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
            borderColor: CHART_BORDER_COLORS[idx % CHART_BORDER_COLORS.length],
          })),
        };
      }
      return {
        datasets: [
          {
            label,
            data: data.values.map((v, i) => ({
              x: Array.isArray(data.labels[i]) ? data.labels[i][0] : data.labels[i],
              y: v,
            })),
            backgroundColor: CHART_COLORS[0],
            borderColor: CHART_BORDER_COLORS[0],
          },
        ],
      };

    case "line":
      if (hasMultipleDatasets) {
        // Multiple line series
        return {
          labels: displayLabels,
          datasets: data.datasets.map((ds, idx) => ({
            label: ds.label,
            data: ds.values,
            borderColor: CHART_BORDER_COLORS[idx % CHART_BORDER_COLORS.length],
            backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
            fill: false,
            tension: 0.1,
          })),
        };
      }
      return {
        labels: displayLabels,
        datasets: [{ 
          label, 
          data: data.values,
          borderColor: CHART_BORDER_COLORS[0],
          backgroundColor: CHART_COLORS[0],
          fill: false,
          tension: 0.1,
        }],
      };

    case "bar":
    default:
      if (hasMultipleDatasets) {
        // Multiple bar series (grouped bars)
        return {
          labels: displayLabels,
          datasets: data.datasets.map((ds, idx) => ({
            label: ds.label,
            data: ds.values,
            backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
            borderColor: CHART_BORDER_COLORS[idx % CHART_BORDER_COLORS.length],
            borderWidth: 1,
          })),
        };
      }
      return {
        labels: displayLabels,
        datasets: [{ 
          label, 
          data: data.values,
          backgroundColor: CHART_COLORS[0],
          borderColor: CHART_BORDER_COLORS[0],
          borderWidth: 1,
        }],
      };
  }
}

export default function DynamicChart({ type = "bar", data }) {
  if (type === "table") {
    return <TableChart data={data} />;
  }
  
  const chartData = buildChartJSData(type, data);

  switch (type) {
    case "line":
      return <Line data={chartData} />;
    case "pie":
      return <Pie data={chartData} />;
    case "doughnut":
      return <Doughnut data={chartData} />;
    case "scatter":
      return <Scatter data={chartData} />;
    default:
      return <Bar data={chartData} />;
  }
}
