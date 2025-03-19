'use client';

import {
  Box,
  Button,
  Card,
  Container,
  Flex,
  Spinner,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import { FileTextIcon } from 'lucide-react';
import { useState, useRef, useActionState } from 'react';

import { askDocumentsQuestion } from '../(auth)/actions';

type DATA = {
  text?: string;
  tokenCount?: string;
  filePath?: string;
  error?: any;
};

export default function MyComponent() {
  const textInput = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const [result, formAction, loading] = useActionState(handleSubmit, {} as any);

  async function handleSubmit(_: any, formData: FormData) {
    return await askDocumentsQuestion(formData);
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

  const documents = [
    'EKOMOR TDT.pdf',
    'EL-23-046.pdf',
    'EL-24-031.pdf',
    'EL-24-053.pdf',
    'SKM_C250i23090509420.pdf',
  ];

  return (
    <Flex direction="column" gap={'2'} align="center">
      <Container>Dokumenty znajdujące się w bazie:</Container>
      <Flex
        direction="row"
        align="center"
        justify="center"
        className="p-4"
        wrap={'wrap'}
        gap={'2'}
      >
        {documents.map((d) => (
          <Button
            key={d}
            onClick={() => {
              handleFileDownload(d);
            }}
            className="p-3"
            variant="outline"
            loading={downloading}
            asChild
          >
            <a href="#">
              <FileTextIcon className="mr-2" />
              {d}
            </a>
          </Button>
        ))}
      </Flex>
      <Box className="p-6" width="600px">
        <form action={formAction}>
          <TextArea
            size="3"
            name="prompt"
            placeholder="Zadaj pytanie"
            ref={textInput}
          />
          <Box className="my-4">
            {loading ? (
              <Spinner size="3" />
            ) : (
              <Button type="submit">Wyślij</Button>
            )}
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
                {downloading ? 'Downloading...' : 'Downloaded'}
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
