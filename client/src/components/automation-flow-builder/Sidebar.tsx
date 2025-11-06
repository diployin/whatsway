// Sidebar.tsx - Operations Sidebar Component

import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GitBranch,
  MessageCircle,
  Reply,
  Clock,
} from "lucide-react";
import { NodeKind } from "./types";

interface SidebarProps {
  onAddNode: (kind: NodeKind) => void;
}

export function Sidebar({ onAddNode }: SidebarProps) {
  return (
    <div className="col-span-2 border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <div className="font-semibold">Operations</div>
      </div>
      <ScrollArea className="p-2">
        <div className="space-y-4">
          <div>
            <div className="text-[11px] uppercase text-gray-500 px-2 mb-1 flex items-center gap-2">
              <GitBranch className="w-3 h-3" /> Conditions
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onAddNode("conditions")}
                className="w-full text-left text-sm px-3 py-2 hover:bg-purple-50 rounded flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-purple-500 rounded-full" />{" "}
                Conditions
              </button>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase text-gray-500 px-2 mb-1 flex items-center gap-2">
              <MessageCircle className="w-3 h-3" /> Send a message
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onAddNode("custom_reply")}
                className="w-full text-left text-sm px-3 py-2 hover:bg-orange-50 rounded flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-orange-500 rounded-full" /> Message
              </button>
              <button
                onClick={() => onAddNode("send_template")}
                className="w-full text-left text-sm px-3 py-2 hover:bg-blue-50 rounded flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-blue-600 rounded-full" /> Template
              </button>
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase text-gray-500 px-2 mb-1 flex items-center gap-2">
              <Reply className="w-3 h-3" /> Ask a question
            </div>
            <button
              onClick={() => onAddNode("user_reply")}
              className="w-full text-left text-sm px-3 py-2 hover:bg-pink-50 rounded flex items-center gap-2"
            >
              <div className="w-2 h-2 bg-pink-500 rounded-full" /> Question
            </button>
          </div>

          <div>
            <div className="text-[11px] uppercase text-gray-500 px-2 mb-1 flex items-center gap-2">
              <Clock className="w-3 h-3" /> Operations
            </div>
            <div className="space-y-1">
              <button
                onClick={() => onAddNode("time_gap")}
                className="w-full text-left text-sm px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-gray-600 rounded-full" /> Time
                Delay
              </button>
              <button
                onClick={() => onAddNode("assign_user")}
                className="w-full text-left text-sm px-3 py-2 hover:bg-indigo-50 rounded flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-indigo-600 rounded-full" /> Assign
                to Member
              </button>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}