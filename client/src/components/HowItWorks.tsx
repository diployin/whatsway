// import React, { useState, useEffect } from "react";
// import {
//   Link,
//   Upload,
//   MessageSquare,
//   BarChart3,
//   ArrowRight,
//   CheckCircle,
//   Play,
// } from "lucide-react";

// const HowItWorks = () => {
//   const [activeStep, setActiveStep] = useState(0);

//   const steps = [
//     {
//       icon: Link,
//       title: "Connect Your Meta API",
//       description:
//         "Bring your own WhatsApp Business API from Meta and connect it to our platform in seconds",
//       details: [
//         "Secure API integration",
//         "One-click setup process",
//         "No technical knowledge required",
//         "Full data ownership",
//       ],
//       color: "from-blue-500 to-blue-600",
//       bgColor: "bg-blue-50",
//     },
//     {
//       icon: Upload,
//       title: "Import Your Contacts",
//       description:
//         "Upload your customer database or sync directly from your CRM and existing tools",
//       details: [
//         "CSV/Excel import support",
//         "CRM integrations available",
//         "Smart duplicate detection",
//         "Automatic data validation",
//       ],
//       color: "from-green-500 to-green-600",
//       bgColor: "bg-green-50",
//     },
//     {
//       icon: MessageSquare,
//       title: "Create & Launch Campaigns",
//       description:
//         "Design beautiful messages with our drag-and-drop builder and launch targeted campaigns",
//       details: [
//         "Visual campaign builder",
//         "Pre-built templates",
//         "Personalization options",
//         "A/B testing capabilities",
//       ],
//       color: "from-purple-500 to-purple-600",
//       bgColor: "bg-purple-50",
//     },
//     {
//       icon: BarChart3,
//       title: "Track & Optimize",
//       description:
//         "Monitor performance in real-time and optimize your campaigns for better results",
//       details: [
//         "Real-time analytics",
//         "Delivery tracking",
//         "Engagement metrics",
//         "ROI calculations",
//       ],
//       color: "from-orange-500 to-orange-600",
//       bgColor: "bg-orange-50",
//     },
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setActiveStep((prev) => (prev + 1) % steps.length);
//     }, 4000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-16">
//           <div className="inline-flex items-center bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
//             <Play className="w-4 h-4 mr-2" />
//             Simple 4-Step Process
//           </div>
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
//             Get Started in
//             <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
//               Under 5 Minutes
//             </span>
//           </h2>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             Our streamlined onboarding process gets you up and running with
//             WhatsApp marketing faster than any other platform
//           </p>
//         </div>

//         {/* Progress Bar */}
//         <div className="mb-16">
//           <div className="flex justify-between items-center mb-4">
//             {steps.map((step, index) => (
//               <div
//                 key={index}
//                 className={`flex items-center space-x-2 cursor-pointer transition-all ${
//                   index <= activeStep ? "text-purple-600" : "text-gray-400"
//                 }`}
//                 onClick={() => setActiveStep(index)}
//               >
//                 <div
//                   className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
//                     index <= activeStep
//                       ? "bg-purple-600 text-white"
//                       : "bg-gray-200 text-gray-500"
//                   }`}
//                 >
//                   {index + 1}
//                 </div>
//                 <span className="hidden sm:block font-medium">
//                   {step.title}
//                 </span>
//               </div>
//             ))}
//           </div>
//           <div className="w-full bg-gray-200 rounded-full h-2">
//             <div
//               className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000"
//               style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
//             ></div>
//           </div>
//         </div>

//         {/* Step Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
//           <div className="space-y-8">
//             <div
//               className={`p-8 rounded-2xl ${steps[activeStep].bgColor} transition-all duration-500`}
//             >
//               <div className="flex items-center space-x-4 mb-6">
//                 <div
//                   className={`p-4 rounded-xl bg-gradient-to-r ${steps[activeStep].color} shadow-lg`}
//                 >
//                   {React.createElement(steps[activeStep].icon, {
//                     className: "w-8 h-8 text-white",
//                   })}
//                 </div>
//                 <div>
//                   <h3 className="text-2xl font-bold text-gray-900">
//                     {steps[activeStep].title}
//                   </h3>
//                   <p className="text-gray-600 mt-2">
//                     {steps[activeStep].description}
//                   </p>
//                 </div>
//               </div>

//               <div className="space-y-3">
//                 {steps[activeStep].details.map((detail, index) => (
//                   <div key={index} className="flex items-center space-x-3">
//                     <CheckCircle className="w-5 h-5 text-green-500" />
//                     <span className="text-gray-700">{detail}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="flex space-x-4">
//               <button
//                 onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
//                 disabled={activeStep === 0}
//                 className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//               >
//                 Previous
//               </button>
//               <button
//                 onClick={() =>
//                   setActiveStep(Math.min(steps.length - 1, activeStep + 1))
//                 }
//                 disabled={activeStep === steps.length - 1}
//                 className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center"
//               >
//                 Next Step
//                 <ArrowRight className="w-4 h-4 ml-2" />
//               </button>
//             </div>
//           </div>

//           {/* Visual Demo */}
//           <div className="relative">
//             <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-2xl">
//               <div className="flex items-center space-x-2 mb-4">
//                 <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//                 <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
//                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                 <span className="text-gray-400 text-sm ml-4">
//                   WhatsApp Business Dashboard
//                 </span>
//               </div>

//               <div className="bg-white rounded-lg p-6 min-h-[300px]">
//                 <div className="animate-pulse">
//                   {activeStep === 0 && (
//                     <div className="space-y-4">
//                       <div className="h-4 bg-blue-200 rounded w-3/4"></div>
//                       <div className="h-8 bg-blue-100 rounded"></div>
//                       <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//                     </div>
//                   )}
//                   {activeStep === 1 && (
//                     <div className="space-y-4">
//                       <div className="h-4 bg-green-200 rounded w-2/3"></div>
//                       <div className="grid grid-cols-3 gap-2">
//                         <div className="h-16 bg-green-100 rounded"></div>
//                         <div className="h-16 bg-green-100 rounded"></div>
//                         <div className="h-16 bg-green-100 rounded"></div>
//                       </div>
//                     </div>
//                   )}
//                   {activeStep === 2 && (
//                     <div className="space-y-4">
//                       <div className="h-4 bg-purple-200 rounded w-1/2"></div>
//                       <div className="h-20 bg-purple-100 rounded"></div>
//                       <div className="flex space-x-2">
//                         <div className="h-8 bg-purple-200 rounded flex-1"></div>
//                         <div className="h-8 bg-purple-500 rounded w-20"></div>
//                       </div>
//                     </div>
//                   )}
//                   {activeStep === 3 && (
//                     <div className="space-y-4">
//                       <div className="h-4 bg-orange-200 rounded w-3/5"></div>
//                       <div className="grid grid-cols-2 gap-4">
//                         <div className="h-24 bg-orange-100 rounded"></div>
//                         <div className="h-24 bg-orange-100 rounded"></div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* CTA Section */}
//         <div className="mt-16 text-center">
//           <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-8 rounded-2xl">
//             <h3 className="text-2xl font-bold text-gray-900 mb-4">
//               Ready to Get Started?
//             </h3>
//             <p className="text-gray-600 mb-6">
//               Join thousands of businesses already using our platform to scale
//               their WhatsApp marketing
//             </p>
//             <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg">
//               Start Your Free Trial
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default HowItWorks;

import React, { useState, useEffect } from "react";
import {
  Link,
  Upload,
  MessageSquare,
  BarChart3,
  ArrowRight,
  CheckCircle,
  Play,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useTranslation } from "@/lib/i18n";

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

          {/* Visual Demo */}
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

              <div className="bg-white rounded-lg p-6 min-h-[300px]">
                <div className="animate-pulse">
                  {activeStep === 0 && (
                    <div className="space-y-4">
                      <div className="h-4 bg-blue-200 rounded w-3/4"></div>
                      <div className="h-8 bg-blue-100 rounded"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  )}
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div className="h-4 bg-green-200 rounded w-2/3"></div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-16 bg-green-100 rounded"></div>
                        <div className="h-16 bg-green-100 rounded"></div>
                        <div className="h-16 bg-green-100 rounded"></div>
                      </div>
                    </div>
                  )}
                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div className="h-4 bg-purple-200 rounded w-1/2"></div>
                      <div className="h-20 bg-purple-100 rounded"></div>
                      <div className="flex space-x-2">
                        <div className="h-8 bg-purple-200 rounded flex-1"></div>
                        <div className="h-8 bg-purple-500 rounded w-20"></div>
                      </div>
                    </div>
                  )}
                  {activeStep === 3 && (
                    <div className="space-y-4">
                      <div className="h-4 bg-orange-200 rounded w-3/5"></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-orange-100 rounded"></div>
                        <div className="h-24 bg-orange-100 rounded"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
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
            <button className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg">
              {cta.startFreeTrial}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
