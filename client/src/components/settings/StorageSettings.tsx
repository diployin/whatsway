import { useEffect, useState } from "react";
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
  Server,
  Edit,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Key,
  Globe,
  Cloud,
  Lock,
  MapPin,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import StorageSettingsModal from "../modals/StorageSettingsModal";

// Types
interface StorageConfig {
  id?: string;
  spaceName?: string;
  endpoint?: string;
  region?: string;
  accessKey?: string;
  secretKey?: string;
  isActive?: boolean;
  updatedAt?: string;
}

export default function StorageSettings(): JSX.Element {
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const { toast } = useToast();

  const {
    data: storageConfig,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery<StorageConfig>({
    queryKey: ["/api/storage-settings"],
    queryFn: () =>
      fetch("/api/storage-settings").then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      }),
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const staticData: StorageConfig = {
    spaceName: "Default Space",
    endpoint: "https://example.endpoint.com",
    region: "us-east-1",
    accessKey: "",
    secretKey: "",
    isActive: false,
    updatedAt: new Date().toISOString(),
  };

  const displayData = error ? staticData : storageConfig || {};
  const isUsingStaticData = Boolean(error);

  const handleEditClick = (): void => {
    if (isUsingStaticData) {
      toast({
        title: "Connection Issue",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }
    setShowEditDialog(true);
  };

  const handleRefresh = async (): Promise<void> => {
    try {
      await refetch();
      toast({
        title: "Refreshed",
        description: "Storage configuration refreshed successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh storage settings.",
        variant: "destructive",
      });
    }
  };

  const formatLastUpdated = (dateString?: string): string => {
    if (!dateString) return "Unknown";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60)
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`;
      if (diffInMinutes < 1440) {
        const hours = Math.floor(diffInMinutes / 60);
        return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
      }
      return date.toLocaleDateString();
    } catch {
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center py-8">
            <Loading />
            <p className="text-sm text-gray-500 mt-2">
              Loading storage configuration...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Storage Configuration */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Title */}
            <CardTitle className="flex items-center min-w-0">
              <Server className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className=" text-xl sm:text-2xl">
                Storage Configuration
              </span>
            </CardTitle>

            {/* Right: Controls */}
            <div
              className="flex items-center flex-wrap gap-2 justify-start
                 w-full sm:w-auto overflow-x-auto sm:overflow-visible"
              aria-label="Storage controls"
            >
              <Badge
                variant={isUsingStaticData ? "destructive" : "default"}
                className="text-xs inline-flex items-center"
              >
                {isUsingStaticData ? (
                  <>
                    <WifiOff className="w-3 h-3 mr-1 flex-shrink-0" />
                    Offline
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 mr-1 flex-shrink-0" />
                    Online
                  </>
                )}
              </Badge>

              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
                className="flex items-center text-xs h-7 rounded-sm px-2 sm:h-9 sm:rounded-md sm:px-3"
                aria-live="polite"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-1 ${isFetching ? "animate-spin" : ""}`}
                />
                {isFetching ? "Refreshing..." : "Refresh"}
              </Button>

              <Button
                onClick={handleEditClick}
                disabled={isUsingStaticData}
                size="sm"
                className="flex items-center text-xs h-7 rounded-sm px-2 sm:h-9 sm:rounded-md sm:px-3"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Storage
              </Button>
            </div>
          </div>

          <CardDescription className="mt-2 text-sm sm:text-base">
            Manage your file storage integration and credentials
          </CardDescription>
        </CardHeader>

        <CardContent>
          {isUsingStaticData && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <h4 className="text-sm font-semibold text-red-800">
                    Connection Error
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    Unable to load storage settings from the server. Displaying
                    cached data.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Storage Info Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-6 gap-2">
              {/* Left: title + badge */}
              <div className="flex items-center space-x-3 min-w-0">
                <h3 className="font-semibold text-base sm:text-lg truncate">
                  Storage Details
                </h3>

                <Badge
                  variant={displayData.isActive ? "outline" : "secondary"}
                  className={`text-xs inline-flex items-center whitespace-nowrap ${
                    displayData.isActive ? "text-green-600" : "text-gray-500"
                  }`}
                  aria-label={displayData.isActive ? "Active" : "Inactive"}
                >
                  {displayData.isActive && (
                    <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                  )}
                  <span>{displayData.isActive ? "Active" : "Inactive"}</span>
                </Badge>
              </div>

              {/* Right: timestamp (moves under on small screens) */}
              {displayData.updatedAt && (
                <div className="mt-1 sm:mt-0 flex items-center text-sm text-gray-500">
                  <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {formatLastUpdated(displayData.updatedAt)}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Space Name */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Cloud className="w-4 h-4 text-blue-500" />
                  <Label className="font-medium">Space Name</Label>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium text-gray-900">
                    {displayData.spaceName || "Not configured"}
                  </p>
                </div>
              </div>

              {/* Endpoint */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-green-500" />
                  <Label className="font-medium">Endpoint</Label>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700 break-all">
                    {displayData.endpoint || "No endpoint provided"}
                  </p>
                </div>
              </div>

              {/* Region */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <Label className="font-medium">Region</Label>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700">
                    {displayData.region || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Access Key */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Key className="w-4 h-4 text-orange-500" />
                  <Label className="font-medium">Access Key</Label>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700">
                    {displayData.accessKey ? "********" : "Not configured"}
                  </p>
                </div>
              </div>

              {/* Secret Key */}
              <div className="space-y-3 md:col-span-2">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-red-500" />
                  <Label className="font-medium">Secret Key</Label>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm text-gray-700">
                    {displayData.secretKey ? "********" : "Not configured"}
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration Status */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      displayData.spaceName &&
                      displayData.endpoint &&
                      displayData.region
                        ? "bg-green-500"
                        : displayData.spaceName
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-gray-600">
                    Configuration Status:{" "}
                    {displayData.spaceName &&
                    displayData.endpoint &&
                    displayData.region
                      ? "Complete"
                      : displayData.spaceName
                      ? "Partial"
                      : "Incomplete"}
                  </span>
                </div>
                {displayData.updatedAt && !isUsingStaticData && (
                  <span className="text-gray-500">
                    Last updated:{" "}
                    {new Date(displayData.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      <StorageSettingsModal
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        existingData={displayData}
        onSuccess={() => {
          setShowEditDialog(false);
          refetch();
        }}
      />
    </div>
  );
}
