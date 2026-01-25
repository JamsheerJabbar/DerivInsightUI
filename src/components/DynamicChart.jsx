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

function buildChartJSData(type, data, label = "Value") {
  switch (type) {
    case "pie":
    case "doughnut":
      return {
        labels: data.labels,
        datasets: [{ label, data: data.values }],
      };

    case "scatter":
      return {
        datasets: [
          {
            label,
            data: data.values.map((v, i) => ({
              x: data.labels[i],
              y: v,
            })),
          },
        ],
      };

    default:
      return {
        labels: data.labels,
        datasets: [{ label, data: data.values }],
      };
  }
}

export default function DynamicChart({ type = "bar", data }) {
  if (type === "table") {
    return <TableChart labels={data.labels} values={data.values} />;
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
