'use client';

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";
import Image from "next/image";

export default function SignInPage() {
  return (
    <div className="min-h-screen ghibli-gradient-bg relative overflow-hidden">
      {/* Ghibli-inspired subtle texture */}
      <div className="ghibli-texture"></div>
      
      {/* Generate random cloud positions for the Ghibli-style background */}
      <div className="ghibli-clouds">
        {Array(6).fill(0).map((_, i) => {
          const size = 30 + Math.random() * 100;
          return (
            <div
              key={i}
              className="ghibli-cloud"
              style={{
                width: `${size}px`,
                height: `${size * 0.6}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 30}%`,
                animationDelay: `${Math.random() * 20}s`,
                animationDuration: `${40 + Math.random() * 40}s`,
              }}
            />
          );
        })}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute left-5 md:left-20 bottom-1/3 transform -translate-y-1/2 opacity-30 dark:opacity-20 hidden md:block">
        <div className="w-32 h-48 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute right-5 md:right-20 top-1/3 transform -translate-y-1/2 opacity-30 dark:opacity-20 hidden md:block">
        <div className="w-36 h-36 bg-indigo-400/20 dark:bg-indigo-600/20 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto p-4 relative z-10 flex flex-col items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <div className="size-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="w-9 h-9"
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 ghibli-title">Short Video Creator</h1>
          <p className="text-xl ghibli-subtitle mb-2">Sign in to create magical videos</p>
          <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto"></div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className=""
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border shadow-xl overflow-hidden p-1">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-primary hover:bg-primary/90',
                  footerActionLink: 'text-primary hover:text-primary/90',
                  card: 'shadow-none p-0 bg-transparent',
                  formContainer: 'gap-2',
                  formFieldInput: 'h-10',
                  formFieldLabel: 'text-sm font-medium',
                  form: 'w-full max-w-none px-2',
                  rootBox: 'w-full'
                }
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
} 