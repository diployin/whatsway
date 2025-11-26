import React from "react";
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
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Header /> */}
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-green-600 via-green-500 to-blue-600 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-8">
            <MessageCircle className="w-4 h-4 mr-2" />
            About Whatsway
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Revolutionizing WhatsApp
            <span className="block">Marketing for Businesses</span>
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Empowering businesses worldwide with powerful, scalable WhatsApp
            marketing automation that drives real results
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
                Our Mission
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Making WhatsApp Marketing
                <span className="text-green-600"> Accessible to All</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                We believe every business, regardless of size, deserves access
                to powerful marketing tools. Our mission is to democratize
                WhatsApp marketing by providing an intuitive, affordable
                platform that delivers enterprise-level features.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                With Whatsway, businesses can connect with their customers on
                the world's most popular messaging platform, driving engagement,
                sales, and loyalty like never before.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    10K+
                  </div>
                  <div className="text-gray-600">Active Businesses</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    5M+
                  </div>
                  <div className="text-gray-600">Messages Delivered</div>
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
                      Trusted by Industry Leaders
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Join thousands of businesses already growing with Whatsway
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="flex -space-x-2">
                        <div className="w-10 h-10 rounded-full bg-green-500"></div>
                        <div className="w-10 h-10 rounded-full bg-blue-500"></div>
                        <div className="w-10 h-10 rounded-full bg-purple-500"></div>
                      </div>
                      <div className="text-sm text-gray-600">
                        +10,000 businesses
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
                      Our Journey
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            2023
                          </div>
                          <div className="text-sm text-gray-600">
                            Company Founded
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            2024
                          </div>
                          <div className="text-sm text-gray-600">
                            10K+ Active Users
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                          <Award className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">
                            2025
                          </div>
                          <div className="text-sm text-gray-600">
                            Industry Recognition
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Heart className="w-4 h-4 mr-2" />
                Our Story
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built by Marketers,
                <span className="text-green-600"> For Marketers</span>
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Whatsway was born from a simple frustration: existing WhatsApp
                marketing tools were either too expensive, too complicated, or
                lacked essential features. As marketers ourselves, we knew there
                had to be a better way.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                We started building Whatsway in 2023 with a clear vision: create
                the most powerful, user-friendly, and affordable WhatsApp
                marketing platform in the market. Today, we're proud to serve
                over 10,000 businesses worldwide.
              </p>
              <p className="text-lg text-gray-600 mb-8">
                Our team combines expertise in marketing automation, software
                development, and customer success to continuously innovate and
                deliver value to our users.
              </p>
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-4 rounded-xl">
                  <Globe className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    Global Presence
                  </div>
                  <div className="text-gray-600">
                    Supporting businesses in 50+ countries
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
                Our Values
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                What Drives Us
                <span className="text-green-600"> Every Day</span>
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-green-100 p-3 rounded-xl flex-shrink-0">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Customer First
                    </h3>
                    <p className="text-gray-600">
                      Every decision we make starts with our customers. Your
                      success is our success.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-xl flex-shrink-0">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Innovation
                    </h3>
                    <p className="text-gray-600">
                      We constantly push boundaries to deliver cutting-edge
                      features and capabilities.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-purple-100 p-3 rounded-xl flex-shrink-0">
                    <Shield className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Trust & Security
                    </h3>
                    <p className="text-gray-600">
                      Your data security and privacy are paramount. We maintain
                      enterprise-grade security standards.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-orange-100 p-3 rounded-xl flex-shrink-0">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      24/7 Support
                    </h3>
                    <p className="text-gray-600">
                      Our dedicated support team is always here to help you
                      succeed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-100 to-green-100 rounded-2xl p-8 h-[600px] flex items-center justify-center">
                <Shield className="w-64 h-64 text-purple-500 opacity-20" />
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className="space-y-4 w-full">
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-green-500 w-12 h-12 rounded-full flex items-center justify-center">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            98% Customer Satisfaction
                          </div>
                          <div className="text-sm text-gray-600">
                            Rated 4.9/5 stars
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-blue-500 w-12 h-12 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            300% Average ROI
                          </div>
                          <div className="text-sm text-gray-600">
                            For our customers
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="bg-purple-500 w-12 h-12 rounded-full flex items-center justify-center">
                          <Globe className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            50+ Countries
                          </div>
                          <div className="text-sm text-gray-600">
                            Global reach
                          </div>
                        </div>
                      </div>
                    </div>
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
            Ready to Transform Your
            <span className="block">WhatsApp Marketing?</span>
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of businesses already growing with Whatsway
          </p>
          <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl text-lg">
            Start Your Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
