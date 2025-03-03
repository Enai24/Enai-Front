/**
 * @description
 *   The AudioPlayer component provides in-browser audio playback controls.
 *   It supports play/pause functionality, displays progress, and can be extended
 *   to include volume and speed controls.
 * @notes
 *   - This component uses the HTML5 <audio> element.
 */

import React, { useState, useRef } from 'react';

const AudioPlayer = ({ audioUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      {audioUrl ? (
        <div className="flex items-center space-x-2">
          <audio ref={audioRef} src={audioUrl} />
          <button
            onClick={togglePlayback}
            className="px-2 py-1 bg-gray-700 text-white rounded focus:outline-none"
            aria-label={isPlaying ? "Pause audio" : "Play audio"}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        </div>
      ) : (
        <span className="text-gray-400">No recording available</span>
      )}
    </div>
  );
};

export default AudioPlayer;