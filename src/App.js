import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen, Trophy, Play } from 'lucide-react';
import { flashcardData } from './data/flashcardData';
import './App.css';

const VocabularyFlashcardApp = () => {
  const [currentLevel, setCurrentLevel] = useState(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState('menu'); // 'menu', 'study'
  const [animating, setAnimating] = useState(false);
  const [completedLevels, setCompletedLevels] = useState(new Set());
  const [inProgressLevels, setInProgressLevels] = useState(new Set());

  // Get cards for a specific level (50 cards per level)
  const getCardsForLevel = (level) => {
    const startIndex = (level - 1) * 50;
    const endIndex = startIndex + 50;
    return flashcardData.slice(startIndex, endIndex);
  };

  const startLevel = (level) => {
    setCurrentLevel(level);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setMode('study');
    // Mark level as in progress if not already completed
    if (!completedLevels.has(level)) {
      setInProgressLevels(prev => new Set([...prev, level]));
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    const levelCards = getCardsForLevel(currentLevel);
    if (currentCardIndex < levelCards.length - 1 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentCardIndex(currentCardIndex + 1);
        setTimeout(() => setAnimating(false), 50);
      }, 150);
    } else if (currentCardIndex === levelCards.length - 1) {
      // Level completed
      setCompletedLevels(prev => new Set([...prev, currentLevel]));
      setInProgressLevels(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentLevel);
        return newSet;
      });
      setMode('menu');
    }
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0 && !animating) {
      setAnimating(true);
      setTimeout(() => {
        setIsFlipped(false);
        setCurrentCardIndex(currentCardIndex - 1);
        setTimeout(() => setAnimating(false), 50);
      }, 150);
    }
  };

  const handleKeyPress = (e) => {
    if (mode === 'study') {
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleFlip();
      }
      if (e.key === ' ') {
        e.preventDefault();
        handleFlip();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [mode, currentCardIndex, currentLevel, isFlipped, animating]);

  // Menu View
  if (mode === 'menu') {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <BookOpen className="text-white mr-3" size={48} />
              <h1 className="text-5xl font-bold text-white">Vocabulary Master</h1>
            </div>
            <p className="text-white/80 text-xl">Master 1000 essential words through 20 progressive levels</p>
            <div className="mt-4 flex items-center justify-center text-white/60">
              <Trophy className="mr-2" size={20} />
              <span>{completedLevels.size}/20 levels completed</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 max-w-2xl mx-auto">
            <div className="bg-white/20 rounded-full h-3">
              <div 
                className="bg-yellow-400 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(completedLevels.size / 20) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Level Grid */}
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-10 gap-3">
              {Array.from({ length: 20 }, (_, i) => {
                const level = i + 1;
                const isCompleted = completedLevels.has(level);
                const isInProgress = inProgressLevels.has(level);
                
                let buttonStyle = '';
                let iconColor = '';
                let textColor = '';
                
                if (isCompleted) {
                  buttonStyle = 'bg-green-500 text-white shadow-lg border-2 border-green-400';
                  iconColor = 'text-yellow-300';
                  textColor = 'text-white';
                } else if (isInProgress) {
                  buttonStyle = 'bg-orange-400 text-white shadow-md border-2 border-orange-300';
                  iconColor = 'text-white';
                  textColor = 'text-white';
                } else {
                  buttonStyle = 'bg-white/90 text-gray-800 hover:bg-white border-2 border-transparent hover:border-blue-200';
                  iconColor = 'text-gray-600';
                  textColor = 'text-gray-800';
                }
                
                return (
                  <button
                    key={level}
                    onClick={() => startLevel(level)}
                    className={`
                      relative p-4 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                      ${buttonStyle}
                    `}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center mb-2">
                        {isCompleted ? (
                          <Trophy className={iconColor} size={20} />
                        ) : isInProgress ? (
                          <Play className={iconColor} size={20} />
                        ) : (
                          <Play className={iconColor} size={20} />
                        )}
                      </div>
                      <h3 className={`text-lg font-bold ${textColor}`}>{level}</h3>
                    </div>
                    {isCompleted && (
                      <div className="absolute top-1 right-1">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 max-w-2xl mx-auto bg-white/10 rounded-2xl p-6">
            <h3 className="text-white text-lg font-semibold mb-3">How to Study:</h3>
            <div className="text-white/80 space-y-2">
              <p>• Each level contains 50 vocabulary words</p>
              <p>• Click or use ↑↓ arrows / spacebar to flip cards</p>
              <p>• Use ←→ arrows to navigate between cards</p>
              <p>• Complete all cards in a level to unlock the next one</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Study View
  if (mode === 'study' && currentLevel) {
    const levelCards = getCardsForLevel(currentLevel);
    const currentCard = levelCards[currentCardIndex];
    
    if (!currentCard) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <div className="text-white text-center">
            <p className="text-xl">Loading cards...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setMode('menu')}
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ChevronLeft className="mr-2" size={24} />
              Back to Levels
            </button>
            
            <div className="text-center">
              <h2 className="text-white text-2xl font-bold">Level {currentLevel}</h2>
              <p className="text-white/80">
                Card {currentCardIndex + 1} of {levelCards.length}
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentCardIndex(0);
                setIsFlipped(false);
              }}
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <RotateCcw className="mr-2" size={20} />
              Restart
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="bg-white/20 rounded-full h-2">
              <div 
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentCardIndex + 1) / levelCards.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Flashcard */}
          <div className="max-w-4xl mx-auto">
            <div className="relative" style={{ perspective: '1000px' }}>
              <div
                className={`
                  relative w-full h-96 transition-all duration-700 cursor-pointer flashcard
                  ${isFlipped ? 'flipped' : ''} 
                  ${animating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
                `}
                onClick={handleFlip}
              >
                {/* Front of card - Word */}
                <div className="flashcard-face flashcard-front absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8">
                  <div className="text-center flex-1 flex items-center justify-center">
                    <h3 className="text-5xl font-bold text-gray-800 mb-4">{currentCard.word}</h3>
                  </div>
                  <p className="text-gray-500 text-lg">Click or press ↑↓/Space to see definition</p>
                </div>
                
                {/* Back of card - Definition and Usage */}
                <div className="flashcard-face flashcard-back absolute inset-0 bg-white rounded-3xl shadow-2xl flex flex-col justify-center p-8">
                  <div className="text-center space-y-6">
                    <div>
                      <h4 className="text-2xl font-semibold text-gray-800 mb-3">Definition:</h4>
                      <p className="text-xl text-gray-700 leading-relaxed">{currentCard.definition}</p>
                    </div>
                    
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="text-xl font-semibold text-gray-800 mb-3">Example Usage:</h4>
                      <p className="text-lg text-gray-600 italic leading-relaxed">"{currentCard.usage}"</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center mt-8 space-x-8">
            <button
              onClick={handlePrevious}
              disabled={currentCardIndex === 0}
              className={`
                flex items-center px-6 py-3 rounded-full font-medium transition-all
                ${currentCardIndex === 0 
                  ? 'bg-white/20 text-white/50 cursor-not-allowed' 
                  : 'bg-white/20 text-white hover:bg-white/30 transform hover:scale-105'
                }
              `}
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous
            </button>
            
            <button
              onClick={handleNext}
              className={`
                flex items-center px-6 py-3 rounded-full font-medium transition-all transform hover:scale-105
                ${currentCardIndex === levelCards.length - 1
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
                }
              `}
            >
              {currentCardIndex === levelCards.length - 1 ? 'Complete Level' : 'Next'}
              <ChevronRight size={20} className="ml-2" />
            </button>
          </div>

          {/* Keyboard shortcuts */}
          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              Use ←→ arrows to navigate • ↑↓ or Space to flip • ESC to return to menu
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VocabularyFlashcardApp;