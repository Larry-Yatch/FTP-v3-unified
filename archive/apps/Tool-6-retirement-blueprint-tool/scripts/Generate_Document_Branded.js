// ═══════════════════════════════════════════════════════════════════════════════
// BRANDED DOCUMENT GENERATION - Wrapper for Safe Document
// This properly wraps the safe document generation with branding
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a branded retirement blueprint document
 * This wraps the safe document generation and applies branding
 */
function generateDocumentBranded() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const row = sheet.getActiveRange().getRow();
    
    if (row < 3) {
      throw new Error('Please select a data row (row 3 or below)');
    }
    
    Logger.log(`Starting BRANDED document generation for row ${row}`);
    
    // First, generate the safe document
    Logger.log('Generating safe document as base...');
    const docUrl = generateRetirementBlueprintSafe(row);
    
    Logger.log(`Safe document returned URL: ${docUrl}`);
    Logger.log(`URL type: ${typeof docUrl}`);
    
    if (!docUrl) {
      throw new Error('Failed to generate base document - no URL returned');
    }
    
    // Extract document ID from URL
    const docId = extractDocIdFromUrl(docUrl);
    Logger.log(`Extracted document ID: ${docId}`);
    
    if (!docId) {
      throw new Error(`Could not extract document ID from URL: ${docUrl}`);
    }
    
    Logger.log(`Base document created with ID: ${docId}`);
    
    // Now apply branding to the generated document
    applyBrandingToDocument(docId);
    
    // Return the same URL - the document has been branded in place
    SpreadsheetApp.getUi().alert('✅ Success!', 
      `Your branded Retirement Blueprint has been created.\n\nDocument URL:\n${docUrl}`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
    
    return docUrl;
    
  } catch (error) {
    Logger.log(`Error in branded generation: ${error.toString()}`);
    Logger.log(`Error stack: ${error.stack}`);
    SpreadsheetApp.getUi().alert('❌ Error', 
      `Failed to generate branded document: ${error.toString()}`, 
      SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Extract document ID from Google Docs URL
 */
function extractDocIdFromUrl(url) {
  if (!url) {
    Logger.log('extractDocIdFromUrl: No URL provided');
    return null;
  }
  
  Logger.log(`extractDocIdFromUrl: Processing URL: ${url}`);
  
  // Handle various Google Docs URL formats:
  // https://docs.google.com/document/d/DOCUMENT_ID/edit
  // https://docs.google.com/document/d/DOCUMENT_ID/edit?usp=sharing
  // https://docs.google.com/document/d/DOCUMENT_ID
  // Also handle if just the ID is passed
  
  // First check if it's already just an ID
  if (/^[a-zA-Z0-9-_]+$/.test(url) && url.length > 20) {
    Logger.log('URL appears to be just the document ID');
    return url;
  }
  
  // Try to extract from URL - handle multiple formats
  // Format 1: /document/d/DOCUMENT_ID
  let match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    Logger.log(`Extracted document ID from /document/d/ format: ${match[1]}`);
    return match[1];
  }
  
  // Format 2: open?id=DOCUMENT_ID (the format we're actually getting)
  match = url.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    Logger.log(`Extracted document ID from open?id= format: ${match[1]}`);
    return match[1];
  }
  
  // Format 3: /d/DOCUMENT_ID (shortened format)
  match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    Logger.log(`Extracted document ID from /d/ format: ${match[1]}`);
    return match[1];
  }
  
  Logger.log('Could not extract document ID from URL');
  return null;
}

/**
 * Apply branding to an existing document
 */
function applyBrandingToDocument(docId) {
  try {
    Logger.log(`Applying branding to document ${docId}`);
    
    // Open the existing document
    const doc = DocumentApp.openById(docId);
    const body = doc.getBody();
    
    // Check if branding config exists
    if (typeof BRANDING_CONFIG === 'undefined') {
      Logger.log('Warning: BRANDING_CONFIG not found, skipping advanced branding');
      // Apply basic formatting at minimum
      applyBasicFormatting(doc, body);
      return;
    }
    
    // Apply full branding
    Logger.log('Applying full branding...');
    
    // 1. Add header with logo
    try {
      if (typeof applyBranding === 'function') {
        applyBranding(doc);
      } else {
        addBrandedHeaderFooter(doc);
      }
    } catch (e) {
      Logger.log('Error applying header/footer: ' + e.toString());
    }
    
    // 2. Format existing content with brand styles
    formatDocumentContent(body);
    
    // 3. Style tables with brand colors
    formatAllTables(body);
    
    // 4. Update the title page with better formatting
    enhanceTitlePage(body);
    
    Logger.log('Branding applied successfully');
    
  } catch (error) {
    Logger.log('Error applying branding: ' + error.toString());
    // Don't throw - document is still usable without branding
  }
}

/**
 * Apply basic formatting even without BRANDING_CONFIG
 */
function applyBasicFormatting(doc, body) {
  try {
    // Set consistent font
    const paragraphs = body.getParagraphs();
    paragraphs.forEach(para => {
      if (para.getText()) {
        const text = para.editAsText();
        text.setFontFamily('Arial');
        
        // Style headings
        const heading = para.getHeading();
        if (heading === DocumentApp.ParagraphHeading.TITLE) {
          text.setFontSize(24);
          text.setBold(true);
          para.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        } else if (heading === DocumentApp.ParagraphHeading.HEADING1) {
          text.setFontSize(18);
          text.setBold(true);
          text.setForegroundColor('#003366');
        } else {
          text.setFontSize(11);
        }
      }
    });
  } catch (e) {
    Logger.log('Error in basic formatting: ' + e.toString());
  }
}

/**
 * Add branded header and footer
 */
function addBrandedHeaderFooter(doc) {
  try {
    // Add header
    const header = doc.addHeader();
    const headerPara = header.appendParagraph('');
    
    if (BRANDING_CONFIG && BRANDING_CONFIG.company) {
      headerPara.setText(BRANDING_CONFIG.company.name || 'Retirement Blueprint');
      headerPara.setAlignment(DocumentApp.HorizontalAlignment.LEFT);
      
      // Try to add logo if configured
      if (BRANDING_CONFIG.logo && BRANDING_CONFIG.logo.driveFileId && 
          BRANDING_CONFIG.logo.driveFileId !== 'YOUR_LOGO_FILE_ID_HERE') {
        try {
          const logoBlob = DriveApp.getFileById(BRANDING_CONFIG.logo.driveFileId).getBlob();
          const logoImage = headerPara.appendInlineImage(logoBlob);
          logoImage.setWidth(BRANDING_CONFIG.logo.width || 150);
          logoImage.setHeight(BRANDING_CONFIG.logo.height || 50);
        } catch (logoError) {
          Logger.log('Could not add logo: ' + logoError.toString());
        }
      }
    }
    
    // Add footer
    const footer = doc.addFooter();
    let footerText = 'Retirement Blueprint';
    
    if (BRANDING_CONFIG && BRANDING_CONFIG.company) {
      const company = BRANDING_CONFIG.company;
      footerText = [
        company.name,
        company.phone,
        company.email,
        company.website
      ].filter(Boolean).join(' | ');
    }
    
    const footerPara = footer.appendParagraph(footerText);
    footerPara.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    footerPara.editAsText().setFontSize(9).setForegroundColor('#666666');
    
  } catch (e) {
    Logger.log('Error adding header/footer: ' + e.toString());
  }
}

/**
 * Format the document content with brand styles
 */
function formatDocumentContent(body) {
  try {
    const paragraphs = body.getParagraphs();
    
    paragraphs.forEach(para => {
      const text = para.editAsText();
      const heading = para.getHeading();
      
      if (BRANDING_CONFIG && BRANDING_CONFIG.fonts) {
        // Apply font families
        if (heading === DocumentApp.ParagraphHeading.TITLE || 
            heading === DocumentApp.ParagraphHeading.HEADING1) {
          text.setFontFamily(BRANDING_CONFIG.fonts.heading || 'Georgia');
        } else {
          text.setFontFamily(BRANDING_CONFIG.fonts.body || 'Arial');
        }
      }
      
      if (BRANDING_CONFIG && BRANDING_CONFIG.colors) {
        // Apply colors
        if (heading === DocumentApp.ParagraphHeading.TITLE || 
            heading === DocumentApp.ParagraphHeading.HEADING1) {
          text.setForegroundColor(BRANDING_CONFIG.colors.primary || '#003366');
        }
      }
      
      if (BRANDING_CONFIG && BRANDING_CONFIG.sizes) {
        // Apply sizes
        if (heading === DocumentApp.ParagraphHeading.TITLE) {
          text.setFontSize(BRANDING_CONFIG.sizes.title || 28);
          para.setSpacingAfter(12);
        } else if (heading === DocumentApp.ParagraphHeading.HEADING1) {
          text.setFontSize(BRANDING_CONFIG.sizes.heading1 || 22);
          para.setSpacingBefore(18);
          para.setSpacingAfter(12);
        } else if (heading === DocumentApp.ParagraphHeading.NORMAL) {
          text.setFontSize(BRANDING_CONFIG.sizes.body || 11);
          para.setLineSpacing(1.5);
        }
      }
    });
  } catch (e) {
    Logger.log('Error formatting content: ' + e.toString());
  }
}

/**
 * Format all tables with brand colors
 */
function formatAllTables(body) {
  try {
    const tables = body.getTables();
    
    tables.forEach(table => {
      if (typeof formatTable === 'function') {
        formatTable(table);
      } else {
        // Basic table formatting
        const numRows = table.getNumRows();
        for (let i = 0; i < numRows; i++) {
          const row = table.getRow(i);
          const numCells = row.getNumCells();
          
          for (let j = 0; j < numCells; j++) {
            const cell = row.getCell(j);
            const cellText = cell.editAsText();
            
            if (i === 0) {
              // Header row
              cellText.setBold(true);
              if (BRANDING_CONFIG && BRANDING_CONFIG.colors) {
                cell.setBackgroundColor(BRANDING_CONFIG.colors.primary || '#003366');
                cellText.setForegroundColor('#FFFFFF');
              }
            } else if (i % 2 === 0 && BRANDING_CONFIG && BRANDING_CONFIG.colors) {
              // Alternate row coloring
              cell.setBackgroundColor(BRANDING_CONFIG.colors.background || '#F5F5F5');
            }
          }
        }
      }
    });
  } catch (e) {
    Logger.log('Error formatting tables: ' + e.toString());
  }
}

/**
 * Enhance the title page formatting
 */
function enhanceTitlePage(body) {
  try {
    const paragraphs = body.getParagraphs();
    
    // Find and enhance the title
    for (let i = 0; i < Math.min(paragraphs.length, 10); i++) {
      const para = paragraphs[i];
      const text = para.getText();
      
      if (text === 'RETIREMENT BLUEPRINT') {
        para.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        const textElement = para.editAsText();
        textElement.setFontSize(32);
        textElement.setBold(true);
        if (BRANDING_CONFIG && BRANDING_CONFIG.colors) {
          textElement.setForegroundColor(BRANDING_CONFIG.colors.primary || '#003366');
        }
      } else if (text === 'Your Personalized Path to Financial Freedom') {
        para.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
        const textElement = para.editAsText();
        textElement.setFontSize(16);
        textElement.setItalic(true);
        if (BRANDING_CONFIG && BRANDING_CONFIG.colors) {
          textElement.setForegroundColor(BRANDING_CONFIG.colors.secondary || '#666666');
        }
      }
    }
  } catch (e) {
    Logger.log('Error enhancing title page: ' + e.toString());
  }
}

/**
 * Alternative menu function that properly wraps safe generation
 */
function generateBrandedBlueprint() {
  return generateDocumentBranded();
}