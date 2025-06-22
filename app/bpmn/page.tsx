'use client';

import { useState, ChangeEvent } from 'react';

export default function BpmnUploader() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [analysis, setAnalysis] = useState('');

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result;
        setFileContent(text as string);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = async () => {
    if (fileContent) {
      setIsLoading(true);
      setMessage('');
      setAnalysis('');
      try {
        const response = await fetch('/api/bmpn', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ bpmn: fileContent }),
        });

        const data = await response.json();

        if (response.ok) {
          setMessage('BPMN content sent successfully');
          setAnalysis(data.analysis);
        } else {
          setMessage(`Failed to send BPMN content: ${data.error}`);
        }
      } catch (error) {
        setMessage('An error occurred while sending the BPMN content.');
        console.error('An error occurred:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Upload BPMN File
        </h1>
        <div className="mb-4">
          <input
            type="file"
            accept=".bpmn"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={!fileContent || isLoading}
          className="w-full px-4 py-2 text-white bg-violet-600 rounded-md hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Submit'}
        </button>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
        {analysis && (
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h2 className="text-lg font-semibold text-gray-800">
              Analysis Result
            </h2>
            <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap font-sans">
              {analysis}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
