import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background ">
      <Header />

      {/* Hero Section */}
      <section className="py-24 bg-gradient-to-br from-green-600 via-green-500 to-blue-600  text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6">Terms & Conditions</h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Last Updated: January 01, 2025
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-8 rounded-2xl mb-12">
              <p className="text-lg text-gray-700 leading-relaxed m-0">
                Please read these Terms and Conditions carefully before using
                the StyleHub website and services. By accessing or using our
                platform, you agree to be bound by these Terms.
              </p>
            </div>

            <div className="space-y-12">
              {/* 1. General Conditions */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  1. General Conditions
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We reserve the right to refuse service to anyone for any
                  reason at any time. You understand that your content
                  (excluding payment information) may be transferred unencrypted
                  and adapted to technical requirements for transmission.
                </p>
              </div>

              {/* 2. Account Creation */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  2. Account Creation & Security
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You may be required to create an account to access certain
                  features. You are responsible for maintaining confidentiality
                  of your account and password. You must be at least the age of
                  majority in your region to use this site.
                </p>
              </div>

              {/* 3. Products & Services */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  3. Products & Services
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li>
                    We may limit product sales to any person, region, or
                    jurisdiction.
                  </li>
                  <li>
                    We make every effort to accurately display product images
                    and colors.
                  </li>
                  <li>All prices are subject to change without notice.</li>
                </ul>
              </div>

              {/* 4. Billing & Orders */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  4. Billing & Order Information
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to provide complete and accurate purchase and
                  account information for all transactions. We reserve the right
                  to refuse or cancel any order.
                </p>
              </div>

              {/* 5. Third-Party Links */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  5. Third-Party Links
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We are not responsible for third-party content, websites, or
                  services accessed via links on our platform.
                </p>
              </div>

              {/* 6. User Comments */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  6. User Comments
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  Any comments or submissions you send to us may be used without
                  restriction. We are not obligated to maintain comments in
                  confidence or compensate you.
                </p>
              </div>

              {/* 7. Prohibited Uses */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  7. Prohibited Uses
                </h2>
                <ul className="space-y-2 text-gray-700">
                  <li>Engaging in unlawful activities</li>
                  <li>Violating applicable laws and regulations</li>
                  <li>
                    Infringing on our intellectual property or others’ rights
                  </li>
                  <li>Abusive, harmful, or discriminatory conduct</li>
                </ul>
              </div>

              {/* 8. Disclaimer */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  8. Disclaimer of Warranties & Liability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We do not guarantee uninterrupted, secure, or error-free
                  service. You agree your use of the service is at your sole
                  risk. All services are provided “as is” without warranties.
                </p>
              </div>

              {/* 9. Indemnification */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  9. Indemnification
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  You agree to indemnify and hold harmless StyleHub and its
                  employees and partners from any claims arising from your
                  breach of these Terms.
                </p>
              </div>

              {/* 10. Severability */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  10. Severability
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  If any provision in these Terms is found unenforceable, the
                  remaining provisions remain valid and enforceable.
                </p>
              </div>

              {/* 11. Termination */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  11. Termination
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms remain effective unless terminated by either
                  party. Obligations before termination survive.
                </p>
              </div>

              {/* 12. Governing Law */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  12. Governing Law
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  These Terms are governed by the laws of India.
                </p>
              </div>

              {/* 13. Updates */}
              <div>
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  13. Changes to These Terms
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We may update these Terms at any time by posting changes on
                  this page. It is your responsibility to review them
                  periodically.
                </p>
              </div>

              {/* Contact Section */}
              <div className="bg-gradient-to-br from-green-600 via-green-500 to-blue-600  p-8 rounded-2xl text-white">
                <h2 className="text-3xl font-bold mb-4">Contact Information</h2>
                <p className="text-lg leading-relaxed mb-4">
                  If you have questions regarding these Terms, contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong> legal@stylehub.com
                  </p>
                  <p>
                    <strong>Address:</strong> Flat - f61 , building - D and K
                    city , village - Minnie bay , Road- Minnie bay , city - Port
                    Blair, district - South andamans
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
