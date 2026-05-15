exports.handler = async function(event) {
  const targetUrl = event.queryStringParameters?.url;
  
  if (!targetUrl) {
    return { statusCode: 400, body: 'Missing url parameter' };
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'Referer': 'https://atlascloud.ai',
        'Origin': 'https://atlascloud.ai',
        'User-Agent': 'Mozilla/5.0 (compatible; AtlasCloud/1.0)',
      }
    });

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = response.headers.get('content-type') || 'image/png';

    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=86400',
      },
      body: base64,
      isBase64Encoded: true,
    };
  } catch(err) {
    return { statusCode: 500, body: 'Proxy error: ' + err.message };
  }
};
