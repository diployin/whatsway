import { Coins } from "lucide-react"; // or any credit/coin icon you prefer

export function AdminCreditBox({ credits = 595 }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 px-5 py-4 flex flex-col w-[180px]">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <Coins className="h-4 w-4 text-yellow-500" />
          <span className="font-medium text-gray-800">Credits</span>
        </div>
        <a
          href="#upgrade"
          className="text-xs font-semibold text-blue-600 hover:underline"
        >
          Upgrade
        </a>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-gray-900">{credits}</span>
      </div>
    </div>
  );
}
