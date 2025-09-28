import React from 'react';

const TestTable = ({ tests }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ref Range</th>
                    
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {(tests || []).map((test, index) => {
                    const isAbnormal = test.status && (test.status.toLowerCase() === 'high' || test.status.toLowerCase() === 'low');
                    return (
                        <tr key={index} className={isAbnormal ? 'bg-red-50/50' : 'hover:bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{test.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.value} <span className="text-xs text-gray-400">{test.unit}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${isAbnormal ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'} uppercase`}>
                                    {test.status || 'N/A'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.ref_range ? `${test.ref_range.low} - ${test.ref_range.high}` : 'N/A'}
                            </td>
                            
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

export default TestTable;
