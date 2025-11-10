import { useState, useEffect } from "react";
import {
  Check,
  X,
  Zap,
  Crown,
  Rocket,
  Star,
  Plus,
  Edit,
  Trash2,
  Save,
  XCircle,
  AlertCircle,
  RefreshCw,
  Award,
} from "lucide-react";
import Header from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const API_URL = "http://localhost:5001/api";

// Interfaces
export interface PlanPermissions {
  channel: string;
  contacts: string;
  automation: string;
}

export interface Feature {
  name: string;
  included: boolean;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular: boolean;
  badge: string;
  color: string;
  buttonColor: string;
  monthlyPrice: string;
  annualPrice: string;
  permissions: PlanPermissions;
  features: Feature[];
  createdAt: string;
  updatedAt: string;
}

export interface PlansDataTypes {
  success: boolean;
  data: Plan[];
}

interface FormData {
  name: string;
  description: string;
  icon: string;
  popular: boolean;
  badge: string;
  color: string;
  buttonColor: string;
  monthlyPrice: string;
  annualPrice: string;
  permissions: PlanPermissions;
  features: Feature[];
}

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    description: "",
    icon: "Zap",
    popular: false,
    badge: "",
    color: "border-gray-200",
    buttonColor: "bg-blue-500 hover:bg-blue-600",
    monthlyPrice: "0",
    annualPrice: "0",
    permissions: {
      channel: "",
      contacts: "",
      automation: "",
    },
    features: [],
  });

  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Zap,
    Crown,
    Rocket,
    Star,
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await apiRequest("GET", "/api/admin/plans");
      // const response = await fetch(`${API_URL}/admin/plans`);
      // const reposne = await apiRequest('GET' , )
      const data: PlansDataTypes = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error("Error fetching plans:", error);
      toast({
        title: "Error",
        description: "Failed to fetch plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (): Promise<void> => {
    try {
      const url = editingPlan
        ? `${API_URL}/admin/plans/${editingPlan.id}`
        : `${API_URL}/admin/plans`;

      const method = editingPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: editingPlan ? "Plan updated" : "Plan created",
          description: editingPlan
            ? "Your plan has been updated successfully."
            : "Your plan has been created successfully.",
        });
        fetchPlans();
        resetForm();
      }
    } catch (error) {
      console.error("Error saving plan:", error);
      toast({
        title: "Error",
        description: "Failed to save plan",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this plan?")) return;

    try {
      const response = await fetch(`${API_URL}/admin/plans/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Plan deleted",
          description: "The plan has been deleted successfully.",
        });
        fetchPlans();
      }
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete plan",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (plan: Plan): void => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name || "",
      description: plan.description || "",
      icon: plan.icon || "Zap",
      popular: plan.popular || false,
      badge: plan.badge || "",
      color: plan.color || "border-gray-200",
      buttonColor: plan.buttonColor || "bg-blue-500 hover:bg-blue-600",
      monthlyPrice: plan.monthlyPrice || "0",
      annualPrice: plan.annualPrice || "0",
      permissions: plan.permissions || {
        channel: "",
        contacts: "",
        automation: "",
      },
      features: plan.features || [],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = (): void => {
    setFormData({
      name: "",
      description: "",
      icon: "Zap",
      popular: false,
      badge: "",
      color: "border-gray-200",
      buttonColor: "bg-blue-500 hover:bg-blue-600",
      monthlyPrice: "0",
      annualPrice: "0",
      permissions: { channel: "", contacts: "", automation: "" },
      features: [],
    });
    setEditingPlan(null);
    setShowForm(false);
  };

  const addFeature = (): void => {
    setFormData({
      ...formData,
      features: [...formData.features, { name: "", included: true }],
    });
  };

  const updateFeature = (
    index: number,
    field: keyof Feature,
    value: string | boolean
  ): void => {
    const newFeatures = [...formData.features];
    newFeatures[index] = { ...newFeatures[index], [field]: value };
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number): void => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  return (
    <div className="flex-1 dots-bg min-h-screen">
      <Header
        title="Pricing Plans"
        subtitle="Create and manage your pricing plans"
      />

      <main className="p-6 space-y-6">
        {/* Stats Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Plans
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plans.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Award className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plans.filter((p) => p.popular).length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {plans.length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Billing</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isAnnual ? "Annual" : "Monthly"}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <RefreshCw className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Pricing Plans
              </CardTitle>
              <div className="flex items-center gap-2">
                {/* Billing Toggle */}
                <div className="inline-flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      !isAnnual
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                      isAnnual
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Annual
                    {isAnnual && (
                      <span className="ml-1 text-xs text-green-600 font-bold">
                        -20%
                      </span>
                    )}
                  </button>
                </div>
                <Button onClick={() => setShowForm(!showForm)}>
                  {showForm ? (
                    <>
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Create/Edit Form */}
            {showForm && (
              <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingPlan ? "Edit Plan" : "Create New Plan"}
                </h3>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Plan Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g., Professional"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Icon
                      </label>
                      <select
                        value={formData.icon}
                        onChange={(e) =>
                          setFormData({ ...formData, icon: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="Zap">⚡ Lightning</option>
                        <option value="Crown">👑 Crown</option>
                        <option value="Rocket">🚀 Rocket</option>
                        <option value="Star">⭐ Star</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        placeholder="Perfect for growing teams..."
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                      />
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Monthly Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.monthlyPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            monthlyPrice: e.target.value,
                          })
                        }
                        placeholder="29.99"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Annual Price ($)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.annualPrice}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            annualPrice: e.target.value,
                          })
                        }
                        placeholder="299.99"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Customization */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Badge Text
                      </label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) =>
                          setFormData({ ...formData, badge: e.target.value })
                        }
                        placeholder="Most Popular"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Border Color
                      </label>
                      <select
                        value={formData.color}
                        onChange={(e) =>
                          setFormData({ ...formData, color: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      >
                        <option value="border-gray-200">Default Gray</option>
                        <option value="border-blue-500">Blue</option>
                        <option value="border-purple-500">Purple</option>
                        <option value="border-green-500">Green</option>
                        <option value="border-pink-500">Pink</option>
                      </select>
                    </div>
                  </div>

                  {/* Permissions */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Channels
                      </label>
                      <input
                        type="text"
                        value={formData.permissions.channel}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              channel: e.target.value,
                            },
                          })
                        }
                        placeholder="5"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contacts
                      </label>
                      <input
                        type="text"
                        value={formData.permissions.contacts}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              contacts: e.target.value,
                            },
                          })
                        }
                        placeholder="10,000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Automation
                      </label>
                      <input
                        type="text"
                        value={formData.permissions.automation}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            permissions: {
                              ...formData.permissions,
                              automation: e.target.value,
                            },
                          })
                        }
                        placeholder="Advanced"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Popular Toggle */}
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.popular}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            popular: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Mark as Popular Plan
                      </span>
                    </label>
                  </div>

                  {/* Features */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Features
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addFeature}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Feature
                      </Button>
                    </div>

                    {formData.features.length === 0 ? (
                      <div className="text-center py-8 bg-white rounded-lg border-2 border-dashed border-gray-300">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">
                          No features added yet
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-white p-3 rounded-lg border border-gray-200"
                          >
                            <input
                              type="text"
                              value={feature.name}
                              onChange={(e) =>
                                updateFeature(index, "name", e.target.value)
                              }
                              placeholder="Feature name"
                              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm"
                            />
                            <label className="flex items-center gap-1.5 text-sm">
                              <input
                                type="checkbox"
                                checked={feature.included}
                                onChange={(e) =>
                                  updateFeature(
                                    index,
                                    "included",
                                    e.target.checked
                                  )
                                }
                                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                              />
                              Included
                            </label>
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      {editingPlan ? "Update Plan" : "Create Plan"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Plans Grid */}

            {(() => {
              if (loading) {
                return <Loading />;
              }

              if (plans.length === 0) {
                return (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No Plans Created Yet
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Get started by creating your first pricing plan
                    </p>
                    <Button onClick={() => setShowForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Plan
                    </Button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {plans.map((plan) => {
                    const IconComponent = iconMap[plan.icon] || Zap;
                    const isPopular = plan.popular;

                    return (
                      <div
                        key={plan.id}
                        className={`relative bg-white rounded-xl shadow-md border-2 ${
                          plan.color
                        } hover:shadow-lg transition-all duration-300 overflow-hidden ${
                          isPopular ? "ring-2 ring-blue-500 ring-offset-2" : ""
                        }`}
                      >
                        {/* Popular Badge */}
                        {plan.badge && (
                          <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                            {plan.badge}
                          </div>
                        )}

                        <div className="p-6">
                          {/* Icon */}
                          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>

                          {/* Plan Name */}
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {plan.name}
                          </h3>

                          {/* Description */}
                          <p className="text-sm text-gray-600 mb-4 min-h-[40px] line-clamp-2">
                            {plan.description}
                          </p>

                          {/* Price */}
                          <div className="mb-4">
                            <div className="flex items-baseline gap-1">
                              <span className="text-3xl font-black text-gray-900">
                                $
                                {isAnnual
                                  ? plan.annualPrice
                                  : plan.monthlyPrice}
                              </span>
                              <span className="text-sm text-gray-600 font-medium">
                                /{isAnnual ? "year" : "mo"}
                              </span>
                            </div>
                            {plan.permissions && (
                              <div className="mt-2 space-y-1">
                                <div className="text-xs text-gray-600">
                                  ✓ {plan.permissions.contacts} contacts
                                </div>
                                <div className="text-xs text-gray-600">
                                  ✓ {plan.permissions.channel} channels
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Features */}
                          <ul className="space-y-2 mb-6">
                            {plan.features &&
                              plan.features.slice(0, 4).map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2"
                                >
                                  {feature.included ? (
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                  ) : (
                                    <X className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                  )}
                                  <span
                                    className={`text-sm ${
                                      feature.included
                                        ? "text-gray-700"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {feature.name}
                                  </span>
                                </li>
                              ))}
                          </ul>

                          {/* CTA Button */}
                          <button
                            className={`w-full py-2.5 rounded-lg font-semibold text-white transition-all mb-3 ${plan.buttonColor}`}
                          >
                            {parseFloat(plan.monthlyPrice) === 0
                              ? "Get Started Free"
                              : "Start Free Trial"}
                          </button>

                          {/* Admin Actions */}
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(plan)}
                            >
                              <Edit className="w-3 h-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(plan.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
