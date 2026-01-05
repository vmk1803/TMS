'use client'
import React from 'react'

const formatUTCDateOnly = (d: any) => {
  if (!d) return "--";
  const date = new Date(d);
  if (isNaN(date.getTime())) return "--";

  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  const yyyy = date.getUTCFullYear();

  return `${mm}-${dd}-${yyyy}`;
};

const to12HourFormat = (time) => {
  if (!time) return "--";        
  const [h, m] = time.split(":"); 

  let hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;      

  return `${String(hour).padStart(2, "0")}:${m} ${ampm}`;
};


const OrderSummary = ({ orderData }:{ orderData: any }) => {
  return (
    <>
    <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
        <h2 className='text-primaryText text-xl font-semibold mb-4'>Order Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <div>
          <h3 className="text-base font-normal text-primaryText">Order ID</h3>
          <p className="text-primary text-base font-semibold">{orderData?.phlebio_order_id || '--'}</p>
        </div>
        <div>
          <h3 className="text-base font-normal text-primaryText">Client</h3>
          <p className="text-primary text-base font-semibold">{orderData?.partner?.name || '--'}</p>
        </div>
        <div>
          <h3 className="text-base font-normal text-primaryText">Technician</h3>
          <p className="text-primary text-base font-semibold">{orderData?.technician?.first_name || '--'} {orderData?.technician?.last_name || '--'}</p>
        </div>
        <div>
          <h3 className="text-base font-normal text-primaryText">Date of Service</h3>
        <p className="text-primaryText text-sm font-semibold">{formatUTCDateOnly(orderData?.date_of_service)}</p>
        </div>
        <div>
          <h3 className="text-base font-normal text-primaryText">Appointment Time</h3>
          <p className="text-primary text-base font-semibold">{to12HourFormat(orderData?.appointment_time) || '--'}</p>
        </div>
        <div>
          <h3 className="text-base font-normal text-primaryText">Status</h3>
          <p className="px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full w-fit">{orderData?.status || '--'}</p>
        </div>
      </div>
    </div>
    </>
  )
}

export default OrderSummary
