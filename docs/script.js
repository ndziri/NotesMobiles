// Configuration
const SPREADSHEET_ID = '1OCgwe3NmxDGOGNjwBCi1-7bHPIn_cG9IA-4m3CiZXY0';
const GID = '0';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv&gid=${GID}`;

document.addEventListener('DOMContentLoaded', init);

async function init() {
    const container = document.getElementById('data-grid');
    container.innerHTML = '<div class="loading">Loading data...</div>';

    const data = await fetchSheetData();
    renderData(data);
}

async function fetchSheetData() {
    try {
        const response = await fetch(SHEET_URL);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const csvText = await response.text();
        return parseCSV(csvText);

    } catch (error) {
        console.error('Error loading data:', error);
        return { error: true, message: error.message };
    }
}

function parseCSV(csvText) {
    // A robust CSV parser that handles quoted values containing commas
    const lines = [];
    const rows = csvText.split('\n');

    // Parse headers from the first row
    if (rows.length === 0) return [];
    const headers = parseLine(rows[0]);

    // Parse the rest
    for (let i = 1; i < rows.length; i++) {
        if (!rows[i].trim()) continue;

        const values = parseLine(rows[i]);
        const entry = {};

        headers.forEach((header, index) => {
            const cleanHeader = header.trim();
            if (cleanHeader) {
                entry[cleanHeader] = values[index] || '';
            }
        });
        lines.push(entry);
    }
    return lines;
}

// Helper to handle commas inside quotes
function parseLine(text) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
        const char = text[i];

        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result.map(val => val.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

function renderData(data) {
    const container = document.getElementById('data-grid');
    container.innerHTML = '';

    if (data.error) {
        container.innerHTML = `
            <div class="error">
                <h3>Connection Error</h3>
                <p>Browsers block external data connections from local files (CORS).</p>
                <div style="margin-top:1.5rem; text-align: left; background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px;">
                    <strong>Solution:</strong><br>
                    You must run a local server instead of opening the file directly.<br><br>
                    1. Open your terminal in the <code>docs</code> folder.<br>
                    2. Run: <code>./start_server.sh</code><br>
                    3. Or use "Live Server" extension in VS Code.
                </div>
            </div>`;
        return;
    }

    if (data.length === 0) {
        container.innerHTML = '<p class="error">No data found in the spreadsheet.</p>';
        return;
    }

    data.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.animationDelay = `${index * 100}ms`;

        // Smart field detection for better display
        const keys = Object.keys(item);

        // We take the first column as the "Title" and second as "Subtitle/Status"
        const title = item[keys[0]] || 'Untitled';
        const subtitle = item[keys[1]] || '';

        // All other columns go into details
        let detailsHtml = '';
        if (keys.length > 2) {
            detailsHtml = keys.slice(2).map(k =>
                `<div class="detail-row"><span>${k}:</span> <span>${item[k]}</span></div>`
            ).join('');
        }

        card.innerHTML = `
            <h3>${title}</h3>
            <p>${subtitle}</p>
            <div class="card-details">
                ${detailsHtml}
            </div>
        `;

        container.appendChild(card);
    });
}
