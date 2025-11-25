// import React, { useState, useEffect } from 'react';
// import { Star, Quote, ArrowLeft, ArrowRight } from 'lucide-react';

// const Testimonials = () => {
//   const [currentTestimonial, setCurrentTestimonial] = useState(0);

//   const testimonials = [
//     {
//       name: 'Sarah Chen',
//       role: 'E-commerce Director',
//       company: 'Fashion Forward',
//       image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//       rating: 5,
//       text: 'WhatsApp Pro transformed our customer engagement. We saw a 300% increase in cart recovery rates and our customers love the personalized experience.',
//       results: '300% increase in cart recovery'
//     },
//     {
//       name: 'Michael Rodriguez',
//       role: 'Marketing Manager',
//       company: 'TechStart Solutions',
//       image: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//       rating: 5,
//       text: 'The automation workflows are incredible. We can now nurture leads 24/7 without any manual intervention. Our conversion rates have never been higher.',
//       results: '85% improvement in lead conversion'
//     },
//     {
//       name: 'Emily Johnson',
//       role: 'Customer Success Lead',
//       company: 'HealthCare Plus',
//       image: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//       rating: 5,
//       text: 'Patient appointment attendance improved dramatically after implementing WhatsApp reminders. The platform is intuitive and our team adopted it quickly.',
//       results: '60% reduction in no-shows'
//     },
//     {
//       name: 'David Park',
//       role: 'Restaurant Owner',
//       company: 'Gourmet Bistro',
//       image: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//       rating: 5,
//       text: 'Our reservation system is now seamless. Customers get instant confirmations and we can send them special offers. Revenue increased by 40% in just 3 months.',
//       results: '40% revenue increase'
//     },
//     {
//       name: 'Lisa Thompson',
//       role: 'Education Coordinator',
//       company: 'Bright Future Academy',
//       image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
//       rating: 5,
//       text: 'Parent engagement has never been better. We can instantly share updates about their children and important school announcements reach everyone.',
//       results: '90% parent engagement rate'
//     }
//   ];

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
//     }, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const nextTestimonial = () => {
//     setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
//   };

//   const prevTestimonial = () => {
//     setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
//   };

//   return (
//     <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
//       <div className="max-w-7xl mx-auto">
//         <div className="text-center mb-16">
//           <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
//             <Star className="w-4 h-4 mr-2" />
//             Customer Success Stories
//           </div>
//           <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
//             Loved by
//             <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//               10,000+ Businesses
//             </span>
//           </h2>
//           <p className="text-xl text-gray-600 max-w-3xl mx-auto">
//             See how businesses across industries are achieving remarkable results with our WhatsApp marketing platform
//           </p>
//         </div>

//         {/* Main Testimonial */}
//         <div className="relative max-w-4xl mx-auto mb-16">
//           <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl relative">
//             <Quote className="absolute top-6 left-6 w-8 h-8 text-blue-200" />

//             <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
//               <div className="flex-shrink-0">
//                 <img
//                   src={testimonials[currentTestimonial].image}
//                   alt={testimonials[currentTestimonial].name}
//                   className="w-24 h-24 rounded-full object-cover shadow-lg"
//                 />
//               </div>

//               <div className="flex-1 text-center md:text-left">
//                 <div className="flex justify-center md:justify-start space-x-1 mb-4">
//                   {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
//                     <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
//                   ))}
//                 </div>

//                 <blockquote className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
//                   "{testimonials[currentTestimonial].text}"
//                 </blockquote>

//                 <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//                   <div>
//                     <p className="font-bold text-gray-900 text-lg">
//                       {testimonials[currentTestimonial].name}
//                     </p>
//                     <p className="text-gray-600">
//                       {testimonials[currentTestimonial].role} at {testimonials[currentTestimonial].company}
//                     </p>
//                   </div>

//                   <div className="mt-4 md:mt-0 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-lg">
//                     <p className="text-sm font-semibold text-gray-800">
//                       {testimonials[currentTestimonial].results}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Navigation Buttons */}
//           <button
//             onClick={prevTestimonial}
//             className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
//           >
//             <ArrowLeft className="w-5 h-5 text-gray-600" />
//           </button>
//           <button
//             onClick={nextTestimonial}
//             className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
//           >
//             <ArrowRight className="w-5 h-5 text-gray-600" />
//           </button>
//         </div>

//         {/* Testimonial Indicators */}
//         <div className="flex justify-center space-x-2 mb-16">
//           {testimonials.map((_, index) => (
//             <button
//               key={index}
//               onClick={() => setCurrentTestimonial(index)}
//               className={`w-3 h-3 rounded-full transition-all ${
//                 index === currentTestimonial
//                   ? 'bg-blue-600 w-8'
//                   : 'bg-gray-300 hover:bg-gray-400'
//               }`}
//             />
//           ))}
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
//           {[
//             { number: '10,000+', label: 'Happy Customers' },
//             { number: '98%', label: 'Satisfaction Rate' },
//             { number: '5M+', label: 'Messages Sent' },
//             { number: '24/7', label: 'Support Available' }
//           ].map((stat, index) => (
//             <div key={index} className="text-center">
//               <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
//                 {stat.number}
//               </div>
//               <div className="text-gray-600 font-medium">{stat.label}</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Testimonials;

import React, { useState, useEffect } from "react";
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

const Testimonials: React.FC = () => {
  const { t } = useTranslation();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Get testimonials data from translation JSON
  const testimonials = t(
    "Landing.testimonialsSec.testimonials"
  ) as unknown as Array<{
    name: string;
    role: string;
    company: string;
    image: string;
    rating: number;
    text: string;
    results: string;
  }>;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const navButtons = t("Landing.testimonialsSec.navButtons") as unknown as {
    previous: string;
    next: string;
  };

  const statsGrid = t("Landing.testimonialsSec.statsGrid") as unknown as Array<{
    number: string;
    label: string;
  }>;

  const prevTestimonial = () => {
    setCurrentTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  };

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  //   const prevTestimonial = () => {
  //     setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  //   };

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="w-4 h-4 mr-2" />
            {t("Landing.testimonialsSec.introTagline")}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("Landing.testimonialsSec.headlinePre")}
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {t("Landing.testimonialsSec.headlineHighlight")}
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("Landing.testimonialsSec.subHeadline")}
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative max-w-4xl mx-auto mb-16">
          <div className="bg-white p-8 md:p-12 rounded-2xl shadow-2xl relative">
            <Quote className="absolute top-6 left-6 w-8 h-8 text-blue-200" />

            <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
              <div className="flex-shrink-0">
                <img
                  src={testimonials[currentTestimonial].image}
                  alt={testimonials[currentTestimonial].name}
                  className="w-24 h-24 rounded-full object-cover shadow-lg"
                />
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex justify-center md:justify-start space-x-1 mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 text-yellow-400 fill-current"
                      />
                    )
                  )}
                </div>

                <blockquote className="text-lg md:text-xl text-gray-700 mb-6 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-bold text-gray-900 text-lg">
                      {testimonials[currentTestimonial].name}
                    </p>
                    <p className="text-gray-600">
                      {testimonials[currentTestimonial].role} at{" "}
                      {testimonials[currentTestimonial].company}
                    </p>
                  </div>

                  <div className="mt-4 md:mt-0 bg-gradient-to-r from-green-100 to-blue-100 px-4 py-2 rounded-lg">
                    <p className="text-sm font-semibold text-gray-800">
                      {testimonials[currentTestimonial].results}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
            aria-label={navButtons.previous}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110"
            aria-label={navButtons.next}
          >
            <ArrowRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Testimonial Indicators */}
        <div className="flex justify-center space-x-2 mb-16">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentTestimonial(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentTestimonial
                  ? "bg-blue-600 w-8"
                  : "bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statsGrid.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
