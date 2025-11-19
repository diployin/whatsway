import { Crown, Calendar } from "lucide-react";
import Header from "./layout/header";

export default function BillingSubscriptionPage() {
  // Dummy Data
  const plan = {
    name: "Pro",
    status: "active",
    description: "Pro plan",
    billingPeriod: "Monthly",
    renews: "Dec 11, 2025",
  };

  return (
    <div className="flex-1  min-h-screen ">
      <Header
        title={"Billing & Subscription"}
        subtitle={"Manage your subscription, credits, and billing"}
      />
      <div className="py-8 px-5">
        {/* Plan Card */}
        <div className="bg-white rounded-xl shadow  border p-6 w-full max-w-2xl mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-6 h-6 text-gray-700" />
            <span className="text-2xl font-bold">{plan.name}</span>
            <span className="bg-gray-800 text-white text-xs font-semibold rounded px-2 py-1">
              {plan.status}
            </span>
          </div>
          <div className="text-gray-700 mb-4">{plan.description}</div>
          <div className="flex items-center gap-6 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                Billing Period:&nbsp;<b>{plan.billingPeriod}</b>
              </span>
            </div>
            <span>
              Renews:&nbsp;<b>{plan.renews}</b>
            </span>
          </div>
        </div>

        {/* Credits & Usage Section */}
        <h2 className="text-2xl font-bold mb-2">Credits & Usage</h2>
        <p className="text-gray-600 mb-5">
          Purchase credits to make calls and send messages
        </p>
        <div className="bg-white rounded-xl shadow border p-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              <svg width={20} height={20}>
                {/* Example Info Icon */}
                <circle
                  cx="10"
                  cy="10"
                  r="8"
                  stroke="gray"
                  strokeWidth="2"
                  fill="none"
                />
                <text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  fontSize="12"
                  fill="gray"
                >
                  i
                </text>
              </svg>
            </span>
            <span className="text-gray-700 text-sm">
              You need an active membership subscription to purchase credits or
              phone numbers.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
