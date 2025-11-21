'use client';

import { useState } from 'react';

export default function TestPage() {
  const [activeTab, setActiveTab] = useState<'single' | 'chat' | 'vision'>('single');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Single message state
  const [message, setMessage] = useState('Tell me a joke about programming.');

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    { role: 'user', content: 'Hello! What is AI?' },
    { role: 'assistant', content: 'AI stands for Artificial Intelligence...' },
    { role: 'user', content: 'Tell me more about machine learning.' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Vision state
  const [visionPrompt, setVisionPrompt] = useState('Analyze this Tokyo metro train image and provide: capacity_percentage (estimated % of capacity filled), people_count (number of visible people), normal_free_seat_num (number of available regular seats), senior_seat_num (number of available priority seats). Return in JSON format.');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0');
  const [imageBase64, setImageBase64] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleSingleMessage = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/llama', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          maxTokens: 512,
          temperature: 0.5,
          topP: 0.9,
          region: 'us-west-2'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch('/api/llama/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          maxTokens: 512,
          temperature: 0.7,
          topP: 0.9,
          region: 'us-west-2'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Convert to base64 for API
      const base64Reader = new FileReader();
      base64Reader.onloadend = () => {
        const base64String = (base64Reader.result as string).split(',')[1];
        setImageBase64(base64String);
        setImageUrl(''); // Clear URL when file is selected
      };
      base64Reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageBase64('');
  };

  const handleVision = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const payload: any = {
        prompt: visionPrompt,
        maxTokens: 1024,
        temperature: 0.3,
        topP: 0.9,
        region: 'us-east-1'
      };

      if (imageBase64) {
        payload.imageBase64 = imageBase64;
        // Detect mime type from file or default to jpeg
        payload.mimeType = selectedFile?.type || 'image/jpeg';
      } else if (imageUrl) {
        payload.imageUrl = imageUrl;
      } else {
        throw new Error('Please provide either an image URL or upload a file');
      }

      const res = await fetch('/api/llama/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setResponse(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addChatMessage = () => {
    if (newChatMessage.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: newChatMessage }]);
      setNewChatMessage('');
    }
  };

  const removeChatMessage = (index: number) => {
    setChatMessages(chatMessages.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">Llama API Test Page</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'single'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Single Message
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'chat'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Chat
          </button>
          <button
            onClick={() => setActiveTab('vision')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'vision'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Vision (Tokyo Metro)
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Input</h2>

            {/* Single Message Tab */}
            {activeTab === 'single' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    rows={4}
                    placeholder="Enter your message..."
                  />
                </div>
                <button
                  onClick={handleSingleMessage}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Send Message'}
                </button>
              </div>
            )}

            {/* Chat Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Messages
                  </label>
                  <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg ${
                          msg.role === 'user' ? 'bg-blue-50' : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-semibold text-gray-600 uppercase">
                            {msg.role}
                          </span>
                          <button
                            onClick={() => removeChatMessage(idx)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Remove
                          </button>
                        </div>
                        <p className="text-sm text-gray-800">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addChatMessage()}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                      placeholder="Add a message..."
                    />
                    <button
                      onClick={addChatMessage}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleChat}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Send Chat'}
                </button>
              </div>
            )}

            {/* Vision Tab */}
            {activeTab === 'vision' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={visionPrompt}
                    onChange={(e) => setVisionPrompt(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    rows={4}
                    placeholder="Enter your vision prompt..."
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Local Image
                  </label>
                  <div className="space-y-2">
                    {!selectedFile ? (
                      <label className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                        <div className="text-center">
                          <svg
                            className="mx-auto h-8 w-8 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span className="mt-2 text-sm text-gray-600">
                            Click to select an image
                          </span>
                          <span className="mt-1 text-xs text-gray-500">
                            PNG, JPG, WEBP up to 10MB
                          </span>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileSelect}
                        />
                      </label>
                    ) : (
                      <div className="border-2 border-blue-300 rounded-lg p-3 bg-blue-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700 font-medium truncate">
                            {selectedFile.name}
                          </span>
                          <button
                            onClick={clearFile}
                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                          >
                            Remove
                          </button>
                        </div>
                        {previewUrl && (
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded"
                          />
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center text-gray-500 text-sm font-medium">OR</div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image URL
                  </label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    disabled={!!selectedFile}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <button
                  onClick={handleVision}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Processing...' : 'Analyze Image'}
                </button>
              </div>
            )}
          </div>

          {/* Response Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Response</h2>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-semibold">Error:</p>
                <p className="text-red-600 mt-1">{error}</p>
              </div>
            )}

            {response && !loading && (
              <div className="space-y-4">
                {/* Structured Data for Vision API */}
                {activeTab === 'vision' && response.data?.structuredData && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-800 font-semibold mb-3">Tokyo Metro Analysis:</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">Capacity %</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {response.data.structuredData.capacity_percentage ?? 'N/A'}
                          {response.data.structuredData.capacity_percentage && '%'}
                        </p>
                      </div>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">People Count</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {response.data.structuredData.people_count ?? 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">Free Normal Seats</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {response.data.structuredData.normal_free_seat_num ?? 'N/A'}
                        </p>
                      </div>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs text-gray-600 mb-1">Free Senior Seats</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {response.data.structuredData.senior_seat_num ?? 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 font-semibold mb-2">Generation:</p>
                  <p className="text-gray-900 whitespace-pre-wrap">
                    {response.data?.generation}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Prompt Tokens</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {response.data?.promptTokenCount || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Generation Tokens</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {response.data?.generationTokenCount || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Stop Reason</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {response.data?.stopReason || 'N/A'}
                    </p>
                  </div>
                </div>

                <details className="bg-gray-50 rounded-lg p-4">
                  <summary className="cursor-pointer text-gray-700 font-medium">
                    Raw JSON Response
                  </summary>
                  <pre className="mt-3 text-xs text-gray-800 overflow-x-auto">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                </details>
              </div>
            )}

            {!response && !loading && !error && (
              <div className="text-center py-12 text-gray-400">
                <p>Response will appear here...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
