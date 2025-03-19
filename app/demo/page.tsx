'use client';

import {
  Box,
  Button,
  Card,
  Flex,
  Spinner,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { useState, useRef } from 'react';

import { askDocumentsQuestion } from '../(auth)/actions';

type DATA = {
  text?: string;
  tokenCount?: string;
  filePath?: string;
  error?: any;
};

export default function MyComponent() {
  const [result, setResult] = useState<DATA | null>(null);
  const textInput = useRef(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    const data = await askDocumentsQuestion(formData);
    setLoading(false);

    setResult(data);
  }

  const [, ...fileParts] =
    result?.filePath?.replace('gs://', '').split('/') || [];
  const fileName = fileParts?.join('/');

  const handleFileDownload = async (fileName: string) => {
    setDownloading(true);
    try {
      const res = await fetch(`/api/download?fileName=${fileName}`);

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Failed to download file', errorData);
        setDownloading(false);
        return;
      }

      const blob = await res.blob(); // Read the Buffer as a Blob

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
      console.error('Failed to download', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <Flex direction="column" gap={'2'} align="center">
      <Box className="p-6" width="600px">
        <form action={handleSubmit}>
          <TextArea
            size="3"
            name="prompt"
            placeholder="Zadaj pytanie"
            ref={textInput}
          />
          <Box className="my-4">
            <Button type="submit">
              {loading ? <Spinner size="3" /> : 'Wyślij'}
            </Button>
          </Box>

          {result && result.text && (
            <Card className="mb-4 p-4">
              <Box>
                <p>{result.text}</p>{' '}
              </Box>
            </Card>
          )}

          {fileName && (
            <Box className="mb-4">
              <label>
                File Name:
                <TextField.Root
                  type="text"
                  value={fileName}
                  className="my-4"
                  onChange={() => {}}
                />
              </label>
              <Button
                type="submit"
                disabled={downloading}
                onClick={() => handleFileDownload(fileName)}
              >
                {downloading ? 'Downloading...' : 'Download'}
              </Button>
            </Box>
          )}

          <Box className="mb-4">
            {result && result.tokenCount ? (
              <p>Token count:{result.tokenCount}</p>
            ) : null}
          </Box>

          <Box>
            {result && result?.error ? (
              <p>Error: {result?.error?.message ?? 'Unknown error.'}</p>
            ) : null}
          </Box>
        </form>
      </Box>
    </Flex>
  );
}
