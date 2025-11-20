"use client";

import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export interface DemoPreviewModalProps {
  screenshot: string;
  logo?: string | null;
  title: string;
  tagline: string;
  themeColor?: string;
  docsLink?: string;
  infoNote?: React.ReactNode;
  demoUrl: string;
  superAdmin?: { username: string; password: string };
  tenant?: { username: string; password: string };
  buttonLabel?: string;
  buttonLink?: string;
  bottomHelp?: string;
  supportEmail?: string;
  blurIntensity?: "sm" | "md" | "lg" | "xl";
  overlayOpacity?: number;
}

const DemoPreviewModal: React.FC<DemoPreviewModalProps> = ({
  screenshot,
  blurIntensity = "lg",
  overlayOpacity = 90,
  logo,
  title,
  tagline,
  themeColor = "#4F46E5",
  docsLink,
  infoNote,
  demoUrl,
  superAdmin,
  tenant,
  buttonLabel = "Visit Demo Now",
  buttonLink,
  bottomHelp,
  supportEmail,
}) => {
  const { data: brandSettings } = useQuery({
    queryKey: ["/api/brand-settings"],
    queryFn: () => fetch("/api/brand-settings").then((res) => res.json()),
  });

  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setTimeout(() => setFadeIn(true), 80);
  }, []);

  const finalLogo = brandSettings?.logo || logo;

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden pt-5">
      {/* Background Screenshot */}
      <img
        src={screenshot}
        alt="Demo Preview"
        className="absolute inset-0 h-full w-full object-cover object-top pointer-events-none select-none"
      />

      {/* Overlay + Blur */}
      <div
        className={`absolute inset-0 backdrop-blur-${blurIntensity}`}
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
      />

      {/* Card */}
      <div
        className={`relative z-20 flex min-h-screen w-full items-center justify-center px-4 transition-all duration-700 ease-out 
                ${fadeIn ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      >
        <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
          {/* Header */}
          <div
            className="flex flex-col items-center justify-center py-7"
            style={{
              background: `linear-gradient(90deg, ${themeColor}, #25D366)`,
            }}
          >
            {finalLogo && (
              <img
                src={finalLogo}
                className="mb-2 h-16 w-16 rounded bg-white border object-contain"
                alt="Logo"
              />
            )}
            <h1 className="text-center text-2xl font-bold text-white">
              {title}
            </h1>
            <div className="text-center text-sm text-white opacity-90">
              {tagline}
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            {/* Docs Link */}
            {docsLink && (
              <div className="mb-4 text-base text-gray-700">
                Visit our docs:{" "}
                <a
                  href={docsLink}
                  target="_blank"
                  className="text-green-600 underline"
                >
                  {docsLink}
                </a>
              </div>
            )}

            {/* Info Note */}
            {infoNote && (
              <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800">
                <div className="flex flex-col">
                  <span className="text-green-600 mb-2">💡</span>
                  <div className="leading-relaxed">{infoNote}</div>
                </div>
              </div>
            )}

            {/* Demo Details */}
            <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4 text-[15px]">
              <div className="mb-2">
                <span className="font-semibold">Demo URL: </span>
                <a
                  href={demoUrl}
                  className="text-green-600 underline"
                  target="_blank"
                >
                  {demoUrl}
                </a>
              </div>

              {superAdmin && (
                <div className="mb-3">
                  <span className="font-semibold block">Super Admin:</span>
                  <span>
                    Username: <code>{superAdmin.username}</code>
                  </span>
                  <br />
                  <span>
                    Password: <code>{superAdmin.password}</code>
                  </span>
                </div>
              )}

              {tenant && (
                <div>
                  <span className="font-semibold block">Tenant:</span>
                  <span>
                    Email: <code>{tenant.email}</code>
                  </span>
                  <br />
                  <span>
                    Password: <code>{tenant.password}</code>
                  </span>
                </div>
              )}
            </div>

            {/* CTA */}
            {buttonLink && (
              <a
                href={buttonLink}
                target="_blank"
                className="block text-center rounded-lg py-3 font-semibold text-white hover:opacity-90"
                style={{ backgroundColor: themeColor }}
              >
                {buttonLabel}
              </a>
            )}

            {/* Helper Text */}
            <div className="mt-2 text-center text-xs text-gray-500">
              {bottomHelp ||
                "This demo resets periodically. All changes are temporary."}
            </div>
          </div>

          {/* Support Email */}
          {supportEmail && (
            <div className="border-t border-gray-100 py-3 text-center text-sm">
              Support:{" "}
              <a
                href={`mailto:${supportEmail}`}
                className="text-green-600 underline"
              >
                {supportEmail}
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoPreviewModal;
