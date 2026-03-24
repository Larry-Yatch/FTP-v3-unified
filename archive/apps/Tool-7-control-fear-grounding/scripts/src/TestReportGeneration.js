/**
 * Test report generation for Control Fear Grounding
 */
function testReportGeneration() {
  // First validate configuration
  console.log('Starting report generation test...');
  console.log('First, validating configuration...');
  
  const isValid = validateDocumentGenerationConfig();
  if (!isValid) {
    console.error('❌ Configuration validation failed. Please fix errors before proceeding.');
    return;
  }
  
  // Configuration for document generation
  const configDocs = {
    sheetName: 'Working Sheet',
    headerRow: 2,
    startRow: 4,  // First data row
    nameColumn: 2,  // Name_Full column
    docUrlColumn: 101,  // Doc_URL column (CW)
    docCreatedAtCol: 102,  // Doc_Created_At column (CX)
    templateDocId: '11dv4K8Ot9W7VjPjxw9vjSPnwn84_uMdv2zA57Wxd7kk',  // Your template
    outputFolderId: '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN'  // Updated with actual folder ID
  };
  
  // Configuration for PDF export and email
  const configPdfs = {
    sheetName: 'Working Sheet',
    headerRow: 2,
    startRow: 4,
    nameColumn: 2,  // Name_Full column
    docUrlColumn: 101,  // Doc_URL column
    pdfUrlColumn: 103,  // PDF_URL column (CY)
    pdfSentAtCol: 104,  // PDF_Sent_At column (CZ)
    emailColumn: 3,  // Email column
    outputFolderId: '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN',  // Same folder for PDFs
    emailTemplate: {
      subject: 'Your Control Fear Grounding Assessment Report',
      body: `Dear {{FirstName}},

Thank you for completing the Control Fear Grounding Assessment. Your personalized report is attached.

This report explores your patterns around financial fear and control across five key domains:
• Spending
• Hiding Money From Ourselves
• Undervaluing Worth
• Misplaced Trust
• Contracts & Protections

Please take time to review your insights and reflection questions. Remember, awareness is the first step toward transformation.

Best regards,
The Assessment Team`
    },
    fromAddress: 'your-email@example.com'  // Optional: sender email
  };
  
  console.log("Starting report generation test...");
  
  // First, generate the documents
  try {
    generateControlFearDocs(configDocs);
    console.log("✅ Documents generated successfully");
  } catch (error) {
    console.error("❌ Document generation failed:", error);
    return;
  }
  
  // Then export to PDF and email
  try {
    exportAndEmailControlFearPdfs(configPdfs);
    console.log("✅ PDFs exported and emailed successfully");
  } catch (error) {
    console.error("❌ PDF export/email failed:", error);
  }
}

/**
 * Test report generation for a single row with validation
 */
function testSingleRowReport() {
  const rowToTest = 4;  // Test with row 4
  
  // First validate configuration
  console.log(`Testing report generation for row ${rowToTest}...`);
  console.log('First, validating configuration...');
  
  const isValid = validateDocumentGenerationConfig();
  if (!isValid) {
    console.error('❌ Configuration validation failed. Please fix errors before proceeding.');
    return;
  }
  
  const configDocs = {
    sheetName: 'Working Sheet',
    headerRow: 2,
    startRow: rowToTest,
    nameColumn: 2,
    docUrlColumn: 101,
    docCreatedAtCol: 102,
    templateDocId: '11dv4K8Ot9W7VjPjxw9vjSPnwn84_uMdv2zA57Wxd7kk',
    outputFolderId: '1mHxdPSHEO-7B9FDgzH-06RHFzLjlW1xN'
  };
  
  try {
    // Clear any existing doc URL to force regeneration
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Working Sheet');
    sheet.getRange(rowToTest, 101).clearContent();
    sheet.getRange(rowToTest, 102).clearContent();
    
    // Generate the document
    generateControlFearDocs(configDocs);
    
    // Check if document was created
    const docUrl = sheet.getRange(rowToTest, 101).getValue();
    if (docUrl) {
      console.log(`✅ Document created successfully: ${docUrl}`);
      return docUrl;
    } else {
      console.log("❌ Document URL not found after generation");
    }
  } catch (error) {
    console.error("❌ Report generation failed:", error);
  }
}

/**
 * Create output folder for reports
 */
function createReportFolder() {
  const folderName = "Control_Fear_Reports_" + new Date().toISOString().split('T')[0];
  const folder = DriveApp.createFolder(folderName);
  const folderId = folder.getId();
  const folderUrl = folder.getUrl();
  
  console.log("✅ Created report folder:");
  console.log(`   Name: ${folderName}`);
  console.log(`   ID: ${folderId}`);
  console.log(`   URL: ${folderUrl}`);
  console.log("\nUse this ID in your configuration:");
  console.log(`   outputFolderId: '${folderId}'`);
  
  return folderId;
}