// Header.tsx - Builder Header Component

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, UserPlus } from "lucide-react";

interface HeaderProps {
  name: string;
  setName: (name: string) => void;
  description: string;
  setDescription: (description: string) => void;
  trigger: string;
  setTrigger: (trigger: string) => void;
  automation: any;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
  isDemo: boolean;
}

export function Header({
  name,
  setName,
  description,
  setDescription,
  trigger,
  setTrigger,
  automation,
  onClose,
  onSave,
  isSaving,
  isDemo,
}: HeaderProps) {
  return (
    <div className="bg-white border-b px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
        <button
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900 self-start sm:self-center"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col gap-2 w-full sm:w-72">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Automation name"
            className="h-9 text-sm placeholder-slate-500"
          />
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="h-8 text-xs placeholder-gray-400"
          />
        </div>

        <div className="flex flex-col flex-wrap items-center gap-3">
          <Badge variant="outline" className="text-xs">
            {automation?.id ? "Edit" : "New"} Automation
          </Badge>
          <Badge className="bg-green-500 text-white text-xs capitalize">
            {trigger === "new_conversation"
              ? "New Chat"
              : trigger || "No Trigger"}
          </Badge>
        </div>

        <div className="flex flex-col gap-2 min-w-[180px] px-4">
          <Label className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <UserPlus className="w-4 h-4" />
            Trigger Channel
          </Label>
          <Select value={trigger} onValueChange={setTrigger}>
            <SelectTrigger className="h-9 text-sm">
              <SelectValue placeholder="Select trigger" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new_conversation">
                New conversation
              </SelectItem>
              <SelectItem value="message_received">
                Message received
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={onSave}
          disabled={isDemo || isSaving}
          className="min-w-[100px]"
        >
          <Save className="w-4 h-4 mr-1" />
          {isSaving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}