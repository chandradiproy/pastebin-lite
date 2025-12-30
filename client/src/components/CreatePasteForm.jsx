import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPaste } from '../lib/api';
import { Loader2, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { clsx } from 'clsx';

export default function CreatePasteForm() {
    const [content, setContent] = useState('');
    const [ttl, setTtl] = useState('');
    const [maxViews, setMaxViews] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResult(null);

        try {
            if (!content.trim()) throw new Error("Content cannot be empty");

            const data = await createPaste(
                content,
                ttl ? parseInt(ttl) : null,
                maxViews ? parseInt(maxViews) : null
            );

            setResult(data);
            setContent(''); // Clear sensitive content from memory/ui
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result?.url) return;
        navigator.clipboard.writeText(result.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (result) {
        return (
            <div className="max-w-2xl mx-auto animate-fade-in space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center shadow-sm">
                    <div className="mx-auto bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="text-green-600" size={24} />
                    </div>
                    <h2 className="text-2xl font-bold text-green-800 mb-2">Paste Created!</h2>
                    <p className="text-green-700 mb-6">Your ephemeral link is ready to share.</p>

                    <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-green-200 shadow-inner">
                        <input
                            readOnly
                            value={result.url}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 text-sm font-mono px-2"
                        />
                        <button
                            onClick={copyToClipboard}
                            className={clsx(
                                "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center space-x-2",
                                copied
                                    ? "bg-green-600 text-white"
                                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                            )}
                        >
                            {copied ? <span>Copied!</span> : <><Copy size={16} /><span>Copy</span></>}
                        </button>
                    </div>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => setResult(null)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                        Create another paste
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto animate-slide-up">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">New Paste</h1>
                <p className="text-slate-500">Share text securely with optional expiration rules.</p>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 flex items-start">
                    <AlertCircle className="text-red-500 mt-0.5 mr-3" size={20} />
                    <p className="text-red-700 text-sm">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">

                {/* Content Input */}
                <div className="space-y-2">
                    <label htmlFor="content" className="block text-sm font-semibold text-slate-700">
                        Paste Content
                    </label>
                    <textarea
                        id="content"
                        rows={10}
                        className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 custom-scrollbar font-mono text-sm leading-relaxed p-4"
                        placeholder="Paste your code or text here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* TTL Input */}
                    <div className="space-y-2">
                        <label htmlFor="ttl" className="block text-sm font-semibold text-slate-700">
                            Expires In (Seconds) <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            id="ttl"
                            min="1"
                            placeholder="e.g. 3600 for 1 hour"
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={ttl}
                            onChange={(e) => setTtl(e.target.value)}
                        />
                        <p className="text-xs text-slate-400">Leave empty to keep forever (unless views limit hits).</p>
                    </div>

                    {/* Max Views Input */}
                    <div className="space-y-2">
                        <label htmlFor="views" className="block text-sm font-semibold text-slate-700">
                            View Limit <span className="text-slate-400 font-normal">(Optional)</span>
                        </label>
                        <input
                            type="number"
                            id="views"
                            min="1"
                            placeholder="e.g. 5 views"
                            className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                            value={maxViews}
                            onChange={(e) => setMaxViews(e.target.value)}
                        />
                        <p className="text-xs text-slate-400">Paste burns after this many distinct reads.</p>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || !content.trim()}
                        className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                        <span>{loading ? 'Creating Paste...' : 'Create Paste'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}