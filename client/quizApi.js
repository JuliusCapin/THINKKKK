async function uploadAndGenerateQuiz(file, numQuestions = 5, quizType = 'multiple_choice') {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('numQuestions', numQuestions);
  formData.append('quizType', quizType);

  const res = await fetch('http://localhost:3000/api/generate-quiz', {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Failed to generate quiz');
  }

  return await res.json(); // { questions: [...] }
}

export default uploadAndGenerateQuiz;
```

---

**`.env`**
```
ANTHROPIC_API_KEY=your_api_key_here
