import React from 'react';
import { Upload, Loader, XCircle } from 'lucide-react';

const ReportForm = ({ 
    file, 
    textInput, 
    status, 
    fileInputRef, 
    handleFileChange, 
    handleTextChange, 
    processReport 
}) => {
    return (
        <section className="mb-8">
            <h2 className="text-2xl font-bold mb-5 text-gray-700">Source Input</h2>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                {/* File Upload */}
                <div className="flex-1 border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-emerald-500 transition duration-300">
                    <label onClick={() => fileInputRef.current.click()} className="cursor-pointer block text-center">
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                            {file ? file.name : 'Click to upload Image/PDF Report'}
                        </span>
                        <input 
                            ref={fileInputRef} 
                            type="file" 
                            className="hidden" 
                            accept="image/jpeg,image/png,application/pdf" 
                            onChange={handleFileChange}
                        />
                    </label>
                </div>

                {/* Text Input */}
                <div className="flex-1">
                    <textarea 
                        id="text-input" 
                        rows="5" 
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-emerald-500 focus:border-emerald-500 resize-none" 
                        placeholder="Or paste unstructured raw text here (e.g., 'Glucose: 95, Cholesterol: 220')."
                        value={textInput}
                        onChange={handleTextChange}>
                    </textarea>
                </div>
            </div>

            {/* Control and Error */}
            <div className="mt-8 flex flex-col items-center">
                {status.error && (
                    <div className="p-3 mb-4 bg-red-100 text-red-700 rounded-lg flex items-center shadow-inner">
                        <XCircle className="h-5 w-5 mr-2" />
                        <p className="font-medium text-sm">{status.error}</p>
                    </div>
                )}

                <button onClick={processReport} 
                    disabled={status.isProcessing || (!file && !textInput)}
                    className="bg-emerald-600 text-white font-semibold py-3 px-10 rounded-full shadow-lg hover:bg-emerald-700 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center group">
                    <span className="text-lg">
                        {status.isProcessing ? 'Analyzing...' : 'Analyze & Simplify Report'}
                    </span>
                    {status.isProcessing && (
                        <Loader className="animate-spin h-5 w-5 ml-3" />
                    )}
                </button>
            </div>
        </section>
    );
};

export default ReportForm;
