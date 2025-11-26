import React from "react";
import { ArrowRight, MessageCircle, Zap, Shield, Clock } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";

const CTA: React.FC = () => {
  const { t } = useTranslation();

  // Icons mapping (icons remain same across languages)
  const iconMap = {
    "Instant Setup": Zap,
    "Secure & Compliant": Shield,
    "24/7 Support": Clock,
    "Free Forever": MessageCircle,
  };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 via-green-500 to-blue-600 relative overflow-hidden">
      {/* Background Animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/5 rounded-full animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
            <MessageCircle className="w-4 h-4 mr-2" />
            {t("Landing.ctaSec.introTagline")}
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {t("Landing.ctaSec.headline")}
          </h2>

          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-12">
            {t("Landing.ctaSec.subHeadline")}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href="/contact"
              className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center group text-lg"
            >
              {t("Landing.ctaSec.buttons.startTrial")}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {t("Landing.ctaSec.trustIndicators", { returnObjects: true }).map(
              (item: any, index: number) => {
                const IconComponent =
                  iconMap[item.title as keyof typeof iconMap] || Zap;
                return (
                  <div key={`${item.title}-${index}`} className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl w-fit mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-sm">{item.desc}</p>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* Final Stats */}
        <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {t("Landing.ctaSec.stats", { returnObjects: true }).map(
              (stat: any, index: number) => (
                <div key={`${stat.label}-${index}`}>
                  <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {stat.number}
                  </div>
                  <div className="text-white/80 font-medium">{stat.label}</div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <style>{`
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
};

export default CTA;
