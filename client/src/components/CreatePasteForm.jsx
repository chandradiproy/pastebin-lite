import React, { useState } from 'react';
import { createPaste } from '../lib/api';
import { Loader2, AlertCircle, CheckCircle2, Copy } from 'lucide-react';
import { clsx } from 'clsx';

export default function CreatePasteForm() {
    const [content, setContent] = useState('');

    // TTL State
    const [ttlValue, setTtlValue] = useState('');
    const [ttlUnit, setTtlUnit] = useState('3600'); // Default to Hours (3600s)

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

            // Convert User friendly TTL to seconds
            let finalTtl = null;
            if (ttlValue && parseInt(ttlValue) > 0) {
                finalTtl = parseInt(ttlValue) * parseInt(ttlUnit);
            }

            const data = await createPaste(
                content,
                finalTtl,
                maxViews ? parseInt(maxViews) : null
            );

            setResult(data);
            setContent('');
            setTtlValue('');
            setMaxViews('');
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
            <div className="max-w-2xl mx-auto animate-fade-in space-y-6 bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
                <div className="text-center">
                    <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="text-green-600 dark:text-green-400" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Paste Created!</h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">Your link is ready. It will vanish based on your settings.</p>

                    <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
                        <input
                            readOnly
                            value={result.url}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-200 text-sm font-mono px-2 outline-none w-full"
                        />
                        <button
                            onClick={copyToClipboard}
                            className={clsx(
                                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center space-x-2 shadow-sm",
                                copied
                                    ? "bg-green-600 text-white"
                                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                            )}
                        >
                            {copied ? <span>Copied!</span> : <><Copy size={16} /><span>Copy</span></>}
                        </button>
                    </div>

                    <button
                        onClick={() => setResult(null)}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium text-sm"
                    >
                        Create another paste
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto animate-slide-up flex flex-col md:flex-row gap-6 items-stretch">

            {/* Left Side: Editor */}
            <div className="flex-1 flex flex-col">
                {error && (
                    <div className="mb-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 flex items-start rounded-r-lg">
                        <AlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex-1 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col">
                    <textarea
                        className="w-full h-[400px] md:h-full bg-transparent border-none focus:ring-0 text-slate-800 dark:text-slate-200 font-mono text-sm leading-relaxed p-6 resize-none custom-scrollbar focus:outline-none"
                        placeholder="Type or paste your content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck="false"
                        required
                    />
                </div>
            </div>

            {/* Right Side: Settings */}
            <div className="w-full md:w-80 flex-none space-y-6">
                <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 h-full flex flex-col justify-between">

                    <div className="space-y-6">
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
                            <h2 className="font-bold text-slate-900 dark:text-white text-lg">Settings</h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Configure how long your paste survives.</p>
                        </div>

                        {/* TTL Input Group */}
                        <div className="space-y-3">
                            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Expiration (TTL)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    placeholder="Val"
                                    className="w-1/3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                                    value={ttlValue}
                                    onChange={(e) => setTtlValue(e.target.value)}
                                />
                                <select
                                    value={ttlUnit}
                                    onChange={(e) => setTtlUnit(e.target.value)}
                                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white cursor-pointer"
                                >
                                    <option value="60">Minutes</option>
                                    <option value="3600">Hours</option>
                                    <option value="86400">Days</option>
                                </select>
                            </div>
                            <p className="text-xs text-slate-400">Leave empty to keep forever.</p>
                        </div>

                        {/* Max Views Input */}
                        <div className="space-y-3">
                            <label htmlFor="views" className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                                View Limit
                            </label>
                            <input
                                type="number"
                                id="views"
                                min="1"
                                placeholder="e.g. 5 views"
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all dark:text-white"
                                value={maxViews}
                                onChange={(e) => setMaxViews(e.target.value)}
                            />
                            <p className="text-xs text-slate-400">Paste burns after this many reads.</p>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit"
                            disabled={loading || !content.trim()}
                            className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
                            <span>{loading ? 'Creating...' : 'Create Paste'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}