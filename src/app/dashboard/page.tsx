"use client";

import React from 'react';
import Link from 'next/link';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Study Aid App</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src="https://ui-avatars.com/api/?name=Demo+User"
                alt="Profile" 
                className="h-8 w-8 rounded-full"
              />
              <span className="text-sm font-medium text-gray-700">Demo User</span>
            </div>
            <Link
              href="/auth/signin"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <Link
              href="/documents"
              className="border-indigo-500 text-indigo-600 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Documents
            </Link>
            <Link
              href="/notes"
              className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            >
              Notes
            </Link>
            <span className="border-transparent text-gray-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Flashcards (Coming Soon)
            </span>
            <span className="border-transparent text-gray-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Quiz (Coming Soon)
            </span>
            <span className="border-transparent text-gray-400 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm">
              Study Guide (Coming Soon)
            </span>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white shadow rounded-lg p-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Welcome to Your Study Aid</h2>
            <p className="text-gray-500 mb-4">
              This application helps you organize your study materials and take notes with handwriting recognition.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-md font-medium text-gray-900 mb-2">Document Viewer</h3>
                <p className="text-gray-500 mb-4">Upload and view your study documents with annotation capabilities.</p>
                <Link 
                  href="/documents" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Documents
                </Link>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                <h3 className="text-md font-medium text-gray-900 mb-2">Note Taking</h3>
                <p className="text-gray-500 mb-4">Take handwritten notes with OCR capabilities to convert to text.</p>
                <Link 
                  href="/notes" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Notes
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
