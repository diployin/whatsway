import React from "react";
import PolicyLayout, { PolicySection } from "./PolicyLayout";
// import PolicyLayout, { PolicySection } from '../components/PolicyLayout';

const CookiePolicy = () => {
  return (
    <PolicyLayout title="Cookie Policy" lastUpdated="January 15, 2025">
      <PolicySection title="What Are Cookies">
        <p>
          Cookies are small text files that are stored on your device when you
          visit our website. They help us provide you with a better experience
          by remembering your preferences and understanding how you use our
          service.
        </p>
        <p>
          This Cookie Policy explains what cookies are, how we use them, the
          types of cookies we use, and how you can control your cookie
          preferences.
        </p>
      </PolicySection>

      <PolicySection title="How We Use Cookies">
        <p>We use cookies for several purposes:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To ensure our website functions properly</li>
          <li>To remember your login status and preferences</li>
          <li>To analyze website traffic and usage patterns</li>
          <li>To improve our services and user experience</li>
          <li>To provide personalized content and features</li>
          <li>To measure the effectiveness of our marketing campaigns</li>
        </ul>
      </PolicySection>

      <PolicySection title="Types of Cookies We Use">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Essential Cookies
            </h3>
            <p>
              These cookies are necessary for the website to function properly.
              They enable core functionality such as security, network
              management, and accessibility. You cannot opt out of these
              cookies.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p>
                <strong>Examples:</strong> Session cookies, authentication
                cookies, load balancing cookies
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Performance Cookies
            </h3>
            <p>
              These cookies collect information about how visitors use our
              website, such as which pages are visited most often and if users
              get error messages. This helps us improve our website's
              performance.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p>
                <strong>Examples:</strong> Google Analytics, page load time
                tracking, error reporting
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Functional Cookies
            </h3>
            <p>
              These cookies allow the website to remember choices you make and
              provide enhanced, more personal features. They may be set by us or
              by third-party providers whose services we have added to our
              pages.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p>
                <strong>Examples:</strong> Language preferences, theme settings,
                form data
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Marketing Cookies
            </h3>
            <p>
              These cookies are used to track visitors across websites to
              display relevant advertisements and measure the effectiveness of
              marketing campaigns.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-3">
              <p>
                <strong>Examples:</strong> Facebook Pixel, Google Ads,
                retargeting cookies
              </p>
            </div>
          </div>
        </div>
      </PolicySection>

      <PolicySection title="Third-Party Cookies">
        <p>
          We may use third-party services that set cookies on your device. These
          services include:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Google Analytics:</strong> For website analytics and
            performance monitoring
          </li>
          <li>
            <strong>Intercom:</strong> For customer support and live chat
            functionality
          </li>
          <li>
            <strong>Stripe:</strong> For payment processing and fraud prevention
          </li>
          <li>
            <strong>Facebook:</strong> For social media integration and
            advertising
          </li>
        </ul>
        <p>
          These third parties have their own privacy policies and cookie
          policies. We recommend reviewing their policies to understand how they
          use cookies.
        </p>
      </PolicySection>

      <PolicySection title="Cookie Duration">
        <p>Cookies can be either session cookies or persistent cookies:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <strong>Session Cookies:</strong> These are temporary cookies that
            are deleted when you close your browser
          </li>
          <li>
            <strong>Persistent Cookies:</strong> These remain on your device for
            a set period or until you delete them manually
          </li>
        </ul>
        <p>
          The duration of persistent cookies varies depending on their purpose,
          typically ranging from 30 days to 2 years.
        </p>
      </PolicySection>

      <PolicySection title="Managing Your Cookie Preferences">
        <p>You have several options for managing cookies:</p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Browser Settings
            </h3>
            <p>
              Most web browsers allow you to control cookies through their
              settings. You can:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Block all cookies</li>
              <li>Block third-party cookies</li>
              <li>Delete existing cookies</li>
              <li>Set up notifications when cookies are being sent</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cookie Consent Manager
            </h3>
            <p>
              When you first visit our website, you'll see a cookie consent
              banner that allows you to accept or decline different types of
              cookies. You can change your preferences at any time by clicking
              the "Cookie Settings" link in our footer.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Opt-Out Links
            </h3>
            <p>You can opt out of specific third-party cookies:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                Google Analytics:{" "}
                <a
                  href="https://tools.google.com/dlpage/gaoptout"
                  className="text-green-600 hover:underline"
                >
                  Google Analytics Opt-out
                </a>
              </li>
              <li>
                Facebook:{" "}
                <a
                  href="https://www.facebook.com/settings?tab=ads"
                  className="text-green-600 hover:underline"
                >
                  Facebook Ad Preferences
                </a>
              </li>
            </ul>
          </div>
        </div>
      </PolicySection>

      <PolicySection title="Impact of Disabling Cookies">
        <p>
          While you can disable cookies, please note that doing so may affect
          your experience on our website:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Some features may not work properly</li>
          <li>You may need to re-enter information more frequently</li>
          <li>Personalized content and recommendations may not be available</li>
          <li>We may not be able to remember your preferences</li>
        </ul>
      </PolicySection>

      <PolicySection title="Updates to This Policy">
        <p>
          We may update this Cookie Policy from time to time to reflect changes
          in our practices or for other operational, legal, or regulatory
          reasons. We will notify you of any material changes by posting the
          updated policy on our website.
        </p>
        <p>
          We encourage you to review this policy periodically to stay informed
          about how we use cookies.
        </p>
      </PolicySection>

      <PolicySection title="Contact Us">
        <p>
          If you have any questions about our use of cookies or this Cookie
          Policy, please contact us at:
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p>
            <strong>Email:</strong> privacy@whatsway.com
          </p>
          <p>
            <strong>Address:</strong> 123 Business Ave, Suite 100, San
            Francisco, CA 94105
          </p>
          <p>
            <strong>Phone:</strong> +1 (555) 123-4567
          </p>
        </div>
      </PolicySection>
    </PolicyLayout>
  );
};

export default CookiePolicy;
