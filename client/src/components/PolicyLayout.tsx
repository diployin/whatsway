import React from "react";

interface PolicyLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

const PolicyLayout: React.FC<PolicyLayoutProps> = ({
  title,
  lastUpdated,
  children,
}) => {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {title}
          </h1>
          <p className="text-lg text-gray-600">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Policy Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Table of Contents */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Table of Contents
                </h3>
                <nav className="space-y-2">
                  {React.Children.map(children, (child, index) => {
                    if (React.isValidElement(child) && child.props.title) {
                      return (
                        <a
                          key={index}
                          href={`#section-${index}`}
                          className="block text-gray-600 hover:text-green-600 transition-colors py-1"
                        >
                          {child.props.title}
                        </a>
                      );
                    }
                    return null;
                  })}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="prose prose-lg max-w-none">
                {React.Children.map(children, (child, index) => {
                  if (React.isValidElement(child)) {
                    return React.cloneElement(child, {
                      key: index,
                      id: `section-${index}`,
                    });
                  }
                  return child;
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

interface PolicySectionProps {
  title: string;
  children: React.ReactNode;
  id?: string;
}

export const PolicySection: React.FC<PolicySectionProps> = ({
  title,
  children,
  id,
}) => {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-200 pb-3">
        {title}
      </h2>
      <div className="text-gray-600 leading-relaxed space-y-4">{children}</div>
    </section>
  );
};

export default PolicyLayout;
