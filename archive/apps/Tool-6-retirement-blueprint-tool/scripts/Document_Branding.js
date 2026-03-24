// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT BRANDING AND FORMATTING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Branding configuration for document formatting
 * Update these values with your company's branding guidelines
 */
const BRANDING_CONFIG = {
  // Company information
  company: {
    name: 'Retirement Blueprint',
    tagline: 'Your Path to Financial Freedom',
    website: 'www.TrupathMastery.com',
    email: 'Sarah@TrupathMastery.com',
    phone: '(555) 123-4567'  // Update with actual phone number
  },
  
  // Logo configuration
  logo: {
    // Replace with your logo's Google Drive file ID
    // To get the ID: Upload logo to Drive, right-click > Get link > extract ID from URL
    driveFileId: '1brLIwiMr7wvlYLHTOKLUCZWMLHLRdvlx',
    width: 150,  // Width in pixels
    height: 50,  // Height in pixels
    alignment: DocumentApp.HorizontalAlignment.LEFT
  },
  
  // Color scheme (use hex colors)
  colors: {
    primary: '#361852',      // Dark blue - main headers
    secondary: '#b39062',    // Medium blue - subheaders
    accent: '#FF6600',       // Orange - highlights, calls to action
    text: '#333333',         // Dark gray - body text
    lightGray: '#666666',    // Light gray - secondary text
    background: '#F5F5F5',   // Light background for sections
    white: '#FFFFFF'         // White
  },
  
  // Typography
  fonts: {
    heading: 'Arial',      // Or 'Playfair Display' if available
    body: 'Arial',          // Or 'Open Sans' if available
    accent: 'Arial'         // For special callouts
  },
  
  // Font sizes (in points)
  sizes: {
    title: 20,
    heading1: 17,
    heading2: 15,
    heading3: 13,
    body: 11,
    small: 9,
    footer: 8
  },
  
  // Spacing (in points)
  spacing: {
    beforeHeading1: 24,
    afterHeading1: 12,
    beforeHeading2: 18,
    afterHeading2: 8,
    beforeParagraph: 6,
    afterParagraph: 6,
    lineSpacing: 1.5
  },
  
  // Page setup
  page: {
    marginTop: 72,      // 1 inch
    marginBottom: 72,
    marginLeft: 72,
    marginRight: 72
  }
};

/**
 * Apply branding to a document
 * @param {Document} doc - The Google Docs document to format
 */
function applyBranding(doc) {
  const body = doc.getBody();
  
  // Set page margins
  body.setMarginTop(BRANDING_CONFIG.page.marginTop);
  body.setMarginBottom(BRANDING_CONFIG.page.marginBottom);
  body.setMarginLeft(BRANDING_CONFIG.page.marginLeft);
  body.setMarginRight(BRANDING_CONFIG.page.marginRight);
  
  // Add header with logo
  addBrandedHeader(doc);
  
  // Add footer with contact info
  addBrandedFooter(doc);
}

/**
 * Add branded header with logo
 * @param {Document} doc - The document to add header to
 */
function addBrandedHeader(doc) {
  const header = doc.addHeader();
  const headerSection = header.appendParagraph('');
  
  // Add logo if configured
  if (BRANDING_CONFIG.logo.driveFileId && BRANDING_CONFIG.logo.driveFileId !== 'YOUR_LOGO_FILE_ID_HERE') {
    try {
      const logoBlob = DriveApp.getFileById(BRANDING_CONFIG.logo.driveFileId).getBlob();
      const logoImage = headerSection.appendInlineImage(logoBlob);
      logoImage.setWidth(BRANDING_CONFIG.logo.width);
      logoImage.setHeight(BRANDING_CONFIG.logo.height);
      headerSection.setAlignment(BRANDING_CONFIG.logo.alignment);
    } catch (error) {
      Logger.log('Error adding logo: ' + error.toString());
      // Fallback to text header
      headerSection.setText(BRANDING_CONFIG.company.name);
      formatText(headerSection, 'heading3', BRANDING_CONFIG.colors.primary);
    }
  } else {
    // Text-only header if no logo
    headerSection.setText(BRANDING_CONFIG.company.name);
    formatText(headerSection, 'heading3', BRANDING_CONFIG.colors.primary);
  }
}

/**
 * Add branded footer
 * @param {Document} doc - The document to add footer to
 */
function addBrandedFooter(doc) {
  const footer = doc.addFooter();
  
  const footerText = footer.appendParagraph(
    `${BRANDING_CONFIG.company.name} | ${BRANDING_CONFIG.company.phone} | ${BRANDING_CONFIG.company.email} | ${BRANDING_CONFIG.company.website}`
  );
  
  footerText.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  formatText(footerText, 'footer', BRANDING_CONFIG.colors.lightGray);
}

/**
 * Format a paragraph with branding styles
 * @param {Paragraph} paragraph - The paragraph to format
 * @param {string} style - Style name: 'title', 'heading1', 'heading2', 'heading3', 'body', 'small'
 * @param {string} color - Optional color override (hex)
 */
function formatText(paragraph, style = 'body', color = null) {
  const text = paragraph.editAsText();
  const styles = text.getTextAttributeIndices();
  
  // Set font family
  const fontFamily = style.includes('heading') || style === 'title' 
    ? BRANDING_CONFIG.fonts.heading 
    : BRANDING_CONFIG.fonts.body;
  
  text.setFontFamily(fontFamily);
  
  // Set font size
  text.setFontSize(BRANDING_CONFIG.sizes[style] || BRANDING_CONFIG.sizes.body);
  
  // Set color
  const textColor = color || (style.includes('heading') || style === 'title' 
    ? BRANDING_CONFIG.colors.primary 
    : BRANDING_CONFIG.colors.text);
  
  text.setForegroundColor(textColor);
  
  // Apply spacing based on style
  if (style === 'heading1') {
    paragraph.setSpacingBefore(BRANDING_CONFIG.spacing.beforeHeading1);
    paragraph.setSpacingAfter(BRANDING_CONFIG.spacing.afterHeading1);
  } else if (style === 'heading2') {
    paragraph.setSpacingBefore(BRANDING_CONFIG.spacing.beforeHeading2);
    paragraph.setSpacingAfter(BRANDING_CONFIG.spacing.afterHeading2);
  } else {
    paragraph.setSpacingBefore(BRANDING_CONFIG.spacing.beforeParagraph);
    paragraph.setSpacingAfter(BRANDING_CONFIG.spacing.afterParagraph);
  }
  
  // Set line spacing
  paragraph.setLineSpacing(BRANDING_CONFIG.spacing.lineSpacing);
  
  // Make headings bold
  if (style.includes('heading') || style === 'title') {
    text.setBold(true);
  }
}

/**
 * Format a table with branding
 * @param {Table} table - The table to format
 */
function formatTable(table) {
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
        cellText.setForegroundColor(BRANDING_CONFIG.colors.white);
        cell.setBackgroundColor(BRANDING_CONFIG.colors.primary);
        cellText.setFontFamily(BRANDING_CONFIG.fonts.heading);
        cellText.setFontSize(BRANDING_CONFIG.sizes.body);
      } else {
        // Data rows
        cellText.setFontFamily(BRANDING_CONFIG.fonts.body);
        cellText.setFontSize(BRANDING_CONFIG.sizes.body);
        cellText.setForegroundColor(BRANDING_CONFIG.colors.text);
        
        // Alternate row coloring
        if (i % 2 === 0) {
          cell.setBackgroundColor(BRANDING_CONFIG.colors.background);
        }
      }
    }
  }
  
  // Set table border
  table.setBorderColor(BRANDING_CONFIG.colors.lightGray);
}

/**
 * Create a branded section divider
 * @param {Body} body - Document body
 * @param {string} text - Optional text for the divider
 */
function addBrandedDivider(body, text = '') {
  body.appendParagraph('');  // Add spacing
  
  if (text) {
    const divider = body.appendParagraph('━━━━━━━━━━━  ' + text + '  ━━━━━━━━━━━');
    divider.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    formatText(divider, 'small', BRANDING_CONFIG.colors.secondary);
  } else {
    const divider = body.appendParagraph('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    divider.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
    formatText(divider, 'small', BRANDING_CONFIG.colors.lightGray);
  }
  
  body.appendParagraph('');  // Add spacing
}

/**
 * Create a highlighted callout box
 * @param {Body} body - Document body
 * @param {string} content - Content for the callout
 * @param {string} icon - Optional icon/emoji
 */
function addCalloutBox(body, content, icon = '💡') {
  const callout = body.appendParagraph(icon + ' ' + content);
  callout.setIndentFirstLine(36);
  callout.setIndentStart(36);
  callout.setIndentEnd(36);
  
  // Set background color (note: Google Docs API doesn't support paragraph background)
  // So we'll use a distinctive text color instead
  formatText(callout, 'body', BRANDING_CONFIG.colors.secondary);
  
  // Add border effect with special characters
  const borderTop = body.insertParagraph(body.getChildIndex(callout), '┌─────────────────────────────────────────────────────────┐');
  const borderBottom = body.insertParagraph(body.getChildIndex(callout) + 1, '└─────────────────────────────────────────────────────────┘');
  
  formatText(borderTop, 'small', BRANDING_CONFIG.colors.lightGray);
  formatText(borderBottom, 'small', BRANDING_CONFIG.colors.lightGray);
}

/**
 * Test function to demonstrate branding
 */
function testBranding() {
  const doc = DocumentApp.create('Branding Test - ' + new Date().toLocaleString());
  const body = doc.getBody();
  
  // Apply base branding
  applyBranding(doc);
  
  // Add content with formatting
  const title = body.appendParagraph('RETIREMENT BLUEPRINT');
  title.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  formatText(title, 'title');
  
  const subtitle = body.appendParagraph('Your Personalized Path to Financial Freedom');
  subtitle.setAlignment(DocumentApp.HorizontalAlignment.CENTER);
  formatText(subtitle, 'heading2', BRANDING_CONFIG.colors.secondary);
  
  body.appendPageBreak();
  
  // Chapter heading
  const chapter1 = body.appendParagraph('CHAPTER 1: YOUR CURRENT PATH');
  formatText(chapter1, 'heading1');
  
  // Regular paragraph
  const para1 = body.appendParagraph('This is a sample paragraph demonstrating the branded body text style. ' +
    'It uses the configured font family, size, color, and spacing to maintain consistency throughout the document.');
  formatText(para1, 'body');
  
  // Add a callout
  addCalloutBox(body, 'Key Insight: Your retirement strategy should align with your unique goals and circumstances.', '🎯');
  
  // Add a divider
  addBrandedDivider(body, 'Vehicle Recommendations');
  
  // Sample table
  const table = body.appendTable();
  const headerRow = table.appendTableRow();
  headerRow.appendTableCell('Investment Vehicle');
  headerRow.appendTableCell('Monthly Amount');
  headerRow.appendTableCell('Tax Advantage');
  
  const dataRow = table.appendTableRow();
  dataRow.appendTableCell('401(k) Match');
  dataRow.appendTableCell('$500');
  dataRow.appendTableCell('Pre-tax');
  
  formatTable(table);
  
  Logger.log('Branding test document created: ' + doc.getUrl());
}