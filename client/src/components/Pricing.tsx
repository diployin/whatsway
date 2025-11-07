import React, { useState } from "react";
import {
  Check,
  X,
  Zap,
  Crown,
  Rocket,
  Building,
  ArrowRight,
} from "lucide-react";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Starter",
      icon: Zap,
      price: { monthly: 0, annual: 0 },
      contacts: "1,000",
      description: "Perfect for small businesses getting started",
      features: [
        { name: "Up to 1,000 contacts", included: true },
        { name: "Basic message templates", included: true },
        { name: "Manual campaigns", included: true },
        { name: "Basic analytics", included: true },
        { name: "Email support", included: true },
        { name: "Automation workflows", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
      ],
      popular: false,
      color: "border-gray-200",
      buttonColor: "bg-gray-900 hover:bg-gray-800",
      badge: null,
    },
    {
      name: "Professional",
      icon: Crown,
      price: { monthly: 49, annual: 39 },
      contacts: "10,000",
      description: "Ideal for growing businesses",
      features: [
        { name: "Up to 10,000 contacts", included: true },
        { name: "Advanced templates", included: true },
        { name: "Automated campaigns", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
        { name: "Automation workflows", included: true },
        { name: "A/B testing", included: true },
        { name: "Custom integrations", included: false },
      ],
      popular: true,
      color: "border-blue-500 ring-2 ring-blue-200",
      buttonColor:
        "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      badge: "Most Popular",
    },
    {
      name: "Business",
      icon: Rocket,
      price: { monthly: 99, annual: 79 },
      contacts: "50,000",
      description: "For established businesses scaling up",
      features: [
        { name: "Up to 50,000 contacts", included: true },
        { name: "Custom templates", included: true },
        { name: "Advanced automation", included: true },
        { name: "Real-time analytics", included: true },
        { name: "Priority support", included: true },
        { name: "Chatbot integration", included: true },
        { name: "API access", included: true },
        { name: "White-label options", included: false },
      ],
      popular: false,
      color: "border-purple-200",
      buttonColor:
        "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      badge: null,
    },
    {
      name: "Enterprise",
      icon: Building,
      price: { monthly: 199, annual: 159 },
      contacts: "Unlimited",
      description: "For large organizations with custom needs",
      features: [
        { name: "Unlimited contacts", included: true },
        { name: "White-label solution", included: true },
        { name: "Custom integrations", included: true },
        { name: "Advanced automation", included: true },
        { name: "Dedicated support", included: true },
        { name: "Custom analytics", included: true },
        { name: "SLA guarantee", included: true },
        { name: "Custom onboarding", included: true },
      ],
      popular: false,
      color: "border-orange-200",
      buttonColor:
        "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700",
      badge: "Enterprise",
    },
  ];

  return (
    <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Crown className="w-4 h-4 mr-2" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Perfect Plan
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free and scale as you grow. All plans include your own Meta
            API integration and unlimited message sending.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span
              className={`font-medium ${
                !isAnnual ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                isAnnual ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                  isAnnual ? "translate-x-7" : "translate-x-1"
                }`}
              ></div>
            </button>
            <span
              className={`font-medium ${
                isAnnual ? "text-gray-900" : "text-gray-500"
              }`}
            >
              Annual
            </span>
            {isAnnual && (
              <span className="bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full font-medium">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-16 relative">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-white p-8 rounded-2xl shadow-lg border-2 ${
                plan.color
              } ${
                plan.popular ? "relative transform scale-105" : ""
              } hover:shadow-xl transition-all`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <div className="bg-gray-100 p-3 rounded-xl w-fit mx-auto mb-4">
                  <plan.icon className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

                <div className="flex items-baseline justify-center mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${isAnnual ? plan.price.annual : plan.price.monthly}
                  </span>
                  <span className="text-gray-600 ml-2">
                    /{isAnnual ? "year" : "month"}
                  </span>
                </div>

                <div className="text-gray-600 text-sm">
                  Up to {plan.contacts} contacts
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start space-x-3">
                    {feature.included ? (
                      <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <X className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        feature.included ? "text-gray-700" : "text-gray-400"
                      }`}
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                className={`w-full py-3 rounded-xl font-semibold transition-all transform hover:scale-105 ${plan.buttonColor} text-white`}
              >
                {plan.price.monthly === 0
                  ? "Get Started Free"
                  : "Start Free Trial"}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 p-8 rounded-2xl">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {[
              {
                q: "Do I need my own WhatsApp Business API?",
                a: "Yes, you need to bring your own Meta WhatsApp Business API. This ensures you have full control over your data and messaging.",
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees! You can start using our platform immediately after connecting your API.",
              },
              {
                q: "Can I change plans anytime?",
                a: "Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately.",
              },
              {
                q: "What happens if I exceed my contact limit?",
                a: "We'll notify you before you reach your limit. You can upgrade your plan or purchase additional contacts.",
              },
            ].map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 p-8 rounded-2xl text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Need a Custom Solution?
          </h3>
          <p className="text-gray-300 mb-6">
            Contact our enterprise team for custom pricing, dedicated support,
            and tailored features
          </p>
          <button className="bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all flex items-center mx-auto group">
            Contact Sales
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Pricing;
