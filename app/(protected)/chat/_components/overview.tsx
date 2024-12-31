import { motion } from "framer-motion";
import Link from "next/link";

import { MessageIcon, VercelIcon } from "@/components/icons";
import Image from "next/image";

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex gap-2 items-center leading-relaxed text-center max-w-xl">
        <Image
          src="/images/symbol.png"
          alt="Subreddify"
          width={26}
          height={26}
        />
        <h3 className="text-lg">How can I help you today?</h3>
      </div>
    </motion.div>
  );
};
