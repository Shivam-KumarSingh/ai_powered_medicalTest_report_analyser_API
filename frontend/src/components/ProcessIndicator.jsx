import React from 'react';
import { FileText, CheckCircle, MessageSquare, BarChart2 } from 'lucide-react';
const IconMap = {
    'OCR & Extraction': FileText, 
    'Normalization (Gemini)': BarChart2, 
    'Guardrail Check': CheckCircle, 
    'Summary Generation': MessageSquare 
};

const ProcessIndicator = ({ status, results, STEPS }) => {
    const width = results ? 100 : (status.currentStep > 0 ? STEPS[status.currentStep].width : 0);

    return (
        <section className="mt-10 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-bold mb-4 text-gray-700">Process Flow</h2>
            
            {/* Progress Bar */}
            <div id="progress-bar" className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${width}%` }}></div>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-4 gap-4 text-center">
                {Object.keys(STEPS).map(key => {
                    const stepId = parseInt(key);
                    const step = STEPS[stepId];
                    const IconComponent = IconMap[step.name];
                    const isDone = status.currentStep > stepId || results;
                    const isActive = status.currentStep === stepId;

                    let classes = 'p-3 rounded-xl transition duration-500 flex flex-col items-center border-2';
                    if (isDone) {
                        classes += ' bg-emerald-50 border-emerald-500 text-emerald-700 shadow-md';
                    } else if (isActive) {
                        classes += ' bg-yellow-50 border-yellow-500 text-yellow-700 shadow-xl scale-105';
                    } else {
                        classes += ' bg-gray-100 border-gray-300 text-gray-400 opacity-60';
                    }

                    return (
                        <div key={key} className={classes}>
                            {IconComponent && <IconComponent className="h-6 w-6 mb-1" />}
                            <p className="text-xs font-semibold">{stepId}. {step.name}</p>
                        </div>
                    );
                })}
            </div>
            {/* Running Message */}
            <p className={`mt-4 text-center font-medium ${status.isProcessing ? 'text-emerald-600' : (status.error ? 'text-red-600' : 'text-gray-500')}`}>
                {status.message || 'Ready for next step.'}
            </p>
        </section>
    );
};

export default ProcessIndicator;
