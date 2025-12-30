import React from 'react';
import { Link } from 'react-router-dom';
import { ClipboardType } from 'lucide-react';

export default function Layout({ children }) {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                        <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
                            <ClipboardType size={20} />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                            Pastebin Lite
                        </span>
                    </Link>

                    <nav>
                        <Link
                            to="/"
                            className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                        >
                            + New Paste
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-200 bg-slate-50 py-6 mt-auto">
                <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} Pastebin Lite. Secure, ephemeral text sharing.</p>
                </div>
            </footer>
        </div>
    );
}