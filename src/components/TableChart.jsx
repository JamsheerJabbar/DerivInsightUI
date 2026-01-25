import "./TableChart.css";

export default function TableChart({ data }) {
  const { labels, values, datasets, xKeys = ['X'], yKeys = ['Y'] } = data;

  // Determine if we have multiple x columns
  const hasMultipleXColumns = Array.isArray(labels[0]);
  
  // Determine if we have multiple y columns (datasets)
  const hasMultipleYColumns = datasets && Array.isArray(datasets);

  // Get x column headers
  const xHeaders = hasMultipleXColumns ? xKeys : xKeys;
  
  // Get y column headers
  const yHeaders = hasMultipleYColumns 
    ? datasets.map(ds => ds.label)
    : yKeys;

  return (
    <div className="table-chart-wrapper">
      <table className="table-chart">
        <thead>
          <tr>
            {/* X column headers */}
            {xHeaders.map((header, idx) => (
              <th key={`x-${idx}`}>{header}</th>
            ))}
            {/* Y column headers */}
            {yHeaders.map((header, idx) => (
              <th key={`y-${idx}`}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {labels.map((label, rowIdx) => (
            <tr key={rowIdx}>
              {/* X values */}
              {hasMultipleXColumns ? (
                label.map((xVal, colIdx) => (
                  <td key={`x-${colIdx}`}>{xVal}</td>
                ))
              ) : (
                <td>{label}</td>
              )}
              {/* Y values */}
              {hasMultipleYColumns ? (
                datasets.map((ds, colIdx) => (
                  <td key={`y-${colIdx}`}>{ds.values[rowIdx]}</td>
                ))
              ) : (
                <td>{values[rowIdx]}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
