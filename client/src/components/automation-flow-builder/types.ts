// types.ts - Type Definitions

export type NodeKind =
  | "start"
  | "conditions"
  | "custom_reply"
  | "user_reply"
  | "time_gap"
  | "send_template"
  | "assign_user";

export interface BuilderNodeData {
  kind: NodeKind;
  label?: string;
  // Configs by type
  message?: string;
  imageFile?: File | null;
  imagePreview?: string;
  videoFile?: File | null;
  videoPreview?: string;
  audioFile?: File | null;
  audioPreview?: string;
  documentFile?: File | null;
  documentPreview?: string;
  question?: string;
  saveAs?: string;
  delay?: number; // seconds
  templateId?: string;
  assigneeId?: string; // user id
  // Condition specific fields
  conditionType?: "keyword" | "contains" | "equals" | "starts_with";
  keywords?: string[];
  matchType?: "any" | "all";
  buttons?: Array<{
    id: string;
    text: string;
    action: "next" | "custom";
    value?: string;
  }>;
  [key: string]: unknown;
}

export interface AutomationFlowBuilderProps {
  automation?: any;
  channelId?: string;
  onClose: () => void;
}

export interface Template {
  id: string;
  name: string;
  status: string;
}

export interface Member {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
}

export interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  style?: React.CSSProperties;
  markerEnd?: string;
  setEdges: React.Dispatch<React.SetStateAction<any[]>>;
}