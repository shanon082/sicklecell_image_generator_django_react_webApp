import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Footer from '../components/footer';
import Header from '../components/header';

const ProcessData = () => {
  const [file, setFile] = useState(null);
  const [multiplier, setMultiplier] = useState(5);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');

    if (selectedFile) {
      if (!selectedFile.name.endsWith('.zip')) {
        setError('Please upload a ZIP file containing images (.png, .jpg, .jpeg).');
        setFile(null);
        setFileName('');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setError('');

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith('.zip')) {
        setError('Please upload a ZIP file containing images (.png, .jpg, .jpeg).');
        setFile(null);
        setFileName('');
        return;
      }

      setFile(droppedFile);
      setFileName(droppedFile.name);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a ZIP file to upload.');
      return;
    }

    setProcessing(true);
    setUploadProgress(0);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('original_file', file);
    formData.append('multiplier', multiplier);

    try {
      // Step 1: Upload file
      const uploadResponse = await axios.post('http://localhost:8000/api/processes/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
      });

      const processId = uploadResponse.data.id;

      // Step 2: Process data
      await axios.post(`http://localhost:8000/api/processes/${processId}/process_data/`);

      // Step 3: Get results
      const processResponse = await axios.get(`http://localhost:8000/api/processes/${processId}/`);
      setResult(processResponse.data);

    } catch (error) {
      console.error('Error processing file:', error);
      setError(error.response?.data?.error || 'An error occurred while processing your file. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-primary-50">
      <Header />

      <main className="flex-grow py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-4xl font-bold text-primary-900 mb-4">Process Your Images</h1>
              <p className="text-xl text-primary-700 leading-relaxed">Upload a ZIP file containing images, and our AI will classify and generate synthetic images.</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-md">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-primary-900 mb-2">Upload Your Zipped Images</label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${file ? 'border-green-500 bg-green-50' : 'border-primary-300 hover:border-primary-400'
                      } ${error ? 'border-red-500 bg-red-50' : ''}`}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                      accept=".zip"
                    />

                    {file ? (
                      <div className="animate-fade-in">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="text-green-700 font-medium">{file.name}</p>
                        <p className="text-sm text-primary-500 mt-2">Click or drag to change file</p>
                      </div>
                    ) : (
                      <div>
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                        <p className="text-primary-700">
                          <span className="text-primary-600 font-medium">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-sm text-primary-500 mt-2">ZIP files containing images (.png, .jpg, .jpeg)</p>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="mt-2 flex items-center text-red-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{error}</span>
                    </div>
                  )}
                </div>

                {/* Multiplier Input */}
                <div>
                  <label htmlFor="multiplier" className="block text-sm font-medium text-primary-900 mb-2">
                    Multiplication Factor
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      id="multiplier"
                      min="2"
                      max="20"
                      value={multiplier}
                      onChange={(e) => setMultiplier(parseInt(e.target.value))}
                      className="w-full h-2 bg-primary-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                      disabled={processing}
                    />
                    <span className="text-lg font-semibold text-primary-600 min-w-[2rem]">{multiplier}x</span>
                  </div>
                  <p className="text-sm text-primary-500 mt-2">Number of times to multiply your image dataset</p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-lg flex items-center justify-center rounded-lg font-medium transition-colors duration-200 shadow-md disabled:bg-primary-400 disabled:cursor-not-allowed"
                  disabled={processing || !file}
                >
                  {processing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    'Process Images'
                  )}
                </button>
              </form>

              {/* Progress Bar */}
              {processing && (
                <div className="mt-8 animate-slide-up">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-primary-900">Processing</span>
                    <span className="text-sm font-medium text-primary-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-primary-200 rounded-full h-2.5">
                    <div
                      className="bg-primary-600 h-2.5 rounded-full transition-all duration-300 animate-progress"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-primary-500 mt-2">
                    {uploadProgress < 30 && "Uploading your ZIP file..."}
                    {uploadProgress >= 30 && uploadProgress < 70 && "Classifying images..."}
                    {uploadProgress >= 70 && uploadProgress < 90 && "Generating synthetic images..."}
                    {uploadProgress >= 90 && "Finalizing and creating download..."}
                  </p>
                </div>
              )}

              {/* Results Section */}
              {result && (
                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-green-800 font-semibold">Processing Complete!</h3>
                      <p className="text-green-700 mt-1 leading-relaxed">Your images have been classified and synthetic images generated.</p>
                      <div className="mt-4">
                        <h4 className="text-primary-900 font-semibold">Classification Summary:</h4>
                        <pre className="text-primary-700 text-sm bg-primary-100 p-4 rounded-lg">
                          {JSON.stringify(result.classification_summary, null, 2)}
                        </pre>
                        <p className="text-primary-700 mt-2">GAN Used: <span className="font-semibold">{result.gan_used}</span></p>
                        <a
                          href={result.processed_file}
                          className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-lg px-4 py-2 font-medium transition-colors duration-200 shadow-md mt-4"
                          download
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Download Generated Images
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Information Section */}
            <div className="mt-10 bg-white p-8 rounded-xl shadow-md">
              <h2 className="text-xl font-semibold text-primary-900 mb-4">About Image Uploads</h2>
              <div className="prose prose-primary">
                <p className="text-primary-700 leading-relaxed">
                  Upload a ZIP file containing images (.png, .jpg, .jpeg). Our system will classify the images and generate synthetic images based on the majority class using advanced AI models.
                </p>
                <h3 className="text-lg font-medium text-primary-900 mt-4">Supported File Types Inside ZIP:</h3>
                <ul className="list-disc pl-5 text-primary-700 leading-relaxed">
                  <li>PNG images (.png)</li>
                  <li>JPEG images (.jpg, .jpeg)</li>
                </ul>
                <h3 className="text-lg font-medium text-primary-900 mt-4">Maximum File Size:</h3>
                <p className="text-primary-700 leading-relaxed">100MB per ZIP file</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProcessData;