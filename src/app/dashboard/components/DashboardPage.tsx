"use client";
import React, { useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import LoadingSpinner from "../../../components/common/LoadingSpinner";

// Lazy load heavy chart components
const TotalOrdersChart = dynamic(() => import("./TotalOrdersChart"), {
  loading: () => <LoadingSpinner size="medium" message="Loading chart..." />,
  ssr: false,
});

const OrdersSummaryChart = dynamic(() => import("./OrdersSummaryChart"), {
  loading: () => <LoadingSpinner size="medium" message="Loading chart..." />,
  ssr: false,
});

const OrdersByFacility = dynamic(() => import("./OrdersByFacility"), {
  loading: () => <LoadingSpinner size="medium" message="Loading data..." />,
  ssr: false,
});

const OrdersByTechnician = dynamic(() => import("./OrdersByTechnician"), {
  loading: () => <LoadingSpinner size="medium" message="Loading data..." />,
  ssr: false,
});

const RecentOrdersSidebar = dynamic(() => import("./RecentOrdersSidebar"), {
  loading: () => <LoadingSpinner size="medium" message="Loading orders..." />,
  ssr: false,
});

const BottomCards = dynamic(() => import("./BottomCards"), {
  loading: () => <LoadingSpinner size="small" />,
  ssr: false,
});

const DashboardOrdersSummary = dynamic(() => import("./DashboardOrdersSummary"), {
  loading: () => <LoadingSpinner size="medium" message="Loading summary..." />,
  ssr: false,
});

const DashboardPage = () => {
  const [fullName, setFullName] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    let parsed: any = null;
    parsed = JSON.parse(raw);
    const candidate = parsed?.user || parsed?.data || parsed || {};
    const first = candidate.firstName || candidate.first_name || candidate.firstname || candidate.givenName;
    const last = candidate.lastName || candidate.last_name || candidate.lastname || candidate.surname;
    const nameField = candidate.name || candidate.fullName || candidate.full_name;
    let combined = '';
    if (first || last) combined = [first, last].filter(Boolean).join(' ');
    else if (nameField) combined = nameField;
    if (combined) {
      const titleCased = combined
        .split(/\s+/)
        .filter(Boolean)
        .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      setFullName(titleCased);
    }
  }, []);

  return (
    <div className="bg-[#F9FAFB]">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[#1E293B]">
          Dashboard Overview
        </h2>
        <p className="text-gray-500 text-sm">{fullName ? `Welcome back, ${fullName}` : 'Welcome back'}</p>
      </div>



      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-6">
        {/* Left + Middle Content */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Orders Performed */}
          <Suspense fallback={<LoadingSpinner size="medium" message="Loading summary..." />}>
            <DashboardOrdersSummary />
          </Suspense>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Suspense fallback={<LoadingSpinner size="medium" message="Loading chart..." />}>
              <TotalOrdersChart />
            </Suspense>
            <Suspense fallback={<LoadingSpinner size="medium" message="Loading chart..." />}>
              <OrdersSummaryChart />
            </Suspense>
            <Suspense fallback={<LoadingSpinner size="medium" message="Loading data..." />}>
              <OrdersByFacility />
            </Suspense>
            <Suspense fallback={<LoadingSpinner size="medium" message="Loading data..." />}>
              <OrdersByTechnician />
            </Suspense>
          </div>
        </div>

        {/* Sidebar */}
        <Suspense fallback={<LoadingSpinner size="medium" message="Loading orders..." />}>
          <RecentOrdersSidebar />
        </Suspense>
      </div>


      {/* Bottom Section */}
      <Suspense fallback={<LoadingSpinner size="small" />}>
        <BottomCards />
      </Suspense>
    </div>
  );
};

export default DashboardPage;
