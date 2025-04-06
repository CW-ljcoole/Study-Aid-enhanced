"use client";

import React, { useState, useRef, useEffect } from 'react';
import Atrament from 'atrament';
import Tesseract from 'tesseract.js';

export default function NoteTaking() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const [canvasData, setCanvasData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWeight, setCurrentWeight] = useState(2);
  const [currentMode, setCurrentMode] = useState('draw');
  
  const canvasRef = useRef(null);
  const atramentRef = useRef(null);
  
  // Color options
  const colorOptions = [
    { name: 'Black', value: '#000000' },
    { name: 'Blue', value: '#0000FF' },
    { name: 'Red', value: '#FF0000' },
    { name: 'Green', value: '#008000' },
    { name: 'Purple', value: '#800080' }
  ];
  
  // Weight options
  const weightOptions = [
    { name: 'Thin', value: 1 },
    { name: 'Normal', value: 2 },
    { name: 'Medium', value: 4 },
    { name: 'Thick', value: 6 }
  ];
  
  // Initialize Atrament when component mounts
  useEffect(() => {
    if (canvasRef.current) {
      atramentRef.current = new Atrament(canvasRef.current, {
        width: 800,
        height: 600,
        color: currentColor,
        weight: currentWeight,
        smoothing: 0.85,
        adaptiveStroke: true
      });
      
      // Set initial mode
      setDrawingMode(currentMode);
    }
    
    return () => {
      // Clean up if needed
    };
  }, []);
  
  // Update Atrament properties when they change
  useEffect(() => {
    if (atramentRef.current) {
      atramentRef.current.color = currentColor;
      atramentRef.current.weight = currentWeight;
      setDrawingMode(currentMode);
    }
  }, [currentColor, currentWeight, currentMode]);
  
  // Load saved notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('study-aid-notes');
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (error) {
        console.error('Failed to parse saved notes:', error);
      }
    }
  }, []);
  
  // Save notes to localStorage when they change
  useEffect(() => {
    if (notes.length > 0) {
      localStorage.setItem('study-aid-notes', JSON.stringify(notes));
    }
  }, [notes]);
  
  // Load canvas data when current note changes
  useEffect(() => {
    if (currentNote && currentNote.canvasData && atramentRef.current) {
      clearCanvas();
      
      // Load the image data
      const img = new Image();
      img.onload = () => {
        const context = canvasRef.current?.getContext('2d');
        if (context) {
          context.drawImage(img, 0, 0);
        }
      };
      img.src = currentNote.canvasData;
      
      // Update state
      setNoteTitle(currentNote.title);
      setRecognizedText(currentNote.textContent);
      setCanvasData(currentNote.canvasData);
    } else if (isCreatingNew) {
      clearCanvas();
      setNoteTitle('');
      setRecognizedText('');
      setCanvasData(null);
    }
  }, [currentNote, isCreatingNew]);
  
  // Helper function to set drawing mode
  const setDrawingMode = (mode) => {
    if (!atramentRef.current) return;
    
    switch (mode) {
      case 'draw':
        atramentRef.current.mode = 'draw';
        break;
      case 'erase':
        atramentRef.current.mode = 'erase';
        break;
      default:
        atramentRef.current.mode = 'draw';
    }
  };
  
  // Clear the canvas
  const clearCanvas = () => {
    if (atramentRef.current) {
      atramentRef.current.clear();
      setCanvasData(null);
    }
  };
  
  // Handle creating a new note
  const handleCreateNote = () => {
    clearCanvas();
    setCurrentNote(null);
    setIsCreatingNew(true);
    setNoteTitle('');
    setRecognizedText('');
  };
  
  // Handle selecting an existing note
  const handleSelectNote = (note) => {
    setCurrentNote(note);
    setIsCreatingNew(false);
  };
  
  // Handle saving a note
  const handleSaveNote = () => {
    if (!noteTitle.trim()) {
      alert('Please enter a title for your note');
      return;
    }
    
    setIsSaving(true);
    
    // Get canvas data
    const currentCanvasData = canvasRef.current?.toDataURL() || null;
    
    const noteData = {
      id: currentNote?.id || `note-${Date.now()}`,
      title: noteTitle,
      canvasData: currentCanvasData || '',
      textContent: recognizedText,
      createdAt: currentNote?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Check if it's an update or a new note
    if (notes.some(note => note.id === noteData.id)) {
      // Update existing note
      setNotes(notes.map(note => 
        note.id === noteData.id ? noteData : note
      ));
    } else {
      // Add new note
      setNotes([...notes, noteData]);
    }
    
    setCurrentNote(noteData);
    setIsCreatingNew(false);
    setIsSaving(false);
    setCanvasData(currentCanvasData);
  };
  
  // Handle deleting a note
  const handleDeleteNote = (noteId) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      setNotes(notes.filter(note => note.id !== noteId));
      
      // If the deleted note is the current note, reset current note
      if (currentNote && currentNote.id === noteId) {
        setCurrentNote(null);
      }
    }
  };
  
  // Handle OCR text recognition
  const handleRecognizeText = async () => {
    if (!canvasRef.current) return;
    
    setIsRecognizing(true);
    
    try {
      // Get canvas data URL
      const dataUrl = canvasRef.current.toDataURL();
      
      // Recognize text using Tesseract.js
      const result = await Tesseract.recognize(
        dataUrl,
        'eng', // English language
        { 
          logger: m => console.log(m)
        }
      );
      
      // Update recognized text
      setRecognizedText(prevText => {
        // Append new text to existing text
        return prevText ? `${prevText}\n${result.data.text}` : result.data.text;
      });
    } catch (error) {
      console.error('Error recognizing text:', error);
      alert('Failed to recognize text. Please try again.');
    } finally {
      setIsRecognizing(false);
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Note Taking</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 bg-white shadow rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Notes</h2>
              <button
                onClick={handleCreateNote}
                className="inline-flex items-center p-1 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {notes.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {notes.map((note) => (
                  <li key={note.id} className="py-3">
                    <div className="flex justify-between">
                      <button
                        onClick={() => handleSelectNote(note)}
                        className={`text-sm font-medium hover:text-indigo-600 truncate ${
                          currentNote && currentNote.id === note.id ? 'text-indigo-600' : 'text-gray-900'
                        }`}
                      >
                        {note.title}
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(note.updatedAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">No notes yet</p>
                <p className="text-xs text-gray-400 mt-1">Create a new note to get started</p>
              </div>
            )}
          </div>
          
          {/* Note Taking Interface */}
          {(currentNote || isCreatingNew) ? (
            <div className="flex-1 bg-white shadow rounded-lg p-6">
              {/* Note Header */}
              <div className="flex justify-between items-center mb-6">
                <input
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="Enter note title..."
                  className="text-xl font-medium text-gray-900 border-b border-gray-300 focus:border-indigo-500 focus:outline-none w-full"
                />
                <button
                  onClick={handleSaveNote}
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isSaving ? 'Saving...' : 'Save Note'}
                </button>
              </div>
              
              {/* Drawing Area */}
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1">
                  <div className="border border-gray-300 rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={600}
                      className="w-full touch-none"
                    />
                  </div>
                </div>
                
                {/* Drawing Tools */}
                <div className="w-full lg:w-64 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Drawing Tools</h3>
                  
                  {/* Drawing Mode */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Mode</label>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentMode('draw')}
                        className={`flex-1 py-2 px-3 text-xs font-medium rounded-md ${
                          currentMode === 'draw'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        Draw
                      </button>
                      <button
                        onClick={() => setCurrentMode('erase')}
                        className={`flex-1 py-2 px-3 text-xs font-medium rounded-md ${
                          currentMode === 'erase'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 border border-gray-300'
                        }`}
                      >
                        Erase
                      </button>
                    </div>
                  </div>
                  
                  {/* Color Selection */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          onClick={() => setCurrentColor(color.value)}
                          className={`w-6 h-6 rounded-full ${
                            currentColor === color.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                          }`}
                          style={{ backgroundColor: color.value }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {/* Line Weight */}
                  <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 mb-2">Line Weight</label>
                    <div className="flex space-x-2">
                      {weightOptions.map(weight => (
                        <button
                          key={weight.value}
                          onClick={() => setCurrentWeight(weight.value)}
                          className={`flex-1 py-2 px-3 text-xs font-medium rounded-md ${
                            currentWeight === weight.value
                              ? 'bg-indigo-600 text-white'
                              : 'bg-white text-gray-700 border border-gray-300'
                          }`}
                        >
                          {weight.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={clearCanvas}
                      className="w-full py-2 px-3 text-xs font-medium rounded-md bg-white text-red-600 border border-red-300 hover:bg-red-50"
                    >
                      Clear Canvas
                    </button>
                    <button
                      onClick={handleRecognizeText}
                      disabled={isRecognizing}
                      className="w-full py-2 px-3 text-xs font-medium rounded-md bg-white text-indigo-600 border border-indigo-300 hover:bg-indigo-50"
                    >
                      {isRecognizing ? 'Recognizing...' : 'Recognize Text'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Recognized Text */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Recognized Text</h3>
                <textarea
                  value={recognizedText}
                  onChange={(e) => setRecognizedText(e.target.value)}
                  placeholder="Handwritten text will appear here after recognition..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white shadow rounded-lg flex items-center justify-center p-6">
              <div className="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No note selected</h3>
                <p className="mt-1 text-sm text-gray-500">Create a new note or select one from the sidebar.</p>
                <div className="mt-6">
                  <button
                    onClick={handleCreateNote}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create New Note
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
