import React, { useState, useEffect } from 'react';

function App() {
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedUuid, setSelectedUuid] = useState('');
  const [notes, setNotes] = useState('');
  const [uuidList, setUuidList] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sessionLimit, setSessionLimit] = useState(20);
  const [selectedDate, setSelectedDate] = useState('');
  const [hoveredMessageId, setHoveredMessageId] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const stageConfig = {
    dev: {
      sessionListEndpoint: 'https://i6mgrbyn65.eu-central-1.awsapprunner.com/api/v1/chat/session_list',
      historyEndpoint: 'https://i6mgrbyn65.eu-central-1.awsapprunner.com/api/v1/chat/history',
      feedbacksEndpoint: 'https://i6mgrbyn65.eu-central-1.awsapprunner.com/api/v1/chat/sessions',
      secret: 'AkH5abZfRc1ZB2wbjOlmoSOKsAtQrAxd'
    },
    test: {
      sessionListEndpoint: 'https://t8xz32qhxw.eu-central-1.awsapprunner.com/api/v1/chat/session_list',
      historyEndpoint: 'https://t8xz32qhxw.eu-central-1.awsapprunner.com/api/v1/chat/history',
      feedbacksEndpoint: 'https://t8xz32qhxw.eu-central-1.awsapprunner.com/api/v1/chat/sessions',
      secret: 'NaJlvxteMqcnbznt5kvKpIlNNimostjj'
    },
    pre_prod: {
      sessionListEndpoint: 'https://bm7smtjw9s.eu-central-1.awsapprunner.com/api/v1/chat/session_list',
      historyEndpoint: 'https://bm7smtjw9s.eu-central-1.awsapprunner.com/api/v1/chat/history',
      feedbacksEndpoint: 'https://bm7smtjw9s.eu-central-1.awsapprunner.com/api/v1/chat/sessions',
      secret: 'AkH5abZfRc1ZB2wbjOlmoSOKsAtQrAxd'
    },
    prod: {
      sessionListEndpoint: 'https://mq44vzczer.eu-central-1.awsapprunner.com/api/v1/chat/session_list',
      historyEndpoint: 'https://mq44vzczer.eu-central-1.awsapprunner.com/api/v1/chat/history',
      feedbacksEndpoint: 'https://mq44vzczer.eu-central-1.awsapprunner.com/api/v1/chat/sessions',
      secret: 'P1sbus4FsLiKDM70sIWo2fTkt8IzF7oR'
    }
  };

 useEffect(() => {
  if (selectedStage) {
    const timeoutId = setTimeout(() => {
      fetchUuidList(selectedStage);
    }, 500);
    return () => clearTimeout(timeoutId);
  } else {
    setUuidList([]);
    setSelectedUuid('');
    setChatHistory([]);
    setFeedbacks({});
  }
}, [selectedStage, sessionLimit, selectedDate]);

useEffect(() => {
  if (selectedUuid && selectedStage) {
    fetchChatHistory(selectedStage, selectedUuid);
    fetchFeedbacks(selectedStage, selectedUuid);
  } else {
    setChatHistory([]);
    setFeedbacks({});
  }
}, [selectedUuid, selectedStage]);

// Закриття tooltip при кліку поза ним
useEffect(() => {
  const handleClickOutside = (event) => {
    if (hoveredMessageId && !event.target.closest('.tooltip-container') && !event.target.closest('.message-box')) {
      setHoveredMessageId(null);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, [hoveredMessageId]);

const fetchUuidList = async (stage) => {
  setLoading(true);
  try {
    const config = stageConfig[stage];
    let url = `${config.sessionListEndpoint}?skip=0&limit=${sessionLimit}&secret_code=${config.secret}`;

    if (selectedDate) {
      const dateFrom = `${selectedDate}T00:00:00Z`;
      const dateTo = `${selectedDate}T23:59:59Z`;
      url += `&date_from=${dateFrom}&date_to=${dateTo}`;
    } 

    const response = await fetch(url);
    
    if (!response.ok) throw new Error('Failed to fetch');

    const data = await response.json();
    setUuidList(data);
    setSelectedUuid('');
  } catch (error) {
    console.error('Error fetching UUID list:', error);
    alert('Помилка завантаження списку UUID');
    setUuidList([]);
  } finally {
    setLoading(false);
  }
};

const fetchChatHistory = async (stage, sessionId) => {
  setLoadingHistory(true);
  try {
    const config = stageConfig[stage];
    const response = await fetch(config.historyEndpoint, {
      method: 'GET',
      headers: {
        'x-session-id': sessionId,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch history');

    const data = await response.json();
    setChatHistory(data);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    alert('Помилка завантаження історії чату');
    setChatHistory([]);
  } finally {
    setLoadingHistory(false);
  }
};

const fetchFeedbacks = async (stage, sessionId) => {
  try {
    const config = stageConfig[stage];
    const response = await fetch(
      `${config.feedbacksEndpoint}/${sessionId}/feedbacks?skip=0&limit=200`
    );
    
    if (!response.ok) throw new Error('Failed to fetch feedbacks');

    const data = await response.json();
    
    const feedbackMap = {};
    data.forEach(feedback => {
      if (feedback.comment) {
        feedbackMap[feedback.messageId] = feedback;
      }
    });
    
    setFeedbacks(feedbackMap);
  } catch (error) {
    console.error('Error fetching feedbacks:', error);
    setFeedbacks({});
  }
};

const handleMouseEnter = (messageId, event) => {
  if (feedbacks[messageId]) {
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top
    });
    setHoveredMessageId(messageId);
  }
};

const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('Коментар скопійовано!');
  }).catch(err => {
    console.error('Помилка копіювання:', err);
  });
};

return (
  <div className="min-h-screen bg-gray-100 p-6">
    <div className="max-w-7xl mx-auto flex gap-6 h-[calc(100vh-3rem)]">
      <div className="flex-1">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">    
          <div className="flex-1 bg-gray-50 p-6 overflow-y-auto relative">
            {loadingHistory ? (
              <div className="text-gray-400 text-center mt-32">
                <p className="text-lg">Завантаження історії...</p>
              </div>
            ) : chatHistory.length === 0 ? (
              <div className="text-gray-400 text-center mt-32">
                <p className="text-lg">Оберіть stage та UUID для перегляду історії</p>
              </div>
            ) : (
              <div className="space-y-4">
                {chatHistory.map((message, index) => {
                  const messageId = message.extra?.message_id;
                  return (
                    <div 
                      key={index} 
                      className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`message-box max-w-[70%] p-4 rounded-lg shadow cursor-pointer transition-all ${
                          message.sender === 'bot' 
                            ? 'bg-teal-100 text-gray-800' 
                            : 'bg-blue-500 text-white'
                        } ${
                          feedbacks[messageId] ? 'hover:ring-2 hover:ring-yellow-400' : ''
                        }`}
                        onMouseEnter={(e) => handleMouseEnter(messageId, e)}
                      >
                        <div className="text-xs opacity-75 mb-2">
                          {new Date(message.messageCreatedAt).toLocaleString('uk-UA', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false,    
                            timeZone: 'UTC' 
                          })}
                        </div>
                        <div className="whitespace-pre-wrap">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hoveredMessageId && feedbacks[hoveredMessageId] && (
              <div 
                className="tooltip-container fixed z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-4 max-w-md"
                style={{
                  left: `${tooltipPosition.x}px`,
                  top: `${tooltipPosition.y - 10}px`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase">
                    Коментар:
                  </div>
                  <button
                    onClick={() => copyToClipboard(feedbacks[hoveredMessageId].comment)}
                    className="flex-shrink-0 px-2 py-1 bg-teal-600 text-white text-xs rounded hover:bg-teal-700 transition"
                  >
                    Копіювати
                  </button>
                </div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap break-words">
                  {feedbacks[hoveredMessageId].comment}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {new Date(feedbacks[hoveredMessageId].createdAt).toLocaleString('uk-UA', {timeZone: 'UTC'})}
                </div>
                <div 
                  className="absolute w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-gray-300"
                  style={{
                    left: '50%',
                    bottom: '-8px',
                    transform: 'translateX(-50%)'
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-96 flex flex-col gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select stage
              </label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Оберіть stage...</option>
                <option value="dev">Dev</option>
                <option value="test">Test</option>
                <option value="pre_prod">Pre-Prod</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session limit
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={sessionLimit}
                onChange={(e) => setSessionLimit(parseInt(e.target.value) || 20)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select date
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select uuid
              </label>
              <select
                value={selectedUuid}
                onChange={(e) => setSelectedUuid(e.target.value)}
                disabled={!selectedStage || loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {loading ? 'Завантаження...' : 'Оберіть uuid...'}
                </option>
                {uuidList.map((item, index) => (
                  <option key={index} value={item.sessionId}>
                    {item.sessionId}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 flex-1 flex flex-col">
          <h3 className="text-sm font-medium text-gray-700 mb-2">For notes:</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="tags"
            className="w-full flex-1 px-4 py-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  </div>
);
}

export default App;