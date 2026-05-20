import React, { useEffect, useRef, useState } from 'react';

import ChatbotIcon from './component/ChatbotIcon';
import ChatForm from './component/ChatForm';
import ChatMessage from './component/ChatMessage';
import { uneeyaInfo } from './component/UneeyaInfo';

const App = () => {
  const [chatHistory, setChatHistory] = useState([
    {
      hideInChat: true,
      role: 'model',
      text: uneeyaInfo,
    },
  ]);
  const [showChatbot, setShowChatbot] = useState(false);
  const chatBodyRef = useRef();

  const generateBotResponse = async (history) => {
    // helper function to update the history
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [...prev.filter((msg) => msg.text !== 'Thingking...'), { role: 'model', text, isError }]);
    };

    // format chat history for API request
    history = history.map(({ role, text }) => ({ role, parts: [{ text }] }));

    const requestOptions = {
      method: 'POST',
      header: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: history }),
    };

    try {
      // make API call to get bot's response
      const response = await fetch(import.meta.env.VITE_API_KEY, requestOptions);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error.message || 'Something went wrong!');

      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, '$1').trim();
      updateHistory(apiResponseText);
    } catch (error) {
      updateHistory(error.message, true);
    }
  };

  useEffect(() => {
    // auto scroll chat update
    chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatHistory]);

  return (
    <div className={`container ${showChatbot ? 'show-chatbot' : ''}`}>
      <button onClick={() => setShowChatbot((prev) => !prev)} id="chatbot-toggle">
        <span className="material-symbols-rounded">mode_comment</span>
        <span className="material-symbols-rounded">close</span>
      </button>

      <div className="chatbot-popup">
        {/* Chatbot Header */}
        <div className="chat-header">
          <div className="header-info">
            <ChatbotIcon />
            <h2 className="logo-text">Cimot</h2>
          </div>
          <button onClick={() => setShowChatbot((prev) => !prev)} className="material-symbols-rounded">
            keyboard_arrow_down
          </button>
        </div>

        {/* Chatbot Body */}
        <div ref={chatBodyRef} className="chat-body">
          <div className="message bot-message">
            <ChatbotIcon />
            <p className="message-text">
              Hallo 😸😻
              <br /> ada yang bisa Cimot bantu?
            </p>
          </div>

          {/* Render chat history */}
          {chatHistory.map((chat, index) => (
            <ChatMessage key={index} chat={chat} />
          ))}
        </div>

        {/* Chatbot Footer */}
        <div className="chat-footer">
          <ChatForm chatHistory={chatHistory} setChatHistory={setChatHistory} generateBotResponse={generateBotResponse} />
        </div>
      </div>
    </div>
  );
};

export default App;
