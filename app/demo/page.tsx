'use client';

import { useState, useRef } from 'react';

import { askDocumentsQuestion } from '../(auth)/actions';

type DATA = { text?: string; file?: File; error?: any };

export default function MyComponent() {
  const [result, setResult] = useState<DATA | null>(null);
  const textInput = useRef(null);

  async function handleSubmit(formData: FormData) {
    const data = await askDocumentsQuestion(formData);

    if ('text' in data && 'file' in data) {
      setResult(data as DATA);
    } else if ('error' in data) {
      setResult(data);
    } else {
      console.error('Unexpected result from processTextAndFetch:', data);
      setResult({ error: 'An unexpected error occurred.' });
    }

    setResult(data);
  }

  return (
    <form action={handleSubmit}>
      <input type="text" name="prompt" ref={textInput} />
      <button type="submit">Submit</button>

      {result && result.text && <p>Text Response: {result.text}</p>}
      {result && result.file && (
        <a href={URL.createObjectURL(result.file)} download={result.file.name}>
          Download File
        </a>
      )}
      {result && result?.error ? (
        <p>Error: {result?.error ?? 'Unknown error.'}</p>
      ) : null}
    </form>
  );
}
