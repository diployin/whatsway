import { Crown, Calendar } from "lucide-react";
import Header from "./layout/header";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import type { SubscriptionResponse } from "@/types/types";
import { useLocation } from "wouter";

export default function BillingSubscriptionPage() {
  const { user, currency, currencySymbol } = useAuth();
  const [, setLocation] = useLocation();

  const {
    data: activeplandata,
    isLoading,
    isError,
  } = useQuery<SubscriptionResponse>({
    queryKey: [`api/subscriptions/user/${user?.id}`],
    queryFn: () =>
      apiRequest("GET", `api/subscriptions/user/${user?.id}`).then((res) =>
        res.json()
      ),
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center p-4 bg-white text-gray-700">
        <p>Loading subscriptions...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 text-gray-900 ">
      <Header
        title={"Billing & Subscription"}
        subtitle={"Manage your subscription, credits, and billing"}
      />

      <main className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6 space-y-6">
        {isError ||
        !activeplandata?.success ||
        activeplandata.data.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="p-4 bg-gray-100 rounded-full">
              <svg
                className="w-10 h-10 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 13h6m-3-3v6m9 1V7a2 2 0 00-2-2h-3.5L14 3H10L8.5 5H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2z"
                />
              </svg>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-gray-800">
              No Active Subscription
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              You currently don't have any subscription activated.
            </p>

            <button
              className="mt-6 px-5 py-2.5 text-sm font-medium bg-green-700 text-white rounded-xl hover:bg-green-800"
              onClick={() => setLocation("/plan-upgrade")}
            >
              Upgrade Plan
            </button>
          </div>
        ) : (
          activeplandata.data.map((item) => {
            const subscription = item.subscription;
            const planData = subscription.planData;
            const renewsDate = subscription.endDate
              ? new Date(subscription.endDate).toLocaleDateString()
              : "-";
            const startDate = subscription.startDate
              ? new Date(subscription.startDate).toLocaleDateString()
              : "-";

            return (
              <div
                key={subscription.id}
                className="bg-white rounded-lg shadow-md border p-4 max-w-sm mx-auto"
              >
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-lg font-semibold truncate">
                    {planData.name}
                  </h2>
                  <span className="bg-green-400 text-green-900 text-xs font-semibold rounded-full px-2 py-0.5 capitalize">
                    {subscription.status}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-3 truncate">
                  {planData.description}
                </p>

                <div className="flex flex-wrap justify-between text-gray-700 mb-3 text-xs gap-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Billing:&nbsp;
                      <b className="capitalize">{subscription.billingCycle}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Starts:&nbsp;<b>{startDate}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Renews:&nbsp;<b>{renewsDate}</b>
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <h3 className="text-sm font-medium mb-1">Pricing</h3>
                  <div className="flex gap-4">
                    <div className="bg-yellow-100 text-yellow-800 rounded-md px-3 py-1 text-sm font-semibold min-w-[90px] text-center">
                      Monthly: {currencySymbol} {planData.monthlyPrice}
                    </div>
                    <div className="bg-yellow-100 text-yellow-800 rounded-md px-3 py-1 text-sm font-semibold min-w-[90px] text-center">
                      Annual: {currencySymbol} {planData.annualPrice}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-1">Details</h3>
                  {planData.permissions && (
                    <div className="mt-2 space-y-1">
                      {Object.entries(planData.permissions).map(([key, value]) => (
                        <div
                          key={key}
                          className="text-xs text-gray-600 capitalize"
                        >
                          ✓ {value} {key}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Features</h3>
                  <ul className="list-disc list-inside text-gray-600 text-xs max-h-28 overflow-y-auto space-y-1">
                    {planData.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className={
                          feature.included ? "" : "line-through text-gray-400"
                        }
                      >
                        {feature.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })
        )}
      </main>
    </div>
  );
}
