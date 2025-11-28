import React from "react";
// import { useTranslation } from "react-i18next";
import {
  MessageCircle,
  Users,
  Target,
  Zap,
  Heart,
  Globe,
  Award,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";

const AboutUs: React.FC = () => {
  const { t } = useTranslation();

  // Get values and journey data
  const valuesList = t("aboutUs.values.list") as unknown as Array<{
    title: string;
    description: string;
  }>;

  const achievements = t("aboutUs.values.achievements") as unknown as Array<{
    title: string;
    subtitle: string;
  }>;

  const journeyMilestones = t(
    "aboutUs.story.journey.milestones"
  ) as unknown as Array<{
    year: string;
    label: string;
  }>;

  // Icon mapping for values
  const valueIcons = [Users, Zap, Shield, Clock];
  const valueColors = ["green", "blue", "purple", "orange"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-500 to-blue-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8">
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("aboutUs.hero.badge")}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("aboutUs.hero.title")}
            <span className="block">{t("aboutUs.hero.titleHighlight")}</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            {t("aboutUs.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Mission Section - Image Right */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Target className="w-4 h-4 mr-2" />
                {t("aboutUs.mission.badge")}
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {t("aboutUs.mission.title")}
                <span className="text-green-600">
                  {" "}
                  {t("aboutUs.mission.titleHighlight")}
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t("aboutUs.mission.description1")}
              </p>
              <p className="text-lg text-gray-600 mb-8">
                {t("aboutUs.mission.description2")}
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {t("aboutUs.mission.stats.businesses")}
                  </div>
                  <div className="text-gray-600">
                    {t("aboutUs.mission.stats.businessesLabel")}
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {t("aboutUs.mission.stats.messages")}
                  </div>
                  <div className="text-gray-600">
                    {t("aboutUs.mission.stats.messagesLabel")}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-8 h-[500px] flex items-center justify-center">
                <MessageCircle className="w-64 h-64 text-green-500 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {t("aboutUs.mission.card.title")}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {t("aboutUs.mission.card.description")}
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 rounded-full bg-green-500"></div>
                        <div className="w-10 h-10 rounded-full bg-blue-500"></div>
                        <div className="w-10 h-10 rounded-full bg-purple-500"></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {t("aboutUs.mission.card.count")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section - Image Left */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Image */}
            <div className="relative order-2 lg:order-1">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl p-8 h-[500px] flex items-center justify-center">
                <Users className="w-64 h-64 text-blue-500 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-sm">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      {t("aboutUs.story.journey.title")}
                    </h3>
                    <div className="space-y-4">
                      {journeyMilestones.map((milestone, index) => {
                        const icons = [Zap, TrendingUp, Award];
                        const Icon = icons[index];
                        const colors = ["green", "blue", "purple"];
                        const color = colors[index];

                        return (
                          <div
                            key={index}
                            className="flex items-start space-x-3"
                          >
                            <div className={`bg-${color}-100 p-2 rounded-lg`}>
                              <Icon className={`w-5 h-5 text-${color}-600`} />
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {milestone.year}
                              </div>
                              <div className="text-sm text-gray-600">
                                {milestone.label}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4 mr-2" />
                {t("aboutUs.story.badge")}
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {t("aboutUs.story.title")}
                <span className="text-green-600">
                  {" "}
                  {t("aboutUs.story.titleHighlight")}
                </span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t("aboutUs.story.description1")}
              </p>
              <p className="text-lg text-gray-600 mb-6">
                {t("aboutUs.story.description2")}
              </p>
              <p className="text-lg text-gray-600 mb-8">
                {t("aboutUs.story.description3")}
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-4 rounded-xl">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {t("aboutUs.story.globalPresence")}
                  </div>
                  <div className="text-gray-600">
                    {t("aboutUs.story.globalPresenceDesc")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Image Right */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4 mr-2" />
                {t("aboutUs.values.badge")}
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                {t("aboutUs.values.title")}
                <span className="text-green-600">
                  {" "}
                  {t("aboutUs.values.titleHighlight")}
                </span>
              </h2>
              <div className="space-y-6">
                {valuesList.map((value, index) => {
                  const Icon = valueIcons[index];
                  const color = valueColors[index];

                  return (
                    <div key={index} className="flex items-start space-x-4">
                      <div
                        className={`bg-${color}-100 p-3 rounded-xl flex-shrink-0`}
                      >
                        <Icon className={`w-6 h-6 text-${color}-600`} />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {value.title}
                        </h3>
                        <p className="text-gray-600">{value.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-green-100 rounded-2xl p-8 h-[600px] flex items-center justify-center">
                <Shield className="w-64 h-64 text-purple-500 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="space-y-4 w-full">
                    {achievements.map((achievement, index) => {
                      const icons = [Award, TrendingUp, Globe];
                      const Icon = icons[index];
                      const colors = ["green", "blue", "purple"];
                      const color = colors[index];

                      return (
                        <div
                          key={index}
                          className="bg-white p-6 rounded-xl shadow-lg"
                        >
                          <div className="flex items-center space-x-4 mb-4">
                            <div
                              className={`bg-${color}-500 w-12 h-12 rounded-full flex items-center justify-center`}
                            >
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900">
                                {achievement.title}
                              </div>
                              <div className="text-sm text-gray-600">
                                {achievement.subtitle}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 via-green-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {t("aboutUs.cta.title")}
            <span className="block">{t("aboutUs.cta.titleHighlight")}</span>
          </h2>
          <p className="text-xl text-white/90 mb-8">
            {t("aboutUs.cta.subtitle")}
          </p>
          <Link
            href="/contact"
            className="bg-white w-fit text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl text-lg"
          >
            {t("aboutUs.cta.button")}
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
