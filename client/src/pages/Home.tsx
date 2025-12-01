import React, {useEffect} from "react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import UseCases from "@/components/UseCases";
import Testimonials from "@/components/Testimonials";
import Pricing from "@/components/Pricing";
import CTA from "@/components/CTA";
import { useQuery } from "@tanstack/react-query";
import { PlansDataTypes } from "@/types/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Home = () => {
  const { data: paymentProviders } = useQuery<PlansDataTypes>({
    queryKey: ["/api/admin/plans"],
    queryFn: async () => {
      const res = await fetch("/api/admin/plans");
      return res.json();
    },
  });

  useEffect(() => {
    window.aiChatConfig = {
      siteId: "3af56dd1-ee82-4914-b143-b879391c6f15",
      channelId: "35f7b44c-d422-4246-b016-21edf9c08bea",
      url: "https://whatsway.diploy.in",
    };

    const script = document.createElement("script");
    script.src = "https://whatsway.diploy.in/widget/widget.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);
  return (
    <>
      {/* <Header /> */}
      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Testimonials />
      {paymentProviders?.success && paymentProviders?.data?.length > 0 && (
        <Pricing />
      )}
      <CTA />
      {/* <Footer /> */}
    </>
  );
};

export default Home;
