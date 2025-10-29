// NodeComponents.tsx - Custom Node Components

import { Handle, Position } from "@xyflow/react";
import {
  Zap,
  GitBranch,
  MessageCircle,
  Reply,
  Clock,
  FileText,
  Users,
  Video,
  FileAudio,
  FileIcon,
} from "lucide-react";
import { BuilderNodeData } from "./types";

function Shell({
  children,
  tint,
}: {
  children: React.ReactNode;
  tint: string;
}) {
  return (
    <div
      className={`rounded-2xl shadow-sm border text-white ${tint} px-4 py-3 min-w-[220px] relative group`}
    >
      {children}
    </div>
  );
}

export function StartNode() {
  return (
    <div className="rounded-full w-14 h-14 bg-green-500 flex items-center justify-center text-white shadow">
      <Zap className="w-6 h-6" />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export function ConditionsNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-purple-500 border-purple-600">
      <div className="font-semibold flex items-center gap-2">
        <GitBranch className="w-4 h-4" /> Conditions
      </div>
      <div className="text-white/90 text-sm mt-1">
        {data.conditionType === "keyword" &&
        data.keywords &&
        data.keywords.length > 0 ? (
          <div>
            Keywords: {data.keywords.slice(0, 3).join(", ")}
            {data.keywords.length > 3 && "..."}
          </div>
        ) : (
          <div>No conditions set</div>
        )}
      </div>
      {data.matchType && (
        <div className="text-[11px] mt-1 bg-white/15 rounded px-2 py-1 inline-block">
          Match: {data.matchType}
        </div>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

export function CustomReplyNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-orange-500 border-orange-600">
      <div className="font-semibold flex items-center gap-2">
        <MessageCircle className="w-4 h-4" /> Message
      </div>
      {data.message && (
        <div className="text-white/90 text-sm mt-1 whitespace-pre-wrap">
          {data.message.length > 50
            ? `${data.message.slice(0, 50)}...`
            : data.message}
        </div>
      )}

      {data.imagePreview && (
        <div className="mt-2 rounded-lg overflow-hidden bg-white/10">
          <img
            src={data.imagePreview}
            alt="message"
            className="max-h-20 object-cover w-full"
          />
        </div>
      )}
      {data.videoPreview && (
        <div className="mt-2 flex items-center gap-2 text-xs bg-white/10 rounded px-2 py-1">
          <Video className="w-3 h-3" />
          Video attached
        </div>
      )}
      {data.audioPreview && (
        <div className="mt-2 flex items-center gap-2 text-xs bg-white/10 rounded px-2 py-1">
          <FileAudio className="w-3 h-3" />
          Audio attached
        </div>
      )}
      {data.documentPreview && (
        <div className="mt-2 flex items-center gap-2 text-xs bg-white/10 rounded px-2 py-1">
          <FileIcon className="w-3 h-3" />
          Document attached
        </div>
      )}

      {data.buttons && data.buttons.length > 0 && (
        <div className="mt-2 space-y-1">
          {data.buttons.slice(0, 2).map((button) => (
            <div
              key={button.id}
              className="bg-white/20 text-xs px-2 py-1 rounded"
            >
              {button.text}
            </div>
          ))}
          {data.buttons.length > 2 && (
            <div className="text-xs text-white/70">
              +{data.buttons.length - 2} more
            </div>
          )}
        </div>
      )}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

export function UserReplyNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-pink-500 border-pink-600">
      <div className="font-semibold flex items-center gap-2">
        <Reply className="w-4 h-4" /> Question
      </div>
      {data.question && (
        <div className="text-white/90 text-sm mt-1 whitespace-pre-wrap">
          {data.question.length > 50
            ? `${data.question.slice(0, 50)}...`
            : data.question}
        </div>
      )}

      {data.imagePreview && (
        <div className="mt-2 rounded-lg overflow-hidden bg-white/10">
          <img
            src={data.imagePreview}
            alt="question"
            className="max-h-20 object-cover w-full"
          />
        </div>
      )}

      {data.saveAs && (
        <div className="text-[11px] mt-2 bg-white/15 rounded px-2 py-1 inline-block">
          save as: <span className="font-mono">{data.saveAs}</span>
        </div>
      )}

      {data.buttons && data.buttons.length > 0 && (
        <div className="mt-2 space-y-1">
          {data.buttons.slice(0, 2).map((button) => (
            <div
              key={button.id}
              className="bg-green-500 text-xs px-2 py-1 rounded flex items-center gap-1"
            >
              <div className="w-1 h-1 bg-white rounded-full" />
              {button.text}
            </div>
          ))}
        </div>
      )}

      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

export function TimeGapNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-gray-600 border-gray-700">
      <div className="font-semibold flex items-center gap-2">
        <Clock className="w-4 h-4" /> Delay
      </div>
      <div className="text-white/90 text-sm mt-1">
        {data.delay ?? 0} seconds
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

export function SendTemplateNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-blue-600 border-blue-700">
      <div className="font-semibold flex items-center gap-2">
        <FileText className="w-4 h-4" /> Template
      </div>
      <div className="text-white/90 text-sm mt-1">
        {data.templateId ? `Template: ${data.templateId}` : "Select a template"}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

export function AssignUserNode({ data }: { data: BuilderNodeData }) {
  return (
    <Shell tint="bg-indigo-600 border-indigo-700">
      <div className="font-semibold flex items-center gap-2">
        <Users className="w-4 h-4" /> Assign to
      </div>
      <div className="text-white/90 text-sm mt-1">
        {data.assigneeId ? data.assigneeId : "Select member"}
      </div>
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </Shell>
  );
}

export const nodeTypes = {
  start: StartNode,
  conditions: ConditionsNode,
  custom_reply: CustomReplyNode,
  user_reply: UserReplyNode,
  time_gap: TimeGapNode,
  send_template: SendTemplateNode,
  assign_user: AssignUserNode,
};