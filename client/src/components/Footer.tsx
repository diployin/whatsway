import React from "react";
import { Link } from "wouter";
import {
  MessageCircle,
  Twitter,
  Linkedin,
  Github,
  Mail,
  ArrowRight,
  MessageSquare,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useQuery } from "@tanstack/react-query";
import { AppSettings } from "@/types/types";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  const { data: brandSettings } = useQuery<AppSettings>({
    queryKey: ["/api/brand-settings"],
    queryFn: () => fetch("/api/brand-settings").then((res) => res.json()),
    staleTime: 5 * 60 * 1000,
  });

  // Get translated links
  const productLinks = t(
    "Landing.footerSec.links.product"
  ) as unknown as string[];
  const companyLinks = t(
    "Landing.footerSec.links.company"
  ) as unknown as string[];
  const supportLinks = t(
    "Landing.footerSec.links.support"
  ) as unknown as string[];
  const resourcesLinks = t(
    "Landing.footerSec.links.resources"
  ) as unknown as string[];
  const legalLinks = t("Landing.footerSec.links.legal") as unknown as string[];

  // Links structure with hrefs (hrefs remain same across languages)
  const links = {
    product: [
      { name: productLinks[0], href: "/#features" },
      { name: productLinks[1], href: "/#how-it-works" },
      { name: productLinks[2], href: "/#use-cases" },
    ],
    company: [
      { name: companyLinks[0], href: "/about" },
      { name: companyLinks[1], href: "/contact" },
      { name: companyLinks[2], href: "/careers" },
    ],
    support: [
      { name: supportLinks[0], href: "#" },
      { name: supportLinks[1], href: "#" },
      { name: supportLinks[2], href: "#" },
      { name: supportLinks[3], href: "#" },
    ],
    resources: [
      { name: resourcesLinks[1], href: "/case-studies" },
      { name: resourcesLinks[2], href: "/whatsapp-guide" },
      { name: resourcesLinks[3], href: "/best-practices" },
    ],
    legal: [
      { name: legalLinks[0], href: "/privacy-policy" },
      { name: legalLinks[1], href: "/terms" },
      { name: legalLinks[2], href: "/cookie-policy" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              {brandSettings?.logo2 ? (
                <img
                  src={brandSettings?.logo2}
                  alt="Logo"
                  className="h-12 object-contain"
                  style={{ filter: "brightness(0) invert(1)" }}
                />
              ) : (
                <div className="bg-green-800 text-primary-foreground rounded-full p-3">
                  <MessageSquare className="h-8 w-8" />
                </div>
              )}
              {/* <div>
                <h1 className="text-xl font-bold text-white">Whatsway</h1>
                <span className="text-xs mb-2">
                  Building amazing experiences
                </span>
              </div> */}
            </Link>
            <p className="text-gray-300 mt-2 mb-10 max-w-md ">
              {t("Landing.footerSec.brandSection.description")}
            </p>
            <div className="flex space-x-4">
              <a
                href="https://x.com"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                aria-label={t("Landing.footerSec.socialLinks.twitter")}
              >
                <Twitter className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              </a>
              <a
                href="https://linkedin.com/"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                aria-label={t("Landing.footerSec.socialLinks.linkedin")}
              >
                <Linkedin className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
              </a>
              <a
                href="https://github.com/"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                aria-label={t("Landing.footerSec.socialLinks.github")}
              >
                <Github className="w-5 h-5 group-hover:text-gray-300 transition-colors" />
              </a>
              <a
                href="https://mail.google.com"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                aria-label={t("Landing.footerSec.socialLinks.mail")}
              >
                <Mail className="w-5 h-5 group-hover:text-green-400 transition-colors" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {links.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {links.company.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {links.resources.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {links.legal.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link.name}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              {t("Landing.footerSec.bottomBar.copyrightText")}
            </p>
            <div className="flex items-center space-x-6 mt-4 sm:mt-0">
              <Link
                to="/terms"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {t("Landing.footerSec.bottomBar.termsLink")}
              </Link>
              <Link
                to="/privacy-policy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {t("Landing.footerSec.bottomBar.privacyLink")}
              </Link>
              <Link
                to="/cookie-policy"
                className="text-gray-400 hover:text-white text-sm transition-colors"
              >
                {t("Landing.footerSec.bottomBar.cookieLink")}
              </Link>
              {/* <ThemeToggle /> */}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
