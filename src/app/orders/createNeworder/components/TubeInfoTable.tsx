// "use client";
// import React from "react";
// import { ChevronDown, X } from "lucide-react";

// const tubeData = [
//   {
//     tube_name: "SST",
//     status: "Collected",
//     tests: ["Basic Metabolic Panel", "CBC", "Thyroid Panel"],
//   },
//   {
//     tube_name: "LAVENDER TOP",
//     status: "Collected",
//     tests: ["HIV Screening"],
//   },
// ];

// const TubeInfoTable = () => {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-200 p-5 mt-4">
//       {/* Title */}
//       <h3 className="text-lg font-semibold text-[#344256] mb-4 flex items-center gap-2">
//         Test Tubes Information
//       </h3>

//       {/* Table */}
//       <div className="w-full overflow-hidden border border-gray-200 rounded-xl">
//         <table className="w-full text-sm text-[#344256]">
//           <thead className="bg-[#F8FAFC] border-b">
//             <tr>
//               <th className="text-left px-4 py-3 font-medium">Test Tube</th>
//               <th className="text-left px-4 py-3 font-medium">Status</th>
//               <th className="text-left px-4 py-3 font-medium">Test Information</th>
//             </tr>
//           </thead>

//           <tbody>
//             {tubeData.map((item, i) => (
//               <tr
//                 key={i}
//                 className="border-b last:border-none hover:bg-green-50 transition"
//               >
//                 {/* Tube Name */}
//                 <td className="px-4 py-4 font-medium">
//                   {item.tube_name}
//                 </td>

//                 {/* Status Dropdown */}
//                 <td className="px-4 py-4">
//                   <div className="relative w-40">
//                     <select
//                       className="w-full appearance-none rounded-xl border border-gray-300 px-3 py-2 text-sm bg-white focus:border-green-600 focus:ring-1 focus:ring-green-300"
//                       defaultValue={item.status}
//                     >
//                       <option>Collected</option>
//                       <option>Not Collected</option>
//                       <option>Rejected</option>
//                     </select>

//                     <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-500 pointer-events-none" />
//                   </div>
//                 </td>

//                 {/* Tests Section */}
//                 <td className="px-4 py-4">
//                   <div className="flex items-center gap-2 flex-wrap">
//                     {/* Display First Test */}
//                     <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs flex items-center gap-1 border border-green-200">
//                       {item.tests[0]}
//                       <X className="w-3 h-3 cursor-pointer hover:text-red-500" />
//                     </span>

//                     {/* Show Count if More */}
//                     {item.tests.length > 1 && (
//                       <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs border">
//                         + {item.tests.length - 1}
//                       </span>
//                     )}

//                     {/* Dropdown */}
//                     <div className="w-7 h-7 rounded-full border flex justify-center items-center cursor-pointer hover:bg-gray-100">
//                       <ChevronDown className="w-4 h-4 text-gray-600" />
//                     </div>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default TubeInfoTable;
