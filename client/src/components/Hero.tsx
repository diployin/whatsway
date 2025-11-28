import { useEffect, useState } from "react";
import { ArrowRight, Play, Users, TrendingUp, Zap } from "lucide-react";
import LoadingAnimation from "./LoadingAnimation";
import { useTranslation } from "@/lib/i18n";
import { Link } from "wouter";

const Hero = () => {
  const [currentStat, setCurrentStat] = useState(0);
  const [animatedNumbers, setAnimatedNumbers] = useState({
    users: 0,
    delivery: 0,
    engagement: 0,
  });
  const { t } = useTranslation();
  const [startTrialLoading, setStartTrialLoading] = useState(false);

  const stats = [
    {
      icon: Users,
      value: 50000,
      label: t("Landing.heroSec.stats.0.label"),
      suffix: t("Landing.heroSec.stats.0.suffix"),
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      icon: TrendingUp,
      value: 98,
      label: t("Landing.heroSec.stats.1.label"),
      suffix: t("Landing.heroSec.stats.1.suffix"),
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      icon: Zap,
      value: 5,
      label: t("Landing.heroSec.stats.2.label"),
      suffix: t("Landing.heroSec.stats.2.suffix"),
      color: "text-purple-600",
      bg: "bg-purple-100",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStat((prev) => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const animateNumbers = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;

        setAnimatedNumbers({
          users: Math.floor(50000 * progress),
          delivery: Math.floor(98 * progress),
          engagement: Math.floor(5 * progress),
        });

        if (step >= steps) clearInterval(timer);
      }, stepDuration);
    };

    animateNumbers();
  }, []);

  const handleStartTrial = () => {
    setStartTrialLoading(true);
    // Simulate trial start process
    setTimeout(() => {
      setStartTrialLoading(false);
      // Add actual trial start logic here
    }, 2000);
  };
  return (
    <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-blue-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-8 animate-bounce">
            <Zap className="w-4 h-4 mr-2" />
            {t("Landing.heroSec.animatedBgGreenText")}
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            {t("Landing.heroSec.headline")}{" "}
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mt-2 pb-4">
              {t("Landing.heroSec.highlightText")}
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
            {t("Landing.heroSec.subHeadline")}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href="/contact"
              // onClick={handleStartTrial}
              // disabled={startTrialLoading}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-xl flex items-center group disabled:opacity-50 min-w-[180px] justify-center"
            >
              {startTrialLoading ? (
                <LoadingAnimation size="md" color="white" />
              ) : (
                <>
                  {t("Landing.heroSec.startTrialButton")}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Link>
            {/* <button className="flex items-center text-gray-700 hover:text-green-600 transition-colors group">
              <div className="bg-white p-3 rounded-full shadow-lg mr-3 group-hover:shadow-xl transition-shadow">
                <Play className="w-6 h-6 text-green-600" />
              </div>
              {t("Landing.heroSec.watchDemoButton")}
            </button> */}
          </div>

          {/* Animated Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`bg-white p-6 lg:p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 ${
                  currentStat === index ? "ring-2 ring-green-500 scale-105" : ""
                }`}
              >
                <div
                  className={`${stat.bg} p-3 lg:p-4 rounded-xl w-fit mx-auto mb-4`}
                >
                  <stat.icon
                    className={`w-6 h-6 lg:w-8 lg:h-8 ${stat.color}`}
                  />
                </div>
                <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  {index === 0
                    ? animatedNumbers.users.toLocaleString()
                    : index === 1
                    ? animatedNumbers.delivery
                    : animatedNumbers.engagement}
                  {stat.suffix || ""}
                  {index === 0 && "+"}
                </h3>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust indicators */}
        <div className="text-center">
          <p className="text-gray-500 mb-8 font-medium">
            {t("Landing.heroSec.trustedByText")}
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {["Shopify", "WooCommerce", "Salesforce", "HubSpot", "Zapier"].map(
              (brand, index) => (
                <div
                  key={index}
                  className="bg-gray-100 px-6 py-3 rounded-lg font-semibold text-gray-700"
                >
                  {brand}
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

export default Hero;
