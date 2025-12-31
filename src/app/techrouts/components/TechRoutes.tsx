"use client";
import React, { useCallback, useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import RouteFilters from "./RouteFilters";
import StatsCards from "./StatsCards";
import OrdersTable from "./OrdersTable";
import Title from "../../../components/common/Title";
import ReAssignTechnicianModal from "../../../components/common/ReAssignTechnicianModal";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { getTechRoutes, type StatusCount, type TechRoutesFilters } from "../services/techRoutesService";
import { canAssign } from "../../../utils/rbac";

// Lazy load the heavy map component (leaflet library)
const TechMap = dynamic(() => import("./TechMap"), {
  loading: () => (
    <LoadingSpinner size="medium" message="Loading map..." />
  ),
  ssr: false,
});

const TechRoutes = () => {
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [filters, setFilters] = useState<TechRoutesFilters>({});

  const [orders, setOrders] = useState<any[]>([]);
  const [statusCount, setStatusCount] = useState<StatusCount | undefined>();
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

  // Fetch data whenever filters change - only if both technician and date are selected
  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await getTechRoutes(page, pageSize, filters);
        if (!active) return;

        setOrders(Array.isArray(res?.data) ? res.data : []);
        setStatusCount(res?.status_count);
        setTotal(Number(res?.total_count || 0));
        setLimit(Number(res?.limit || pageSize));
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to fetch tech routes");
        setOrders([]);
        setTotal(0);
        setStatusCount(undefined);
      } finally {
        if (active) setLoading(false);
      }
    };

    // Only call API if both technician and date are selected
    if (filters.technician_guid && filters.date_of_service) {
      load();
    } else {
      // Clear data when filters are incomplete
      setOrders([]);
      setTotal(0);
      setStatusCount(undefined);
      setError(null);
      setLoading(false);
    }

    return () => {
      active = false;
    };
  }, [page, pageSize, filters, refreshTrigger]);

  // Handle successful re-assignment
  const handleReassignSuccess = () => {
    setSelectedOrders([]);
    setShowAssignModal(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <>
      <div className="bg-gray-50">
        <div className="w-full mx-auto">

          {/* Header */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-2">
            <Title
              heading="Tech Routes"
              subheading="Manage and optimize technician routes and workflows across locations."
            />

            <div className="flex items-center gap-3">
              {canAssign() && (
                <button
                  className="flex px-5 bg-secondary rounded-full text-base h-10 text-white font-medium items-center gap-2 hover:bg-secondary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowAssignModal(true)}
                  disabled={selectedOrders.length === 0}
                >
                  Re-Assign
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 scrollbar-custom">
            <div className="col-span-12 lg:col-span-7">
              <div className="bg-white rounded-2xl p-5 shadow-sm space-y-5">

                {/* Route Filters */}
                <RouteFilters
                  onFiltersChange={useCallback((f) => {
                    setPage(1);
                    setFilters((prev) => {
                      const prevStr = JSON.stringify(prev || {});
                      const nextStr = JSON.stringify(f || {});
                      return prevStr === nextStr ? prev : f;
                    });
                  }, [])}
                />

                <StatsCards statusCount={statusCount} />

                <OrdersTable
                  data={orders}
                  page={page}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  limit={limit}
                  total={total}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  selectedOrders={selectedOrders}
                  onSelectionChange={setSelectedOrders}
                />
              </div>
            </div>

            {/* Map */}
            <div className="col-span-12 lg:col-span-5">
              <div className="bg-white rounded-2xl p-4 shadow-sm h-full">
                <Suspense fallback={<LoadingSpinner size="medium" message="Loading map..." />}>
                  <TechMap orders={orders} loading={loading} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reassign Modal */}
      <ReAssignTechnicianModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        selectedOrderGuids={selectedOrders}
        onSuccess={handleReassignSuccess}
      />
    </>
  );
};

export default TechRoutes;
