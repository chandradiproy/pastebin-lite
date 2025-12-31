import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPaste } from '../lib/api';
import { Loader2, AlertTriangle, Calendar, Eye, FileText } from 'lucide-react';

export default function ViewPaste() {
    const { id } = useParams();
    const [paste, setPaste] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const data = await getPaste(id);
                if (isMounted) setPaste(data);
            } catch (err) {
                if (isMounted) setError(err.message);
            } finally {
                if (isMounted) setLoading(false);
            }
        }

        fetchData();
        return () => { isMounted = false; };
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 dark:text-slate-500 animate-fade-in">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p className="font-medium">Retrieving paste securely...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full animate-fade-in px-4">
                <div className="max-w-md w-full text-center bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <AlertTriangle className="text-red-500 dark:text-red-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unavailable</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">{error}</p>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-lg"
                    >
                        Create New Paste
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-slide-up h-full flex flex-col w-full">
            {/* Meta Bar */}
            <div className="flex-none flex flex-wrap items-center justify-between gap-4 mb-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
                <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400">
                    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <FileText size={20} className="text-slate-700 dark:text-slate-300" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400 dark:text-slate-500">Paste ID</span>
                        <span className="font-mono text-sm font-bold text-slate-700 dark:text-slate-200">{id}</span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-slate-500 dark:text-slate-400">
                    {paste.remaining_views !== null && (
                        <div className="flex items-center space-x-2" title="Remaining Views">
                            <Eye size={18} className="text-indigo-500 dark:text-indigo-400" />
                            <span className="font-medium">
                                <span className="font-bold text-slate-700 dark:text-slate-200">{paste.remaining_views}</span> views left
                            </span>
                        </div>
                    )}

                    {paste.expires_at && (
                        <div className="flex items-center space-x-2" title="Expires At">
                            <Calendar size={18} className="text-orange-500" />
                            <span className="font-medium">
                                Expires {new Date(paste.expires_at).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area - Flex Grow to fill remaining height */}
            <div className="flex-grow relative group min-h-[300px] mb-4">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-10 group-hover:opacity-20 transition duration-1000 blur"></div>
                <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden h-full flex flex-col transition-colors">
                    <div className="flex-none bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center transition-colors">
                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                            Raw Content
                        </span>
                    </div>
                    {/* Safe rendering using pre tag with flex-grow */}
                    <pre className="flex-grow p-6 sm:p-8 overflow-auto text-sm sm:text-base font-mono leading-relaxed text-slate-800 dark:text-slate-300 whitespace-pre-wrap break-words custom-scrollbar bg-white dark:bg-slate-900">
                        {paste.content}
                    </pre>
                </div>
            </div>

            <div className="flex-none pb-2 text-center">
                <Link
                    to="/"
                    className="inline-flex items-center space-x-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium transition-colors py-2 px-4 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                    <span>← Back to Home</span>
                </Link>
            </div>
        </div>
    );
}