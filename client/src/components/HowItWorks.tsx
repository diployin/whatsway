import React, { useState, useEffect } from "react";
import {
  Upload,
  MessageSquare,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Play,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "@/lib/i18n";

// Import your step images
import step1Image from "../images/Connect_Your_Meta_API.png";
import step2Image from "../images/Import_Your_Contacts.png";
import step3Image from "../images/create_lanch_campaigns.png";
import step4Image from "../images/Track_&_Optimize.png";
import { Link } from "wouter";

interface FeatureStep {
  icon: keyof typeof LucideIcons;
  title: string;
  description: string;
  details: string[];
  color: string;
  bgColor: string;
  demo?: {
    title?: string;
    stats?: string;
    features?: string[];
  };
}

const HowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const { t } = useTranslation();

  const steps: FeatureStep[] = (t as any)("Landing.howItWorksSec.steps", {
    returnObjects: true,
  });

  // Array of step images corresponding to each step
  const stepImages = [step1Image, step2Image, step3Image, step4Image];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [steps.length]);

  const progressBarLabels = (t as any)("Landing.howItWorksSec.progressBar", {
    returnObjects: true,
  }) as { previous: string; nextStep: string };

  const visualDemoLabel = t(
    "Landing.howItWorksSec.visualDemo.whatsAppBusinessDashboard"
  );

  const cta = (t as any)("Landing.howItWorksSec.cta", {
    returnObjects: true,
  }) as {
    readyToGetStarted: string;
    joinText: string;
    startFreeTrial: string;
  };

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Play className="w-4 h-4 mr-2" />
            {t("Landing.howItWorksSec.introTagline")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("Landing.howItWorksSec.headlinePre")}
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {t("Landing.howItWorksSec.headlineHighlight")}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("Landing.howItWorksSec.subHeadline")}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-16">
          <div className="flex justify-between items-center mb-4">
            {steps.map((step: FeatureStep, index: number) => (
              <div
                key={index}
                className={`flex items-center space-x-2 cursor-pointer transition-all ${
                  index <= activeStep ? "text-purple-600" : "text-gray-400"
                }`}
                onClick={() => setActiveStep(index)}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                    index <= activeStep
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index + 1}
                </div>
                <span className="hidden sm:block font-medium">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Step Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div
              className={`p-8 rounded-2xl ${steps[activeStep].bgColor} transition-all duration-500`}
            >
              <div className="flex items-center space-x-4 mb-6">
                <div
                  className={`p-4 rounded-xl bg-gradient-to-r ${steps[activeStep].color} shadow-lg`}
                >
                  {(() => {
                    const Icon = LucideIcons[
                      steps[activeStep].icon
                    ] as unknown as React.ComponentType<any>;
                    return Icon ? (
                      <Icon className="w-8 h-8 text-white" />
                    ) : null;
                  })()}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {steps[activeStep].title}
                  </h3>
                  <p className="text-gray-600 mt-2">
                    {steps[activeStep].description}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {steps[activeStep].details.map((detail, idx) => (
                  <div key={idx} className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-700">{detail}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {progressBarLabels.previous}
              </button>
              <button
                onClick={() =>
                  setActiveStep(Math.min(steps.length - 1, activeStep + 1))
                }
                disabled={activeStep === steps.length - 1}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
              >
                {progressBarLabels.nextStep}
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>

          {/* Visual Demo with Real Screenshots */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-4">
                  {visualDemoLabel}
                </span>
              </div>
              <div className="bg-white rounded-lg p-2 min-h-[250px] overflow-hidden">
                <img
                  src={stepImages[activeStep]}
                  alt={`Step ${activeStep + 1}: ${steps[activeStep].title}`}
                  className="w-full h-full object-cover rounded-lg transition-all duration-500 ease-in-out"
                  key={activeStep} // Force re-render on step change
                />
              </div>
            </div>

            {/* Optional: Add animation overlay */}
            <div className="absolute inset-0 pointer-events-none">
              <div
                className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${steps[activeStep].color} opacity-20 rounded-full blur-2xl transition-all duration-1000`}
              ></div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              {cta.readyToGetStarted}
            </h3>
            <p className="text-gray-600 mb-6">{cta.joinText}</p>
            <Link
              href="/contact"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg"
            >
              {cta.startFreeTrial}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
