'use client'

import { useState, useRef } from 'react';

export default function ScoldingGenerator() {
  const [scoldingText, setScoldingText] = useState<string>("Press the button to hear what Amma has to say...");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [showPlayButton, setShowPlayButton] = useState<boolean>(false);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);

  // Main function to get scolding
  const getScolding = async () => {
    setIsLoading(true);
    setUserInteracted(true); // Mark that user has interacted
    setShowPlayButton(false); // Hide play button when generating new content
    setScoldingText(''); // Clear previous scolding
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl); // Clean up previous audio URL
      setAudioUrl(null); // Hide audio player
    }

    try {
      // Fetch scolding text from our Next.js API route (generates Manglish)
      const response = await fetch('/api/scolding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch scolding from API');
      }

      const data = await response.json();
      const generatedManglishText = data.scolding;
      
      setScoldingText(generatedManglishText); // Display the Manglish text
      
      // Generate speech from the Manglish text (which will be translated to Malayalam server-side)
      await generateSpeechFromText(generatedManglishText);
      
    } catch (error: any) {
      console.error('Error generating scolding:', error);
      setScoldingText(`Amma is taking a break. Try again later! (${error.message || 'Unknown error'})`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to generate speech from text using the new server-side endpoint
  const generateSpeechFromText = async (manglishText: string) => {
    try {
        const response = await fetch('/api/tts-malayalam', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ manglishText }),
        });

        if (!response.ok) {
            const errorText = await response.text(); // Get raw error text
            console.error('TTS API error response:', errorText);
            throw new Error(`Failed to generate speech: ${response.status} - ${errorText}`);
        }

        const audioBlob = await response.blob();
        const url = URL.createObjectURL(audioBlob);
        
        console.log('Audio blob created:', audioBlob.size, 'bytes');
        console.log('Audio URL created:', url);
        
        setAudioUrl(url);
        
        // Ensure audio element exists and is properly configured
        if (audioPlayerRef.current) {
            console.log('Setting audio source and attempting to play');
            audioPlayerRef.current.src = url;
            audioPlayerRef.current.load();
            
            // Add event listeners for debugging
            audioPlayerRef.current.addEventListener('loadeddata', () => {
                console.log('Audio data loaded');
            });
            
            audioPlayerRef.current.addEventListener('canplay', () => {
                console.log('Audio can start playing');
            });
            
            audioPlayerRef.current.addEventListener('error', (e) => {
                console.error('Audio error:', e);
            });
            
            // Try to play immediately
            const attemptPlay = async () => {
                try {
                    console.log('Attempting to play audio...');
                    if (audioPlayerRef.current) {
                        audioPlayerRef.current.volume = 1.0;
                        const playPromise = audioPlayerRef.current.play();
                        
                        if (playPromise !== undefined) {
                            await playPromise;
                            console.log('Audio playing successfully!');
                        }
                    }
                } catch (error) {
                    console.log('Play attempt failed:', error);
                    console.log('Showing play button as fallback');
                    setShowPlayButton(true);
                }
            };
            
            // Try playing once data is loaded
            audioPlayerRef.current.addEventListener('canplaythrough', attemptPlay, { once: true });
            
            // Also try immediately in case it's already loaded
            setTimeout(attemptPlay, 100);
        } else {
            console.error('Audio player ref is null');
            setShowPlayButton(true);
        }
        
        // Clean up the URL when audio ends
        audioPlayerRef.current?.addEventListener('ended', () => {
            if (url) URL.revokeObjectURL(url);
        }, { once: true });
        
    } catch (error) {
        console.error('Error in speech generation:', error);
        // Optionally update scoldingText to show TTS error
        setScoldingText(prev => prev + "\n(Audio generation failed)");
    }
  };

  // Manual play function for fallback
  const playAudioManually = async () => {
    if (audioPlayerRef.current) {
      try {
        await audioPlayerRef.current.play();
        setShowPlayButton(false); // Hide button once playing
        console.log('Audio playing manually');
      } catch (error) {
        console.error('Manual play failed:', error);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Card */}
      <div className="bg-off-white rounded-2xl shadow-lg border border-warm-beige/50 p-8 text-center">
        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-warm-maroon mb-2">
            Amma's Digital Scoldings
          </h1>
          <p className="text-lg text-dark-green font-medium">
            അമ്മയുടെ വഴക്ക്
          </p>
        </div>

        {/* Text Display Area */}
        <div id="scoldingDisplay" className="bg-warm-beige/30 border border-warm-beige rounded-lg p-6 mb-6 min-h-[120px] flex items-center justify-center">
          <p className={`text-center ${isLoading ? 'text-gray-500 italic' : 'text-dark-green font-medium text-lg leading-relaxed'}`}>
            {isLoading ? 'Thinking of a good one...' : scoldingText}
          </p>
        </div>

        {/* Button */}
        <button 
          id="scoldingButton" 
          className="w-full bg-warm-maroon hover:bg-warm-maroon/90 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 mb-6"
          onClick={getScolding}
          disabled={isLoading}
        >
          {isLoading ? 'Generating...' : 'Get a Scolding!'}
        </button>

        {/* Audio Player - Temporarily visible for debugging */}
        <audio 
          ref={audioPlayerRef} 
          preload="auto"
          controls
          style={{ width: '100%', marginTop: '10px' }}
        >
          Your browser does not support the audio element.
        </audio>

        {/* Fallback Play Button - Only shows if autoplay fails */}
        {showPlayButton && (
          <div className="mt-4 text-center">
            <button 
              onClick={playAudioManually}
              className="bg-dark-green hover:bg-dark-green/90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200"
            >
              🔊 Play Audio
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Made with ❤️ for nostalgic memories
        </p>
      </div>
    </div>
  );
}
