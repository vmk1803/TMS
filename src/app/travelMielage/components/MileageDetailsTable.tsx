// "use client";
// import React, { useState } from "react";
// import { Pencil, Trash2 } from "lucide-react";
// import MileageEditView from "../components/MileageEditView"; // edit screen component

// const MileageDetailsTable = ({ setIsDetailView }) => {
//   const [searchTerm, setSearchTerm] = useState("");
//   const [technician, setTechnician] = useState("");
//   const [date, setDate] = useState("");
//   const [page, setPage] = useState(1);
//   const [selectedRow, setSelectedRow] = useState(null);

//   const ITEMS_PER_PAGE = 10;
//   const totalItems = 1000;
//   const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

//   const data = [
//     {
//       order: "ORD-20154",
//       technician: "John Smith",
//       arrived: "0",
//       performed: "0",
//       delivered: "0",
//       totalMiles: "0",
//       date: "01/12/2025",
//       updatedAt: "01/12/2025 05:00",
//       updatedBy: "Lorem",
//     },
//     {
//       order: "ORD-20155",
//       technician: "Jane Doe",
//       arrived: "10",
//       performed: "8",
//       delivered: "7",
//       totalMiles: "25",
//       date: "01/12/2025",
//       updatedAt: "01/12/2025 05:10",
//       updatedBy: "Ipsum",
//     },
//   ];

//   // ✅ Back to table view
//   const handleBack = () => {
//     setSelectedRow(null);
//     setIsDetailView(false);
//   };

//   // ✅ When edit clicked → show separate edit screen
//   if (selectedRow) {
//     return <MileageEditView data={selectedRow} onBack={handleBack} />;
//   }

//   return (
//     <div className="w-full bg-white border border-[#BDD8C5] rounded-2xl shadow-sm overflow-hidden">
//       {/* 🔍 Search and Filters */}
//       <div className="flex flex-wrap justify-between items-center gap-4 p-4 bg-white border-b border-gray-100">
//         {/* Search */}
//         <div className="flex items-center w-full md:w-1/3 relative">
//           <input
//             type="text"
//             placeholder="Search"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full rounded-full bg-[#F8FAFC] border border-[#DDE2E5] px-4 py-2 pl-9 text-sm text-gray-600 focus:outline-none"
//           />
//           <svg
//             xmlns="http://www.w3.org/2000/svg"
//             className="w-4 h-4 text-gray-400 absolute left-3 top-3"
//             fill="none"
//             viewBox="0 0 24 24"
//             stroke="currentColor"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               strokeWidth={2}
//               d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
//             />
//           </svg>
//         </div>

//         {/* Technician + Date Filters */}
//         <div className="flex items-center gap-3 w-full md:w-auto">
//           <select
//             value={technician}
//             onChange={(e) => setTechnician(e.target.value)}
//             className="bg-[#F8FAFC] border border-[#DDE2E5] rounded-full px-4 py-2 text-sm text-gray-600 focus:outline-none"
//           >
//             <option value="">Select Technician</option>
//             <option value="John Smith">John Smith</option>
//             <option value="Jane Doe">Jane Doe</option>
//           </select>

//           <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#DDE2E5] rounded-full px-4 py-2">
//             <input
//               type="date"
//               value={date}
//               onChange={(e) => setDate(e.target.value)}
//               className="text-sm text-gray-600 focus:outline-none bg-transparent"
//             />
//           </div>
//         </div>
//       </div>

//       {/* 📋 Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-max w-full text-sm text-gray-700">
//           <thead className="bg-[#F1F6F1] text-[#344256] font-semibold uppercase text-sm border-b">
//             <tr>
//               <th className="p-3 text-left">
//                 <input type="checkbox" />
//               </th>
//               <th className="p-3 text-left">Order#</th>
//               <th className="p-3 text-left">Technician</th>
//               <th className="p-3 text-left">Arrived Miles</th>
//               <th className="p-3 text-left">Performed Miles</th>
//               <th className="p-3 text-left">Delivered Miles</th>
//               <th className="p-3 text-left">Total Miles</th>
//               <th className="p-3 text-left">Date</th>
//               <th className="p-3 text-left">Updated Date & Time</th>
//               <th className="p-3 text-left">Updated By</th>
//               <th className="p-3 text-left">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {data.map((row, i) => (
//               <tr key={i} className="border-b hover:bg-gray-50 text-[#344256] font-normal transition-colors">
//                 <td className="p-3">
//                   <input type="checkbox" />
//                 </td>
//                 <td className="p-3">{row.order}</td>
//                 <td className="p-3">{row.technician}</td>
//                 <td className="p-3">{row.arrived}</td>
//                 <td className="p-3">{row.performed}</td>
//                 <td className="p-3">{row.delivered}</td>
//                 <td className="p-3">{row.totalMiles}</td>
//                 <td className="p-3">{row.date}</td>
//                 <td className="p-3">{row.updatedAt}</td>
//                 <td className="p-3">{row.updatedBy}</td>
//                 <td className="p-3 text-green-600 flex gap-3 items-center">
//                   <Pencil
//                     className="w-4 h-4 cursor-pointer hover:scale-110 transition"
//                     onClick={() => {
//                       setSelectedRow(row);
//                       setIsDetailView(true); // ✅ hide header & tabs
//                     }}
//                   />
//                   <Trash2 className="w-4 h-4 text-red-500 cursor-pointer hover:scale-110 transition" />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* 📄 Pagination */}
//       <div className="flex flex-wrap justify-between items-center px-4 py-3 border-t border-gray-200 bg-white">
//         <div className="flex items-center gap-2 text-sm text-gray-500">
//           <span>Items per page:</span>
//           <select className="border rounded-lg px-2 py-1 text-sm text-gray-700 focus:outline-none">
//             <option>10</option>
//             <option>20</option>
//             <option>50</option>
//           </select>
//           <span>
//             {ITEMS_PER_PAGE * (page - 1) + 1}–{ITEMS_PER_PAGE * page} of{" "}
//             {totalItems}
//           </span>
//         </div>

//         <div className="flex items-center gap-1 text-sm">
//           <button
//             disabled={page === 1}
//             onClick={() => setPage(1)}
//             className="px-2 py-1 border rounded disabled:opacity-40"
//           >
//             « First
//           </button>
//           <button
//             disabled={page === 1}
//             onClick={() => setPage(page - 1)}
//             className="px-2 py-1 border rounded disabled:opacity-40"
//           >
//             ‹ Back
//           </button>
//           <button className="px-3 py-1 border rounded bg-green-600 text-white">
//             {page}
//           </button>
//           <button
//             disabled={page === totalPages}
//             onClick={() => setPage(page + 1)}
//             className="px-2 py-1 border rounded disabled:opacity-40"
//           >
//             Next ›
//           </button>
//           <button
//             disabled={page === totalPages}
//             onClick={() => setPage(totalPages)}
//             className="px-2 py-1 border rounded disabled:opacity-40"
//           >
//             Last »
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MileageDetailsTable;
