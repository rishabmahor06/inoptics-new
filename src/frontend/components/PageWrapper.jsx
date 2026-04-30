import { motion } from "framer-motion";

const pageVariants = {
  initial: { opacity: 0, y: 50 },
  in:      { opacity: 1, y: 0,   transition: { duration: 0.6, ease: "easeInOut" } },
  out:     { opacity: 0, y: -50, transition: { duration: 0.6, ease: "easeInOut" } },
};

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      className="absolute top-0 left-0 w-full min-h-screen"
    >
      {children}
    </motion.div>
  );
}
