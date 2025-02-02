export const saveTestResults = async (testData) => {
    try {
      const response = await fetch('/api/test-results/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // If using auth
        },
        body: JSON.stringify({
          userId: testData.userId,
          testId: testData.id,
          marksObtained: testData.score,
          totalMarks: testData.totalQuestions,
          wrongQuestions: testData.wrongAnswers
        })
      });
      return await response.json();
    } catch (error) {
      console.error('Error saving results:', error);
      throw error;
    }
  };