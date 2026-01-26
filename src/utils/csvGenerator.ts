/**
 * CSV Generator Utility
 * A flexible utility for generating and downloading CSV files from JavaScript objects
 */

export interface CSVColumnConfig {
  /** The key from the source object */
  key: string
  /** The header name to display in CSV */
  header: string
  /** Optional transform function to modify the value */
  transform?: (value: any, record: any) => any
}

export interface CSVGeneratorOptions {
  /** Custom filename (without .csv extension) */
  filename?: string
  /** Column configuration. If not provided, will use all object keys */
  columns?: CSVColumnConfig[]
  /** Whether to auto-download the file */
  autoDownload?: boolean
  /** Custom delimiter (default: comma) */
  delimiter?: string
  /** Include BOM for better Excel compatibility */
  includeBOM?: boolean
}

/**
 * Escapes a CSV field value and wraps in quotes if necessary
 */
function escapeCsvValue(value: any, delimiter: string = ','): string {
  if (value === null || value === undefined) {
    return ''
  }

  const stringValue = String(value)
  
  // Wrap in quotes if contains delimiter, quote, or newline
  if (stringValue.includes(delimiter) || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

/**
 * Generates CSV content from an array of objects
 */
export function generateCSV(data: any[], options: CSVGeneratorOptions = {}): string {
  const {
    columns,
    delimiter = ',',
    includeBOM = true
  } = options

  if (!data || data.length === 0) {
    return ''
  }

  let csvConfig: CSVColumnConfig[]

  if (columns) {
    // Use provided column configuration
    csvConfig = columns
  } else {
    // Auto-generate from first object keys
    const firstItem = data[0]
    csvConfig = Object.keys(firstItem).map(key => ({
      key,
      header: key.charAt(0).toUpperCase() + key.slice(1) // Capitalize first letter
    }))
  }

  // Generate header row
  const headers = csvConfig.map(col => col.header)
  const headerRow = headers.map(header => escapeCsvValue(header, delimiter)).join(delimiter)

  // Generate data rows
  const dataRows = data.map(item => {
    return csvConfig.map(col => {
      let value = item[col.key]
      
      // Apply transform if provided
      if (col.transform) {
        value = col.transform(value, item)
      }
      
      return escapeCsvValue(value, delimiter)
    }).join(delimiter)
  })

  // Combine header and data
  const csvContent = [headerRow, ...dataRows].join('\n')
  
  // Add BOM for better Excel compatibility
  return includeBOM ? '\uFEFF' + csvContent : csvContent
}

/**
 * Downloads CSV content as a file
 */
export function downloadCSV(csvContent: string, filename: string = 'export'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  link.href = URL.createObjectURL(blob)
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`
  
  // Temporarily add to DOM and click
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  // Clean up object URL
  URL.revokeObjectURL(link.href)
}

/**
 * Main function to generate and optionally download CSV
 */
export function exportToCSV(data: any[], options: CSVGeneratorOptions = {}): string {
  const {
    filename = `export-${new Date().toISOString().split('T')[0]}`,
    autoDownload = true
  } = options

  const csvContent = generateCSV(data, options)
  
  if (autoDownload && csvContent) {
    downloadCSV(csvContent, filename)
  }
  
  return csvContent
}

// Predefined column configurations for common data types
export const commonColumnConfigs = {
  locations: [
    { key: 'city', header: 'City' },
    { key: 'streetAddress', header: 'Street Address' },
    { key: 'country', header: 'Country' },
    { key: 'state', header: 'State', transform: (value: any) => value || '' },
    { key: 'zip', header: 'ZIP Code', transform: (value: any) => value || '' },
    { key: 'timeZone', header: 'Time Zone' },
    { key: 'addressLine', header: 'Address Line', transform: (value: any) => value || '' },
    { key: 'organization', header: 'Organization', transform: (value: any) => value?.organizationName || 'N/A' },
    { key: 'userCount', header: 'No. of Users', transform: (value: any) => value || 0 }
  ],
  
  users: [
    { key: 'firstName', header: 'First Name' },
    { key: 'lastName', header: 'Last Name' },
    { key: 'email', header: 'Email' },
    { key: 'role', header: 'Role', transform: (value: any) => value?.name || value || 'N/A' },
    { key: 'department', header: 'Department', transform: (value: any) => value?.name || value || 'N/A' },
    { key: 'active', header: 'Status', transform: (value: boolean) => value ? 'Active' : 'Inactive' },
    { key: 'createdAt', header: 'Created Date', transform: (value: any) => value ? new Date(value).toLocaleDateString() : '' }
  ]
}

/**
 * Quick export functions for common data types
 */
export const quickExport = {
  locations: (data: any[], filename?: string) => exportToCSV(data, {
    filename: filename || `locations-${new Date().toISOString().split('T')[0]}`,
    columns: commonColumnConfigs.locations
  }),
  
  users: (data: any[], filename?: string) => exportToCSV(data, {
    filename: filename || `users-${new Date().toISOString().split('T')[0]}`,
    columns: commonColumnConfigs.users
  })
}