import { useEffect, useState, useCallback } from "react";
import { getSpeakOutmsg } from "../../services/SpeakOutMsgList";
import Loader from "../../components/common/Loader";
import { useParams } from "react-router-dom";
import { FaComments, FaExclamationTriangle, FaUser, FaClock, FaVolumeUp } from "react-icons/fa";
import "./SpeakOutMsg.css";

const SpeakOutMsg = () => {
  const { shareCode } = useParams();
  const [speakOutData, setSpeakOutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Language detection function
  const detectLanguage = (text) => {
    // This is a simple heuristic-based language detection
    // In a real application, you might want to use a more sophisticated library
    
    // Common Odia characters
    const odiaRegex = /[\u0B00-\u0B7F]/;
    // Common Hindi characters
    const hindiRegex = /[\u0900-\u097F]/;
    // Common Bengali characters
    const bengaliRegex = /[\u0980-\u09FF]/;
    // Common Telugu characters
    const teluguRegex = /[\u0C00-\u0C7F]/;
    // Common Tamil characters
    const tamilRegex = /[\u0B80-\u0BFF]/;
    
    if (text && typeof text === 'string') {
      // Check for Odia characters first (highest priority for this app)
      if (odiaRegex.test(text)) return "or-IN";
      // Check for Hindi characters
      if (hindiRegex.test(text)) return "hi-IN";
      // Check for Bengali characters
      if (bengaliRegex.test(text)) return "bn-IN";
      // Check for Telugu characters
      if (teluguRegex.test(text)) return "te-IN";
      // Check for Tamil characters
      if (tamilRegex.test(text)) return "ta-IN";
    }
    
    // Default to English if no Indian language detected
    return "en-US";
  };

  const selectVoice = useCallback((utter, voices, language) => {
    // For Indian languages, look for specific voice patterns
    const languageVoices = voices.filter(voice => {
      // Check if voice supports the detected language
      if (voice.lang === language) return true;
      
      // For Odia specifically, check alternative language codes
      if (language === "or-IN" && (
        voice.lang.includes("or") || 
        voice.lang.includes("Oriya") ||
        voice.lang.includes("odia") ||
        voice.lang.includes("OR")
      )) return true;
      
      // For other Indian languages, check if they support Indian languages
      if (language.endsWith("-IN") && (
        voice.lang.includes("IN") || 
        voice.lang.includes("India") ||
        voice.name.includes("India") ||
        voice.name.includes("Hindi") ||
        voice.name.includes("Google") // Google voices often support multiple languages
      )) return true;
      
      return false;
    });
    
    // Prefer female voices
    const femaleVoices = languageVoices.filter(voice => 
      voice.name.includes("Female") || 
      voice.name.includes("female") ||
      voice.name.includes("Woman") ||
      voice.name.includes("woman") ||
      voice.name.includes("Google UK English Female") ||
      voice.name.includes("Microsoft Zira") ||
      voice.name.includes("Samantha") ||
      voice.name.includes("Karen") ||
      voice.name.includes("Kyoko") ||
      voice.name.includes("Yuna") ||
      voice.name.includes("Kalpana") // Indian female voices
    );
    
    // Use female voice if available, otherwise use any voice for the language
    if (femaleVoices.length > 0) {
      utter.voice = femaleVoices[0];
    } else if (languageVoices.length > 0) {
      utter.voice = languageVoices[0];
    }
    
    // Special handling for Odia
    if (language === "or-IN") {
      // Try to adjust parameters for better Odia pronunciation
      utter.rate = 0.9; // Slightly slower for complex scripts
    }
  }, []);

  const speakMessage = useCallback((message) => {
    if ("speechSynthesis" in window && message) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Detect language automatically
      const detectedLanguage = detectLanguage(message);
      
      const utter = new window.SpeechSynthesisUtterance(message);
      utter.lang = detectedLanguage;
      
      // Get all available voices
      let voices = window.speechSynthesis.getVoices();
      
      // If voices are not immediately available, try to get them after a short delay
      if (voices.length === 0) {
        // Sometimes voices are loaded asynchronously
        setTimeout(() => {
          voices = window.speechSynthesis.getVoices();
          selectVoice(utter, voices, detectedLanguage);
          window.speechSynthesis.speak(utter);
        }, 100);
        return;
      }
      
      // Select appropriate voice
      selectVoice(utter, voices, detectedLanguage);
      
      // Set pitch and rate for a more natural tone
      utter.pitch = 1.0;
      utter.rate = 1.0;
      
      utter.onstart = () => setIsSpeaking(true);
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utter);
    }
  }, [selectVoice]);

  const handleTextToSpeech = () => {
    if (!speakOutData?.shaktiRaKahani) return;

    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        speakMessage(speakOutData.shaktiRaKahani);
      }
    }
  };

  useEffect(() => {
    const fetchSpeakOutData = async () => {
      try {
        setLoading(true);
        const response = await getSpeakOutmsg(shareCode);
        if (response.data && response.data.outcome) {
          const data = response.data.data;
          setSpeakOutData(data);
          
          // Automatically read the message when it loads
          if (data?.shaktiRaKahani) {
            // Small delay to ensure DOM is ready and voices are loaded
            setTimeout(() => {
              speakMessage(data.shaktiRaKahani);
            }, 1000);
          }
        } else {
          setError(response.data?.message || "Failed to fetch message");
        }
      } catch (err) {
        console.error("Error fetching message:", err);
        setError("Failed to load message");
      } finally {
        setLoading(false);
      }
    };

    if (shareCode) {
      fetchSpeakOutData();
    } else {
      setError("No share code provided");
      setLoading(false);
    }

    // Load voices when component mounts
    const loadVoices = () => {
      if ("speechSynthesis" in window) {
        // This will trigger voice loading
        window.speechSynthesis.getVoices();
      }
    };

    loadVoices();

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [shareCode, speakMessage]);

  if (loading) {
    return (
      <div className="speak-out-container">
        <div className="message-card loading">
          <Loader />
          <p>Loading your message...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="speak-out-container">
        <div className="message-card error">
          <div className="icon-wrapper">
            <FaExclamationTriangle />
          </div>
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button 
            className="retry-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!speakOutData) {
    return (
      <div className="speak-out-container">
        <div className="message-card empty">
          <div className="icon-wrapper">
            <FaComments />
          </div>
          <h2>No Message Found</h2>
          <p>The message you're looking for doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const { userName, shaktiRaKahani, messageTime } = speakOutData;

  return (
    <div className="speak-out-container">
      <div className="message-card">
        <div className="card-header">
          <div className="icon-wrapper primary">
            <FaComments />
          </div>
          <div className="header-content">
            <h1>Speak Out Message</h1>
            <p>Someone shared their thoughts with you</p>
          </div>
        </div>

        <div className="message-content">
          <div className="message-text left-align">
            {shaktiRaKahani || "No message content available"}
          </div>
        </div>

        <div className="message-footer">
          <div className="user-info">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-details">
              <span className="user-name">{userName || "Anonymous"}</span>
              {messageTime && (
                <span className="message-time">
                  <FaClock />
                  {new Date(messageTime).toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className={`action-btn ${isSpeaking ? 'speaking' : ''}`}
              onClick={handleTextToSpeech}
              disabled={!speakOutData?.shaktiRaKahani}
            >
              <FaVolumeUp />
              {isSpeaking ? 'Stop' : 'Listen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakOutMsg;