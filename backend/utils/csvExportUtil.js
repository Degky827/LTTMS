/**
 * Utility to format arrays of objects into RFC 4180-compliant CSV string
 */
function convertToCSV(data, fields) {
  if (!Array.isArray(data) || data.length === 0) {
    return fields.map(f => `"${f.label.replace(/"/g, '""')}"`).join(',') + '\r\n';
  }

  // Header row
  const headerRow = fields.map(f => `"${f.label.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const rows = data.map(item => {
    return fields.map(f => {
      let val = typeof f.value === 'function' ? f.value(item) : item[f.value];
      if (val === null || val === undefined) {
        val = '';
      } else if (val instanceof Date) {
        val = val.toISOString();
      } else if (typeof val === 'object') {
        val = JSON.stringify(val);
      } else {
        val = String(val);
      }
      // CSV Formula Injection (DDE) Defense: Neutralize dangerous leading characters
      if (/^[=+\-@\t\r]/.test(val)) {
        val = `'${val}`;
      }
      return `"${val.replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headerRow, ...rows].join('\r\n');
}

/**
 * Send CSV file response with correct headers
 */
function sendCSVResponse(res, filename, csvString) {
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`);
  res.status(200).send(csvString);
}

module.exports = {
  convertToCSV,
  sendCSVResponse
};
