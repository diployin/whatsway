import React, { useState } from 'react';
import { BookOpen, CheckCircle, ArrowRight, MessageCircle, Settings, Users, BarChart3, Zap, Shield, Globe } from 'lucide-react';

const WhatsAppGuide = () => {
  const [activeSection, setActiveSection] = useState('getting-started');

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: Zap },
    { id: 'setup', title: 'API Setup', icon: Settings },
    { id: 'campaigns', title: 'Creating Campaigns', icon: MessageCircle },
    { id: 'automation', title: 'Automation', icon: BarChart3 },
    { id: 'best-practices', title: 'Best Practices', icon: Shield },
    { id: 'compliance', title: 'Compliance', icon: Globe }
  ];

  const content = {
    'getting-started': {
      title: 'Getting Started with WhatsApp Marketing',
      content: [
        {
          title: 'What is WhatsApp Business API?',
          text: 'WhatsApp Business API is a powerful platform that allows businesses to communicate with customers at scale. Unlike the regular WhatsApp Business app, the API enables automated messaging, integrations, and advanced features.'
        },
        {
          title: 'Why Choose WPSaaS?',
          text: 'WPSaaS provides a user-friendly interface for the WhatsApp Business API, allowing you to create campaigns, automate responses, and track performance without technical complexity.'
        },
        {
          title: 'Prerequisites',
          text: 'Before getting started, you\'ll need: A verified WhatsApp Business API account from Meta, A business phone number, Basic understanding of your target audience'
        }
      ]
    },
    'setup': {
      title: 'Setting Up Your WhatsApp Business API',
      content: [
        {
          title: 'Step 1: Get Your Meta API Credentials',
          text: 'Visit the Meta Business Platform and create a WhatsApp Business API account. You\'ll receive API credentials including your phone number ID, access token, and webhook URL.'
        },
        {
          title: 'Step 2: Connect to WPSaaS',
          text: 'In your WPSaaS dashboard, navigate to Settings > API Configuration. Enter your Meta API credentials and test the connection to ensure everything is working properly.'
        },
        {
          title: 'Step 3: Verify Your Business',
          text: 'Complete the business verification process with Meta. This typically involves providing business documents and may take 1-3 business days to complete.'
        }
      ]
    },
    'campaigns': {
      title: 'Creating Effective WhatsApp Campaigns',
      content: [
        {
          title: 'Campaign Types',
          text: 'WPSaaS supports various campaign types: Broadcast messages for announcements, Drip campaigns for nurturing leads, Triggered messages based on user actions, Promotional campaigns for sales and offers'
        },
        {
          title: 'Message Templates',
          text: 'Create templates in your Meta Business Manager and sync them with Whatsway. Templates can include text, images, videos, and interactive buttons.'
        },
        {
          title: 'Audience Segmentation',
          text: 'Segment your audience based on demographics, behavior, purchase history, and engagement levels. This ensures your messages are relevant and improve engagement rates.'
        }
      ]
    },
    'automation': {
      title: 'WhatsApp Marketing Automation',
      content: [
        {
          title: 'Workflow Automation',
          text: 'Create automated workflows that respond to customer actions. Examples include welcome sequences for new subscribers, abandoned cart recovery, appointment reminders, and follow-up messages.'
        },
        {
          title: 'Chatbot Integration',
          text: 'Deploy AI-powered chatbots to handle common queries, qualify leads, and provide 24/7 customer support. Chatbots can seamlessly hand over to human agents when needed.'
        },
        {
          title: 'Trigger-Based Messaging',
          text: 'Set up triggers based on customer behavior, time delays, or external events. This ensures timely and relevant communication with your audience.'
        }
      ]
    },
    'best-practices': {
      title: 'WhatsApp Marketing Best Practices',
      content: [
        {
          title: 'Respect User Privacy',
          text: 'Always obtain explicit consent before messaging users. Provide clear opt-out options and respect user preferences. Never purchase contact lists or send unsolicited messages.'
        },
        {
          title: 'Timing and Frequency',
          text: 'Send messages at appropriate times based on your audience\'s time zone. Avoid over-messaging - quality over quantity is key. Monitor engagement rates and adjust frequency accordingly.'
        },
        {
          title: 'Personalization',
          text: 'Use customer data to personalize messages. Include names, purchase history, and relevant offers. Personalized messages have significantly higher engagement rates.'
        }
      ]
    },
    'compliance': {
      title: 'WhatsApp Business Policy Compliance',
      content: [
        {
          title: 'Message Categories',
          text: 'WhatsApp categorizes messages into: Utility (account updates, order confirmations), Authentication (login codes, security alerts), Marketing (promotions, announcements). Each category has specific rules and pricing.'
        },
        {
          title: 'Template Approval Process',
          text: 'All message templates must be approved by Meta before use. The approval process typically takes 24-48 hours. Ensure templates follow WhatsApp\'s content guidelines.'
        },
        {
          title: 'Quality Rating',
          text: 'WhatsApp monitors your messaging quality through user feedback and engagement metrics. Maintain a high quality rating to avoid restrictions and ensure deliverability.'
        }
      ]
    }
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-6">
            <BookOpen className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            WhatsApp Marketing
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Complete Guide
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about WhatsApp Business API, marketing strategies, 
            and best practices to grow your business.
          </p>
        </div>
      </section>

      {/* Guide Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Guide Sections</h3>
                <nav className="space-y-2">
                  {sections.map(section => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                        activeSection === section.id
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'text-gray-700 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-white">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">
                  {content[activeSection as keyof typeof content].title}
                </h2>
                
                <div className="space-y-8">
                  {content[activeSection as keyof typeof content].content.map((item, index) => (
                    <div key={index} className="border-l-4 border-green-500 pl-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
                  <button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex > 0) {
                        setActiveSection(sections[currentIndex - 1].id);
                      }
                    }}
                    disabled={sections.findIndex(s => s.id === activeSection) === 0}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Previous</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      if (currentIndex < sections.length - 1) {
                        setActiveSection(sections[currentIndex + 1].id);
                      }
                    }}
                    disabled={sections.findIndex(s => s.id === activeSection) === sections.length - 1}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Tips for Success</h2>
            <p className="text-xl text-gray-600">Essential tips to maximize your WhatsApp marketing results</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Build Your Audience Organically',
                tip: 'Focus on quality over quantity. Engaged subscribers are more valuable than large, unengaged lists.'
              },
              {
                icon: MessageCircle,
                title: 'Craft Compelling Messages',
                tip: 'Keep messages concise, valuable, and action-oriented. Include clear calls-to-action.'
              },
              {
                icon: BarChart3,
                title: 'Monitor Performance',
                tip: 'Track delivery rates, read rates, and response rates. Use data to optimize your campaigns.'
              },
              {
                icon: Zap,
                title: 'Automate Wisely',
                tip: 'Automate routine tasks but maintain human touch for complex interactions.'
              },
              {
                icon: Shield,
                title: 'Stay Compliant',
                tip: 'Always follow WhatsApp policies and local regulations. Compliance protects your business.'
              },
              {
                icon: Globe,
                title: 'Test and Iterate',
                tip: 'Continuously test different approaches and optimize based on results.'
              }
            ].map((tip, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all">
                <div className="bg-green-100 p-3 rounded-lg w-fit mb-4">
                  <tip.icon className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{tip.title}</h3>
                <p className="text-gray-600">{tip.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your WhatsApp Marketing Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Put this guide into action with WPSaaS's powerful platform
          </p>
          <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default WhatsAppGuide;