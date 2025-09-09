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
  Settings,
  Edit,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Image,
  Type,
  Tag,
  Globe,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loading } from "@/components/ui/loading";
import GeneralSettingsModal from "../modals/GeneralSettingsModal";

// Types
interface BrandSettings {
  title?: string;
  tagline?: string;
  logo?: string;
  favicon?: string;
  updatedAt?: string;
}

export function GeneralSettings(): JSX.Element {
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch brand settings
  const {
    data: brandSettings,
    isLoading: settingsLoading,
    error,
    refetch: refetchSettings,
  } = useQuery<BrandSettings>({
    queryKey: ["/api/brand-settings"],
    retry: false, // Don't retry on API failure
  });

  // Static fallback data when API fails
  const staticData: BrandSettings = {
    title: "Your App Name",
    tagline: "Building amazing experiences",
    logo: "https://via.placeholder.com/100x100/6366f1/white?text=LOGO",
    favicon: "https://via.placeholder.com/32x32/f59e0b/white?text=F",
    updatedAt: new Date().toISOString(),
  };

  // Use static data if API fails, otherwise use API data
  const displayData = error ? staticData : brandSettings || {};
  const isUsingStaticData = Boolean(error);

  const handleEditClick = (): void => {
    setShowEditDialog(true);
  };

  // Show loading state
  if (settingsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <Loading />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              General Configuration
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchSettings()}
                disabled={settingsLoading}
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button onClick={handleEditClick}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Settings
              </Button>
            </div>
          </div>
          <CardDescription>
            Manage your application's brand identity and appearance
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Show error message if API failed */}
          {isUsingStaticData && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  Unable to load settings from server. Showing sample data.
                </span>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-lg">Brand Identity</h3>
                <Badge variant="default" className="text-xs">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                  {isUsingStaticData ? "Sample Data" : "Live Data"}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Type className="w-4 h-4 text-blue-500" />
                  <Label className="font-medium">Application Title</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm font-medium">
                    {displayData.title || "Not configured"}
                  </p>
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-green-500" />
                  <Label className="font-medium">Tagline</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border">
                  <p className="text-sm">
                    {displayData.tagline || "Not configured"}
                  </p>
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Image className="w-4 h-4 text-purple-500" />
                  <Label className="font-medium">Logo</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {displayData.logo ? (
                    <div className="flex items-center space-x-3">
                      <img
                        src={displayData.logo}
                        alt="Logo"
                        className="w-10 h-10 object-contain rounded"
                      />
                      <span className="text-sm text-gray-600">
                        Logo uploaded
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No logo uploaded</p>
                  )}
                </div>
              </div>

              {/* Favicon */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Globe className="w-4 h-4 text-orange-500" />
                  <Label className="font-medium">Favicon</Label>
                </div>
                <div className="p-3 bg-gray-50 rounded-md border">
                  {displayData.favicon ? (
                    <div className="flex items-center space-x-3">
                      <img
                        src={displayData.favicon}
                        alt="Favicon"
                        className="w-6 h-6 object-contain rounded"
                      />
                      <span className="text-sm text-gray-600">
                        Favicon uploaded
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No favicon uploaded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Last Updated */}
            {displayData.updatedAt && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Last updated:{" "}
                  {new Date(displayData.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Brand Preview */}
      {displayData.title && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Image className="w-5 h-5 mr-2" />
              Brand Preview
            </CardTitle>
            <CardDescription>
              How your brand will appear in the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 p-6 border border-gray-200 rounded-lg bg-white">
              {displayData.logo && (
                <img
                  src={displayData.logo}
                  alt="Brand Logo"
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {displayData.title}
                </h3>
                {displayData.tagline && (
                  <p className="text-gray-600 text-sm mt-1">
                    {displayData.tagline}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Settings Modal */}
      <GeneralSettingsModal
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        brandSettings={displayData}
        onSuccess={() => setShowEditDialog(false)}
      />
    </div>
  );
}
