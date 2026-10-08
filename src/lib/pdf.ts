import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function esc(s: any): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export async function sharePdf(title: string, sections: { h: string; b: string }[]) {
  const html = `
  <html><head><meta charset="utf-8"></head>
  <body style="font-family:sans-serif;color:#34343A;padding:24px">
    <h1 style="color:#A85AA5">CARE-VISION AI</h1>
    <h2>${esc(title)}</h2>
    <p style="color:#77737A">${new Date().toLocaleString('en-IN')}</p>
    ${sections
      .map(
        (s) =>
          `<h3 style="margin-top:20px">${esc(s.h)}</h3><p style="line-height:1.6">${esc(s.b)}</p>`
      )
      .join('')}
    <hr><p style="color:#77737A;font-size:12px">Educational information only — not a medical diagnosis. Please consult a qualified doctor.</p>
  </body></html>`;
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
  return uri;
}
