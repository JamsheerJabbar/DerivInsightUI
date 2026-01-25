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

function buildChartData(type, labels, values, label = "Value") {
  switch (type) {
    case "pie":
    case "doughnut":
      return {
        labels,
        datasets: [{ label, data: values }],
      };

    case "scatter":
      return {
        datasets: [
          {
            label,
            data: values.map((v, i) => ({
              x: labels[i],
              y: v,
            })),
          },
        ],
      };

    default: // bar, line
      return {
        labels,
        datasets: [{ label, data: values }],
      };
  }
}

export default function DashboardChart({ graph }) {
  const type = graph.graphType || "bar";

  const labels = graph.attributes.xaxis.values;
  const values = graph.attributes.yaxis.values;
  if (type === "table") {
    return <TableChart labels={labels} values={values} />;
  }

  const data = buildChartData(type, labels, values, graph.query);

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
