import "./TableChart.css";

export default function TableChart({ labels, values }) {
  return (
    <div className="table-chart-wrapper">
      <table className="table-chart">
        <thead>
          <tr>
            <th>X</th>
            <th>Y</th>
          </tr>
        </thead>
        <tbody>
          {labels.map((label, i) => (
            <tr key={i}>
              <td>{label}</td>
              <td>{values[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
