"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  images: string[];
  onCtaClick?: () => void;
  className?: string;
}

const ActionButton = ({ children }: { children: React.ReactNode }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    className={[
      'mt-8 px-8 py-3 rounded-full bg-brand-600 text-white font-semibold',
      'shadow-lg transition-colors hover:bg-brand-700 focus:outline-none',
      'focus:ring-2 focus:ring-brand-400 focus:ring-opacity-75',
    ].join(' ')}
  >
    {children}
  </motion.button>
);

const heroBgGradient = 'bg-[radial-gradient(circle_at_top,rgba(14,165,233,0.16),transparent_38%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef6fb_100%)]'

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  onCtaClick,
  className,
}) => {
  const FADE_IN_ANIMATION_VARIANTS = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
  } as const;

  const duplicatedImages = [...images, ...images, ...images];

  return (
    <section
      className={cn(
        "relative w-full min-h-screen overflow-hidden bg-background flex flex-col items-center justify-center text-center px-4 pt-24",
        className
      )}
    >
      <div className={[
        'absolute inset-0',
        heroBgGradient,
      ].join(' ')} />
      <div className={[
        'absolute inset-0 opacity-50',
        '[background-image:linear-gradient(to_right,rgba(148,163,184,0.09)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.09)_1px,transparent_1px)]',
        '[background-size:56px_56px]',
      ].join(' ')} />

      <div className="z-10 flex flex-col items-center max-w-5xl">
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-4 inline-block rounded-full border border-brand-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-brand-700 backdrop-blur-sm"
        >
          {tagline}
        </motion.div>

        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.08,
              },
            },
          } as const}
          className="text-5xl md:text-7xl font-bold tracking-tighter text-slate-950"
        >
          {typeof title === "string" ? (
            title.split(" ").map((word, i) => (
              <motion.span key={i} variants={FADE_IN_ANIMATION_VARIANTS} className="inline-block">
                {word}&nbsp;
              </motion.span>
            ))
          ) : (
            title
          )}
        </motion.h1>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.35 }}
          className="mt-6 max-w-2xl text-lg md:text-xl text-slate-600"
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.45 }}
        >
          <div onClick={onCtaClick}>
            <ActionButton>{ctaText}</ActionButton>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-1/3 md:h-2/5 [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        <motion.div
          className="flex gap-4 px-4"
          animate={{
            x: ["0%", "-33.333%"],
            transition: {
              ease: "linear",
              duration: 34,
              repeat: Infinity,
            },
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="relative aspect-[3/4] h-48 md:h-64 flex-shrink-0"
              style={{
                rotate: `${index % 2 === 0 ? -2 : 4}deg`,
              }}
            >
              <img
                src={src}
                alt={`Showcase image ${index + 1}`}
                className="w-full h-full object-cover rounded-2xl shadow-md"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedMarqueeHero;
