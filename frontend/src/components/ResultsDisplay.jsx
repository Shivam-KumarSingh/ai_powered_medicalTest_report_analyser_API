import React from 'react';
import { MessageSquare } from 'lucide-react';
import TestTable from './TestTable';

const ResultsDisplay = ({ results }) => {
    if (!results) return null;

    return (
        <section className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-3xl font-bold mb-6 text-emerald-600">Analysis Complete</h2>

            {/* Summary Card */}
            <div className="bg-emerald-50 p-6 rounded-xl shadow-lg mb-8 border border-emerald-300">
                <h3 className="text-xl font-semibold text-emerald-700 mb-3 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" /> Patient Summary
                </h3>
                
                {/* 1. Main Summary */}
                <p className="text-gray-800 text-lg leading-relaxed italic mb-4" id="result-summary">
                    {results.summary}
                </p>

                {/* 2. Explanations Section */}
                {results.explanations && results.explanations.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-emerald-300">
                        <h4 className="text-base font-semibold text-emerald-700 mb-2">Key Explanations:</h4>
                        <ul className="list-disc list-inside text-gray-800 space-y-1 pl-4">
                            {results.explanations.map((explanation, i) => (
                                <li key={i} className="text-base leading-relaxed">{explanation}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Normalized Data Table */}
            <h3 className="text-xl font-semibold mt-8 mb-4 text-gray-700">Detailed Results</h3>
            <TestTable tests={results.tests} />

            <div className="mt-8 text-sm text-gray-500 border-t pt-4">
                <p className="font-semibold">Overall Processing Confidence: <span className="text-emerald-600">{(results.normalizationConfidence ? Math.round(results.normalizationConfidence * 100) : 'N/A')}%</span></p>
                <p className="text-xs mt-2">Disclaimer: This information is for educational purposes only. Always consult a healthcare professional for diagnosis or treatment.</p>
            </div>
        </section>
    );
};

export default ResultsDisplay;
