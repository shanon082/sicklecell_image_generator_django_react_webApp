import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-900 text-white py-12">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Sickle-Cell Image Generator</h3>
            <p className="text-primary-200 leading-relaxed">AI-powered data multiplication tool for enhanced datasets and machine learning.</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary-100">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-primary-200 hover:text-white transition-colors duration-200">Home</Link></li>
              <li><Link to="/how-it-works" className="text-primary-200 hover:text-white transition-colors duration-200">How It Works</Link></li>
              <li><Link to="/process" className="text-primary-200 hover:text-white transition-colors duration-200">Process Data</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary-100">Resources</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-primary-200 hover:text-white transition-colors duration-200">Documentation</a></li>
              <li><a href="#" className="text-primary-200 hover:text-white transition-colors duration-200">API Reference</a></li>
              <li><a href="#" className="text-primary-200 hover:text-white transition-colors duration-200">Tutorials</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-primary-100">Contact</h4>
            <ul className="space-y-3">
              <li><a href="mailto:support@datamultiplier.com" className="text-primary-200 hover:text-white transition-colors duration-200">support@datamultiplier.com</a></li>
              <li><a href="#" className="text-primary-200 hover:text-white transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-primary-200 hover:text-white transition-colors duration-200">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-primary-700 mt-10 pt-8 text-center text-primary-200">
          <p>&copy; {new Date().getFullYear()} Sickle-Cell Image Generator. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;