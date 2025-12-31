/**
 * Utility functions for persisting table filters in URL query parameters
 */

/**
 * Converts a filter object to URL search parameters
 * @param filters - Object containing filter key-value pairs
 * @returns URLSearchParams object
 */
export function filtersToSearchParams(filters: Record<string, any>): URLSearchParams {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            params.set(key, String(value));
        }
    });

    return params;
}

/**
 * Extracts filter values from URL search parameters
 * @param searchParams - URLSearchParams or ReadonlyURLSearchParams object
 * @param filterKeys - Array of filter keys to extract
 * @returns Object containing filter key-value pairs
 */
export function searchParamsToFilters(
    searchParams: any,
    filterKeys: string[]
): Record<string, string> {
    const filters: Record<string, string> = {};

    filterKeys.forEach((key) => {
        const value = searchParams.get(key);
        if (value !== null) {
            filters[key] = value;
        }
    });

    return filters;
}

/**
 * Updates the URL with new filter parameters without triggering a full page reload
 * @param router - Next.js router instance
 * @param pathname - Current pathname
 * @param filters - Filter object to persist in URL
 * @param page - Current page number (optional)
 * @param pageSize - Current page size (optional)
 */
export function updateUrlWithFilters(
    router: any,
    pathname: string,
    filters: Record<string, any>,
    page?: number,
    pageSize?: number
): void {
    const params = filtersToSearchParams(filters);
    
    // Add pagination parameters if provided
    if (page !== undefined) {
        params.set('page', page.toString());
    }
    if (pageSize !== undefined) {
        params.set('pageSize', pageSize.toString());
    }
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Use shallow routing to update URL without triggering a full page reload
    router.push(newUrl, { scroll: false });
}

/**
 * Extracts pagination state from URL search parameters
 * @param searchParams - URLSearchParams or ReadonlyURLSearchParams object
 * @returns Object containing pagination state
 */
export function searchParamsToPagination(searchParams: any): {
    page: number;
    pageSize: number;
} {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    
    return {
        page: page > 0 ? page : 1,
        pageSize: pageSize > 0 ? pageSize : 10
    };
}

/**
 * Updates the URL with pagination state
 * @param router - Next.js router instance
 * @param pathname - Current pathname
 * @param page - Current page number
 * @param pageSize - Current page size
 */
export function updateUrlWithPagination(
    router: any,
    pathname: string,
    page: number,
    pageSize: number
): void {
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
    
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    // Use shallow routing to update URL without triggering a full page reload
    router.push(newUrl, { scroll: false });
}
