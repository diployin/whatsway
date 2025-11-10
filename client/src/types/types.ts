export interface PlanPermissions {
  channel: string;
  contacts: string;
  automation: string;
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
  features: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlansDataTyps {
  success: boolean;
  data: Plan[];
}
