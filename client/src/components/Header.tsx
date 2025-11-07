import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  MessageCircle,
  Menu,
  X,
  ArrowRight,
  ChevronDown,
  Users,
  Briefcase,
  Mail,
  Zap,
  BookOpen,
  Calculator,
  FileText,
  Code,
  TrendingUp,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LoadingAnimation from "./LoadingAnimation";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAboutMega, setShowAboutMega] = useState(false);
  const [showResourcesMega, setShowResourcesMega] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [getStartedLoading, setGetStartedLoading] = useState(false);
  const [location] = useLocation(); // string

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const aboutMenuItems = [
    { title: "About Us", path: "/about", description: "Learn about our mission and team", icon: Users, image: "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
    { title: "Contact", path: "/contact", description: "Get in touch with our team", icon: Mail, image: "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
    { title: "Careers", path: "/careers", description: "Join our growing team", icon: Briefcase, image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
    { title: "Integrations", path: "/integrations", description: "Connect with 1000+ apps", icon: Zap, image: "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
  ];

  const resourcesMenuItems = [
    { title: "Templates", path: "/templates", description: "Ready‑to‑use message templates", icon: FileText, image: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
    { title: "Case Studies", path: "/case‑studies", description: "Success stories from our clients", icon: TrendingUp, image: "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
    { title: "WhatsApp Guide", path: "/whatsapp-guide", description: "Complete WhatsApp marketing guide", icon: BookOpen, image: "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
    { title: "API Documentation", path: "/api-docs", description: "Developer resources and API docs", icon: Code, image: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
    { title: "Best Practices", path: "/best-practices", description: "Tips for WhatsApp marketing success", icon: BookOpen, image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
    { title: "ROI Calculator", path: "/roi‑calculator", description: "Calculate your WhatsApp marketing ROI", icon: Calculator, image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop" },
  ];

  const handleLogin = () => {
    setLoginLoading(true);
    setTimeout(() => setLoginLoading(false), 2000);
  };

  const handleGetStarted = () => {
    setGetStartedLoading(true);
    setTimeout(() => setGetStartedLoading(false), 2000);
  };

  const closeMegaMenus = () => {
    setShowAboutMega(false);
    setShowResourcesMega(false);
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${isScrolled ? "bg-white/95 backdrop-blur-lg shadow-lg" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl shadow-lg">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">Whatsway</span>
            </Link>

            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/" className={`text-gray-700 hover:text-green-600 transition-colors font-medium ${location === "/" ? "text-green-600" : ""}`}>
                Home
              </Link>

              {/* About trigger + menu */}
              <div
                   onMouseEnter={() => setShowAboutMega(true)}
                   onMouseLeave={() => setShowAboutMega(false)}>
                <button className="flex items-center text-gray-700 hover:text-green-600 transition-colors font-medium cursor-pointer">
                  About
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${showAboutMega ? "rotate-180" : ""}`} />
                </button>
                {showAboutMega && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white shadow-2xl border-t border-gray-100 z-50">
                    <div className="max-w-7xl mx-auto p-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                      {aboutMenuItems.map((item, idx) => (
                        <Link
                          key={idx}
                          to={item.path}
                          className="group bg-gray-50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          onClick={closeMegaMenus}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                          <div className="flex items-center mt-3 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm font-medium">Learn more</span>
                            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    {/* Featured Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              Ready to get started?
                            </h3>
                            <p className="text-gray-600">
                              Join thousands of businesses already growing with Whatsway
                            </p>
                          </div>
                          <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center group">
                            Start Free Trial
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Resources trigger + menu */}
              <div 
                   onMouseEnter={() => setShowResourcesMega(true)}
                   onMouseLeave={() => setShowResourcesMega(false)}>
                <button className="flex items-center text-gray-700 hover:text-green-600 transition-colors font-medium cursor-pointer">
                  Resources
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform duration-200 ${showResourcesMega ? "rotate-180" : ""}`} />
                </button>
                {showResourcesMega && (
                  <div className="absolute left-0 right-0 top-full mt-2 bg-white shadow-2xl border-t border-gray-100 z-50">
                    <div className="max-w-7xl mx-auto p-8 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      {resourcesMenuItems.map((item, idx) => (
                        <Link
                          key={idx}
                          to={item.path}
                          className="group bg-gray-50 rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                          onClick={closeMegaMenus}
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                          <h3 className="font-bold text-gray-900 mb-2 group-hover:text-green-600">{item.title}</h3>
                          <p className="text-gray-600 text-sm">{item.description}</p>
                          <div className="flex items-center mt-3 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-sm font-medium">Learn more</span>
                            <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </Link>
                      ))}
                    </div>
                     {/* Featured Section */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">
                              Ready to get started?
                            </h3>
                            <p className="text-gray-600">
                              Join thousands of businesses already growing with Whatsway
                            </p>
                          </div>
                          <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center group">
                            Start Free Trial
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/login" className="text-gray-700 hover:text-green-600 transition-colors font-medium">Login</Link>
              <Link to="/signup" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg flex items-center group text-sm">
                Get Started Free <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </nav>

            <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg">
            {/* Mobile menu items … */}
          </div>
        )}
      </header>

      {(showAboutMega || showResourcesMega) && (
        <button className="fixed inset-0 bg-black/10 z-30" onClick={closeMegaMenus} />
      )}
    </>
  );
};

export default Header;
