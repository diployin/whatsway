import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Brain,
  Edit,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  Key,
  Cpu,
  Clock,
  Code2,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import AISettingsModal from "../modals/AISettingsModal";

interface AIConfig {
  id?: string;
  provider?: string;
  apiKey?: string;
  model?: string;
  endpoint?: string;
  temperature?: number;
  maxTokens?: number;
  words?: string[];
  isActive?: boolean;
  updatedAt?: string;
}

export default function AISettings(): JSX.Element {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  const { data, isLoading, error, refetch, isFetching } = useQuery<AIConfig[]>({
    queryKey: ["/api/ai-settings"],
    queryFn: async () => {
      const res = await fetch("/api/ai-settings");
      if (!res.ok) throw new Error("Failed to fetch settings");
      return res.json();
    },
  });

  const aiConfig = data?.[0]; // Using first active or first record

  const handleEditClick = () => setShowEditDialog(true);

  if (isLoading)
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center">
          <Loading />
          <p className="text-gray-500 text-sm mt-2">
            Loading AI configuration...
          </p>
        </CardContent>
      </Card>
    );

  if (error)
    return (
      <Card>
        <CardContent className="p-6 flex flex-col items-center text-red-600">
          <AlertCircle className="w-5 h-5 mb-2" />
          Failed to load AI settings.
        </CardContent>
      </Card>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Title */}
            <CardTitle className="flex items-center text-base sm:text-lg min-w-0">
              <Brain className="w-5 h-5 mr-2 text-indigo-600 flex-shrink-0" />
              <span className="truncate">AI Configuration</span>
            </CardTitle>

            {/* Controls */}
            <div
              className="flex items-center flex-wrap gap-2 justify-start sm:justify-end
                 w-full sm:w-auto"
            >
              <Badge
                variant={aiConfig?.isActive ? "outline" : "secondary"}
                className={`text-xs inline-flex items-center whitespace-nowrap ${
                  aiConfig?.isActive ? "text-green-600" : "text-gray-500"
                }`}
              >
                {aiConfig?.isActive ? "Active" : "Inactive"}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="whitespace-nowrap"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`}
                />
                {isFetching ? "Refreshing..." : "Refresh"}
              </Button>

              <Button
                onClick={handleEditClick}
                size="sm"
                className="whitespace-nowrap"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>

          <CardDescription className="mt-2 text-sm sm:text-base">
            Manage your AI model provider, credentials, and runtime parameters.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoBlock
              icon={<Settings />}
              label="Provider"
              value={aiConfig?.provider}
            />
            <InfoBlock
              icon={<Key />}
              label="API Key"
              value={aiConfig?.apiKey ? "***************" : "Not configured"}
            />
            <InfoBlock icon={<Cpu />} label="Model" value={aiConfig?.model} />
            <InfoBlock
              icon={<Code2 />}
              label="Endpoint"
              value={aiConfig?.endpoint}
            />
            <InfoBlock
              icon={<Brain />}
              label="Temperature"
              value={aiConfig?.temperature?.toString()}
            />
            <InfoBlock
              icon={<Clock />}
              label="Max Tokens"
              value={aiConfig?.maxTokens?.toString()}
            />
            {/* Words */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <Label className="font-medium">Trigger Words</Label>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                {aiConfig?.words && aiConfig?.words.length > 0 ? (
                  <p className="text-sm text-gray-800">
                    {aiConfig?.words.join(", ")}
                  </p>
                ) : (
                  <p className="text-gray-400 text-sm italic">
                    No trigger words defined
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <AISettingsModal
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        existingData={aiConfig}
        onSuccess={() => {
          setShowEditDialog(false);
          refetch();
        }}
      />
    </div>
  );
}

function InfoBlock({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2">
        <div className="text-blue-500">{icon}</div>
        <Label className="font-medium">{label}</Label>
      </div>
      <div className="p-4 bg-gray-50 rounded-lg border text-sm text-gray-800 break-all">
        {value || "Not set"}
      </div>
    </div>
  );
}
