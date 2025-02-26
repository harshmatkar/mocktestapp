import React, { useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

const RaiseIssueForm = () => {
  const [formData, setFormData] = useState({
    testNumber: '',
    questionNumber: '',
    issue: ''
  });

  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0); // Timer in seconds

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // EmailJS service details
    const serviceID = 'service_6tjszwf';
    const templateID = 'template_qgqmc9j';
    const publicKey = 'Szvzgr2kqt6lpkhj4';

    const templateParams = {
      testNumber: formData.testNumber,
      questionNumber: formData.questionNumber,
      issue: formData.issue,
      to_email: 'your_email@example.com' // Replace with your email
    };

    emailjs.send(serviceID, templateID, templateParams, publicKey)
      .then((response) => {
        console.log('Email sent:', response);
        setMessage('Thank you! Your issue has been submitted.');
        setFormData({ testNumber: '', questionNumber: '', issue: '' });
        setCountdown(120); // Start 2-minute cooldown
      })
      .catch((error) => {
        console.error('Email sending failed:', error);
        setMessage('Failed to submit issue. Please try again.');
      });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-900">
      <div className="w-full max-w-lg bg-gray-800 text-gray-100 shadow-lg rounded-xl p-6">
        <h1 className='text-red-500'>You can see qn num in mistake page</h1>
        <h2 className="text-2xl font-semibold text-center mb-4">Raise an Issue</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="testNumber" className="block text-sm font-medium text-gray-300 mb-1">
              Test Number
            </label>
            <input
              id="testNumber"
              name="testNumber"
              type="text"
              value={formData.testNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter test number"
              required
            />
          </div>

          <div>
            <label htmlFor="questionNumber" className="block text-sm font-medium text-gray-300 mb-1">
              Question Number
            </label>
            <input
              id="questionNumber"
              name="questionNumber"
              type="text"
              value={formData.questionNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter question number"
              required
            />
          </div>

          <div>
            <label htmlFor="issue" className="block text-sm font-medium text-gray-300 mb-1">
              Issue Description
            </label>
            <textarea
              id="issue"
              name="issue"
              value={formData.issue}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the issue"
              rows={4}
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={countdown > 0}
          >
            {countdown > 0 ? `Wait ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}` : 'Submit Issue'}
          </button>
        </form>

        {message && <p className="mt-4 text-center text-green-400">{message}</p>}
      </div>
    </div>
  );
};

export default RaiseIssueForm;