import { useState } from 'react';
import { csvExportService, type ExportFilters } from '../services/csvExportService';
import { message } from 'antd';

export const useCSVExport = () => {
  const [isExporting, setIsExporting] = useState(false);

  const exportData = async (
    exportType: 'locations' | 'departments' | 'organizations' | 'roles' | 'groups' | 'users',
    filters: ExportFilters = {}
  ) => {
    setIsExporting(true);
    try {
      switch (exportType) {
        case 'locations':
          await csvExportService.exportLocations(filters);
          break;
        case 'departments':
          await csvExportService.exportDepartments(filters);
          break;
        case 'organizations':
          await csvExportService.exportOrganizations(filters);
          break;
        case 'roles':
          await csvExportService.exportRoles(filters);
          break;
        case 'groups':
          await csvExportService.exportGroups(filters);
          break;
        case 'users':
          await csvExportService.exportUsers(filters);
          break;
        default:
          throw new Error(`Unsupported export type: ${exportType}`);
      }
      message.success('CSV export downloaded successfully');
    } catch (error) {
      console.error('CSV export failed:', error);
      message.error('Failed to export CSV. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    isExporting,
    exportData,
  };
};