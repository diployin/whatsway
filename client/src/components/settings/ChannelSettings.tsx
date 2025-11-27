import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  TestTube,
  RefreshCw,
  Info,
  Activity,
  MessageSquare,
  Shield,
  TrendingUp,
  Gauge,
  ShieldCheck,
  Award,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Channel } from "@shared/schema";
import { Loading } from "@/components/ui/loading";
import { ChannelDialog } from "./ChannelDialog";
import { TestMessageDialog } from "./TestMessageDialog";
import { useAuth } from "@/contexts/auth-context";
import { useTranslation } from "@/lib/i18n";

export function ChannelSettings() {
  const { t } = useTranslation();
  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [testingChannelId, setTestingChannelId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch WhatsApp channels
  const { data: channels = [], isLoading: channelsLoading } = useQuery({
    queryKey: ["/api/channels"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/channels");
      const json = await response.json();
      return json.data ?? [];
    },
  });

  // Delete channel mutation
  const deleteChannelMutation = useMutation({
    mutationFn: async (channelId: string) => {
      return await apiRequest("DELETE", `/api/channels/${channelId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/channels"] });
      toast({
        title: t("settings.channel_setting.channelDeleted"),
        description: t("settings.channel_setting.channelDeletedDesc"),
      });
    },
    onError: (error) => {
      toast({
        title: t("settings.channel_setting.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditChannel = (channel: Channel) => {
    setEditingChannel(channel);
    setShowChannelDialog(true);
  };

  const handleDeleteChannel = (channelId: string) => {
    if (confirm(t("settings.channel_setting.deleteConfirm"))) {
      deleteChannelMutation.mutate(channelId);
    }
  };

  const checkChannelHealth = async (channelId: string) => {
    try {
      toast({
        title: t("settings.channel_setting.checkingHealth"),
        description: t("settings.channel_setting.verifyingConnection"),
      });

      const response = await apiRequest(
        "POST",
        `/api/channels/${channelId}/health`
      );

      await queryClient.invalidateQueries({ queryKey: ["/api/channels"] });

      if (response.status === "healthy") {
        toast({
          title: t("settings.channel_setting.channelHealthy"),
          description: t("settings.channel_setting.channelHealthyDesc"),
        });
      } else if (response.status === "warning") {
        toast({
          title: t("settings.channel_setting.channelWarnings"),
          description:
            response.error || t("settings.channel_setting.channelWarningsDesc"),
          variant: "default",
        });
      } else if (response.status === "error") {
        toast({
          title: t("settings.channel_setting.channelIssues"),
          description:
            response.error || t("settings.channel_setting.channelIssuesDesc"),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t("settings.channel_setting.healthCheckFailed"),
        description: t("settings.channel_setting.healthCheckFailedDesc"),
        variant: "destructive",
      });
    }
  };

  const getHealthIcon = (status?: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <Activity className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-400" />;
    }
  };

  const getHealthStatusBadge = (status?: string, lastChecked?: string) => {
    const variant =
      status === "healthy"
        ? "success"
        : status === "warning"
        ? "warning"
        : status === "error"
        ? "destructive"
        : "secondary";
    const displayStatus =
      status === "error"
        ? t("settings.channel_setting.healthStatus.error")
        : status
        ? t(`settings.channel_setting.healthStatus.${status}`)
        : t("settings.channel_setting.healthStatus.unknown");

    return (
      <div className="flex items-center space-x-2">
        <Badge variant={variant as any} className="capitalize">
          {displayStatus}
        </Badge>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="flex items-center text-base sm:text-lg min-w-0">
              <Smartphone className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="truncate">
                {t("settings.channel_setting.title")}
              </span>
            </CardTitle>

            <Button
              onClick={() => {
                setEditingChannel(null);
                setShowChannelDialog(true);
              }}
              size="sm"
              className="self-start sm:self-auto whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("settings.channel_setting.addChannel")}
            </Button>
          </div>

          <CardDescription className="mt-2 text-sm sm:text-base">
            {t("settings.channel_setting.description")}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {channelsLoading ? (
            <Loading />
          ) : channels.length === 0 ? (
            <div className="text-center py-12">
              <Smartphone className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">
                {t("settings.channel_setting.noChannels")}
              </p>
              <Button onClick={() => setShowChannelDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t("settings.channel_setting.addFirstChannel")}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className="border border-gray-200 rounded-lg p-3 sm:p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                      {/* Channel Name & Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="font-semibold text-base sm:text-lg">
                          {user?.username === "demouser" ? (
                            <span className="px-2 py-1 rounded">
                              {channel.name.slice(0, -1).replace(/./g, "*") +
                                channel.name.slice(-1)}
                            </span>
                          ) : (
                            channel.name
                          )}
                        </h3>
                        {channel.isActive && (
                          <Badge variant="success" className="text-xs">
                            {t("settings.channel_setting.active")}
                          </Badge>
                        )}
                        {channel.mmLiteEnabled && (
                          <Badge
                            variant="secondary"
                            className="text-xs flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            {t("settings.channel_setting.mmLite")}
                          </Badge>
                        )}
                      </div>

                      {/* Channel Details */}
                      <div className="space-y-2 text-xs sm:text-sm text-gray-600 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium text-gray-700">
                            {t("settings.channel_setting.phone")}
                          </span>
                          <span className="font-mono">
                            {user?.username === "demouser"
                              ? channel.phoneNumber
                                  ?.slice(0, -4)
                                  .replace(/\d/g, "*") +
                                channel.phoneNumber?.slice(-4)
                              : channel.phoneNumber ||
                                t("settings.channel_setting.notSet")}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium text-gray-700">
                            {t("settings.channel_setting.phoneNumberId")}
                          </span>
                          <span className="font-mono break-all">
                            {user?.username === "demouser"
                              ? channel.phoneNumberId
                                  ?.slice(0, -4)
                                  .replace(/\d/g, "*") +
                                channel.phoneNumberId?.slice(-4)
                              : channel.phoneNumberId}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-medium text-gray-700">
                            {t("settings.channel_setting.businessAccountId")}
                          </span>
                          <span className="font-mono break-all">
                            {user?.username === "demouser"
                              ? channel.whatsappBusinessAccountId
                                  ?.slice(0, -4)
                                  .replace(/\d/g, "*") +
                                channel.whatsappBusinessAccountId?.slice(-4)
                              : channel.whatsappBusinessAccountId ||
                                t("settings.channel_setting.notSet")}
                          </span>
                        </div>
                      </div>

                      {/* Channel Health Section */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <span className="font-semibold text-gray-700">
                              {t("settings.channel_setting.channelHealth")}
                            </span>
                          </div>
                          {getHealthStatusBadge(
                            channel.healthStatus,
                            channel.lastHealthCheck
                          )}
                        </div>

                        {channel?.healthDetails &&
                          Object.keys(channel?.healthDetails).length > 0 && (
                            <div className="mt-3">
                              {channel?.healthDetails.error ? (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md space-y-1 text-xs sm:text-sm">
                                  <p className="text-red-700 font-medium break-words">
                                    {t(
                                      "settings.channel_setting.healthDetails.errorLabel"
                                    )}{" "}
                                    {channel.healthDetails.error}
                                  </p>
                                  {channel.healthDetails.error_code && (
                                    <p className="text-red-600">
                                      {t(
                                        "settings.channel_setting.healthDetails.errorCode"
                                      )}{" "}
                                      {channel.healthDetails.error_code}
                                    </p>
                                  )}
                                  {channel.healthDetails.error_type && (
                                    <p className="text-red-600">
                                      {t(
                                        "settings.channel_setting.healthDetails.errorType"
                                      )}{" "}
                                      {channel.healthDetails.error_type}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                                  {/* Account Mode */}
                                  {channel.healthDetails.status && (
                                    <div
                                      className={`p-2.5 sm:p-3 rounded-lg border ${
                                        channel.healthDetails.status === "LIVE"
                                          ? "bg-green-50 border-green-200"
                                          : "bg-yellow-50 border-yellow-200"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Activity
                                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${
                                            channel.healthDetails.status ===
                                            "LIVE"
                                              ? "text-green-600"
                                              : "text-yellow-600"
                                          }`}
                                        />
                                        <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                                          {t(
                                            "settings.channel_setting.healthDetails.accountMode"
                                          )}
                                        </span>
                                      </div>
                                      <p
                                        className={`font-semibold text-sm sm:text-base ${
                                          channel.healthDetails.status ===
                                          "LIVE"
                                            ? "text-green-700"
                                            : "text-yellow-700"
                                        }`}
                                      >
                                        {channel.healthDetails.status}
                                      </p>
                                    </div>
                                  )}

                                  {/* Quality Rating */}
                                  {channel.healthDetails.quality_rating && (
                                    <div
                                      className={`p-2.5 sm:p-3 rounded-lg border ${
                                        channel.healthDetails.quality_rating ===
                                        "GREEN"
                                          ? "bg-emerald-50 border-emerald-200"
                                          : channel.healthDetails
                                              .quality_rating === "YELLOW"
                                          ? "bg-amber-50 border-amber-200"
                                          : "bg-red-50 border-red-200"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 mb-1">
                                        <TrendingUp
                                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${
                                            channel.healthDetails
                                              .quality_rating === "GREEN"
                                              ? "text-emerald-600"
                                              : channel.healthDetails
                                                  .quality_rating === "YELLOW"
                                              ? "text-amber-600"
                                              : "text-red-600"
                                          }`}
                                        />
                                        <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                                          {t(
                                            "settings.channel_setting.healthDetails.qualityRating"
                                          )}
                                        </span>
                                      </div>
                                      <p
                                        className={`font-semibold text-sm sm:text-base ${
                                          channel.healthDetails
                                            .quality_rating === "GREEN"
                                            ? "text-emerald-700"
                                            : channel.healthDetails
                                                .quality_rating === "YELLOW"
                                            ? "text-amber-700"
                                            : "text-red-700"
                                        }`}
                                      >
                                        {channel.healthDetails.quality_rating}
                                      </p>
                                    </div>
                                  )}

                                  {/* Messaging Limit */}
                                  {channel.healthDetails.messaging_limit && (
                                    <div className="p-2.5 sm:p-3 rounded-lg border bg-blue-50 border-blue-200">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-blue-600" />
                                        <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                                          {t(
                                            "settings.channel_setting.healthDetails.messagingLimit"
                                          )}
                                        </span>
                                      </div>
                                      <p className="font-semibold text-sm sm:text-base text-blue-700">
                                        {channel.healthDetails.messaging_limit}
                                      </p>
                                    </div>
                                  )}

                                  {/* Throughput */}
                                  {channel.healthDetails.throughput_level && (
                                    <div className="p-2.5 sm:p-3 rounded-lg border bg-purple-50 border-purple-200">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Gauge className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 text-purple-600" />
                                        <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                                          {t(
                                            "settings.channel_setting.healthDetails.throughput"
                                          )}
                                        </span>
                                      </div>
                                      <p className="font-semibold text-sm sm:text-base text-purple-700 capitalize">
                                        {channel.healthDetails.throughput_level}
                                      </p>
                                    </div>
                                  )}

                                  {/* Verification */}
                                  {channel.healthDetails
                                    .verification_status && (
                                    <div
                                      className={`p-2.5 sm:p-3 rounded-lg border ${
                                        channel.healthDetails
                                          .verification_status === "VERIFIED"
                                          ? "bg-teal-50 border-teal-200"
                                          : "bg-gray-50 border-gray-200"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 mb-1">
                                        <ShieldCheck
                                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${
                                            channel.healthDetails
                                              .verification_status ===
                                            "VERIFIED"
                                              ? "text-teal-600"
                                              : "text-gray-600"
                                          }`}
                                        />
                                        <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                                          {t(
                                            "settings.channel_setting.healthDetails.verification"
                                          )}
                                        </span>
                                      </div>
                                      <p
                                        className={`font-semibold text-sm sm:text-base ${
                                          channel.healthDetails
                                            .verification_status === "VERIFIED"
                                            ? "text-teal-700"
                                            : "text-gray-700"
                                        }`}
                                      >
                                        {channel.healthDetails.verification_status.replace(
                                          /_/g,
                                          " "
                                        )}
                                      </p>
                                    </div>
                                  )}

                                  {/* Name Status */}
                                  {channel.healthDetails.name_status && (
                                    <div
                                      className={`p-2.5 sm:p-3 rounded-lg border ${
                                        channel.healthDetails.name_status ===
                                        "APPROVED"
                                          ? "bg-indigo-50 border-indigo-200"
                                          : "bg-orange-50 border-orange-200"
                                      }`}
                                    >
                                      <div className="flex items-center space-x-2 mb-1">
                                        <Award
                                          className={`w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 ${
                                            channel.healthDetails
                                              .name_status === "APPROVED"
                                              ? "text-indigo-600"
                                              : "text-orange-600"
                                          }`}
                                        />
                                        <span className="text-[10px] sm:text-xs font-medium text-gray-600">
                                          {t(
                                            "settings.channel_setting.healthDetails.nameStatus"
                                          )}
                                        </span>
                                      </div>
                                      <p
                                        className={`font-semibold text-sm sm:text-base ${
                                          channel.healthDetails.name_status ===
                                          "APPROVED"
                                            ? "text-indigo-700"
                                            : "text-orange-700"
                                        }`}
                                      >
                                        {channel.healthDetails.name_status}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* Last Health Check */}
                              {channel.lastHealthCheck && (
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-3 pt-3 border-t border-gray-100">
                                  <p className="text-[10px] sm:text-xs text-gray-500">
                                    {t("settings.channel_setting.lastChecked")}{" "}
                                    {new Date(
                                      channel.lastHealthCheck
                                    ).toLocaleString()}
                                  </p>
                                  <Button
                                    onClick={() =>
                                      checkChannelHealth(channel.id)
                                    }
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs w-full sm:w-auto"
                                  >
                                    <RefreshCw className="w-3 h-3 mr-1" />
                                    {t("settings.channel_setting.refresh")}
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex sm:flex-col gap-2 sm:gap-2 flex-wrap sm:flex-nowrap">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={user?.username === "demouser"}
                        onClick={() => {
                          setTestingChannelId(channel.id);
                          setShowTestDialog(true);
                        }}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <TestTube className="w-3.5 h-3.5 sm:w-4 sm:h-4 sm:mr-1" />
                        <span className="hidden sm:inline">
                          {t("settings.channel_setting.test")}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditChannel(channel)}
                        disabled={user?.username === "demouser"}
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button>
                      {/* <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteChannel(channel.id)}
                        disabled={
                          user?.username === "demouser" ||
                          deleteChannelMutation.isPending
                        }
                        className="flex-1 sm:flex-none text-xs sm:text-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </Button> */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Channel Dialog */}
      <ChannelDialog
        open={showChannelDialog}
        onOpenChange={setShowChannelDialog}
        editingChannel={editingChannel}
        onSuccess={() => {
          setShowChannelDialog(false);
          setEditingChannel(null);
        }}
      />

      {/* Test Message Dialog */}
      <TestMessageDialog
        open={showTestDialog}
        onOpenChange={setShowTestDialog}
        channelId={testingChannelId}
      />
    </>
  );
}
