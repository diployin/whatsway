import React, { useState } from 'react';
import { CheckCircle, TrendingUp, Users, MessageCircle, Clock, Shield, Target, Zap, AlertTriangle, Star } from 'lucide-react';

const BestPractices = () => {
  const [activeCategory, setActiveCategory] = useState('messaging');

  const categories = [
    { id: 'messaging', name: 'Messaging', icon: MessageCircle },
    { id: 'automation', name: 'Automation', icon: Zap },
    { id: 'engagement', name: 'Engagement', icon: Users },
    { id: 'compliance', name: 'Compliance', icon: Shield },
    { id: 'timing', name: 'Timing', icon: Clock },
    { id: 'optimization', name: 'Optimization', icon: TrendingUp }
  ];

  const practices = {
    messaging: [
      {
        title: 'Keep Messages Concise and Clear',
        description: 'WhatsApp users prefer short, direct messages. Aim for 160 characters or less when possible.',
        tips: [
          'Use bullet points for multiple items',
          'Include clear call-to-action',
          'Avoid jargon and complex language',
          'Use emojis sparingly but effectively'
        ],
        impact: 'Increases read rates by 40%'
      },
      {
        title: 'Personalize Your Messages',
        description: 'Use customer data to create personalized experiences that resonate with your audience.',
        tips: [
          'Include customer names in greetings',
          'Reference past purchases or interactions',
          'Segment audiences for targeted messaging',
          'Use dynamic content based on user behavior'
        ],
        impact: 'Improves engagement by 60%'
      },
      {
        title: 'Use Rich Media Effectively',
        description: 'Images, videos, and documents can significantly enhance your message impact.',
        tips: [
          'Optimize images for mobile viewing',
          'Keep videos under 30 seconds',
          'Use high-quality visuals',
          'Include captions for accessibility'
        ],
        impact: 'Increases conversion by 35%'
      }
    ],
    automation: [
      {
        title: 'Set Up Welcome Sequences',
        description: 'Create automated welcome messages for new subscribers to set expectations.',
        tips: [
          'Send welcome message within 5 minutes',
          'Explain what subscribers can expect',
          'Provide opt-out instructions',
          'Include helpful resources or links'
        ],
        impact: 'Reduces unsubscribe rate by 25%'
      },
      {
        title: 'Implement Smart Triggers',
        description: 'Use behavioral triggers to send relevant messages at the right time.',
        tips: [
          'Cart abandonment reminders',
          'Post-purchase follow-ups',
          'Birthday and anniversary messages',
          'Re-engagement campaigns for inactive users'
        ],
        impact: 'Increases revenue by 45%'
      },
      {
        title: 'Create Drip Campaigns',
        description: 'Nurture leads with a series of automated messages over time.',
        tips: [
          'Space messages 2-3 days apart',
          'Provide value in each message',
          'Include social proof and testimonials',
          'End with a clear call-to-action'
        ],
        impact: 'Improves lead conversion by 50%'
      }
    ],
    engagement: [
      {
        title: 'Encourage Two-Way Conversations',
        description: 'Make your WhatsApp presence interactive to build stronger relationships.',
        tips: [
          'Ask questions in your messages',
          'Respond quickly to customer inquiries',
          'Use polls and surveys',
          'Share user-generated content'
        ],
        impact: 'Increases customer loyalty by 30%'
      },
      {
        title: 'Provide Excellent Customer Support',
        description: 'Use WhatsApp as a customer service channel to resolve issues quickly.',
        tips: [
          'Set up automated responses for common queries',
          'Train support team on WhatsApp etiquette',
          'Use quick replies for faster responses',
          'Escalate complex issues to phone or email'
        ],
        impact: 'Improves satisfaction by 55%'
      },
      {
        title: 'Share Valuable Content',
        description: 'Provide content that educates, entertains, or solves problems for your audience.',
        tips: [
          'Share industry insights and tips',
          'Provide exclusive offers and previews',
          'Send helpful tutorials and guides',
          'Curate relevant news and updates'
        ],
        impact: 'Increases brand trust by 40%'
      }
    ],
    compliance: [
      {
        title: 'Obtain Proper Consent',
        description: 'Always get explicit permission before adding contacts to your WhatsApp list.',
        tips: [
          'Use double opt-in processes',
          'Clearly explain what users will receive',
          'Provide easy opt-out options',
          'Keep records of consent'
        ],
        impact: 'Reduces spam complaints by 80%'
      },
      {
        title: 'Follow WhatsApp Business Policies',
        description: 'Adhere to WhatsApp\'s terms of service and business policies.',
        tips: [
          'Use approved message templates',
          'Respect the 24-hour messaging window',
          'Don\'t send promotional content without consent',
          'Monitor your quality rating regularly'
        ],
        impact: 'Prevents account restrictions'
      },
      {
        title: 'Maintain Data Privacy',
        description: 'Protect customer data and comply with privacy regulations.',
        tips: [
          'Implement data encryption',
          'Limit access to customer information',
          'Regularly audit data usage',
          'Provide data deletion options'
        ],
        impact: 'Builds customer trust'
      }
    ],
    timing: [
      {
        title: 'Send Messages at Optimal Times',
        description: 'Time your messages when your audience is most likely to be active.',
        tips: [
          'Analyze your audience\'s time zones',
          'Test different sending times',
          'Avoid early morning and late night messages',
          'Consider local holidays and events'
        ],
        impact: 'Increases open rates by 25%'
      },
      {
        title: 'Respect Frequency Limits',
        description: 'Don\'t overwhelm your audience with too many messages.',
        tips: [
          'Limit to 2-3 messages per week maximum',
          'Space promotional messages appropriately',
          'Monitor unsubscribe rates',
          'Allow users to set frequency preferences'
        ],
        impact: 'Reduces unsubscribe rate by 35%'
      },
      {
        title: 'Plan Seasonal Campaigns',
        description: 'Align your messaging with seasonal trends and events.',
        tips: [
          'Create holiday-specific campaigns',
          'Plan back-to-school promotions',
          'Leverage local events and festivals',
          'Prepare end-of-year sales messages'
        ],
        impact: 'Increases seasonal sales by 60%'
      }
    ],
    optimization: [
      {
        title: 'A/B Test Your Messages',
        description: 'Continuously test different message variations to improve performance.',
        tips: [
          'Test subject lines and opening messages',
          'Try different call-to-action phrases',
          'Experiment with message length',
          'Test sending times and frequencies'
        ],
        impact: 'Improves performance by 30%'
      },
      {
        title: 'Monitor Key Metrics',
        description: 'Track important metrics to measure and improve your WhatsApp marketing.',
        tips: [
          'Monitor delivery and read rates',
          'Track click-through rates',
          'Measure conversion rates',
          'Analyze customer lifetime value'
        ],
        impact: 'Enables data-driven decisions'
      },
      {
        title: 'Segment Your Audience',
        description: 'Divide your audience into groups for more targeted messaging.',
        tips: [
          'Segment by demographics',
          'Group by purchase behavior',
          'Create engagement-based segments',
          'Use geographic segmentation'
        ],
        impact: 'Increases relevance by 45%'
      }
    ]
  };

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bg-green-100 p-4 rounded-full w-fit mx-auto mb-6">
            <Star className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            WhatsApp Marketing
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Best Practices
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Proven strategies and techniques to maximize your WhatsApp marketing success. 
            Learn from industry experts and top-performing campaigns.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeCategory === category.id
                    ? 'bg-green-500 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Best Practices Content */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {practices[activeCategory as keyof typeof practices].map((practice, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{practice.title}</h3>
                    <p className="text-gray-600 text-lg">{practice.description}</p>
                  </div>
                  <div className="bg-green-100 px-4 py-2 rounded-full ml-6">
                    <span className="text-green-800 font-semibold text-sm">{practice.impact}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Implementation Tips:</h4>
                    <ul className="space-y-2">
                      {practice.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
                    <div className="flex items-center space-x-3 mb-4">
                      <TrendingUp className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Expected Impact</h4>
                    </div>
                    <p className="text-gray-700 mb-4">
                      Implementing this practice typically results in measurable improvements 
                      to your WhatsApp marketing performance.
                    </p>
                    <div className="bg-white p-3 rounded-lg">
                      <span className="text-blue-600 font-bold text-lg">{practice.impact}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Success Tips</h2>
            <p className="text-xl text-gray-600">Essential reminders for WhatsApp marketing success</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Target,
                title: 'Quality Over Quantity',
                tip: 'Focus on engaged subscribers rather than large lists'
              },
              {
                icon: Clock,
                title: 'Timing Matters',
                tip: 'Send messages when your audience is most active'
              },
              {
                icon: Users,
                title: 'Be Personal',
                tip: 'Use customer data to create relevant experiences'
              },
              {
                icon: Shield,
                title: 'Stay Compliant',
                tip: 'Always follow WhatsApp policies and local regulations'
              },
              {
                icon: MessageCircle,
                title: 'Encourage Interaction',
                tip: 'Make conversations two-way for better engagement'
              },
              {
                icon: TrendingUp,
                title: 'Test and Optimize',
                tip: 'Continuously improve based on performance data'
              }
            ].map((tip, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-xl hover:bg-gray-100 transition-colors">
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

      {/* Warning Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-red-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg border-l-4 border-red-500">
            <div className="flex items-start space-x-4">
              <AlertTriangle className="w-8 h-8 text-red-500 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Important Compliance Reminder</h3>
                <p className="text-gray-700 mb-4">
                  Always ensure you have explicit consent before messaging customers on WhatsApp. 
                  Violating WhatsApp's business policies can result in account restrictions or bans.
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li>• Never purchase contact lists</li>
                  <li>• Always provide opt-out options</li>
                  <li>• Respect the 24-hour messaging window</li>
                  <li>• Use approved message templates for promotional content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Implement These Best Practices?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Start applying these proven strategies with Whatsway today
          </p>
          <button className="bg-white text-green-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl">
            Start Free Trial
          </button>
        </div>
      </section>
    </div>
  );
};

export default BestPractices;