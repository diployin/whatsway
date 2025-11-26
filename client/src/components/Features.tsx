// import React, { useState } from "react";
// import {
//   MessageSquare,
//   Workflow,
//   BarChart3,
//   Users,
//   Send,
//   Bot,
//   Calendar,
//   Target,
//   ArrowRight,
//   CheckCircle,
//   Smartphone,
//   Globe,
// } from "lucide-react";

// const Features = () => {
//   const [activeTab, setActiveTab] = useState(0);

//   const features = [
//     {
//       icon: MessageSquare,
//       title: "Bulk Messaging",
//       description:
//         "Send personalized messages to thousands of contacts instantly with smart delivery optimization",
//       color: "from-green-500 to-green-600",
//       demo: {
//         title: "Broadcast Campaign",
//         stats: "10,000 messages sent in 2 minutes",
//         features: [
//           "Personalized templates",
//           "Smart scheduling",
//           "Delivery optimization",
//         ],
//       },
//     },
//     {
//       icon: Workflow,
//       title: "Automation Workflows",
//       description:
//         "Create intelligent automated sequences that nurture leads and engage customers 24/7",
//       color: "from-blue-500 to-blue-600",
//       demo: {
//         title: "Welcome Sequence",
//         stats: "85% engagement rate",
//         features: [
//           "Trigger-based flows",
//           "Conditional logic",
//           "Multi-step journeys",
//         ],
//       },
//     },
//     {
//       icon: BarChart3,
//       title: "Advanced Analytics",
//       description:
//         "Track performance with real-time insights, delivery reports, and engagement metrics",
//       color: "from-purple-500 to-purple-600",
//       demo: {
//         title: "Campaign Analytics",
//         stats: "98% delivery rate",
//         features: ["Real-time tracking", "ROI analysis", "Custom reports"],
//       },
//     },
//     {
//       icon: Users,
//       title: "Contact Management",
//       description:
//         "Organize and segment your audience with smart tagging and advanced filtering",
//       color: "from-orange-500 to-orange-600",
//       demo: {
//         title: "Smart Segmentation",
//         stats: "50+ custom fields",
//         features: ["Auto-tagging", "Behavioral segments", "Import/Export"],
//       },
//     },
//     {
//       icon: Bot,
//       title: "AI Chatbots",
//       description:
//         "Deploy intelligent chatbots that handle customer queries and qualify leads automatically",
//       color: "from-indigo-500 to-indigo-600",
//       demo: {
//         title: "Customer Support Bot",
//         stats: "24/7 availability",
//         features: [
//           "Natural language",
//           "Lead qualification",
//           "Handoff to humans",
//         ],
//       },
//     },
//     {
//       icon: Calendar,
//       title: "Campaign Scheduler",
//       description:
//         "Plan and schedule campaigns across time zones with optimal delivery timing",
//       color: "from-pink-500 to-pink-600",
//       demo: {
//         title: "Global Campaigns",
//         stats: "Multi-timezone support",
//         features: ["Smart timing", "Recurring campaigns", "A/B testing"],
//       },
//     },
//   ];

//   return (
//     <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-16">
//           <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
//             <Smartphone className="w-4 h-4 mr-2" />
//             Powerful WhatsApp Marketing Features
//           </div>
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
//             Everything You Need to
//             <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
//               Scale Your Business
//             </span>
//           </h2>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             From bulk messaging to AI chatbots, our platform provides all the
//             tools you need to create successful WhatsApp marketing campaigns
//           </p>
//         </div>

//         <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 items-start">
//           {/* Feature Tabs */}
//           <div className="space-y-4">
//             {features.map((feature, index) => (
//               <div
//                 key={index}
//                 className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
//                   activeTab === index
//                     ? "bg-white shadow-xl ring-2 ring-green-500 transform scale-105"
//                     : "bg-white/50 hover:bg-white hover:shadow-lg"
//                 }`}
//                 onClick={() => setActiveTab(index)}
//               >
//                 <div className="flex items-start space-x-4">
//                   <div
//                     className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}
//                   >
//                     <feature.icon className="w-6 h-6 text-white" />
//                   </div>
//                   <div className="flex-1">
//                     <h3 className="text-xl font-bold text-gray-900 mb-2">
//                       {feature.title}
//                     </h3>
//                     <p className="text-gray-600 mb-4">{feature.description}</p>
//                     <div className="flex items-center text-green-600 font-semibold">
//                       <span className="text-sm">View Demo</span>
//                       <ArrowRight
//                         className={`w-4 h-4 ml-2 transition-transform ${
//                           activeTab === index ? "translate-x-1" : ""
//                         }`}
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Feature Demo */}
//           <div className="lg:sticky lg:top-8">
//             <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl">
//               <div className="flex items-center space-x-3 mb-6">
//                 <div className="w-3 h-3 bg-red-500 rounded-full"></div>
//                 <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
//                 <div className="w-3 h-3 bg-green-500 rounded-full"></div>
//                 <span className="text-gray-400 text-sm ml-4">
//                   WhatsApp Business API
//                 </span>
//               </div>

//               <div className="bg-white p-6 rounded-xl">
//                 <div className="flex items-center space-x-3 mb-6">
//                   <div
//                     className={`p-2 rounded-lg bg-gradient-to-r ${features[activeTab].color}`}
//                   >
//                     {React.createElement(features[activeTab].icon, {
//                       className: "w-5 h-5 text-white",
//                     })}
//                   </div>
//                   <div>
//                     <h4 className="font-bold text-gray-900">
//                       {features[activeTab].demo.title}
//                     </h4>
//                     <p className="text-sm text-gray-600">
//                       {features[activeTab].demo.stats}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="space-y-3">
//                   {features[activeTab].demo.features.map((item, index) => (
//                     <div key={index} className="flex items-center space-x-3">
//                       <CheckCircle className="w-5 h-5 text-green-500" />
//                       <span className="text-gray-700">{item}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-6 bg-gray-50 p-4 rounded-lg">
//                   <div className="flex items-center justify-between mb-2">
//                     <span className="text-sm text-gray-600">
//                       Campaign Progress
//                     </span>
//                     <span className="text-sm font-semibold text-gray-900">
//                       {Math.round((activeTab + 1) * 16.67)}%
//                     </span>
//                   </div>
//                   <div className="w-full bg-gray-200 rounded-full h-2">
//                     <div
//                       className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
//                       style={{ width: `${(activeTab + 1) * 16.67}%` }}
//                     ></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Additional Features Grid */}
//         <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
//           {[
//             {
//               icon: Globe,
//               title: "Multi-language Support",
//               desc: "Reach global audiences in their native language",
//             },
//             {
//               icon: Target,
//               title: "Smart Targeting",
//               desc: "Precision targeting based on behavior and demographics",
//             },
//             {
//               icon: Send,
//               title: "API Integration",
//               desc: "Seamless integration with your existing tools and CRM",
//             },
//           ].map((item, index) => (
//             <div
//               key={index}
//               className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
//             >
//               <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-lg w-fit mb-4">
//                 <item.icon className="w-6 h-6 text-green-600" />
//               </div>
//               <h3 className="text-lg font-bold text-gray-900 mb-2">
//                 {item.title}
//               </h3>
//               <p className="text-gray-600">{item.desc}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Features;

import React, { useState } from "react";
import {
  MessageSquare,
  Workflow,
  BarChart3,
  Users,
  Bot,
  Calendar,
  Globe,
  Target,
  Send,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Play,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const Features = () => {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

  const features = [
    {
      icon: MessageSquare,
      title: t("Landing.featuresSec.featureTabs.0.title"),
      description: t("Landing.featuresSec.featureTabs.0.description"),
      color: "from-green-500 to-green-600",
      demo: {
        title: t("Landing.featuresSec.featureTabs.0.demo.title"),
        stats: t("Landing.featuresSec.featureTabs.0.demo.stats"),
        features: (t as any)(
          "Landing.featuresSec.featureTabs.0.demo.features",
          { returnObjects: true }
        ),
      },
    },
    {
      icon: Workflow,
      title: t("Landing.featuresSec.featureTabs.1.title"),
      description: t("Landing.featuresSec.featureTabs.1.description"),
      color: "from-blue-500 to-blue-600",
      demo: {
        title: t("Landing.featuresSec.featureTabs.1.demo.title"),
        stats: t("Landing.featuresSec.featureTabs.1.demo.stats"),
        features: (t as any)(
          "Landing.featuresSec.featureTabs.1.demo.features",
          { returnObjects: true }
        ),
      },
    },
    {
      icon: BarChart3,
      title: t("Landing.featuresSec.featureTabs.2.title"),
      description: t("Landing.featuresSec.featureTabs.2.description"),
      color: "from-purple-500 to-purple-600",
      demo: {
        title: t("Landing.featuresSec.featureTabs.2.demo.title"),
        stats: t("Landing.featuresSec.featureTabs.2.demo.stats"),
        features: (t as any)(
          "Landing.featuresSec.featureTabs.2.demo.features",
          { returnObjects: true }
        ),
      },
    },
    {
      icon: Users,
      title: t("Landing.featuresSec.featureTabs.3.title"),
      description: t("Landing.featuresSec.featureTabs.3.description"),
      color: "from-orange-500 to-orange-600",
      demo: {
        title: t("Landing.featuresSec.featureTabs.3.demo.title"),
        stats: t("Landing.featuresSec.featureTabs.3.demo.stats"),
        features: (t as any)(
          "Landing.featuresSec.featureTabs.3.demo.features",
          { returnObjects: true }
        ),
      },
    },
    {
      icon: Bot,
      title: t("Landing.featuresSec.featureTabs.4.title"),
      description: t("Landing.featuresSec.featureTabs.4.description"),
      color: "from-indigo-500 to-indigo-600",
      demo: {
        title: t("Landing.featuresSec.featureTabs.4.demo.title"),
        stats: t("Landing.featuresSec.featureTabs.4.demo.stats"),
        features: (t as any)(
          "Landing.featuresSec.featureTabs.4.demo.features",
          { returnObjects: true }
        ),
      },
    },
    {
      icon: Calendar,
      title: t("Landing.featuresSec.featureTabs.5.title"),
      description: t("Landing.featuresSec.featureTabs.5.description"),
      color: "from-pink-500 to-pink-600",
      demo: {
        title: t("Landing.featuresSec.featureTabs.5.demo.title"),
        stats: t("Landing.featuresSec.featureTabs.5.demo.stats"),
        features: (t as any)(
          "Landing.featuresSec.featureTabs.5.demo.features",
          { returnObjects: true }
        ),
      },
    },
  ];

  const additionalFeatures = (t as any)(
    "Landing.featuresSec.additionalFeatures",
    {
      returnObjects: true,
    }
  );

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Smartphone className="w-4 h-4 mr-2" />
            {t("Landing.featuresSec.introTagline")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("Landing.featuresSec.headlinePre")}
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {t("Landing.featuresSec.headlineHighlight")}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("Landing.featuresSec.subHeadline")}
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Feature Tabs */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`p-6 rounded-2xl cursor-pointer transition-all duration-300 ${
                  activeTab === index
                    ? "bg-white shadow-xl ring-2 ring-green-500 transform scale-105"
                    : "bg-white/50 hover:bg-white hover:shadow-lg"
                }`}
                onClick={() => setActiveTab(index)}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-r ${feature.color} shadow-lg`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-4">{feature.description}</p>
                    <div className="flex items-center text-green-600 font-semibold">
                      {/* <span className="text-sm">
                        {t("Landing.featuresSec.demo")}
                      </span> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Demo */}
          <div className="lg:sticky lg:top-8">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl shadow-2xl">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-400 text-sm ml-4">
                  {t("Landing.featuresSec.whatsAppAPI")}
                </span>
              </div>

              <div className="bg-white p-6 rounded-xl">
                <div className="flex items-center space-x-3 mb-6">
                  <div
                    className={`p-2 rounded-lg bg-gradient-to-r ${features[activeTab].color}`}
                  >
                    {React.createElement(features[activeTab].icon, {
                      className: "w-5 h-5 text-white",
                    })}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {features[activeTab].demo.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {features[activeTab].demo.stats}
                    </p>
                  </div>
                </div>

                {/* <div className="space-y-3">
                  {features[activeTab].demo.features.map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div> */}

                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">
                      {t("Landing.featuresSec.campaign_progress")}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Math.round((activeTab + 1) * 16.67)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${(activeTab + 1) * 16.67}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Features Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {additionalFeatures.map(
            (item: { title: string; desc: string }, index: number) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="bg-gradient-to-r from-green-100 to-blue-100 p-3 rounded-lg w-fit mb-4">
                  {React.createElement([Globe, Target, Send][index], {
                    className: "w-6 h-6 text-green-600",
                  })}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Features;
