'use client';

import { createReactEditorJS } from 'react-editor-js';

import Header from '@editorjs/header';

import { useRef } from 'react';

const ReactEditorJS = createReactEditorJS();

export function downloadPdf(blob) {
  const blobUrl = window.URL.createObjectURL(blob);

  // Create a temporary anchor tag and trigger the download
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = 'downloaded-pdf.pdf'; // You can customize the file name
  document.body.appendChild(link); // Append to the document
  link.click(); // Programmatically click the link to trigger the download

  // Clean up by revoking the Blob URL and removing the temporary link
  window.URL.revokeObjectURL(blobUrl);
  document.body.removeChild(link);
}

const convertStylesToInline = (styles) => {
  if (!styles) return '';

  const styleString = Object.entries(styles)
    .map(([key, value]) => {
      // Convert camelCase properties to kebab-case
      const kebabKey = key.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      return `${kebabKey}: ${value}`;
    })
    .join('; ');
  return `${styleString}; white-space:normal; word-wrap:break-word; overflow-wrap:break-word`;
};

// recieves the editorJs blocks array and returns the data converted to html
export function parseEditorJsToHtml(editorJsData) {
  console.log(editorJsData);
  let htmlContent = ``;
  const blocks = editorJsData?.blocks;

  console.log(blocks);

  blocks.forEach((block) => {
    const styleString = convertStylesToInline(block?.data?.styles);
    switch (block.type) {
      case 'paragraph':
        htmlContent += `<p style=${styleString}>${block.data.text}</p>`;
        break;
      case 'textBlock':
        htmlContent += `<p style="${styleString}">${block.data.text}</p>`;
        break;
      case 'header':
        htmlContent += `<h2 style="${styleString}">${block.data.text}</h2>`;
        break;
      case 'list':
        const listStyle = 'list-style-type: disc; padding-left: 20px;'; // Example style for unordered lists
        htmlContent += parseList(block.data, listStyle);
        break;
      // Add cases for other block types as needed
      case 'twoColumns':
        console.log(block);
        htmlContent += parseTwoColumnBlock(block.data);
        break;
      case 'divider':
        htmlContent += `<div style="${styleString}" />`;
        break;
      default:
        console.log(`Unsupported block type: ${block.type}`);
    }
  });

  console.log(htmlContent);

  return `<body><div style="width: 650px; margin-left: auto; margin-right: auto; overflow:hidden; margin-top: 20px; margin-bottom: 20px">${htmlContent}</div></body>`;
}

export default function Editor({}) {
  const editorRef = useRef();

  const handleInitializeEditor = (instance) => {
    editorRef.current = instance;
  };

  console.log({ editorRef });

  const handleDownloadPdf = async () => {
    if (!editorRef.current) return;

    // get the json data
    const content = await editorRef.current.save();

    const htmlBody = parseEditorJsToHtml(content);

    // get the entire head of the document
    const headContent = document.head.innerHTML;

    const fullHtml = `<html><head>${headContent}</head><body>${htmlBody}</body></html>`;

    const response = await fetch('https://html-to-pdf-7o6w.onrender.com/pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // Indicate that you're sending JSON data to express
      },
      body: JSON.stringify({
        html: fullHtml,
      }),
    });

    const blob = await response.blob();

    downloadPdf(blob);

    //     setLoadingPdfDownload(false);
  };

  return (
    <>
      <nav className='max-w-5xl mx-auto'>
        <button className='outline' onClick={() => handleDownloadPdf()}>
          Print PDF
        </button>
      </nav>
      <div className='w-[794px] mx-auto mb-16 bg-white shadow-lg rounded border p-10 min-h-[1123px] mt-12'>
        <ReactEditorJS
          holder='editorId'
          onInitialize={handleInitializeEditor}
          tools={{
            header: {
              class: Header,
              config: {
                placeholder: 'Enter a header',
                levels: [2, 3, 4],
                defaultLevel: 3,
              },
            },
          }}
        />
      </div>
    </>
  );
}
