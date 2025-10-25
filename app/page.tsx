"use client";

import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <section className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-5xl font-bold mb-4"
      >
        Bienvenue sur <span className="text-brand-orange">MS SaaS Starter</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-gray-600 mb-8 max-w-xl"
      >
        Un template Next.js + Tailwind + shadcn + Framer prêt à l’emploi pour
        lancer tes futurs SaaS.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      ></motion.div>
    </section>
  );
}
