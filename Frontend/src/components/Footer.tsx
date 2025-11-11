"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { useState, useEffect } from "react";
import Logo from "./Logo";

const Footer = () => {
  const [mounted, setMounted] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Ensure component is mounted before rendering client-side content
  useEffect(() => {
    setMounted(true);
    setCurrentYear(new Date().getFullYear());
  }, []);


  const socialLinks = [
    { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/priyanshu-raj-0b4a9624b/", label: "LinkedIn" },
    { icon: <FaGithub />, url: "https://github.com/priyanshu30405", label: "GitHub" },
  ];

  const footerLinks = [
    { title: "Home", url: "/" },
    { title: "About Us", url: "#about" },
    { title: "How to Use", url: "#how-to-use" },
    { title: "Contact Us", url: "#contact" },
  ];

  // Return simple placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Simple loading placeholder */}
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Logo 
                size="lg" 
                showIcon={true}
                className="text-white mb-4"
              />
              <p className="text-gray-400 mb-4">
                Transforming waste into opportunities with intelligent AI analysis for a greener tomorrow.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-teal-400 transition-colors duration-200"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {footerLinks.map((link, index) => (
                  <li key={index}>
                    <Link
                      href={link.url}
                      className="text-gray-400 hover:text-teal-400 transition-colors duration-200"
                    >
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Newsletter */}
          <div className="col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
              <p className="text-gray-400 mb-4">
                 Subscribe to our newsletter for the latest updates on
                sustainable waste management.
              </p>
              <form className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="px-4 py-2 w-full rounded-l-md focus:outline-none text-gray-900"
                  required
                />
                <button
                  type="submit"
                  className="bg-teal-600 text-white px-4 py-2 rounded-r-md hover:bg-teal-700 transition-colors duration-200"
                >
                  Subscribe
                </button>
              </form>
            </motion.div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {currentYear} EcoScan. All rights reserved.</p>
          <p className="mt-2">Created by Priyanshu Raj</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
