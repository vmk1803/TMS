/**
 * CSV Export Service
 * Handles CSV export requests for User Management sections
 */

import api from '../lib/api';

export interface ExportFilters {
    name?: string;
    status?: string;
    searchString?: string;
    organizationId?: string;
    departmentId?: string;
    locationId?: string;
    roleId?: string;
    isActive?: boolean;
    [key: string]: any;
}

class CSVExportService {
    /**
     * Downloads a CSV file from blob data
     */
    private downloadFile(blob: Blob, filename: string): void {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the URL object
        URL.revokeObjectURL(url);
    }

    /**
     * Makes API request for CSV export and handles file download
     */
    private async exportCSV(endpoint: string, filters: ExportFilters, filename: string): Promise<void> {
        try {
            const response = await api.post(endpoint, filters, {
                responseType: 'blob',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            // Axios automatically throws for non-2xx responses, so if we reach here, it's successful
            this.downloadFile(response.data, filename);
        } catch (error: any) {
            console.error(`CSV Export failed for ${endpoint}:`, error);

            // Provide user-friendly error message
            const errorMessage = error?.response?.data?.message ||
                error?.message ||
                'Failed to export CSV file. Please try again.';

            throw new Error(`Export failed: ${errorMessage}`);
        }
    }

    /**
     * Export locations as CSV
     */
    async exportLocations(filters: ExportFilters = {}): Promise<void> {
        await this.exportCSV('/user-management/locations/export-csv', filters, 'locations.csv');
    }

    /**
     * Export departments as CSV
     */
    async exportDepartments(filters: ExportFilters = {}): Promise<void> {
        await this.exportCSV('/user-management/departments/export-csv', filters, 'departments.csv');
    }

    /**
     * Export organizations as CSV
     */
    async exportOrganizations(filters: ExportFilters = {}): Promise<void> {
        await this.exportCSV('/user-management/organizations/export-csv', filters, 'organizations.csv');
    }

    /**
     * Export roles as CSV
     */
    async exportRoles(filters: ExportFilters = {}): Promise<void> {
        await this.exportCSV('/user-management/roles/export-csv', filters, 'roles.csv');
    }

    /**
     * Export groups as CSV
     */
    async exportGroups(filters: ExportFilters = {}): Promise<void> {
        await this.exportCSV('/user-management/groups/export-csv', filters, 'groups.csv');
    }

    /**
     * Export users as CSV
     */
    async exportUsers(filters: ExportFilters = {}): Promise<void> {
        await this.exportCSV('/user-management/users/export-csv', filters, 'users.csv');
    }
}

// Export singleton instance
export const csvExportService = new CSVExportService();
