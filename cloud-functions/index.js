/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const { CloudEvent } = require('cloudevents');
const { DocumentProcessorServiceClient } =
  require('@google-cloud/documentai').v1;
const { Storage } = require('@google-cloud/storage');
const { BigQuery } = require('@google-cloud/bigquery');
const { VertexAI } = require('@google-cloud/vertexai');
const functions = require('@google-cloud/functions-framework');
const { default: PQueue } = require('p-queue');
const fs = require('fs');
const path = require('path');
const os = require('os');
const pdf = require('pdf-parse');

const SUMMARIZATION_PROMPT = `You are an expert in summarizing technical documentation related to the logistics of dangerous goods in rail and road transport. Your task is to provide a concise and accurate summary of the following TEXT. Use same language and style as the original document.


TEXT:
{text}
`;

// Error counter for each file
const errorCounts = {};

// Register a CloudEvent callback with the Functions Framework that will
// be triggered by Cloud Storage.
functions.cloudEvent(
  'document-summary-node-event-handler',
  async (cloudEvent) => {
    console.log(`Event ID: ${cloudEvent.id}`);
    console.log(`Event Type: ${cloudEvent.type}`);

    const file = cloudEvent.data;
    const filePath = `gs://${file.bucket}/${file.name}`; // Combine bucket and name
    console.log(`Bucket: ${file.bucket}`);
    console.log(`File: ${file.name}`);
    console.log(`Metageneration: ${file.metageneration}`);
    console.log(`Created: ${file.timeCreated}`);
    console.log(`Updated: ${file.updated}`);

    console.log(process.env.DOCAI_PROCESSOR);
    console.log(process.env.DOCAI_LOCATION);
    console.log(process.env.OUTPUT_BUCKET);
    console.log(process.env.BQ_DATASET);
    console.log(process.env.BQ_TABLE);

    // Initialize or increment error count
    if (!errorCounts[filePath]) {
      errorCounts[filePath] = 0;
    }
    errorCounts[filePath]++;

    try {
      await processDocument(
        cloudEvent.id,
        file.bucket,
        file.name,
        file.contentType,
        new Date(file.timeCreated),
        process.env.DOCAI_PROCESSOR,
        process.env.DOCAI_LOCATION || 'us',
        process.env.OUTPUT_BUCKET,
        process.env.BQ_DATASET,
        process.env.BQ_TABLE,
      );
      // Reset error counter if successful
      delete errorCounts[filePath];
    } catch (err) {
      console.error('Error processing document:', err);
      if (errorCounts[filePath] >= 2) {
        console.error(`Exiting after 2 failed attempts for ${filePath}`);
        delete errorCounts[filePath]; // Clear the counter
        return; // Exit the function
      }
      console.log(
        `Attempt ${errorCounts[filePath]} failed for ${filePath}. Retrying.`,
      );
    }
  },
);

/**
 * Processes a new document from an Eventarc event.
 *
 * @param {CloudEvent} event The CloudEvent object.
/**
 * Processes a new document.
 *
 * @param {string} eventId ID of the event.
 * @param {string} inputBucket Name of the input bucket.
 * @param {string} filename Name of the input file.
 * @param {string} mimeType MIME type of the input file.
 * @param {Date} timeUploaded Time the input file was uploaded.
 * @param {string} docaiProcessorId ID of the Document AI processor.
 * @param {string} docaiLocation Location of the Document AI processor.
 * @param {string} outputBucket Name of the output bucket.
 * @param {string} bqDataset Name of the BigQuery dataset.
 * @param {string} bqTable Name of the BigQuery table.
 */
async function processDocument(
  eventId,
  inputBucket,
  filename,
  mimeType,
  timeUploaded,
  docaiProcessorId,
  docaiLocation,
  outputBucket,
  bqDataset,
  bqTable,
) {
  const docPath = `gs://${inputBucket}/${filename}`;
  // console.log(`📖 ${eventId}: Getting document text`);
  // if documents are pdf exports we do not need OCR
  // const docText = (
  //   await getDocumentText(
  //     docPath,
  //     mimeType,
  //     docaiProcessorId,
  //     outputBucket,
  //     docaiLocation,
  //   )
  // ).join('\n');

  const storage = new Storage();
  const bucket = storage.bucket(inputBucket);
  const file = bucket.file(filename);
  const tempFilePath = path.join(os.tmpdir(), filename);
  await file.download({ destination: tempFilePath });
  let dataBuffer = fs.readFileSync(tempFilePath);
  const documentData = await pdf(dataBuffer);
  fs.unlinkSync(tempFilePath);

  const docText = documentData.text;

  const modelName = 'gemini-pro';
  console.log(`📝 ${eventId}: Summarizing document with ${modelName}`);
  console.log(`  - Text length:     ${docText.length} characters`);
  // const docSummary = await generateSummary(docText, modelName);
  // console.log(`  - Summary length: ${docSummary.length} characters`);

  console.log(
    `🗃️ ${eventId}: Writing document summary to BigQuery: ${bqDataset}.${bqTable}`,
  );
  await writeToBigQuery(
    eventId,
    timeUploaded,
    docPath,
    docText,
    docSummary,
    bqDataset,
    bqTable,
  );

  console.log(`✅ ${eventId}: Done!`);
}

/**
 * Perform Optical Character Recognition (OCR) with Document AI on a Cloud Storage file.
 *
 * @param {string} inputFile GCS URI of the document file.
 * @param {string} mimeType MIME type of the document file.
 * @param {string} processorId ID of the Document AI processor.
 * @param {string} tempBucket GCS bucket to store Document AI temporary files.
 * @param {string} docaiLocation Location of the Document AI processor.
 * @returns {Promise<string[]>} The document text chunks.
 */
async function getDocumentText(
  inputFile,
  mimeType,
  processorId,
  outputBucket,
  outputPrefix,
  docaiLocation = 'us', // Default docaiLocation
) {
  const clientOptions = {
    apiEndpoint: `${docaiLocation}-documentai.googleapis.com`,
  };
  const documentaiClient = new DocumentProcessorServiceClient(clientOptions);
  const storageClient = new Storage();

  const request = {
    name: processorId,
    inputDocuments: {
      gcsDocuments: {
        documents: [{ gcsUri: inputFile, mimeType }],
      },
    },
    documentOutputConfig: {
      gcsOutputConfig: {
        gcsUri: `gs://${outputBucket}/${outputPrefix}/`,
      },
    },
  };

  const [operation] = await documentaiClient.batchProcessDocuments(request);
  await operation.promise();
  console.log('Document processing complete.');

  const [files] = await storageClient
    .bucket(outputBucket)
    .getFiles({ prefix: outputPrefix });
  const textChunks = []; // Corrected: removed colon after textChunks
  const queue = new PQueue({ concurrency: 15 });
  const tasks = files.map((file) => async () => {
    const [fileContents] = await file.download();
    const document = JSON.parse(fileContents.toString());
    const { text } = document;
    const getText = (textAnchor) => {
      // Removed : any
      if (!textAnchor.textSegments || textAnchor.textSegments.length === 0) {
        return '';
      }
      const startIndex = textAnchor.textSegments[0].startIndex || 0;
      const endIndex = textAnchor.textSegments[0].endIndex;
      return text.substring(startIndex, endIndex);
    };

    if (document.pages && document.pages[0] && document.pages[0].paragraphs) {
      for (const paragraph of document.pages[0].paragraphs) {
        const paragraphText = getText(paragraph.layout.textAnchor);
        textChunks.push(paragraphText);
      }
    }
  });

  await queue.addAll(tasks);
  return textChunks;
}

/**
 * Generate a summary of the given text.
 *
 * @param {string} text The text to summarize.
 * @param {string} modelName The name of the model to use for summarization.
 * @returns {Promise<string>} The generated summary.
 */
async function generateSummary(text, modelName = 'gemini-pro') {
  const vertexAI = new VertexAI({
    project: process.env.GCLOUD_PROJECT,
    location: 'europe-central2',
  });
  const model = vertexAI.getGenerativeModel({ model: modelName });
  const prompt = SUMMARIZATION_PROMPT.replace('{text}', text);
  const result = await model.generateContent(prompt);
  const contentResponse = await result.response;

  if (
    contentResponse &&
    contentResponse.candidates &&
    contentResponse.candidates.length > 0
  ) {
    const firstCandidate = contentResponse.candidates[0];
    if (
      firstCandidate.content &&
      firstCandidate.content.parts &&
      firstCandidate.content.parts.length > 0
    ) {
      const textSummary = firstCandidate.content.parts[0].text;
      console.log('Text summary:', textSummary);
      return textSummary;
    } else {
      throw new Error('No text parts found in the response.');
    }
  } else {
    throw new Error('No candidates found in the response.');
  }
}

/**
 * Write the summary to BigQuery.
 *
 * @param {string} eventId The Eventarc trigger event ID.
 * @param {Date} timeUploaded Time the document was uploaded.
 * @param {string} docPath Cloud Storage path to the document.
 * @param {string} docText Text extracted from the document.
 * @param {string} docSummary Summary generated fro the document.
 * @param {string} bqDataset Name of the BigQuery dataset.
 * @param {string} bqTable Name of the BigQuery table.
 */
async function writeToBigQuery(
  eventId,
  timeUploaded,
  docPath,
  docText,
  docSummary,
  bqDataset,
  bqTable,
) {
  const bigquery = new BigQuery();
  const table = bigquery.dataset(bqDataset).table(bqTable);
  const rows = [
    {
      event_id: eventId,
      time_uploaded: timeUploaded,
      time_processed: new Date(),
      document_path: docPath,
      document_text: docText,
      document_summary: docSummary,
    },
  ];

  await table.insert(rows);
}
