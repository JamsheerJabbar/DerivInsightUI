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

// Extract data from graph attributes (handles both old and new formats)
function extractGraphData(attributes) {
  // Handle both 'xaxis'/'yaxis' (old) and 'xAxis'/'yAxis' (new) formats
  const xAxis = attributes.xAxis || attributes.xaxis || {};
  const yAxis = attributes.yAxis || attributes.yaxis || {};

  const labels = xAxis.values || [];
  const xKeys = xAxis.keys || ['X'];
  const yKeys = yAxis.keys || ['Y'];

  // Check if we have multiple datasets (new format)
  if (yAxis.datasets && Array.isArray(yAxis.datasets)) {
    return {
      labels,
      datasets: yAxis.datasets,
      xKeys,
      yKeys
    };
  }

  // Single dataset (old format or simple new format)
  return {
    labels,
    values: yAxis.values || [],
    xKeys,
    yKeys
  };
}

function buildChartData(type, graphData, label = "Value") {
  const { labels, values, datasets } = graphData;
  const hasMultipleDatasets = datasets && Array.isArray(datasets);

  // Normalize labels for display (handle array of arrays for multiple x columns)
  const displayLabels = labels.map(l => 
    Array.isArray(l) ? l.join(' | ') : l
  );

  switch (type) {
    case "pie":
    case "doughnut": {
      // Pie/Doughnut only supports single dataset - use first if multiple
      const pieValues = hasMultipleDatasets ? datasets[0].values : values;
      return {
        labels: displayLabels,
        datasets: [{ 
          label: hasMultipleDatasets ? datasets[0].label : label, 
          data: pieValues,
          backgroundColor: CHART_COLORS,
          borderColor: CHART_BORDER_COLORS,
          borderWidth: 1
        }],
      };
    }

    case "scatter":
      if (hasMultipleDatasets) {
        return {
          datasets: datasets.map((ds, idx) => ({
            label: ds.label,
            data: ds.values.map((v, i) => ({
              x: Array.isArray(labels[i]) ? labels[i][0] : labels[i],
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
            data: values.map((v, i) => ({
              x: Array.isArray(labels[i]) ? labels[i][0] : labels[i],
              y: v,
            })),
            backgroundColor: CHART_COLORS[0],
            borderColor: CHART_BORDER_COLORS[0],
          },
        ],
      };

    case "line":
      if (hasMultipleDatasets) {
        return {
          labels: displayLabels,
          datasets: datasets.map((ds, idx) => ({
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
          data: values,
          borderColor: CHART_BORDER_COLORS[0],
          backgroundColor: CHART_COLORS[0],
          fill: false,
          tension: 0.1,
        }],
      };

    case "bar":
    default:
      if (hasMultipleDatasets) {
        return {
          labels: displayLabels,
          datasets: datasets.map((ds, idx) => ({
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
          data: values,
          backgroundColor: CHART_COLORS[0],
          borderColor: CHART_BORDER_COLORS[0],
          borderWidth: 1,
        }],
      };
  }
}

export default function DashboardChart({ graph }) {
  const type = graph.graphType || "bar";
  const graphData = extractGraphData(graph.attributes);

  if (type === "table") {
    return <TableChart data={graphData} />;
  }

  const data = buildChartData(type, graphData, graph.query);

  switch (type) {
    case "line":
      return <Line data={data} />;
    case "pie":
      return <Pie data={data} />;
    case "doughnut":
      return <Doughnut data={data} />;
    case "scatter":
      return <Scatter data={data} />;
    default:
      return <Bar data={data} />;
  }
}
