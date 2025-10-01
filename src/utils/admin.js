export async function handleAdmin() {
  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Admin - Activity Waivers</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .container {
      max-width: 1400px;
      margin: 0 auto;
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h1 {
      margin-top: 0;
      color: #333;
    }
    .search-form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 30px;
      padding: 20px;
      background: #f9f9f9;
      border-radius: 8px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
    }
    label {
      font-weight: 600;
      margin-bottom: 5px;
      color: #555;
      font-size: 14px;
    }
    input {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    input:focus {
      outline: none;
      border-color: #0070f3;
    }
    .button-group {
      grid-column: 1 / -1;
      display: flex;
      gap: 10px;
    }
    button {
      padding: 12px 24px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-search {
      background: #0070f3;
      color: white;
    }
    .btn-search:hover {
      background: #0051cc;
    }
    .btn-clear {
      background: #eee;
      color: #333;
    }
    .btn-clear:hover {
      background: #ddd;
    }
    .results {
      margin-top: 20px;
    }
    .result-count {
      margin-bottom: 15px;
      color: #666;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }
    thead {
      background: #f9f9f9;
    }
    th {
      text-align: left;
      padding: 12px;
      border-bottom: 2px solid #ddd;
      font-weight: 600;
      color: #555;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #eee;
    }
    tr:hover {
      background: #f9f9f9;
    }
    .activity-badge {
      display: inline-block;
      padding: 4px 8px;
      margin: 2px;
      background: #e3f2fd;
      color: #1976d2;
      border-radius: 4px;
      font-size: 12px;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .error {
      padding: 15px;
      background: #fee;
      color: #c33;
      border-radius: 4px;
      margin: 20px 0;
    }
    .empty {
      text-align: center;
      padding: 40px;
      color: #999;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Activity Waivers Admin</h1>

    <form class="search-form" id="searchForm">
      <div class="form-group">
        <label for="name">Guest Name</label>
        <input type="text" id="name" name="name" placeholder="John Doe">
      </div>

      <div class="form-group">
        <label for="email">Email</label>
        <input type="email" id="email" name="email" placeholder="guest@example.com">
      </div>

      <div class="form-group">
        <label for="prop">Property ID</label>
        <input type="text" id="prop" name="prop" placeholder="cabin-12">
      </div>

      <div class="form-group">
        <label for="date">Check-in Date</label>
        <input type="date" id="date" name="date">
      </div>

      <div class="form-group">
        <label for="activity">Activity</label>
        <input type="text" id="activity" name="activity" placeholder="archery">
      </div>

      <div class="button-group">
        <button type="submit" class="btn-search">Search</button>
        <button type="button" class="btn-clear" onclick="clearForm()">Clear</button>
      </div>
    </form>

    <div class="results" id="results"></div>
  </div>

  <script>
    const form = document.getElementById('searchForm');
    const resultsDiv = document.getElementById('results');

    // Load all results on page load
    window.addEventListener('load', () => search());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      search();
    });

    async function search() {
      resultsDiv.innerHTML = '<div class="loading">Loading...</div>';

      const formData = new FormData(form);
      const params = new URLSearchParams();

      for (const [key, value] of formData) {
        if (value.trim()) {
          params.append(key, value.trim());
        }
      }

      try {
        const response = await fetch('/admin/search?' + params.toString());
        const data = await response.json();

        if (!data.rows.success) {
          throw new Error('Search failed');
        }

        displayResults(data.rows.results);
      } catch (error) {
        resultsDiv.innerHTML = '<div class="error">Error loading results: ' + error.message + '</div>';
      }
    }

    function displayResults(results) {
      if (results.length === 0) {
        resultsDiv.innerHTML = '<div class="empty">No results found</div>';
        return;
      }

      const countHtml = '<div class="result-count">Found ' + results.length + ' submission' + (results.length !== 1 ? 's' : '') + '</div>';

      const tableHtml = \`
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Guest Name</th>
              <th>Email</th>
              <th>Property</th>
              <th>Check-in</th>
              <th>Activities</th>
            </tr>
          </thead>
          <tbody>
            \${results.map(row => {
              const createdDate = new Date(row.created_at).toLocaleString();
              const activities = JSON.parse(row.activities);

              return \`
                <tr>
                  <td>\${createdDate}</td>
                  <td>\${escapeHtml(row.guest_name)}</td>
                  <td>\${escapeHtml(row.guest_email)}</td>
                  <td>\${escapeHtml(row.property_id)}</td>
                  <td>\${row.checkin_date}</td>
                  <td>
                    \${activities.map(a => '<span class="activity-badge">' + escapeHtml(a) + '</span>').join('')}
                  </td>
                </tr>
              \`;
            }).join('')}
          </tbody>
        </table>
      \`;

      resultsDiv.innerHTML = countHtml + tableHtml;
    }

    function clearForm() {
      form.reset();
      search();
    }

    function escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    }
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}
