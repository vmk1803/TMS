/**
 * CSV Generator Usage Examples
 * Demonstrates how to use the CSV utility for different data types and scenarios
 */

import { exportToCSV, generateCSV, downloadCSV, quickExport, CSVColumnConfig } from '@/utils/csvGenerator'

// Example data
const sampleLocations = [
  {
    id: '1',
    city: 'New York',
    streetAddress: '123 Main St',
    country: 'USA',
    state: 'NY',
    zip: '10001',
    timeZone: 'America/New_York',
    organization: { organizationName: 'Tech Corp' },
    userCount: 25
  },
  {
    id: '2', 
    city: 'San Francisco',
    streetAddress: '456 Oak Ave',
    country: 'USA',
    state: 'CA',
    zip: '94102',
    timeZone: 'America/Los_Angeles',
    organization: { organizationName: 'StartupCo' },
    userCount: 12
  }
]

const sampleUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe', 
    email: 'john@example.com',
    role: { name: 'Admin' },
    department: { name: 'IT' },
    active: true,
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com', 
    role: { name: 'User' },
    department: { name: 'Sales' },
    active: false,
    createdAt: '2024-02-01T14:30:00Z'
  }
]

// Example 1: Quick export using predefined configurations
export function exampleQuickExport() {
  // Export locations using predefined config
  quickExport.locations(sampleLocations)
  
  // Export users using predefined config
  quickExport.users(sampleUsers)
  
  // Export with custom filename
  quickExport.locations(sampleLocations, 'company-locations-2024')
}

// Example 2: Custom column configuration
export function exampleCustomColumns() {
  // Define custom columns for a custom data type
  const customColumns: CSVColumnConfig[] = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Full Name', transform: (_, record) => `${record.firstName} ${record.lastName}` },
    { key: 'email', header: 'Email Address' },
    { key: 'status', header: 'Account Status', transform: (_, record) => record.active ? 'Active' : 'Inactive' },
    { key: 'role', header: 'User Role', transform: (value) => value?.name || 'No Role' },
    { key: 'joinDate', header: 'Join Date', transform: (_, record) => new Date(record.createdAt).toLocaleDateString() }
  ]

  // Export with custom configuration
  exportToCSV(sampleUsers, {
    filename: 'user-report-2024',
    columns: customColumns,
    delimiter: ';' // Use semicolon delimiter
  })
}

// Example 3: Generate CSV without downloading
export function exampleGenerateOnly() {
  // Generate CSV content without auto-download
  const csvContent = exportToCSV(sampleLocations, {
    autoDownload: false,
    columns: [
      { key: 'city', header: 'City' },
      { key: 'country', header: 'Country' },
      { key: 'userCount', header: 'Users' }
    ]
  })
  
  console.log('Generated CSV:', csvContent)
  
  // You can then process the CSV content or send it to an API
  return csvContent
}

// Example 4: Custom data transformation
export function exampleComplexTransformations() {
  const complexData = [
    {
      id: 1,
      metrics: { revenue: 50000, customers: 120 },
      location: { lat: 40.7128, lng: -74.0060 },
      tags: ['enterprise', 'priority'],
      lastContact: '2024-01-15'
    }
  ]

  const columns: CSVColumnConfig[] = [
    { key: 'id', header: 'Account ID' },
    { 
      key: 'metrics', 
      header: 'Revenue (USD)', 
      transform: (value) => `$${value.revenue.toLocaleString()}` 
    },
    { 
      key: 'metrics', 
      header: 'Customer Count', 
      transform: (value) => value.customers 
    },
    { 
      key: 'location', 
      header: 'Coordinates', 
      transform: (value) => `${value.lat},${value.lng}` 
    },
    { 
      key: 'tags', 
      header: 'Tags', 
      transform: (value) => Array.isArray(value) ? value.join('; ') : '' 
    },
    { 
      key: 'lastContact', 
      header: 'Last Contact', 
      transform: (value) => new Date(value).toLocaleDateString() 
    }
  ]

  exportToCSV(complexData, {
    filename: 'complex-account-data',
    columns
  })
}

// Example 5: Handle large datasets with chunking (for performance)
export function exampleLargeDataset() {
  const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
    id: i + 1,
    name: `Item ${i + 1}`,
    value: Math.random() * 1000,
    category: ['A', 'B', 'C'][i % 3]
  }))

  // For large datasets, you might want to process in chunks
  const chunkSize = 1000
  for (let i = 0; i < largeDataset.length; i += chunkSize) {
    const chunk = largeDataset.slice(i, i + chunkSize)
    const csvContent = generateCSV(chunk, {
      columns: [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Name' },
        { key: 'value', header: 'Value', transform: (value) => Math.round(value * 100) / 100 },
        { key: 'category', header: 'Category' }
      ]
    })
    
    // Process each chunk as needed
    downloadCSV(csvContent, `large-dataset-chunk-${Math.floor(i / chunkSize) + 1}`)
  }
}

// Example 6: Integration with React component
export function useCSVExportHook(data: any[], dataType: 'locations' | 'users' | 'custom') {
  const handleExport = (selectedItems?: any[]) => {
    const exportData = selectedItems || data
    
    switch (dataType) {
      case 'locations':
        quickExport.locations(exportData)
        break
      case 'users':
        quickExport.users(exportData)
        break
      case 'custom':
        exportToCSV(exportData, {
          filename: `${dataType}-export-${new Date().toISOString().split('T')[0]}`,
          // Auto-generate columns from object keys
        })
        break
    }
  }

  const handleExportSelected = (selectedRecords: any[]) => {
    if (selectedRecords.length === 0) {
      console.warn('No records selected for export')
      return
    }
    
    handleExport(selectedRecords)
  }

  return {
    exportAll: () => handleExport(),
    exportSelected: handleExportSelected,
    exportCustom: (customData: any[], filename?: string) => 
      exportToCSV(customData, { filename })
  }
}