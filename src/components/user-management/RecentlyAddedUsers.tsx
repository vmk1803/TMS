import { Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { RecentUser } from "@/types/user";
import LoadingSpinner from "../common/LoadingSpinner";

interface RecentlyAddedUsersProps {
  recentUsers?: RecentUser[];
  loading?: boolean;
}

export default function RecentlyAddedUsers({ recentUsers = [], loading = false }: RecentlyAddedUsersProps) {
  const router = useRouter()

  const handleViewAll = () => {
    router.push('/user-management/users');
  }

  const handleViewUser = (userId: string) => {
    router.push(`/user-management/users/${userId}`);
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm lg:col-span-1 h-96 flex flex-col">
      <div className="flex justify-between mb-4 flex-shrink-0">
        <h3 className="text-xl font-semibold">Recently Added Users</h3>
        <button
          className="text-sm text-primary hover:text-primary-dark transition-colors"
          onClick={handleViewAll}
        >
          View All
        </button>
      </div>

      <div className="rounded-2xl border border-tableBorder overflow-hidden flex-1 flex flex-col">
        <div className="bg-tableHeader text-secondary flex-shrink-0">
          <div className="flex text-text70 border-b">
            <div className="p-2 text-left flex-1 font-medium">Name</div>
            <div className="p-2 text-left flex-1 font-medium">Role</div>
            <div className="p-2 text-left flex-1 font-medium">Department</div>
            <div className="p-2 text-left w-20 font-medium">Added</div>
            <div className="p-2 text-left w-20 font-medium">Actions</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="text-sm">
            {loading ? (
              <div className="p-8 text-center">
                <LoadingSpinner size="small" />
              </div>
            ) : recentUsers.length > 0 ? (
              recentUsers.map((user) => {
                const firstName = user.firstName || '';
                const lastName = user.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim();
                const displayName = fullName || user.email?.split('@')[0] || 'Unknown User';

                let addedDate = 'N/A';
                try {
                  if (user.createdAt) {
                    addedDate = new Date(user.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    });
                  }
                } catch (error) {
                  console.warn('Error formatting date:', error);
                }

                return (
                  <div key={user.id} className="flex border-b last:border-none hover:bg-gray-50 transition-colors">
                    <div className="p-2 font-medium flex-1 truncate">{displayName}</div>
                    <div className="p-2 flex-1 truncate">{user.roleName || 'N/A'}</div>
                    <div className="p-2 flex-1 truncate">{user.departmentName || 'N/A'}</div>
                    <div className="p-2 w-24 truncate">{addedDate}</div>
                    <div className="p-2 w-16">
                      <button
                        onClick={() => handleViewUser(user.id)}
                        className="cursor-pointer hover:text-primary transition-colors"
                        title="View user details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center text-gray-500">
                No recent users found
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
