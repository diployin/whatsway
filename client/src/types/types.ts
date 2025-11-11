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
