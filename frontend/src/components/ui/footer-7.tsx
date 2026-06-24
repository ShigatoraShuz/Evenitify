import React from "react";
import { Globe, Mail, MessageCircle, Share2 } from "lucide-react";

interface Footer7Props {
  logo?: {
    url: string;
    src?: string;
    alt?: string;
    title: string;
  };
  sections?: Array<{
    title: string;
    links: Array<{ name: string; href: string }>;
  }>;
  description?: string;
  socialLinks?: Array<{
    icon: React.ReactElement;
    href: string;
    label: string;
  }>;
  copyright?: string;
  legalLinks?: Array<{
    name: string;
    href: string;
  }>;
}

const defaultSections = [
  {
    title: "Product",
    links: [
      { name: "Overview", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Marketplace", href: "#" },
      { name: "Features", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About", href: "#" },
      { name: "Team", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Help", href: "#" },
      { name: "Sales", href: "#" },
      { name: "Advertise", href: "#" },
      { name: "Privacy", href: "#" },
    ],
  },
];

const defaultSocialLinks = [
  { icon: <Globe className="size-5" />, href: "#", label: "Website" },
  { icon: <Mail className="size-5" />, href: "#", label: "Email" },
  { icon: <MessageCircle className="size-5" />, href: "#", label: "Message" },
  { icon: <Share2 className="size-5" />, href: "#", label: "Share" },
];

const defaultLegalLinks = [
  { name: "Terms and Conditions", href: "#" },
  { name: "Privacy Policy", href: "#" },
];

export const Footer7 = ({
  logo = {
    url: "#",
    src: "",
    alt: "Eventify logo",
    title: "Eventify",
  },
  sections = defaultSections,
  description = "Eventify is a procurement-focused platform that helps organizers discover vendors, send requests, track bookings, and manage event operations in one place.",
  socialLinks = defaultSocialLinks,
  copyright = `© ${new Date().getFullYear()} Eventify. All rights reserved.`,
  legalLinks = defaultLegalLinks,
}: Footer7Props) => {
  return (
    <section className="relative z-10 border-t border-[#16335f] bg-[#071526] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-col justify-between gap-10 lg:flex-row lg:items-start lg:text-left text-white">
          <div className="flex w-full flex-col justify-between gap-6 lg:items-start">
            <div className="flex items-center gap-3 lg:justify-start">
              <a href={logo.url} className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-300/40 bg-white shadow-sm">
                  <svg viewBox="0 0 32 32" className="h-7 w-7 text-brand-700" aria-hidden="true">
                    <path
                      d="M8 21.5C8 13.5 12.5 9 20.5 9H24v3.5h-3.3c-5.5 0-8.7 3.2-8.7 9v1.2c0 3.1 1.8 4.8 4.9 4.8H24V31H15.2C10 31 8 28.8 8 23.7v-2.2Z"
                      fill="currentColor"
                    />
                    <circle cx="23" cy="8" r="3" fill="currentColor" opacity="0.9" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-white">{logo.title}</h2>
              </a>
            </div>
            <p className="max-w-[32rem] text-sm leading-6 text-slate-200">{description}</p>
            <ul className="flex items-center space-x-6 text-white">
              {socialLinks.map((social, idx) => (
                <li key={idx} className="font-medium text-white transition-colors hover:text-brand-200">
                  <a href={social.href} aria-label={social.label}>
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="grid w-full gap-8 md:grid-cols-3 lg:gap-16">
            {sections.map((section, sectionIdx) => (
              <div key={sectionIdx}>
                <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-white">
                  {section.title}
                </h3>
                <ul className="space-y-3 text-sm text-slate-200">
                  {section.links.map((link, linkIdx) => (
                    <li key={linkIdx} className="font-medium text-slate-200 transition-colors hover:text-white">
                      <a href={link.href}>{link.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-4 border-t border-[#16335f] pt-8 text-xs font-medium text-slate-200 md:flex-row md:items-center md:text-left">
          <p className="order-2 lg:order-1">{copyright}</p>
          <ul className="order-1 flex flex-col gap-2 md:order-2 md:flex-row md:gap-6">
            {legalLinks.map((link, idx) => (
              <li key={idx} className="transition-colors hover:text-white">
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Footer7;
