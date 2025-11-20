import { useAuth } from "@/contexts/auth-context";
import { apiRequest } from "@/lib/queryClient";
import { SubscriptionResponse } from "@/types/types";
import { useQuery } from "@tanstack/react-query";
import { Crown, Check } from "lucide-react";

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

  const creditData = activeplandata?.data?.slice(0, 1)[0];
  const hasActivePlan = activeplandata?.data && activeplandata.data.length > 0;

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
          <a
            href="#upgrade"
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Upgrade
          </a>
        )}
      </div>

      {/* Plan Name */}
      {hasActivePlan && creditData && (
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-900 mb-2">
            {creditData.subscription.planData.name || "Pro Plan"}
          </p>
        </div>
      )}

      {/* Permissions List with Check Icons */}
      <div className="space-y-2">
        {hasActivePlan && creditData ? (
          <>
            <div className="flex items-center gap-2">
              <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <span className="text-[11px] text-gray-700">
                <span className="font-semibold">
                  {creditData.subscription.planData.permissions.channel || 0}
                </span>{" "}
                <span className="text-gray-500">Channels</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
              <span className="text-[11px] text-gray-700">
                <span className="font-semibold">
                  {creditData.subscription.planData.permissions.contacts || 0}
                </span>{" "}
                <span className="text-gray-500">Contacts</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Check className="w-3 h-3 text-purple-600 flex-shrink-0" />
              <span className="text-[11px] text-gray-700">
                <span className="font-semibold">
                  {creditData.subscription.planData.permissions.automation || 0}
                </span>{" "}
                <span className="text-gray-500">Automation</span>
              </span>
            </div>
          </>
        ) : (
          <div className="text-xs text-gray-500 text-center py-3 bg-white rounded-lg">
            No active subscription
          </div>
        )}
      </div>
    </div>
  );
}
