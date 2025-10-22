import React from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/footer';
import Header from '../components/header';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-50 to-primary-100">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 lg:py-28">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-900 mb-6 leading-tight">
                Transform Your Data with <span className="text-primary-600">AI-Powered</span> Image Generation
              </h1>
              <p className="text-xl text-primary-700 mb-10 max-w-2xl mx-auto leading-relaxed">
                Upload your dataset and let our advanced algorithm multiply your images while maintaining integrity, creating enhanced datasets for machine learning and analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/process" className="bg-primary-600 hover:bg-primary-700 text-white text-lg px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md">
                  Get Started
                </Link>
                <Link to="/how-it-works" className="bg-secondary-100 hover:bg-secondary-200 text-primary-700 text-lg px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md">
                  How It Works
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-primary-900 mb-12">Powerful Features</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-primary-50 p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary-900">ZIP File Upload</h3>
                <p className="text-primary-700 leading-relaxed">Upload your dataset as a ZIP file containing CSV, JSON, Excel, or text files for processing.</p>
              </div>

              <div className="bg-primary-50 p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary-900">Smart Processing</h3>
                <p className="text-primary-700 leading-relaxed">Our AI-powered algorithm intelligently multiplies your data while preserving patterns and relationships.</p>
              </div>

              <div className="bg-primary-50 p-6 rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-primary-900">Secure Download</h3>
                <p className="text-primary-700 leading-relaxed">Download your multiplied data in a convenient ZIP format. Your data is never stored longer than necessary.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Multiply Your Data?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">Join thousands of data scientists and analysts who use our tool to enhance their datasets.</p>
            <Link to="/process" className="bg-white text-primary-700 hover:bg-primary-50 text-lg px-8 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md">
              Start Processing Now
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;