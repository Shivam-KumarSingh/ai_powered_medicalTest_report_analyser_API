import React from 'react';
import { useReportProcessor } from './hooks/useReportProcessor';

import ReportForm from './components/ReportForm';
import ProcessIndicator from './components/ProcessIndicator';
import ResultsDisplay from './components/ResultsDisplay';


const App = () => {
    // Call the custom hook to get all state and logic
    const {
        file,
        textInput,
        results,
        status,
        fileInputRef,
        handleFileChange,
        handleTextChange,
        processReport,
        STEPS
    } = useReportProcessor();

    return (
        <div className="bg-gray-50 min-h-screen text-gray-800 font-sans p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-emerald-600 mb-2">AI Medical Report Simplifier</h1>
                    <p className="text-lg text-gray-600">Securely extract, normalize, and interpret lab results using Gemini AI.</p>
                </header>

                <main className="bg-white p-6 sm:p-10 rounded-2xl shadow-3xl border border-gray-100">
                    
                    {/* Input and Control Section */}
                    <ReportForm 
                        file={file}
                        textInput={textInput}
                        status={status}
                        fileInputRef={fileInputRef}
                        handleFileChange={handleFileChange}
                        handleTextChange={handleTextChange}
                        processReport={processReport}
                    />
                    
                    {/* Status and Progress Tracker Section */}
                    {(status.isProcessing || status.currentStep > 0 || results) && (
                        <ProcessIndicator status={status} results={results} STEPS={STEPS} />
                    )}

                    {/* Results Section */}
                    <ResultsDisplay results={results} />
                    
                </main>
            </div>
        </div>
    );
};

export default App;
