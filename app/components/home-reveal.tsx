"use client";

import Localize from "@/app/i18n/localize";
import { LazyMotion, domAnimation, m } from "motion/react";
import type { ReactNode } from "react";
import useReducedMotionPreference from "../lib/use-reduced-motion";

export default function HomeReveal({ children }: { children: ReactNode }) {
  const reduced = useReducedMotionPreference();
  return <Localize>{(
    <LazyMotion features={domAnimation}>
      <m.div
        initial={false}
        whileInView={{ y: 0 }}
        style={{ y: reduced ? 0 : 22 }}
        viewport={{ once: true, amount: 0.08 }}
        transition={{ duration: reduced ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </m.div>
    </LazyMotion>
  )}</Localize>;
}
