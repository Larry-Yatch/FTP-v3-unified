function doGet(e) {
  return HtmlService.createHtmlOutputFromFile('index')
      .setTitle('Control Fear Grounding')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function processData(data) {
  console.log('Processing data:', data);
  return {
    success: true,
    message: 'Data processed successfully',
    timestamp: new Date().toISOString()
  };
}