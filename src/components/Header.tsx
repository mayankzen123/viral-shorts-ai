'use client';

import { ThemeToggle } from "@/components/ui/theme-toggle";
import { motion } from "framer-motion";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Button } from "./ui/button";
import Link from "next/link";

export function Header() {
  const { isSignedIn, user } = useUser();
  
  return (
    <header className="w-full relative z-10">
      <div className="container px-4 py-8 md:px-6 lg:py-12 mx-auto">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-2"
            >
              <Link href="/">
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
              </Link>
              <Link href="/">
                <h1 className="text-4xl font-bold gradient-text">ShortScript</h1>
              </Link>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-muted-foreground text-center md:text-left"
            >
              Create viral short-form videos with AI
            </motion.p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-600 text-white px-2 py-1 rounded-full font-medium">BETA</span>
            </div>
            
            {isSignedIn ? (
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="text-sm font-medium hidden md:block">
                    Hello, {user.firstName || user.username}
                  </div>
                )}
                <UserButton 
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "w-9 h-9"
                    }
                  }}
                  afterSignOutUrl="/"
                />
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal" appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90',
                    footerActionLink: 'text-primary hover:text-primary/90',
                    card: 'shadow-none p-0 bg-transparent',
                    formContainer: 'gap-2',
                    formFieldInput: 'h-10',
                    formFieldLabel: 'text-sm font-medium',
                    form: 'w-full max-w-none px-2',
                    rootBox: 'w-full',
                    modalContent: 'max-w-md sm:max-w-lg'
                  },
                  layout: {
                    logoPlacement: "inside",
                    showOptionalFields: false
                  },
                  variables: {
                    colorPrimary: 'hsl(var(--primary))',
                    colorText: 'hsl(var(--foreground))',
                    colorTextSecondary: 'hsl(var(--muted-foreground))',
                    colorBackground: 'transparent',
                    colorInputText: 'hsl(var(--foreground))',
                    colorInputBackground: 'hsl(var(--input))',
                    borderRadius: '0.5rem'
                  }
                }}>
                  <Button variant="ghost" size="sm">Sign in</Button>
                </SignInButton>
                <SignUpButton mode="modal" appearance={{
                  elements: {
                    formButtonPrimary: 'bg-primary hover:bg-primary/90',
                    footerActionLink: 'text-primary hover:text-primary/90',
                    card: 'shadow-none p-0 bg-transparent',
                    formContainer: 'gap-2',
                    formFieldInput: 'h-10',
                    formFieldLabel: 'text-sm font-medium',
                    form: 'w-full max-w-none px-2',
                    rootBox: 'w-full',
                    modalContent: 'max-w-md sm:max-w-lg'
                  },
                  layout: {
                    logoPlacement: "inside",
                    showOptionalFields: false
                  },
                  variables: {
                    colorPrimary: 'hsl(var(--primary))',
                    colorText: 'hsl(var(--foreground))',
                    colorTextSecondary: 'hsl(var(--muted-foreground))',
                    colorBackground: 'transparent',
                    colorInputText: 'hsl(var(--foreground))',
                    colorInputBackground: 'hsl(var(--input))',
                    borderRadius: '0.5rem'
                  }
                }}>
                  <Button size="sm">Sign up</Button>
                </SignUpButton>
              </div>
            )}
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
} 