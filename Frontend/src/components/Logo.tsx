"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

const Logo = ({ className = "", size = "md", showIcon = true }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl md:text-3xl",
    lg: "text-3xl md:text-4xl",
  };

  const iconSizes = {
    sm: "w-5 h-5",
    md: "w-7 h-7 md:w-8 md:h-8",
    lg: "w-10 h-10 md:w-12 md:h-12",
  };

  return (
    <Link href="/" className={`flex items-center ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center space-x-2"
      >
        {showIcon && (
          <motion.div
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              repeatDelay: 2,
              ease: "easeInOut"
            }}
            className="text-teal-400"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={iconSizes[size]}
            >
              {/* Simple Leaf Icon */}
              <path
                d="M17 8C17 5.24 14.76 3 12 3S7 5.24 7 8c0 4.5 5 10 5 10s5-5.5 5-10z"
                fill="currentColor"
              />
              <path
                d="M12 2C9.24 2 7 4.24 7 7c0 3.5 2.5 7 5 9.5 2.5-2.5 5-6 5-9.5 0-2.76-2.24-5-5-5z"
                fill="currentColor"
                opacity="0.3"
              />
            </svg>
          </motion.div>
        )}
        <span
          className={`font-bold bg-gradient-to-r from-teal-400 via-green-400 to-emerald-500 bg-clip-text text-transparent ${sizeClasses[size]} tracking-tight`}
        >
          EcoScan
        </span>
      </motion.div>
    </Link>
  );
};

export default Logo;

