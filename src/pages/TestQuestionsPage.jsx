import React, { useState, useEffect } from 'react';

const TestQuestionsPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Стан для унікальних типів з БД
  const [availableTypes, setAvailableTypes] = useState([]);
  const [showCustomType, setShowCustomType] = useState(false);
  
  // Стан для форми нового питання
  const [newQuestion, setNewQuestion] = useState({
    type: '',
    category_subcategory: '',
    Request: '',
    'correct produc id': '',
    'correct product name': '',
    comments: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Ваш webhook URL з n8n
  const WEBHOOK_URL = 'https://n8n.beinf.ai/webhook/test_q_gen'; // GET - отримати питання
  const WEBHOOK_URL_ADD = 'https://n8n.beinf.ai/webhook/test_q_add'; // POST - додати питання

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(WEBHOOK_URL);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Received data:', data); // Для дебагу
      
      // n8n може повернути [{json: {...}}, {json: {...}}] або просто [{...}, {...}]
      let processedData = Array.isArray(data) ? data : [];
      
      // Якщо кожен елемент має властивість 'json', витягуємо її
      if (processedData.length > 0 && processedData[0]?.json) {
        processedData = processedData.map(item => item.json);
      }
      
      console.log('Processed data:', processedData); // Для дебагу
      setQuestions(processedData);
      
      // Витягуємо унікальні типи для dropdown
      const types = [...new Set(processedData.map(q => q.type).filter(Boolean))];
      setAvailableTypes(types.sort());
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Помилка: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Якщо вибрали "custom" - показуємо поле для вводу
    if (name === 'type' && value === '__custom__') {
      setShowCustomType(true);
      setNewQuestion(prev => ({
        ...prev,
        [name]: ''
      }));
    } else {
      if (name === 'type') {
        setShowCustomType(false);
      }
      setNewQuestion(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валідація обов'язкових полів
    if (!newQuestion.type.trim() || !newQuestion.Request.trim()) {
      setSubmitError('Поля Type та Request є обов\'язковими');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch(WEBHOOK_URL_ADD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuestion)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setSubmitSuccess(true);
      // Очищаємо форму
      setNewQuestion({
        type: '',
        category_subcategory: '',
        Request: '',
        'correct produc id': '',
        'correct product name': '',
        comments: ''
      });
      
      // Оновлюємо список питань
      setTimeout(() => {
        fetchQuestions();
        setSubmitSuccess(false);
      }, 1000);

    } catch (err) {
      console.error('Submit error:', err);
      setSubmitError(`Помилка при додаванні: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Форма додавання нового питання */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Додати нове питання</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Type - обов'язкове - dropdown або custom input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                {!showCustomType ? (
                  <select
                    name="type"
                    value={newQuestion.type}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="">Оберіть тип...</option>
                    {availableTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                    <option value="__custom__">➕ Інший (ввести вручну)</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="type"
                      value={newQuestion.type}
                      onChange={handleInputChange}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Введіть новий тип"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowCustomType(false);
                        setNewQuestion(prev => ({ ...prev, type: '' }));
                      }}
                      className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Category/Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category/Subcategory
                </label>
                <input
                  type="text"
                  name="category_subcategory"
                  value={newQuestion.category_subcategory}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Введіть категорію"
                />
              </div>
            </div>

            {/* Request - обов'язкове */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request <span className="text-red-500">*</span>
              </label>
              <textarea
                name="Request"
                value={newQuestion.Request}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Введіть текст запиту"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product ID
                </label>
                <input
                  type="text"
                  name="correct produc id"
                  value={newQuestion['correct produc id']}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Введіть ID продукту"
                />
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="correct product name"
                  value={newQuestion['correct product name']}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="Введіть назву продукту"
                />
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Comments
              </label>
              <textarea
                name="comments"
                value={newQuestion.comments}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Додайте коментарі (необов'язково)"
              />
            </div>

            {/* Повідомлення про помилку або успіх */}
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {submitError}
              </div>
            )}
            
            {submitSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                Питання успішно додано!
              </div>
            )}

            {/* КнопкаSubmit */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Додавання...' : 'Додати питання'}
              </button>
            </div>
          </form>
        </div>

        {/* Таблиця з питаннями */}
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
              {/* Контейнер зі скролом - максимум 10 рядків (~50px на рядок) */}
              <div className="max-h-[500px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Category/Subcategory</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Request</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product ID</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Product Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Comments</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {questions.map((q, index) => (
                      <tr key={q._id || index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-800">{q.type}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{q.category_subcategory || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{q.Request}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{q['correct produc id'] || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-800">{q['correct product name'] || '-'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 italic">{q.comments || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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