/**
 * Global utility function to export data to CSV format
 * Handles nested objects and triggers browser download
 */

/**
 * Escapes special characters in CSV fields
 */
function escapeCSVField(field: any): string {
    if (field === null || field === undefined) return '';

    const str = String(field);

    // If field contains comma, newline, or double quote, wrap in quotes and escape quotes
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
}

/**
 * Formats date to readable format
 */
function formatDate(dateString?: string): string {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US').replace(/\//g, '-');
    } catch {
        return dateString;
    }
}

/**
 * Flattens nested objects into a single-level object
 */
function flattenObject(obj: any, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};

    for (const key in obj) {
        if (!obj.hasOwnProperty(key)) continue;

        const value = obj[key];
        const newKey = prefix ? `${prefix}_${key}` : key;

        if (value === null || value === undefined) {
            flattened[newKey] = '';
        } else if (Array.isArray(value)) {
            // Handle arrays by joining values
            if (value.length > 0 && typeof value[0] === 'object') {
                // Array of objects - extract specific fields
                const arrayValues = value.map(item => {
                    if (typeof item === 'object') {
                        return Object.values(item).filter(v => v !== null && v !== undefined).join(' ');
                    }
                    return String(item);
                }).filter(Boolean).join('; ');
                flattened[newKey] = arrayValues;
            } else {
                // Array of primitives
                flattened[newKey] = value.filter(v => v !== null && v !== undefined).join('; ');
            }
        } else if (typeof value === 'object') {
            // Recursively flatten nested objects
            const nested = flattenObject(value, newKey);
            Object.assign(flattened, nested);
        } else if (typeof value === 'boolean') {
            flattened[newKey] = value ? 'Yes' : 'No';
        } else if (key.toLowerCase().includes('date') || key.toLowerCase().includes('_at')) {
            // Format date fields
            flattened[newKey] = formatDate(String(value));
        } else {
            flattened[newKey] = value;
        }
    }

    return flattened;
}

/**
 * Converts field names to human-readable headers
 */
function formatHeader(key: string): string {
    return key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Converts array of data to CSV format and triggers download
 * @param data - Array of objects to export
 * @param filename - Optional custom filename (without extension)
 */
export function exportToCSV(data: any[], filename?: string): void {
    if (!data || data.length === 0) {
        return;
    }

    // Flatten all data items
    const flattenedData = data.map(item => flattenObject(item));

    // Get all unique headers from all flattened items
    const headersSet = new Set<string>();
    flattenedData.forEach(item => {
        Object.keys(item).forEach(key => headersSet.add(key));
    });
    const headers = Array.from(headersSet);

    // Create CSV header row with formatted names
    const csvHeaders = headers.map(h => escapeCSVField(formatHeader(h))).join(',');

    // Create CSV data rows
    const csvRows = flattenedData.map(item =>
        headers.map(header => escapeCSVField(item[header] || '')).join(',')
    );

    // Combine headers and rows
    const csvContent = [csvHeaders, ...csvRows].join('\n');

    // Create blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const finalFilename = filename || `export_${timestamp}`;

    link.href = URL.createObjectURL(blob);
    link.download = `${finalFilename}.csv`;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up the URL object
    URL.revokeObjectURL(link.href);
}
