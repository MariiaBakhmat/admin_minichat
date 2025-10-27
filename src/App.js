import React, { useState, useEffect } from 'react';


function App() {
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedUuid, setSelectedUuid] = useState('');
  const [notes, setNotes] = useState('');
  const [uuidList, setUuidList] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sessionLimit, setSessionLimit] = useState(20);
  const [selectedDate, setSelectedDate] = useState('');

  // Конфігурація для різних стейджів
  const stageConfig = {
    dev: {
      sessionListEndpoint: 'https://i6mgrbyn65.eu-central-1.awsapprunner.com/api/v1/chat/session_list',
      historyEndpoint: 'https://i6mgrbyn65.eu-central-1.awsapprunner.com/api/v1/chat/history',
      secret: 'amTYMNtgg9ISPXM8kNQmK0pcBSaQuOYA'
    },
    test: {
      sessionListEndpoint: 'https://t8xz32qhxw.eu-central-1.awsapprunner.com/api/v1/chat/session_list',
      historyEndpoint: 'https://t8xz32qhxw.eu-central-1.awsapprunner.com/api/v1/chat/history',
      secret: 'amTYMNtgg9ISPXM8kNQmK0pcBSaQuOYA'
    },
    prod: {
      sessionListEndpoint: 'https://mq44vzczer.eu-central-1.awsapprunner.com/api/v1/chat/session_list',
      historyEndpoint: 'https://mq44vzczer.eu-central-1.awsapprunner.com/api/v1/chat/history',
      secret: 'amTYMNtgg9ISPXM8kNQmK0pcBSaQuOYA'
    }
  };

  // Завантажуємо список UUID коли обрано стейдж
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
    }
  }, [selectedStage, sessionLimit]);

  // Завантажуємо історію чату коли обрано UUID
  useEffect(() => {
    if (selectedUuid && selectedStage) {
      fetchChatHistory(selectedStage, selectedUuid);
    } else {
      setChatHistory([]);
    }
  }, [selectedUuid, selectedStage]);

  const fetchUuidList = async (stage) => {
    setLoading(true);
    try {
      const config = stageConfig[stage];
      const response = await fetch(
        `${config.sessionListEndpoint}?skip=0&limit=${sessionLimit}&secret_code=${config.secret}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }

      const data = await response.json();
      console.log('UUID List:', data);
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
      
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }

      const data = await response.json();
      console.log('Chat History:', data);
      setChatHistory(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      alert('Помилка завантаження історії чату');
      setChatHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

 

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto flex gap-6 h-[calc(100vh-3rem)]">
        {/* Лівий блок - історія чату */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col h-full">
            {/* Заголовок */}
            <div className="bg-teal-700 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold">Gewürz Guru Chat</h1>
                <span className="bg-teal-600 text-xs px-3 py-1 rounded-full">Beta</span>
              </div>
            </div>
            
            {/* Область для історії переписки */}
            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto">
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
                  {chatHistory.map((message, index) => (
                    <div 
                      key={index} 
                      className={`flex ${message.sender === 'bot' ? 'justify-start' : 'justify-end'}`}
                    >
                      <div 
                        className={`max-w-[70%] p-4 rounded-lg shadow ${
                          message.sender === 'bot' 
                            ? 'bg-teal-100 text-gray-800' 
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <div className="text-xs opacity-75 mb-2">
                          {new Date(message.timestamp).toLocaleString('uk-UA', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          })}
                        </div>
                        <div className="whitespace-pre-wrap">
                          {message.text}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Правий блок - фільтри та нотатки */}
        <div className="w-96 flex flex-col gap-6">
          {/* Блок з фільтрами */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="space-y-4">
              {/* Фільтр Stage */}
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
                  <option value="prod">Prod</option>
                </select>
              </div>

              {/* Ліміт сесій */}
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

              {/* Вибір дати */}
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

              {/* Фільтр UUID */}
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

          {/* Блок для нотаток */}
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