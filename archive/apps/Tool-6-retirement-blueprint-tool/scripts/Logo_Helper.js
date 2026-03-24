// ═══════════════════════════════════════════════════════════════════════════════
// LOGO HELPER - Easy Logo Setup and Testing
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Test logo setup and provide diagnostic information
 * Run this from the menu to verify your logo is properly configured
 */
function testLogoSetup() {
  const ui = SpreadsheetApp.getUi();
  
  Logger.log('Starting logo diagnostics...');
  
  // Check current configuration
  const logoId = BRANDING_CONFIG.logo.driveFileId;
  
  if (!logoId || logoId === 'YOUR_LOGO_FILE_ID_HERE') {
    ui.alert('Logo Not Configured', 
      'No logo file ID has been set.\n\n' +
      'To add your logo:\n' +
      '1. Upload your logo to Google Drive\n' +
      '2. Right-click → Get link\n' +
      '3. Copy the ID from the URL\n' +
      '4. Update driveFileId in Document_Branding.js',
      ui.ButtonSet.OK);
    return;
  }
  
  // Try to access the logo
  try {
    const file = DriveApp.getFileById(logoId);
    const fileName = file.getName();
    const fileSize = file.getSize();
    const mimeType = file.getMimeType();
    
    // Check file details
    let issues = [];
    
    if (fileSize > 2 * 1024 * 1024) {
      issues.push('- File size is over 2MB (current: ' + (fileSize / 1024 / 1024).toFixed(2) + 'MB)');
    }
    
    if (!mimeType.includes('image')) {
      issues.push('- File is not an image (type: ' + mimeType + ')');
    }
    
    // Try to get the blob
    try {
      const blob = file.getBlob();
      Logger.log('Successfully retrieved logo blob');
    } catch (blobError) {
      issues.push('- Cannot read file contents: ' + blobError.toString());
    }
    
    // Check sharing settings
    try {
      const access = file.getSharingAccess();
      if (access === DriveApp.Access.PRIVATE) {
        issues.push('- File is private. Change sharing to "Anyone with link can view"');
      }
    } catch (accessError) {
      Logger.log('Could not check sharing settings: ' + accessError.toString());
    }
    
    // Show results
    if (issues.length === 0) {
      ui.alert('✅ Logo Setup Successful!', 
        'Logo file: ' + fileName + '\n' +
        'Size: ' + (fileSize / 1024).toFixed(1) + 'KB\n' +
        'Type: ' + mimeType + '\n\n' +
        'Your logo is properly configured and should appear in documents.',
        ui.ButtonSet.OK);
        
      // Create a test document with just the logo
      createLogoTestDocument();
    } else {
      ui.alert('⚠️ Logo Issues Found', 
        'Logo file: ' + fileName + '\n\n' +
        'Issues:\n' + issues.join('\n') + '\n\n' +
        'Please fix these issues for the logo to display properly.',
        ui.ButtonSet.OK);
    }
    
  } catch (error) {
    ui.alert('❌ Logo Access Error', 
      'Cannot access the logo file.\n\n' +
      'Error: ' + error.toString() + '\n\n' +
      'Common causes:\n' +
      '1. Incorrect file ID\n' +
      '2. File was deleted\n' +
      '3. No permission to access\n' +
      '4. Not signed into Google Drive\n\n' +
      'Current ID: ' + logoId,
      ui.ButtonSet.OK);
  }
}

/**
 * Create a simple test document to verify logo display
 */
function createLogoTestDocument() {
  try {
    const doc = DocumentApp.create('Logo Test - ' + new Date().toLocaleString());
    const body = doc.getBody();
    
    // Clear default content
    body.clear();
    
    // Add title
    const title = body.appendParagraph('Logo Display Test');
    title.setHeading(DocumentApp.ParagraphHeading.HEADING1);
    title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    
    body.appendParagraph('');
    
    // Try to add logo directly to body
    body.appendParagraph('Testing logo in document body:');
    
    try {
      const logoBlob = DriveApp.getFileById(BRANDING_CONFIG.logo.driveFileId).getBlob();
      const logoImage = body.appendImage(logoBlob);
      logoImage.setWidth(BRANDING_CONFIG.logo.width);
      logoImage.setHeight(BRANDING_CONFIG.logo.height);
      
      body.appendParagraph('✅ Logo displayed successfully!');
    } catch (error) {
      body.appendParagraph('❌ Error displaying logo: ' + error.toString());
    }
    
    // Add header with logo
    body.appendPageBreak();
    body.appendParagraph('Testing logo in header (check page header above):');
    
    try {
      addBrandedHeader(doc);
      body.appendParagraph('✅ Header with logo added successfully!');
    } catch (error) {
      body.appendParagraph('❌ Error adding header: ' + error.toString());
    }
    
    // Show document URL
    const url = doc.getUrl();
    SpreadsheetApp.getUi().alert('Test Document Created', 
      'A test document has been created to verify your logo display.\n\n' +
      'Document URL:\n' + url,
      SpreadsheetApp.getUi().ButtonSet.OK);
      
    Logger.log('Logo test document created: ' + url);
    
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error', 
      'Failed to create test document: ' + error.toString(),
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Helper function to upload a logo from URL
 * Useful for testing with a sample logo
 */
function setupSampleLogo() {
  const ui = SpreadsheetApp.getUi();
  
  try {
    // Create a simple text-based logo as a sample
    const blob = Utilities.newBlob(
      '<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="200" height="60" fill="#003366" rx="5"/>' +
      '<text x="100" y="35" font-family="Arial" font-size="20" fill="white" text-anchor="middle">YOUR LOGO</text>' +
      '</svg>',
      'image/svg+xml',
      'sample_logo.svg'
    );
    
    // Save to Drive
    const file = DriveApp.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    const fileId = file.getId();
    
    ui.alert('Sample Logo Created!', 
      'A sample logo has been created for testing.\n\n' +
      'File ID: ' + fileId + '\n\n' +
      'To use this logo:\n' +
      '1. Copy the ID above\n' +
      '2. Open Document_Branding.js\n' +
      '3. Replace driveFileId with: \'' + fileId + '\'',
      ui.ButtonSet.OK);
      
    Logger.log('Sample logo created with ID: ' + fileId);
    
  } catch (error) {
    ui.alert('Error', 
      'Failed to create sample logo: ' + error.toString(),
      ui.ButtonSet.OK);
  }
}

/**
 * Get sharing URL for a Drive file
 */
function getLogoSharingUrl() {
  const ui = SpreadsheetApp.getUi();
  const logoId = BRANDING_CONFIG.logo.driveFileId;
  
  if (!logoId || logoId === 'YOUR_LOGO_FILE_ID_HERE') {
    ui.alert('No Logo Configured', 
      'Please set a logo file ID first.',
      ui.ButtonSet.OK);
    return;
  }
  
  try {
    const file = DriveApp.getFileById(logoId);
    const url = file.getUrl();
    
    ui.alert('Logo Sharing URL', 
      'Your logo file URL:\n\n' + url + '\n\n' +
      'Click this link to verify the logo displays correctly.',
      ui.ButtonSet.OK);
      
  } catch (error) {
    ui.alert('Error', 
      'Cannot access logo file: ' + error.toString(),
      ui.ButtonSet.OK);
  }
}

/**
 * Menu function to access logo helpers
 */
function showLogoHelperMenu() {
  const ui = SpreadsheetApp.getUi();
  
  ui.createMenu('🖼️ Logo Helper')
    .addItem('Test Logo Setup', 'testLogoSetup')
    .addItem('Create Sample Logo', 'setupSampleLogo')
    .addItem('Get Logo URL', 'getLogoSharingUrl')
    .addItem('Create Test Document', 'createLogoTestDocument')
    .addToUi();
}