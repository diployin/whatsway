import { aboutMenuItems } from "@/data/data";
import { useTranslation } from "@/lib/i18n";
import {
  FileText,
  TrendingUp,
  BookOpen,
  Code,
  Calculator,
  Briefcase,
  Mail,
  Users,
  Zap,
} from "lucide-react";
import React from "react";
import logo from "../images/logo1924.jpg";

const useStaticData = () => {
  const { t } = useTranslation();
  const staticData = {
    header: {
      resourcesMenuItems: [
        {
          title: t("Landing.header.resourcesMenuItems.0.title"),
          path: "/templates",
          description: t("Landing.header.resourcesMenuItems.0.description"),
          icon: FileText,
          image:
            "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
        },
        {
          title: t("Landing.header.resourcesMenuItems.1.title"),
          path: "/case-studies",
          description: t("Landing.header.resourcesMenuItems.0.description"),
          icon: TrendingUp,
          image:
            "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
        },
      ],
      aboutMenuItems: [
        {
          title: t("Landing.header.aboutMenuItems.0.title"),
          path: "/about",
          description: t("Landing.header.aboutMenuItems.0.description"),
          icon: Users,
          image:
            "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
        },
        {
          title: t("Landing.header.aboutMenuItems.1.title"),
          path: "/contact",
          description: t("Landing.header.aboutMenuItems.1.description"),
          icon: Mail,
          image:
            "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
        },
      ],
    },
    logo: logo,
  };

  return staticData;
};

export default useStaticData;
