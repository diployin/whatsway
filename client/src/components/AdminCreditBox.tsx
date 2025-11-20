import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { SubscriptionResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { Crown, Check } from "lucide-react";
import { Link } from "wouter";

export function AdminCreditBox() {
  const { user } = useAuth();

  const { data: activeplandata, isLoading } = useQuery<SubscriptionResponse>({
    queryKey: [`api/subscriptions/user/${user?.id}`],
    queryFn: () =>
      apiRequest("GET", `api/subscriptions/user/${user?.id}`).then((res) =>
        res.json()
      ),
    enabled: !!user?.id,
  });

  // -----------------------------
  // ⭐ FILTER ACTIVE PLANS ⭐
  // -----------------------------
  const activePlans =
    activeplandata?.data?.filter(
      (p) => p.subscription.status === "active"
    ) || [];

  const hasActivePlan = activePlans.length > 0;

  // -----------------------------
  // ⭐ DYNAMIC PERMISSION SUMMER ⭐
  // -----------------------------
  const totalPermissions: Record<string, number> = {};

  activePlans.forEach((plan) => {
    const permissions = plan.subscription.planData.permissions || {};

    Object.keys(permissions).forEach((key) => {
      const val = Number(permissions[key] || 0);

      if (!totalPermissions[key]) {
        totalPermissions[key] = val;
      } else {
        totalPermissions[key] += val;
      }
    });
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 w-[200px] h-[140px] animate-pulse" />
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50/50 to-purple-50/50 px-5 py-4 shadow-sm hover:shadow-md transition-all duration-200 w-[200px]">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-yellow-100 rounded-lg">
            <Crown className="h-3.5 w-3.5 text-yellow-600" />
          </div>
          <span className="text-sm font-semibold text-gray-800">
            Subscription
          </span>
        </div>

        {hasActivePlan ? (
          <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded-full">
            PRO
          </span>
        ) : (
          <Link
            to="/plan-upgrade"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Upgrade
          </Link>
        )}
      </div>

      {/* Plan Summary */}
      {hasActivePlan && (
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-900 mb-2">
            Active Plans ({activePlans.length})
          </p>
        </div>
      )}

      {/* Dynamic Permissions List */}
      <div className="space-y-2">
        {hasActivePlan ? (
          Object.entries(totalPermissions).map(([key, value], idx) => (
            <div key={key} className="flex items-center gap-2">
              <Check
                className={`w-3 h-3 flex-shrink-0 ${
                  idx % 2 === 0 ? "text-blue-600" : "text-purple-600"
                }`}
              />
              <span className="text-[11px] text-gray-700 capitalize">
                <span className="font-semibold">{value}</span>{" "}
                <span className="text-gray-500">{key}</span>
              </span>
            </div>
          ))
        ) : (
          <div className="text-xs text-gray-500 text-center py-3 bg-white rounded-lg">
            No active subscription
          </div>
        )}
      </div>
    </div>
  );
}
