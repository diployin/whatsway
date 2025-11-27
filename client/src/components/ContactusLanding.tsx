import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageCircle,
  Users,
  Headphones,
} from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

const ContactusLanding = () => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    setLoading(true);
  
    try {
      const response = await fetch("/api/contact/sendmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data?.success) {
        toast({
          title: "Failed to send message",
          description: data?.message || "Something went wrong.",
          variant: "destructive",
        });
        return;
      }
  
      // SUCCESS TOAST
      toast({
        title: "Message Sent Successfully",
        description: "We received your message and will respond shortly.",
      });
  
      // Reset form
      setFormData({
        name: "",
        email: "",
        company: "",
        subject: "",
        message: "",
      });
  
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error?.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Get contact info and FAQ from translations
  const contactInfo = t("contactUs.contactInfo.list") as unknown as Array<{
    title: string;
    details: string;
    description: string;
  }>;

  const faqQuestions = t("contactUs.faq.questions") as unknown as Array<{
    q: string;
    a: string;
  }>;

  // Icon mapping for contact info
  const iconMap = [Mail, MapPin];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 inline-flex">
            {t("contactUs.hero.title")}
            <span className="block bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent ml-3">
              {t("contactUs.hero.titleHighlight")}
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t("contactUs.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {t("contactUs.form.heading")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contactUs.form.fields.name")}{" "}
                      {t("contactUs.form.fields.required")}
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contactUs.form.fields.email")}{" "}
                      {t("contactUs.form.fields.required")}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contactUs.form.fields.company")}
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("contactUs.form.fields.subject")}{" "}
                      {t("contactUs.form.fields.required")}
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    >
                      <option value="">
                        {t("contactUs.form.placeholders.selectSubject")}
                      </option>
                      <option value="general">
                        {t("contactUs.form.subjects.general")}
                      </option>
                      <option value="support">
                        {t("contactUs.form.subjects.support")}
                      </option>
                      <option value="sales">
                        {t("contactUs.form.subjects.sales")}
                      </option>
                      <option value="partnership">
                        {t("contactUs.form.subjects.partnership")}
                      </option>
                      <option value="feedback">
                        {t("contactUs.form.subjects.feedback")}
                      </option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("contactUs.form.fields.message")}{" "}
                    {t("contactUs.form.fields.required")}
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder={t("contactUs.form.placeholders.message")}
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center group"
                >
                  {t("contactUs.form.button")}
                  <Send className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>

            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("contactUs.contactInfo.heading")}
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((info, index) => {
                    const Icon = iconMap[index];
                    return (
                      <div key={index} className="flex items-start space-x-4">
                        <div className="bg-green-100 p-3 rounded-lg">
                          <Icon className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {info.title}
                          </h3>
                          <p className="text-gray-700 font-medium">
                            {info.details}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {info.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("contactUs.faq.heading")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("contactUs.faq.subtitle")}
            </p>
          </div>

          <div className="space-y-6">
            {faqQuestions.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactusLanding;
