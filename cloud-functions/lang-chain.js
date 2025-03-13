import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';

const filePath = './sample pdf/EKOMOR TDT.pdf';
const folderPath = './sample pdf';

const loader = new PDFLoader(filePath, {
  parsedItemSeparator: '',
  splitPages: false,
});

const normalize = (text) =>
  text
    .replaceAll(
      'Elgum-PLUS Sp. z o.o. Sp. k., ul. Sochaczewska 13, 01-327 Warszawa, tel. 022-666-17-23, tel. 022-666-17-24,',
    )
    .replaceAll(
      'tel. 022-666-18-60, fax. 022-666-17-25, www.elgum.net, biuro@elgum.net',
      '',
    )
    .replaceAll('undefined', '')
    .replaceAll('\n', '');

const loadDoc = async () => {
  const docs = await loader.load();

  const noAddress = docs.map((d) => ({
    ...d,
    pageContent: normalize(d.pageContent),
  }));

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 4000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(noAddress);

  splitDocs.forEach((d) => console.log(d.pageContent.length / 4));

  console.log(splitDocs);

  // const tokensPerPage = docs.map((d) => d.Document?.pageContent);

  // console.log('Number of tokens per page', tokensPerPage);

  // const textSplitter = new RecursiveCharacterTextSplitter({
  //   chunkSize: 1000,
  //   chunkOverlap: 200,
  // });

  // const splitDocs = await textSplitter.splitDocuments(docs);

  // console.log(splitDocs[0]);
};

// const loadDirectory = async () => {
//   const directoryLoader = new DirectoryLoader(folderPath, {
//     '.pdf': (path) => new PDFLoader(path),
//   });

//   const directoryDocs = await directoryLoader.load();

//   const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 1000,
//     chunkOverlap: 200,
//   });

//   const splitDocs = await textSplitter.splitDocuments(directoryDocs);
//   console.log(splitDocs[0]);

//   console.log('Number of split documents', directoryDocs.length);
// };

// loadDirectory();

loadDoc();
