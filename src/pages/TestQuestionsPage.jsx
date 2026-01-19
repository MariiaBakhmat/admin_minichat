import React, { useState, useEffect } from 'react';

const TestQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Ваш webhook URL з n8n
  const WEBHOOK_URL = 'https://n8n.beinf.ai/webhook/test_q_gen'; 

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(WEBHOOK_URL);
      if (!response.ok) throw new Error('Failed to fetch questions');
      
      const data = await response.json();
      // Якщо n8n повертає масив напряму
      setQuestions(Array.isArray(data) ? data : data.questions || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Помилка завантаження питань');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Test Questions</h2>
            <button
              onClick={fetchQuestions}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
            >
              Оновити
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Завантаження...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Питань не знайдено</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Subcategory</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Request</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q, index) => (
                    <tr key={q._id || index} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{q.type}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{q.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{q.subcategory || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{q.request}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{q.correctProductId}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{q.correctProductName}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 italic">{q.comments || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600">
            Всього питань: {questions.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestQuestionsPage;