import { useState, useEffect, useRef } from "react";
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
  LogOut,
  User,
  Settings,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import LoadingAnimation from "./LoadingAnimation";
import { useAuth } from "@/contexts/auth-context";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showAboutMega, setShowAboutMega] = useState(false);
  const [showResourcesMega, setShowResourcesMega] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [getStartedLoading, setGetStartedLoading] = useState(false);
  const [, setLocation] = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [location] = useLocation(); // string
  const { isAuthenticated, user, logout } = useAuth();

  const username = (user?.firstName || "") + " " + (user?.lastName || "");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    closeMegaMenus();
  }, [location]);

  const aboutMenuItems = [
    {
      title: "About Us",
      path: "/about",
      description: "Learn about our mission and team",
      icon: Users,
      image:
        "https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      title: "Contact",
      path: "/contact",
      description: "Get in touch with our team",
      icon: Mail,
      image:
        "https://images.pexels.com/photos/4386466/pexels-photo-4386466.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      title: "Careers",
      path: "/careers",
      description: "Join our growing team",
      icon: Briefcase,
      image:
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      title: "Integrations",
      path: "/integrations",
      description: "Connect with 1000+ apps",
      icon: Zap,
      image:
        "https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
  ];

  const resourcesMenuItems = [
    {
      title: "Templates",
      path: "/templates",
      description: "Ready-to-use message templates",
      icon: FileText,
      image:
        "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      title: "Case Studies",
      path: "/case-studies",
      description: "Success stories from our clients",
      icon: TrendingUp,
      image:
        "https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      title: "WhatsApp Guide",
      path: "/whatsapp-guide",
      description: "Complete WhatsApp marketing guide",
      icon: BookOpen,
      image:
        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      title: "API Documentation",
      path: "/api-docs",
      description: "Developer resources and API docs",
      icon: Code,
      image:
        "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      title: "Best Practices",
      path: "/best-practices",
      description: "Tips for WhatsApp marketing success",
      icon: BookOpen,
      image:
        "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
    {
      title: "ROI Calculator",
      path: "/roi-calculator",
      description: "Calculate your WhatsApp marketing ROI",
      icon: Calculator,
      image:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop",
    },
  ];

  const handleLogin = () => {
    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
    }, 2000);
  };

  const handleGetStarted = () => {
    setGetStartedLoading(true);
    setTimeout(() => {
      setGetStartedLoading(false);
    }, 2000);
  };

  const closeMegaMenus = () => {
    setShowAboutMega(false);
    setShowResourcesMega(false);
  };

  const MegaMenu = ({
    items,
    isVisible,
  }: {
    items: typeof aboutMenuItems;
    isVisible: boolean;
    title: string;
  }) => (
    <div
      className={`fixed left-0 right-0 w-screen bg-white dark:bg-gray-900 shadow-2xl border-t border-gray-100 dark:border-gray-800 z-50 transition-all duration-300 ease-out max-h-[80vh] overflow-y-auto ${
        isVisible
          ? "opacity-100 translate-y-0 visible"
          : "opacity-0 -translate-y-4 invisible pointer-events-none"
      }`}
      style={{
        top: "56px",
      }}
    >
      <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <div
          className={`grid gap-3 sm:gap-4 md:gap-6 ${
            items.length === 4
              ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
              : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {items.map((item, index) => (
            <Link
              key={`${item.title}-${index}`}
              href={item.path}
              className="group bg-gray-50 dark:bg-gray-800 rounded-xl p-4 sm:p-5 md:p-6 hover:bg-white dark:hover:bg-gray-700 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              onClick={closeMegaMenus}
            >
              <div className="relative overflow-hidden rounded-lg mb-3 sm:mb-4">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-24 sm:h-28 md:h-32 object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                <div className="absolute bottom-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-lg">
                  <item.icon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white mb-1 sm:mb-2 group-hover:text-green-600 transition-colors text-sm sm:text-base">
                {item.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm leading-relaxed line-clamp-2">
                {item.description}
              </p>

              <div className="flex items-center mt-2 sm:mt-3 text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs sm:text-sm font-medium">
                  Learn more
                </span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700 hidden md:block">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-1 sm:mb-2">
                  Ready to get started?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Join thousands of businesses already growing with Whatsway
                </p>
              </div>
              <Link
                href="/signup"
                className="bg-green-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center group text-sm sm:text-base whitespace-nowrap"
                onClick={closeMegaMenus}
              >
                Start Free Trial
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg"
            : "bg-white dark:bg-gray-900"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-lg">
                <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Whatsway
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link
                href="/"
                className={`text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors font-medium text-sm xl:text-base ${
                  location === "/" ? "text-green-600 dark:text-green-500" : ""
                }`}
              >
                Home
              </Link>

              {/* About Mega Menu - FIXED VERSION */}
              <div
                className="relative group"
                onMouseEnter={() => setShowAboutMega(true)}
                onMouseLeave={() => setShowAboutMega(false)}
              >
                <button
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors font-medium cursor-pointer bg-transparent border-none text-sm xl:text-base "
                  aria-haspopup="true"
                  aria-expanded={showAboutMega}
                  type="button"
                >
                  About
                  <ChevronDown
                    className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                      showAboutMega ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Bridge div to close the gap */}
                <div
                  className="absolute left-0 right-0 h-4 top-full"
                  style={{ top: "100%" }}
                />

                <MegaMenu
                  items={aboutMenuItems}
                  isVisible={showAboutMega}
                  title="About"
                />
              </div>

              {/* Resources Mega Menu - FIXED VERSION */}
              <div
                className="relative group"
                onMouseEnter={() => setShowResourcesMega(true)}
                onMouseLeave={() => setShowResourcesMega(false)}
              >
                <button
                  className="flex items-center text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 transition-colors font-medium cursor-pointer bg-transparent border-none text-sm xl:text-base"
                  aria-haspopup="true"
                  aria-expanded={showResourcesMega}
                  type="button"
                >
                  Resources
                  <ChevronDown
                    className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                      showResourcesMega ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Bridge div to close the gap */}
                <div
                  className="absolute left-0 right-0 h-4 top-full"
                  style={{ top: "100%" }}
                />

                <MegaMenu
                  items={resourcesMenuItems}
                  isVisible={showResourcesMega}
                  title="Resources"
                />
              </div>

              {!isAuthenticated && (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105 shadow-lg flex items-center group text-sm"
                  >
                    Get Started Free{" "}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-green-600 transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  {/* User Profile */}
                  <div className="relative" ref={dropdownRef}>
                    <button
                      className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 hover:border-gray-400 transition-colors"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                          username
                        )}`}
                        alt="User Profile"
                        className="w-full h-full object-cover"
                      />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {/* User Name */}
                        <div className="px-4 py-2 border-b border-gray-100 text-gray-800 font-semibold">
                          {username}
                        </div>

                        <button
                          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setLocation("/settings");
                            setDropdownOpen(false);
                          }}
                        >
                          <Settings className="w-4 h-4 mr-2" /> Settings
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => {
                            setLocation("/account");
                            setDropdownOpen(false);
                          }}
                        >
                          <User className="w-4 h-4 mr-2" /> Accounts
                        </button>
                        <button
                          className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={logout}
                        >
                          <LogOut className="w-4 h-4 mr-2" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg fixed top-14 sm:top-16 left-0 right-0 z-30 max-h-[calc(100vh-3.5rem)] sm:max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/"
              className="block py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium text-sm sm:text-base"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>

            {/* Mobile About Section */}
            <div className="space-y-2">
              <div className="text-gray-900 dark:text-white font-semibold py-2 text-sm sm:text-base">
                About
              </div>
              {aboutMenuItems.map((item, index) => (
                <Link
                  key={`mobile-about-${index}`}
                  href={item.path}
                  className="flex items-center py-2 pl-4 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium text-sm sm:text-base gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4 text-green-600" />
                  {item.title}
                </Link>
              ))}
            </div>

            {/* Mobile Resources Section */}
            <div className="space-y-2">
              <div className="text-gray-900 dark:text-white font-semibold py-2 text-sm sm:text-base">
                Resources
              </div>
              {resourcesMenuItems.map((item, index) => (
                <Link
                  key={`mobile-resources-${index}`}
                  href={item.path}
                  className="flex items-center py-2 pl-4 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium text-sm sm:text-base gap-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4 text-green-600" />
                  {item.title}
                </Link>
              ))}
            </div>

            <Link
              href="/login"
              onClick={() => {
                setIsMenuOpen(false);
                handleLogin();
              }}
              className="block w-full text-left py-2 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 font-medium text-sm sm:text-base"
            >
              {loginLoading ? (
                <LoadingAnimation size="sm" color="green" />
              ) : (
                "Login"
              )}
            </Link>

            <Link
              href="/signup"
              onClick={() => {
                setIsMenuOpen(false);
                handleGetStarted();
              }}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 sm:py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all font-medium flex items-center justify-center text-sm sm:text-base"
            >
              {getStartedLoading ? (
                <LoadingAnimation size="sm" color="white" />
              ) : (
                <>
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Link>
          </div>
        </div>
      )}

      {/* Overlay for mega menus */}
      {(showAboutMega || showResourcesMega) && (
        <div
          className="fixed inset-0 bg-black/10 dark:bg-black/30 z-30"
          onClick={closeMegaMenus}
        />
      )}
    </>
  );
};

export default Header;
