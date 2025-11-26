// import React, { useState } from 'react';
// import { Link, useLocation } from 'wouter';
// import { apiRequest } from "@/lib/queryClient";
// import {
//   Mail,
//   Lock,
//   Eye,
//   EyeOff,
//   ArrowRight,
//   User,
//   Building
// } from 'lucide-react';
// import Footer from '@/components/Footer';
// import Header from '@/components/Header';

// const Signup: React.FC = () => {
//   const [, setLocation] = useLocation();

//   const [formData, setFormData] = useState({
//     username: '',
//     firstName: '',
//     lastName: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     agreeToTerms: false,
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [errors, setErrors] = useState<{ [key: string]: string }>({});

//   // ✅ Form validation
//   const validateForm = () => {
//     const newErrors: { [key: string]: string } = {};

//     if (!formData.username.trim()) newErrors.username = 'Username is required';
//     if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
//     if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
//     if (!formData.email.trim()) newErrors.email = 'Email is required';
//     // if (!formData.company.trim()) newErrors.company = 'Company name is required';
//     if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
//     if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
//     if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms';

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   // ✅ Handle signup API
// const handleSubmitOld = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (!validateForm()) return;

//   setIsLoading(true);
//   setErrors({});

//   try {
//     const res = await apiRequest("POST", "/api/users/create", {
//       username: formData.username,
//       password: formData.password,
//       email: formData.email,
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       role: "admin",
//       avatar: "",
//     });

//     const data = await res.json();
//     console.log("User created:", data);

//     setLocation("/login");
//   } catch (error: any) {
//     console.error("Signup error:", error);
//     setErrors({
//       general: error.message || "Signup failed. Please try again.",
//     });
//   } finally {
//     setIsLoading(false);
//   }
// };

// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   if (!validateForm()) return;

//   setIsLoading(true);
//   setErrors({});

//   try {
//     const res = await apiRequest("POST", "/api/users/create", {
//       username: formData.username,
//       password: formData.password,
//       email: formData.email,
//       firstName: formData.firstName,
//       lastName: formData.lastName,
//       role: "admin",
//       avatar: "",
//     });

//     const data = await res.json();
//     console.log("User created:", data);

//     // 👇👇 NEW: Redirect to verify email page
//     setLocation(`/verify-email?email=${formData.email}`);

//   } catch (error: any) {
//     console.error("Signup error:", error);
//     setErrors({
//       general: error.message || "Signup failed. Please try again.",
//     });
//   } finally {
//     setIsLoading(false);
//   }
// };

//   // ✅ Google signup (dummy for now)
//   const handleGoogleSignup = () => {
//     setIsLoading(true);
//     setTimeout(() => {
//       setLocation('/dashboard');
//     }, 1500);
//   };

//   // ✅ Handle input changes
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value, type, checked } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value,
//     }));
//     if (errors[name]) {
//       setErrors((prev) => ({ ...prev, [name]: '' }));
//     }
//   };

//   return (
//     <>
//       <Header />
//       <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-md w-full space-y-8">
//           <div className="text-center mt-8">
//             <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
//             <p className="text-gray-600">Start your WhatsApp marketing journey today</p>
//           </div>

//           <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
//             <form onSubmit={handleSubmit} className="space-y-6">

//               {/* Username */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
//                 <div className="relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     name="username"
//                     value={formData.username}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
//                       errors.username ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                     placeholder="Choose a unique username"
//                     required
//                   />
//                 </div>
//                 {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
//               </div>

//               {/* First Name & Last Name */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleChange}
//                       className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
//                         errors.firstName ? 'border-red-300' : 'border-gray-300'
//                       }`}
//                       placeholder="John"
//                       required
//                     />
//                   </div>
//                   {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
//                   <div className="relative">
//                     <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                     <input
//                       type="text"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleChange}
//                       className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
//                         errors.lastName ? 'border-red-300' : 'border-gray-300'
//                       }`}
//                       placeholder="Doe"
//                       required
//                     />
//                   </div>
//                   {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
//                 </div>
//               </div>

//               {/* Email */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="email"
//                     name="email"
//                     value={formData.email}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
//                       errors.email ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                     placeholder="john@company.com"
//                     required
//                   />
//                 </div>
//                 {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
//               </div>

//               {/* Company Name
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
//                 <div className="relative">
//                   <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type="text"
//                     name="company"
//                     value={formData.company}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
//                       errors.company ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                     placeholder="Your Company"
//                     required
//                   />
//                 </div>
//                 {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company}</p>}
//               </div> */}

//               {/* Password */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type={showPassword ? 'text' : 'password'}
//                     name="password"
//                     value={formData.password}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
//                       errors.password ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                     placeholder="Create a strong password"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
//               </div>

//               {/* Confirm Password */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                   <input
//                     type={showConfirmPassword ? 'text' : 'password'}
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleChange}
//                     className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
//                       errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
//                     }`}
//                     placeholder="Confirm your password"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//                 {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
//               </div>

//               {/* Terms Checkbox */}
//               <div>
//                 <label className="flex items-start space-x-3">
//                   <input
//                     type="checkbox"
//                     name="agreeToTerms"
//                     checked={formData.agreeToTerms}
//                     onChange={handleChange}
//                     className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
//                   />
//                   <span className="text-sm text-gray-600">
//                     I agree to the{' '}
//                     <Link to="/terms" className="text-green-600 hover:text-green-700">Terms of Service</Link>{' '}
//                     and{' '}
//                     <Link to="/privacy-policy" className="text-green-600 hover:text-green-700">Privacy Policy</Link>
//                   </span>
//                 </label>
//                 {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>}
//               </div>

//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 disabled={isLoading}
//                 className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center"
//               >
//                 {isLoading
//                   ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   : <>
//                       Create Account
//                       <ArrowRight className="w-4 h-4 ml-2" />
//                     </>
//                 }
//               </button>

//               {/* General error message */}
//               {errors.general && (
//                 <p className="text-center text-red-600 mt-2 text-sm">{errors.general}</p>
//               )}
//             </form>

//             {/* Or Sign up with Google */}
//             {/* <div className="mt-6">
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-gray-300" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-2 bg-white text-gray-500">Or sign up with</span>
//                 </div>
//               </div>
//               <button
//                 onClick={handleGoogleSignup}
//                 disabled={isLoading}
//                 className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 flex items-center justify-center"
//               >
//                 <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
//                   <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
//                   <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
//                   <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
//                   <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
//                 </svg>
//                 Continue with Google
//               </button>
//             </div> */}

//             <div className="mt-6 text-center">
//               <p className="text-gray-600">
//                 Already have an account?{' '}
//                 <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
//                   Sign in
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Footer />
//     </>
//   );
// };

// export default Signup;

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Lock, Eye, EyeOff, ArrowRight, User } from "lucide-react";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const Signup: React.FC = () => {
  const [location] = useLocation(); // ✅ Add this to track route changes
  const [, setLocation] = useLocation();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // ✅ FIXED: Pre-fill email from URL query parameter
  useEffect(() => {
    // Get email from URL
    const searchParams = new URLSearchParams(window.location.search);
    const emailFromUrl = searchParams.get("email");

    console.log("URL:", window.location.search); // Debug
    console.log("Email from URL:", emailFromUrl); // Debug

    if (emailFromUrl) {
      const decodedEmail = decodeURIComponent(emailFromUrl);
      console.log("Decoded email:", decodedEmail); // Debug

      setFormData((prev) => ({
        ...prev,
        email: decodedEmail,
      }));
    }
  }, [location]); // ✅ Add location dependency

  // ✅ Form validation
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ Handle signup API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const res = await apiRequest("POST", "/api/users/create", {
        username: formData.username,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: "admin",
        avatar: "",
      });

      const data = await res.json();
      console.log("User created:", data);

      // Redirect to verify email page
      setLocation(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrors({
        general: error.message || "Signup failed. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center mt-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h2>
            <p className="text-gray-600">
              Start your WhatsApp marketing journey today
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.username ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Choose a unique username"
                    required
                  />
                </div>
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                )}
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.firstName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="John"
                      required
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.lastName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Doe"
                      required
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email - Pre-filled from popup */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.email ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="john@company.com"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.password ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Create a strong password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.confirmPassword
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 mt-1"
                  />
                  <span className="text-sm text-gray-600">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="text-green-600 hover:text-green-700"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      className="text-green-600 hover:text-green-700"
                    >
                      Privacy Policy
                    </Link>
                  </span>
                </label>
                {errors.agreeToTerms && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.agreeToTerms}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>

              {/* General error message */}
              {errors.general && (
                <p className="text-center text-red-600 mt-2 text-sm">
                  {errors.general}
                </p>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Signup;
