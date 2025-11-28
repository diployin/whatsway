import React, { useState } from "react";
import {
  ShoppingCart,
  GraduationCap,
  Heart,
  Building,
  Utensils,
  Car,
  ArrowRight,
  TrendingUp,
  Users,
  MessageCircle,
} from "lucide-react";
import { Link } from "wouter";
import { useTranslation } from "@/lib/i18n";

const UseCases = () => {
  const [activeUseCase, setActiveUseCase] = useState(0);
  const { t } = useTranslation();

  const useCases = [
    {
      icon: ShoppingCart,
      title: t("Landing.useCasesSec.useCases.0.title"),
      description: t("Landing.useCasesSec.useCases.0.description"),
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      stats: {
        increase: "300%",
        metric: t("Landing.useCasesSec.useCases.0.stats.metric"),
      },
      features: [
        t("Landing.useCasesSec.useCases.0.features.0"),
        t("Landing.useCasesSec.useCases.0.features.1"),
        t("Landing.useCasesSec.useCases.0.features.2"),
        t("Landing.useCasesSec.useCases.0.features.3"),
      ],
    },
    {
      icon: GraduationCap,
      title: t("Landing.useCasesSec.useCases.1.title"),
      description: t("Landing.useCasesSec.useCases.1.description"),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      stats: {
        increase: "85%",
        metric: t("Landing.useCasesSec.useCases.1.stats.metric"),
      },
      features: [
        t("Landing.useCasesSec.useCases.1.features.0"),
        t("Landing.useCasesSec.useCases.1.features.1"),
        t("Landing.useCasesSec.useCases.1.features.2"),
        t("Landing.useCasesSec.useCases.1.features.3"),
      ],
    },
    {
      icon: Heart,
      title: t("Landing.useCasesSec.useCases.2.title"),
      description: t("Landing.useCasesSec.useCases.2.description"),
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      stats: {
        increase: "60%",
        metric: t("Landing.useCasesSec.useCases.2.stats.metric"),
      },
      features: [
        t("Landing.useCasesSec.useCases.2.features.0"),
        t("Landing.useCasesSec.useCases.2.features.1"),
        t("Landing.useCasesSec.useCases.2.features.2"),
        t("Landing.useCasesSec.useCases.2.features.3"),
      ],
    },
    {
      icon: Building,
      title: t("Landing.useCasesSec.useCases.3.title"),
      description: t("Landing.useCasesSec.useCases.3.description"),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      stats: {
        increase: "45%",
        metric: t("Landing.useCasesSec.useCases.3.stats.metric"),
      },
      features: [
        t("Landing.useCasesSec.useCases.3.features.0"),
        t("Landing.useCasesSec.useCases.3.features.1"),
        t("Landing.useCasesSec.useCases.3.features.2"),
        t("Landing.useCasesSec.useCases.3.features.3"),
      ],
    },
    {
      icon: Utensils,
      title: t("Landing.useCasesSec.useCases.4.title"),
      description: t("Landing.useCasesSec.useCases.4.description"),
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      stats: {
        increase: "120%",
        metric: t("Landing.useCasesSec.useCases.4.stats.metric"),
      },
      features: [
        t("Landing.useCasesSec.useCases.4.features.0"),
        t("Landing.useCasesSec.useCases.4.features.1"),
        t("Landing.useCasesSec.useCases.4.features.2"),
        t("Landing.useCasesSec.useCases.4.features.3"),
      ],
    },
    {
      icon: Car,
      title: t("Landing.useCasesSec.useCases.5.title"),
      description: t("Landing.useCasesSec.useCases.5.description"),
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      stats: {
        increase: "75%",
        metric: t("Landing.useCasesSec.useCases.5.stats.metric"),
      },
      features: [
        t("Landing.useCasesSec.useCases.5.features.0"),
        t("Landing.useCasesSec.useCases.5.features.1"),
        t("Landing.useCasesSec.useCases.5.features.2"),
        t("Landing.useCasesSec.useCases.5.features.3"),
      ],
    },
  ];

  return (
    <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Building className="w-4 h-4 mr-2" />
            {t("Landing.useCasesSec.introTagline")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("Landing.useCasesSec.headlinePre")}{" "}
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t("Landing.useCasesSec.headlineHighlight")}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("Landing.useCasesSec.subHeadline")}
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {useCases.map((useCase, index) => (
            <button
              key={index}
              onClick={() => setActiveUseCase(index)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeUseCase === index
                  ? `bg-gradient-to-r ${useCase.color} text-white shadow-lg transform scale-105`
                  : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
              }`}
            >
              <useCase.icon className="w-5 h-5" />
              <span>{useCase.title}</span>
            </button>
          ))}
        </div>

        {/* Active Use Case Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div
            className={`p-8 rounded-2xl ${useCases[activeUseCase].bgColor} transition-all duration-500`}
          >
            <div className="flex items-center space-x-4 mb-6">
              <div
                className={`p-4 rounded-xl bg-gradient-to-r ${useCases[activeUseCase].color} shadow-lg`}
              >
                {React.createElement(useCases[activeUseCase].icon, {
                  className: "w-8 h-8 text-white",
                })}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {useCases[activeUseCase].title}
                </h3>
                <p className="text-gray-600 mt-1">
                  {useCases[activeUseCase].description}
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">
                  Success Metric
                  {/* {t("Landing.useCasesSec.successMetric")} */}
                </span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {useCases[activeUseCase].stats.increase}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 font-medium">
                {useCases[activeUseCase].stats.metric}
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">
                {t("Landing.useCasesSec.keyFeatures")}
              </h4>
              {useCases[activeUseCase].features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <Link
              href="/case-studies"
              className="inline-flex w-fit mt-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all items-center group"
            >
              {t("Landing.useCasesSec.cta.viewCaseStudyButton")}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Success Stories */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    Customer Success Story
                    {/* {t("Landing.useCasesSec.successStoryTitle")} */}
                  </h4>
                  <p className="text-gray-600 text-sm">
                    Real results from our platform
                    {/* {t("Landing.useCasesSec.successStorySubtitle")} */}
                  </p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                {String(t("Landing.useCasesSec.cta.customerSuccessQuote"))
                  .replace(
                    "{industry}",
                    useCases[activeUseCase].title.toLowerCase()
                  )
                  .replace(
                    "{increase}",
                    useCases[activeUseCase].stats.increase
                  )}
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src="https://plus.unsplash.com/premium_photo-1689977968861-9c91dbb16049?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <p className="font-semibold text-gray-900">
                    {t("Landing.useCasesSec.cta.testimonialName")}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {t("Landing.useCasesSec.cta.testimonialPosition")}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-gray-900">
                  {t("Landing.useCasesSec.quickStatsTitle")}
                </h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {t("Landing.useCasesSec.quickStats.0.value")}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {t("Landing.useCasesSec.quickStats.0.label")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {t("Landing.useCasesSec.quickStats.1.value")}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {t("Landing.useCasesSec.quickStats.1.label")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {t("Landing.useCasesSec.quickStats.2.value")}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {t("Landing.useCasesSec.quickStats.2.label")}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {t("Landing.useCasesSec.quickStats.3.value")}
                  </div>
                  <div className="text-gray-600 text-sm">
                    {t("Landing.useCasesSec.quickStats.3.label")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;
