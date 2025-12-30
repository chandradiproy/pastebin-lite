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
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400">
                <Loader2 className="animate-spin mb-4" size={40} />
                <p>Retrieving paste securely...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-xl mx-auto mt-10 text-center animate-fade-in">
                <div className="bg-red-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="text-red-500" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Unavailable</h2>
                <p className="text-slate-600 mb-8">{error}</p>
                <Link
                    to="/"
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                    Create New Paste
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto animate-slide-up">
            {/* Meta Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="flex items-center space-x-2 text-slate-500">
                    <FileText size={18} />
                    <span className="font-mono text-sm font-medium text-slate-700">ID: {id}</span>
                </div>

                <div className="flex items-center gap-6 text-sm text-slate-500">
                    {paste.remaining_views !== null && (
                        <div className="flex items-center space-x-1.5" title="Remaining Views">
                            <Eye size={16} className="text-indigo-500" />
                            <span>
                                <span className="font-bold text-slate-700">{paste.remaining_views}</span> views left
                            </span>
                        </div>
                    )}

                    {paste.expires_at && (
                        <div className="flex items-center space-x-1.5" title="Expires At">
                            <Calendar size={16} className="text-orange-500" />
                            <span>
                                Expires {new Date(paste.expires_at).toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl opacity-10 group-hover:opacity-20 transition duration-1000 blur"></div>
                <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Raw Content</span>
                    </div>
                    {/* Safe rendering using pre tag */}
                    <pre className="p-6 overflow-x-auto text-sm sm:text-base font-mono leading-relaxed text-slate-800 whitespace-pre-wrap break-words">
                        {paste.content}
                    </pre>
                </div>
            </div>

            <div className="mt-8 text-center">
                <Link
                    to="/"
                    className="text-slate-400 hover:text-indigo-600 text-sm font-medium transition-colors"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}