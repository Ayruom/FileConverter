"use client";

import { motion } from "framer-motion";
import { Conversion, CONVERSIONS, labelFor } from "@/lib/formats";

type FormatPickerProps = {
  selected?: Conversion;
  onSelect: (conversion: Conversion) => void;
};

export function FormatPicker({ selected, onSelect }: FormatPickerProps) {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-2"
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.025 } }
      }}
    >
      {CONVERSIONS.slice(0, 25).map((conversion) => {
        const active = selected?.slug === conversion.slug;
        return (
          <motion.button
            key={conversion.slug}
            type="button"
            onClick={() => onSelect(conversion)}
            className={`rounded-md border px-3 py-2 text-sm transition ${
              active
                ? "border-accent bg-accent text-white"
                : "border-border bg-surface text-zinc-300 hover:border-accent hover:text-white"
            }`}
            variants={{
              hidden: { opacity: 0, y: 8 },
              show: { opacity: 1, y: 0 }
            }}
          >
            {labelFor(conversion.from)} to {labelFor(conversion.to)}
          </motion.button>
        );
      })}
    </motion.div>
  );
}
