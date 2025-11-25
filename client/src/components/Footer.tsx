// // import React from "react";
// // import { Link } from "wouter";
// // import {
// //   MessageCircle,
// //   Twitter,
// //   Linkedin,
// //   Github,
// //   Mail,
// //   ArrowRight,
// // } from "lucide-react";
// // import ThemeToggle from "./ThemeToggle";

// // const Footer = () => {
// //   const links = {
// //     product: [
// //       { name: "Features", href: "/#features" },
// //       { name: "How it Works", href: "/#how-it-works" },
// //       { name: "Use Cases", href: "/#use-cases" },
// //       { name: "Pricing", href: "/#pricing" },
// //       { name: "API Documentation", href: "/api-docs" },
// //     ],
// //     company: [
// //       { name: "About Us", href: "/about" },
// //       { name: "Contact", href: "/contact" },
// //       { name: "Careers", href: "/careers" },
// //       { name: "Press Kit", href: "/press-kit" },
// //       { name: "Integrations", href: "/integrations" },
// //     ],
// //     support: [
// //       { name: "Help Center", href: "#" },
// //       { name: "Community", href: "#" },
// //       { name: "Status", href: "#" },
// //       { name: "Security", href: "#" },
// //     ],
// //     resources: [
// //       { name: "Templates", href: "/templates" },
// //       { name: "Case Studies", href: "/case-studies" },
// //       { name: "WhatsApp Guide", href: "/whatsapp-guide" },
// //       { name: "Best Practices", href: "/best-practices" },
// //       { name: "ROI Calculator", href: "/roi-calculator" },
// //     ],
// //     legal: [
// //       { name: "Privacy Policy", href: "/privacy-policy" },
// //       { name: "Terms of Service", href: "/terms-of-service" },
// //       { name: "Cookie Policy", href: "/cookie-policy" },
// //       { name: "GDPR", href: "#" },
// //     ],
// //   };

// //   return (
// //     <footer className="bg-gray-900 text-white">
// //       {/* Newsletter Section */}
// //       <div className="border-b border-gray-800">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
// //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
// //             <div>
// //               <h3 className="text-2xl font-bold mb-4">
// //                 Stay Updated with WhatsApp Marketing Tips
// //               </h3>
// //               <p className="text-gray-300">
// //                 Get the latest strategies, case studies, and platform updates
// //                 delivered to your inbox.
// //               </p>
// //             </div>
// //             <div className="flex flex-col sm:flex-row gap-4">
// //               <input
// //                 type="email"
// //                 name="subscriptEmail"
// //                 id="subscriptEmail"
// //                 placeholder="Enter your email address"
// //                 className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
// //               />
// //               <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center group">
// //                 Subscribe
// //                 <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
// //               </button>
// //             </div>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Main Footer Content */}
// //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
// //           {/* Brand Section */}
// //           <div className="lg:col-span-2">
// //             <Link to="/" className="flex items-center space-x-3 mb-6">
// //               <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
// //                 <MessageCircle className="w-6 h-6 text-white" />
// //               </div>
// //               <span className="text-xl font-bold">WPSaaS</span>
// //               <span className="text-xl font-bold">Whatsway</span>
// //             </Link>
// //             <p className="text-gray-300 mb-6 max-w-md">
// //               The most powerful WhatsApp marketing platform. Scale your business
// //               with automated campaigns, advanced analytics, and seamless API
// //               integration.
// //             </p>
// //             <div className="flex space-x-4">
// //               <a
// //                 href="#"
// //                 className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
// //               >
// //                 <Twitter className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
// //               </a>
// //               <a
// //                 href="#"
// //                 className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
// //               >
// //                 <Linkedin className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
// //               </a>
// //               <a
// //                 href="#"
// //                 className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
// //               >
// //                 <Github className="w-5 h-5 group-hover:text-gray-300 transition-colors" />
// //               </a>
// //               <a
// //                 href="#"
// //                 className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
// //               >
// //                 <Mail className="w-5 h-5 group-hover:text-green-400 transition-colors" />
// //               </a>
// //             </div>
// //           </div>

// //           {/* Links Sections */}
// //           <div>
// //             <h3 className="text-lg font-semibold mb-4">Product</h3>
// //             <ul className="space-y-3">
// //               {links.product.map((link, index) => (
// //                 <li key={index}>
// //                   <a
// //                     href={link.href}
// //                     className="text-gray-300 hover:text-white transition-colors"
// //                   >
// //                     {link.name}
// //                   </a>
// //                 </li>
// //               ))}
// //             </ul>
// //           </div>

// //           <div>
// //             <h3 className="text-lg font-semibold mb-4">Company</h3>
// //             <ul className="space-y-3">
// //               {links.company.map((link, index) => (
// //                 <li key={index}>
// //                   {link.href.startsWith("/") ? (
// //                     <Link
// //                       to={link.href}
// //                       className="text-gray-300 hover:text-white transition-colors"
// //                     >
// //                       {link.name}
// //                     </Link>
// //                   ) : (
// //                     <a
// //                       href={link.href}
// //                       className="text-gray-300 hover:text-white transition-colors"
// //                     >
// //                       {link.name}
// //                     </a>
// //                   )}
// //                 </li>
// //               ))}
// //             </ul>
// //           </div>

// //           <div>
// //             <h3 className="text-lg font-semibold mb-4">Resources</h3>
// //             <ul className="space-y-3">
// //               {links.resources.map((link, index) => (
// //                 <li key={index}>
// //                   {link.href.startsWith("/") ? (
// //                     <Link
// //                       to={link.href}
// //                       className="text-gray-300 hover:text-white transition-colors"
// //                     >
// //                       {link.name}
// //                     </Link>
// //                   ) : (
// //                     <a
// //                       href={link.href}
// //                       className="text-gray-300 hover:text-white transition-colors"
// //                     >
// //                       {link.name}
// //                     </a>
// //                   )}
// //                 </li>
// //               ))}
// //             </ul>
// //           </div>

// //           <div>
// //             <h3 className="text-lg font-semibold mb-4">Legal</h3>
// //             <ul className="space-y-3">
// //               {links.legal.map((link, index) => (
// //                 <li key={index}>
// //                   {link.href.startsWith("/") ? (
// //                     <Link
// //                       to={link.href}
// //                       className="text-gray-300 hover:text-white transition-colors"
// //                     >
// //                       {link.name}
// //                     </Link>
// //                   ) : (
// //                     <a
// //                       href={link.href}
// //                       className="text-gray-300 hover:text-white transition-colors"
// //                     >
// //                       {link.name}
// //                     </a>
// //                   )}
// //                 </li>
// //               ))}
// //             </ul>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Bottom Bar */}
// //       <div className="border-t border-gray-800">
// //         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
// //           <div className="flex flex-col sm:flex-row justify-between items-center">
// //             <p className="text-gray-400 text-sm">
// //               © 2025 Whatsway. All rights reserved.
// //             </p>
// //             <div className="flex items-center space-x-6 mt-4 sm:mt-0">
// //               <Link
// //                 to="/terms-of-service"
// //                 className="text-gray-400 hover:text-white text-sm transition-colors"
// //               >
// //                 Terms of Service
// //               </Link>
// //               <Link
// //                 to="/privacy-policy"
// //                 className="text-gray-400 hover:text-white text-sm transition-colors"
// //               >
// //                 Privacy Policy
// //               </Link>
// //               <Link
// //                 to="/cookie-policy"
// //                 className="text-gray-400 hover:text-white text-sm transition-colors"
// //               >
// //                 Cookie Policy
// //               </Link>
// //               <ThemeToggle />
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </footer>
// //   );
// // };

// // export default Footer;

// import React from "react";
// import { Link } from "wouter";
// import {
//   MessageCircle,
//   Twitter,
//   Linkedin,
//   Github,
//   Mail,
//   ArrowRight,
// } from "lucide-react";
// import ThemeToggle from "./ThemeToggle";

// const links = {
//   product: [
//     { name: "Features", href: "/#features" },
//     { name: "How it Works", href: "/#how-it-works" },
//     { name: "Use Cases", href: "/#use-cases" },
//     { name: "Pricing", href: "/#pricing" },
//     { name: "API Documentation", href: "/api-docs" },
//   ],
//   company: [
//     { name: "About Us", href: "/about" },
//     { name: "Contact", href: "/contact" },
//     { name: "Careers", href: "/careers" },
//     { name: "Press Kit", href: "/press-kit" },
//     { name: "Integrations", href: "/integrations" },
//   ],
//   support: [
//     { name: "Help Center", href: "#" },
//     { name: "Community", href: "#" },
//     { name: "Status", href: "#" },
//     { name: "Security", href: "#" },
//   ],
//   resources: [
//     { name: "Templates", href: "/templates" },
//     { name: "Case Studies", href: "/case-studies" },
//     { name: "WhatsApp Guide", href: "/whatsapp-guide" },
//     { name: "Best Practices", href: "/best-practices" },
//     { name: "ROI Calculator", href: "/roi-calculator" },
//   ],
//   legal: [
//     { name: "Privacy Policy", href: "/privacy-policy" },
//     { name: "Terms of Service", href: "/terms-of-service" },
//     { name: "Cookie Policy", href: "/cookie-policy" },
//     { name: "GDPR", href: "#" },
//   ],
// };

// const Footer = () => {
//   return (
//     <footer className="bg-gray-900 text-white">
//       {/* Newsletter Section */}
//       <div className="border-b border-gray-800">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
//             <div>
//               <h3 className="text-2xl font-bold mb-4">
//                 Stay Updated with WhatsApp Marketing Tips
//               </h3>
//               <p className="text-gray-300">
//                 Get the latest strategies, case studies, and platform updates
//                 delivered to your inbox.
//               </p>
//             </div>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <input
//                 type="email"
//                 name="subscriptEmail"
//                 id="subscriptEmail"
//                 placeholder="Enter your email address"
//                 className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
//               />
//               <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center group">
//                 Subscribe
//                 <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Main Footer Content */}
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
//           {/* Brand Section */}
//           <div className="lg:col-span-2">
//             <Link to="/" className="flex items-center space-x-3 mb-6">
//               <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
//                 <MessageCircle className="w-6 h-6 text-white" />
//               </div>
//               <span className="text-xl font-bold">WPSaaS</span>
//               <span className="text-xl font-bold">Whatsway</span>
//             </Link>
//             <p className="text-gray-300 mb-6 max-w-md">
//               The most powerful WhatsApp marketing platform. Scale your business
//               with automated campaigns, advanced analytics, and seamless API
//               integration.
//             </p>
//             <div className="flex space-x-4">
//               <a
//                 href="#"
//                 className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
//                 aria-label="Twitter"
//               >
//                 <Twitter className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
//               </a>
//               <a
//                 href="#"
//                 className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
//                 aria-label="LinkedIn"
//               >
//                 <Linkedin className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
//               </a>
//               <a
//                 href="#"
//                 className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
//                 aria-label="GitHub"
//               >
//                 <Github className="w-5 h-5 group-hover:text-gray-300 transition-colors" />
//               </a>
//               <a
//                 href="#"
//                 className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
//                 aria-label="Mail"
//               >
//                 <Mail className="w-5 h-5 group-hover:text-green-400 transition-colors" />
//               </a>
//             </div>
//           </div>

//           {/* Links Sections */}
//           <div>
//             <h3 className="text-lg font-semibold mb-4">Product</h3>
//             <ul className="space-y-3">
//               {links.product.map((link, index) => (
//                 <li key={index}>
//                   <a
//                     href={link.href}
//                     className="text-gray-300 hover:text-white transition-colors"
//                   >
//                     {link.name}
//                   </a>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h3 className="text-lg font-semibold mb-4">Company</h3>
//             <ul className="space-y-3">
//               {links.company.map((link, index) => (
//                 <li key={index}>
//                   {link.href.startsWith("/") ? (
//                     <Link
//                       to={link.href}
//                       className="text-gray-300 hover:text-white transition-colors"
//                     >
//                       {link.name}
//                     </Link>
//                   ) : (
//                     <a
//                       href={link.href}
//                       className="text-gray-300 hover:text-white transition-colors"
//                     >
//                       {link.name}
//                     </a>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h3 className="text-lg font-semibold mb-4">Resources</h3>
//             <ul className="space-y-3">
//               {links.resources.map((link, index) => (
//                 <li key={index}>
//                   {link.href.startsWith("/") ? (
//                     <Link
//                       to={link.href}
//                       className="text-gray-300 hover:text-white transition-colors"
//                     >
//                       {link.name}
//                     </Link>
//                   ) : (
//                     <a
//                       href={link.href}
//                       className="text-gray-300 hover:text-white transition-colors"
//                     >
//                       {link.name}
//                     </a>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           <div>
//             <h3 className="text-lg font-semibold mb-4">Legal</h3>
//             <ul className="space-y-3">
//               {links.legal.map((link, index) => (
//                 <li key={index}>
//                   {link.href.startsWith("/") ? (
//                     <Link
//                       to={link.href}
//                       className="text-gray-300 hover:text-white transition-colors"
//                     >
//                       {link.name}
//                     </Link>
//                   ) : (
//                     <a
//                       href={link.href}
//                       className="text-gray-300 hover:text-white transition-colors"
//                     >
//                       {link.name}
//                     </a>
//                   )}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         </div>
//       </div>

//       {/* Bottom Bar */}
//       <div className="border-t border-gray-800">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//           <div className="flex flex-col sm:flex-row justify-between items-center">
//             <p className="text-gray-400 text-sm">
//               © 2025 Whatsway. All rights reserved.
//             </p>
//             <div className="flex items-center space-x-6 mt-4 sm:mt-0">
//               <Link
//                 to="/terms-of-service"
//                 className="text-gray-400 hover:text-white text-sm transition-colors"
//               >
//                 Terms of Service
//               </Link>
//               <Link
//                 to="/privacy-policy"
//                 className="text-gray-400 hover:text-white text-sm transition-colors"
//               >
//                 Privacy Policy
//               </Link>
//               <Link
//                 to="/cookie-policy"
//                 className="text-gray-400 hover:text-white text-sm transition-colors"
//               >
//                 Cookie Policy
//               </Link>
//               <ThemeToggle />
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// };

// export default Footer;

import React from "react";
import { Link } from "wouter";
import {
  MessageCircle,
  Twitter,
  Linkedin,
  Github,
  Mail,
  ArrowRight,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useTranslation } from "@/lib/i18n";

const Footer: React.FC = () => {
  const { t } = useTranslation();

  // Get links from translation with proper typing
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
      { name: productLinks[3], href: "/#pricing" },
      { name: productLinks[4], href: "/api-docs" },
    ],
    company: [
      { name: companyLinks[0], href: "/about" },
      { name: companyLinks[1], href: "/contact" },
      { name: companyLinks[2], href: "/careers" },
      { name: companyLinks[3], href: "/press-kit" },
      { name: companyLinks[4], href: "/integrations" },
    ],
    support: [
      { name: supportLinks[0], href: "#" },
      { name: supportLinks[1], href: "#" },
      { name: supportLinks[2], href: "#" },
      { name: supportLinks[3], href: "#" },
    ],
    resources: [
      { name: resourcesLinks[0], href: "/templates" },
      { name: resourcesLinks[1], href: "/case-studies" },
      { name: resourcesLinks[2], href: "/whatsapp-guide" },
      { name: resourcesLinks[3], href: "/best-practices" },
      { name: resourcesLinks[4], href: "/roi-calculator" },
    ],
    legal: [
      { name: legalLinks[0], href: "/privacy-policy" },
      { name: legalLinks[1], href: "/terms-of-service" },
      { name: legalLinks[2], href: "/cookie-policy" },
      { name: legalLinks[3], href: "#" },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl font-bold mb-4">
                {t("Landing.footerSec.newsletter.heading")}
              </h3>
              <p className="text-gray-300">
                {t("Landing.footerSec.newsletter.description")}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                name="subscriptEmail"
                id="subscriptEmail"
                placeholder={t("Landing.footerSec.newsletter.emailPlaceholder")}
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center group">
                {t("Landing.footerSec.newsletter.subscribeButton")}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-2 rounded-xl">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">
                {t("Landing.footerSec.brandSection.brandNames.0")}
              </span>
              <span className="text-xl font-bold">
                {t("Landing.footerSec.brandSection.brandNames.1")}
              </span>
            </Link>
            <p className="text-gray-300 mb-6 max-w-md">
              {t("Landing.footerSec.brandSection.description")}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                aria-label={t("Landing.footerSec.socialLinks.twitter")}
              >
                <Twitter className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                aria-label={t("Landing.footerSec.socialLinks.linkedin")}
              >
                <Linkedin className="w-5 h-5 group-hover:text-blue-500 transition-colors" />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors group"
                aria-label={t("Landing.footerSec.socialLinks.github")}
              >
                <Github className="w-5 h-5 group-hover:text-gray-300 transition-colors" />
              </a>
              <a
                href="#"
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
                to="/terms-of-service"
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
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
