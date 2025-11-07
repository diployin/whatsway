import React, { useState } from 'react';
import { 
  ShoppingCart, 
  GraduationCap, 
  Heart, 
  Building, 
  Utensils,
  Car,
  ArrowRight,
  TrendingUp,
  Users,
  MessageCircle
} from 'lucide-react';

const UseCases = () => {
  const [activeUseCase, setActiveUseCase] = useState(0);

  const useCases = [
    {
      icon: ShoppingCart,
      title: 'E-commerce',
      description: 'Boost sales with abandoned cart recovery, order updates, and personalized product recommendations',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      stats: { increase: '300%', metric: 'Sales Recovery' },
      features: [
        'Abandoned cart recovery',
        'Order status updates',
        'Product recommendations',
        'Flash sale notifications'
      ]
    },
    {
      icon: GraduationCap,
      title: 'Education',
      description: 'Engage students and parents with course updates, assignment reminders, and educational content',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      stats: { increase: '85%', metric: 'Student Engagement' },
      features: [
        'Assignment reminders',
        'Course announcements',
        'Parent communication',
        'Study material sharing'
      ]
    },
    {
      icon: Heart,
      title: 'Healthcare',
      description: 'Improve patient care with appointment reminders, health tips, and medication alerts',
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      stats: { increase: '60%', metric: 'Appointment Attendance' },
      features: [
        'Appointment reminders',
        'Medication alerts',
        'Health tips delivery',
        'Test result notifications'
      ]
    },
    {
      icon: Building,
      title: 'Real Estate',
      description: 'Connect with prospects through property alerts, virtual tours, and market updates',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      stats: { increase: '45%', metric: 'Lead Conversion' },
      features: [
        'Property alerts',
        'Virtual tour scheduling',
        'Market updates',
        'Lead qualification'
      ]
    },
    {
      icon: Utensils,
      title: 'Restaurants',
      description: 'Increase orders with menu updates, special offers, and reservation confirmations',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      stats: { increase: '120%', metric: 'Order Volume' },
      features: [
        'Menu updates',
        'Special offers',
        'Reservation confirmations',
        'Loyalty programs'
      ]
    },
    {
      icon: Car,
      title: 'Automotive',
      description: 'Enhance customer service with service reminders, appointment booking, and vehicle updates',
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      stats: { increase: '75%', metric: 'Service Bookings' },
      features: [
        'Service reminders',
        'Appointment booking',
        'Vehicle updates',
        'Maintenance tips'
      ]
    }
  ];

  return (
    <section id="use-cases" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Building className="w-4 h-4 mr-2" />
            Industry Solutions
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Perfect for Every
            <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Industry & Business
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover how businesses across different industries are using WhatsApp marketing 
            to drive growth and improve customer engagement
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {useCases.map((useCase, index) => (
            <button
              key={index}
              onClick={() => setActiveUseCase(index)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all ${
                activeUseCase === index
                  ? `bg-gradient-to-r ${useCase.color} text-white shadow-lg transform scale-105`
                  : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md'
              }`}
            >
              <useCase.icon className="w-5 h-5" />
              <span>{useCase.title}</span>
            </button>
          ))}
        </div>

        {/* Active Use Case Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`p-8 rounded-2xl ${useCases[activeUseCase].bgColor} transition-all duration-500`}>
            <div className="flex items-center space-x-4 mb-6">
              <div className={`p-4 rounded-xl bg-gradient-to-r ${useCases[activeUseCase].color} shadow-lg`}>
                {React.createElement(useCases[activeUseCase].icon, { className: "w-8 h-8 text-white" })}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{useCases[activeUseCase].title}</h3>
                <p className="text-gray-600 mt-1">{useCases[activeUseCase].description}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Success Metric</span>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  <span className="text-2xl font-bold text-green-600">
                    {useCases[activeUseCase].stats.increase}
                  </span>
                </div>
              </div>
              <p className="text-gray-700 font-medium">{useCases[activeUseCase].stats.metric}</p>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
              {useCases[activeUseCase].features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <button className="mt-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-3 rounded-lg hover:from-gray-800 hover:to-gray-700 transition-all flex items-center group">
              View Case Study
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Success Stories */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Customer Success Story</h4>
                  <p className="text-gray-600 text-sm">Real results from our platform</p>
                </div>
              </div>
              <blockquote className="text-gray-700 italic mb-4">
                "WhatsApp Pro helped us increase our {useCases[activeUseCase].title.toLowerCase()} 
                engagement by {useCases[activeUseCase].stats.increase}. The automation features 
                saved us countless hours while improving customer satisfaction."
              </blockquote>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="font-semibold text-gray-900">Sarah Johnson</p>
                  <p className="text-gray-600 text-sm">Marketing Director</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
              <div className="flex items-center space-x-3 mb-4">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <h4 className="font-bold text-gray-900">Quick Stats</h4>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">98%</div>
                  <div className="text-gray-600 text-sm">Delivery Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">5x</div>
                  <div className="text-gray-600 text-sm">Higher Engagement</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">24/7</div>
                  <div className="text-gray-600 text-sm">Automation</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">50%</div>
                  <div className="text-gray-600 text-sm">Cost Reduction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UseCases;