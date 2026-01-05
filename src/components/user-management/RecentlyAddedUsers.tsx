import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RecentlyAddedUsers() {
      const router = useRouter()
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm lg:col-span-1">
      <div className="flex justify-between mb-4">
        <h3 className="text-xl font-semibold">Recently Added Users</h3>
        <button className="text-sm text-primary">View All</button>
      </div>

<div className="rounded-2xl border border-tableBorder overflow-hidden">
  <table className="w-full text-sm">
    <thead className="bg-tableHeader text-secondary">
      <tr className="text-text70 border-b">
        <th className="p-2 text-left">Name</th>
        <th className="p-2 text-left">Role</th>
        <th className="p-2 text-left">Department</th>
        <th className="p-2 text-left">Added</th>
        <th className="p-2 text-left"></th>
      </tr>
    </thead>

    <tbody>
      {[
        ['Sarah Johnson', 'Admin', 'Operations', '2025-11-25'],
        ['Emily Davis', 'User', 'Marketing', '2026-01-05'],
        ['Michael Smith', 'Manager', 'Sales', '2025-10-12'],
        ['David Brown', 'Admin', 'Engineering', '2024-08-30'],
      ].map((row) => (
        <tr key={row[0]} className="border-b last:border-none">
          {row.map((cell) => (
            <td key={cell} className="p-2">
              {cell}
            </td>
          ))}
          <td className="p-2">
           <Eye size={16}   onClick={() => router.push(`/user-management/users/view`)}
                        className="cursor-pointer" />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>
  )
}
