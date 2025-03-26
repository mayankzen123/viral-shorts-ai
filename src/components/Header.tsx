'use client';

import Link from "next/link";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="w-full relative z-10">
      <div className="container px-4 py-6 md:px-6 lg:py-8 mx-auto">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <Link href="/">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <div className="size-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  className="w-5 h-5"
                >
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold gradient-text">ShortScript</h1>
            </motion.div>
          </Link>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center space-x-6"
          >
            <nav className="hidden md:flex items-center space-x-6">
              <Button variant="ghost" asChild>
                <Link href="#features">Features</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="#trending">Trending</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link href="#help">Help</Link>
              </Button>
            </nav>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2 py-1 rounded-full font-medium">BETA</span>
              </div>
              <ThemeToggle />
            </div>
          </motion.div>
        </div>
      </div>
    </header>
  );
} 