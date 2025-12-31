import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardType, Moon, Sun } from 'lucide-react';

export default function Layout({ children }) {
    // Initialize dark mode from localStorage or system preference
    const [darkMode, setDarkMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('theme');
            if (saved) return saved === 'dark';
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return false;
    });

    // Apply dark mode class to html element
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [darkMode]);

    return (
        <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header */}
            <header className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <div className="bg-indigo-600 p-1.5 rounded-lg text-white shadow-md">
                            <ClipboardType size={20} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400">
                            Pastebin Lite
                        </span>
                    </Link>

                    <div className="flex items-center space-x-6">
                        <nav>
                            <Link
                                to="/"
                                className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                            >
                                + New Paste
                            </Link>
                        </nav>

                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
                            aria-label="Toggle Dark Mode"
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content - Flex Grow to take available space, centered vertically */}
            <main className="flex-grow flex flex-col items-center justify-center w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 overflow-y-auto">
                <div className="w-full">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="flex-none border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 py-4">
                <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 dark:text-slate-500 text-xs">
                    <p>© {new Date().getFullYear()} Pastebin Lite. Secure, ephemeral text sharing.</p>
                </div>
            </footer>
        </div>
    );
}