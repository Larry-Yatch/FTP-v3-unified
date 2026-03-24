// Configuration for document generation
const DOC_CONFIG = {
  // Output folder configuration
  OUTPUT_FOLDER_ID: '16KZLGRzLxa-e-jxnkDVb-sZcbosgPvGM',
  
  // Working Sheet configuration
  SHEET_NAME: 'Working Sheet',
  HEADER_ROW: 2,
  
  // Email configuration (no longer used - we have custom email function)
  EMAIL_TEMPLATE: {
    subject: 'Your Retirement Blueprint Report',
    body: 'See custom email function for current template'
  }
};

// Configuration for addendum documents
const ADDENDUM_CONFIG = {
  // Profile-specific addendum document IDs
  PROFILE_ADDENDUMS: {
    '1_ROBS_In_Use': '1i2Ghcm938x4tG-h0awrCDhDL5k8tGiplB36N1fQrwTA',
    '2_ROBS_Curious': '16XfI39hU6AC5JtX389hxkY_Tu7uRHt4bw6vlslO4d0w',
    '3_Solo401k_Builder': '1Ye_m2jE34E-fA8W0VJV7_cRnxXnjezcWCRzkVMakoZs',
    '4_Roth_Reclaimer': '1yJBXpv12uN00_OboM96d1by5JXnj0JUlMdooH5XzUQ0',
    '5_Bracket_Strategist': '14eWZWHT6mbs72du30QBzwoOaWOrhyoSXMWB5jLVzoTM',
    '6_Catch_Up': '1_O_aldmpAzJf6W2vrpYTuynL54YBU8rASHv5TKCocPo',
    '7_Foundation_Builder': '1407aq99LJWEILaqh8W0za-NVO_FKu7gsERY1IzdTHk4',
    '8_Biz_Owner_Group': '1zpwqMQDQ6-5UA1FUDyLCZyei3jgzJwG23FPq1XPqjnc',
    '9_Late_Stage_Growth': '13zE5KhZd_IVZlzZadtUf2v5jWQMoNQbZKYSUDOWj7xs'
  },
  // Universal addendum document ID
  UNIVERSAL_ADDENDUM_ID: '1aYMYsskG_1BDkf-ySV_0z1JMLHVryEg5o3ceZkAZzQI'
};

/**
 * Safe document generation - prevents content repetition
 */
function generateRetirementBlueprintSafe(rowNum) {
  try {
    Logger.log(`Starting SAFE document generation for row ${rowNum}`);
    
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const ws = ss.getSheetByName(DOC_CONFIG.SHEET_NAME);
    if (!ws) throw new Error('Working Sheet not found');
    
    // Get headers and data
    const lastCol = ws.getLastColumn();
    const headers = ws.getRange(DOC_CONFIG.HEADER_ROW, 1, 1, lastCol).getValues()[0];
    const rowData = ws.getRange(rowNum, 1, 1, lastCol).getValues()[0];
    
    // Create header map for easy access
    const hdr = {};
    headers.forEach((h, i) => {
      if (h) hdr[h] = i;
    });
    
    // Get key data
    const fullName = rowData[hdr['Full_Name']] || 'Client';
    const profileId = rowData[hdr['ProfileID']];
    const email = rowData[hdr['Email']];
    
    // Create document name
    const timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    const cleanName = fullName.replace(/\s+/g, '_');
    const docName = `Retirement Blueprint_${cleanName}_${timestamp}`;
    
    // Create NEW document WITHOUT using template copy
    const folder = DOC_CONFIG.OUTPUT_FOLDER_ID ? 
      DriveApp.getFolderById(DOC_CONFIG.OUTPUT_FOLDER_ID) : 
      DriveApp.getRootFolder();
    
    const doc = DocumentApp.create(docName);
    const body = doc.getBody();
    body.clear();
    
    // Build document from scratch
    // Title section
    body.appendParagraph('RETIREMENT BLUEPRINT').setHeading(DocumentApp.ParagraphHeading.TITLE);
    body.appendParagraph('Your Personalized Path to Financial Freedom');
    body.appendParagraph('');
    body.appendParagraph('Prepared for: ' + fullName);
    body.appendParagraph('Date: ' + timestamp);
    body.appendParagraph('Profile: ' + (PROFILE_CONFIG[profileId]?.title || 'Retirement Strategist'));
    
    body.appendPageBreak();
    
    // Generate narratives safely - with increased character limits
    const opening = truncateNarrative(generateOpeningNarrative(rowData, hdr), 1500);
    body.appendParagraph(opening);
    body.appendParagraph('');
    
    // Chapter 1
    body.appendParagraph('CHAPTER 1: YOUR CURRENT PATH').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const phase1 = truncateNarrative(generatePhase1Narrative(rowData, hdr), 1200);
    body.appendParagraph(phase1);
    body.appendParagraph('');
    
    body.appendParagraph('Financial Snapshot:');
    body.appendParagraph('• Annual Income: ' + formatCurrency(rowData[hdr['gross_annual_income']]));
    body.appendParagraph('• Monthly Net: ' + formatCurrency(rowData[hdr['Net_Monthly_Income']]));
    body.appendParagraph('• Savings Rate: ' + (rowData[hdr['Allocation_Percentage']] || '0') + '%');
    body.appendParagraph('');
    
    // Chapter 2
    body.appendParagraph('CHAPTER 2: YOUR PRIORITIES').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const phase2 = truncateNarrative(generatePhase2Narrative(rowData, hdr), 1200);
    body.appendParagraph(phase2);
    body.appendParagraph('');
    
    const profileNarrative = truncateNarrative(generateProfileNarrative(profileId, rowData, hdr), 1500);
    if (profileNarrative) {
      body.appendParagraph(profileNarrative);
      body.appendParagraph('');
    }
    
    // Chapter 3
    body.appendParagraph('CHAPTER 3: YOUR OPPORTUNITY').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const results = truncateNarrative(generateResultsNarrative(rowData, hdr), 1200);
    body.appendParagraph(results);
    body.appendParagraph('');
    
    // Calculate totals
    const actualTotal = calculateTotalMonthly(rowData, hdr, 'actual');
    const idealTotal = calculateTotalMonthly(rowData, hdr, 'ideal');
    const difference = idealTotal - actualTotal;
    
    body.appendParagraph('Monthly Contribution Summary:');
    body.appendParagraph('• Current: ' + formatCurrency(actualTotal));
    body.appendParagraph('• Optimized: ' + formatCurrency(idealTotal));
    body.appendParagraph('• Improvement: ' + formatCurrency(difference));
    body.appendParagraph('');
    
    // Chapter 4
    body.appendParagraph('CHAPTER 4: FUTURE PROJECTIONS').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const rate = rowData[hdr['personalized_annual_rate']];
    body.appendParagraph('Your Personalized Growth Rate: ' + formatPercentage(rate));
    body.appendParagraph('');
    
    // NEW: Starting Point Section
    body.appendParagraph('Current Starting Positions:').setBold(true);
    const retirementStart = parseFloat(rowData[hdr['retirement_starting_balance']]) || 0;
    const educationStart = parseFloat(rowData[hdr['education_starting_balance']]) || 0;
    const healthStart = parseFloat(rowData[hdr['health_starting_balance']]) || 0;
    const familyBankStart = parseFloat(rowData[hdr['family_bank_starting_balance']]) || 0;
    const totalStart = retirementStart + educationStart + healthStart + familyBankStart;
    
    if (totalStart > 0) {
      body.appendParagraph('• Retirement Accounts: ' + formatCurrency(retirementStart));
      body.appendParagraph('• Education Accounts: ' + formatCurrency(educationStart));
      body.appendParagraph('• Health Accounts: ' + formatCurrency(healthStart));
      if (familyBankStart > 0) {
        body.appendParagraph('• Family Bank: ' + formatCurrency(familyBankStart));
      }
      body.appendParagraph('• Total Current Assets: ' + formatCurrency(totalStart)).setBold(true);
    } else {
      body.appendParagraph('• Starting from zero - perfect time to begin!');
    }
    body.appendParagraph('');
    
    body.appendParagraph('Projected Growth (including current balances):').setBold(true);
    body.appendParagraph('Retirement Domain:');
    body.appendParagraph('• Current Path: ' + formatCurrency(rowData[hdr['retirement_fv_actual']]));
    body.appendParagraph('• Optimized Path: ' + formatCurrency(rowData[hdr['retirement_fv_ideal']]));
    const retFvGain = (parseFloat(rowData[hdr['retirement_fv_ideal']]) || 0) - 
                      (parseFloat(rowData[hdr['retirement_fv_actual']]) || 0);
    body.appendParagraph('• Additional Wealth: ' + formatCurrency(retFvGain));
    body.appendParagraph('');
    
    // Add Education and Health if they have meaningful values
    const eduFvActual = parseFloat(rowData[hdr['education_fv_actual']]) || 0;
    const eduFvIdeal = parseFloat(rowData[hdr['education_fv_ideal']]) || 0;
    if (eduFvActual > 0 || eduFvIdeal > 0 || educationStart > 0) {
      body.appendParagraph('Education Domain:');
      body.appendParagraph('• Current Path: ' + formatCurrency(eduFvActual));
      body.appendParagraph('• Optimized Path: ' + formatCurrency(eduFvIdeal));
      body.appendParagraph('');
    }
    
    const healthFvActual = parseFloat(rowData[hdr['health_fv_actual']]) || 0;
    const healthFvIdeal = parseFloat(rowData[hdr['health_fv_ideal']]) || 0;
    if (healthFvActual > 0 || healthFvIdeal > 0 || healthStart > 0) {
      body.appendParagraph('Health Domain:');
      body.appendParagraph('• Current Path: ' + formatCurrency(healthFvActual));
      body.appendParagraph('• Optimized Path: ' + formatCurrency(healthFvIdeal));
      body.appendParagraph('');
    }
    
    // Family Bank projections (5% growth rate)
    const familyBankFvActual = parseFloat(rowData[hdr['family_bank_fv_actual']]) || 0;
    const familyBankFvIdeal = parseFloat(rowData[hdr['family_bank_fv_ideal']]) || 0;
    const familyBankIdealMonthly = parseFloat(rowData[hdr['family_bank_ideal']]) || 0;
    if (familyBankFvActual > 0 || familyBankFvIdeal > 0 || familyBankIdealMonthly > 0) {
      body.appendParagraph('Family Bank (5% Growth):');
      if (familyBankFvActual > 0) {
        body.appendParagraph('• Current Path: ' + formatCurrency(familyBankFvActual));
      }
      body.appendParagraph('• Optimized Path: ' + formatCurrency(familyBankFvIdeal));
      body.appendParagraph('• Monthly Contribution: ' + formatCurrency(familyBankIdealMonthly));
      body.appendParagraph('');
    }
    
    // Total future value comparison
    const totalFvActual = (parseFloat(rowData[hdr['retirement_fv_actual']]) || 0) +
                          (parseFloat(rowData[hdr['education_fv_actual']]) || 0) +
                          (parseFloat(rowData[hdr['health_fv_actual']]) || 0) +
                          (parseFloat(rowData[hdr['family_bank_fv_actual']]) || 0);
    const totalFvIdeal = (parseFloat(rowData[hdr['retirement_fv_ideal']]) || 0) +
                         (parseFloat(rowData[hdr['education_fv_ideal']]) || 0) +
                         (parseFloat(rowData[hdr['health_fv_ideal']]) || 0) +
                         (parseFloat(rowData[hdr['family_bank_fv_ideal']]) || 0);
    const totalFvGain = totalFvIdeal - totalFvActual;
    
    body.appendParagraph('Total Portfolio Projection:').setBold(true);
    body.appendParagraph('• Current Path Total: ' + formatCurrency(totalFvActual));
    body.appendParagraph('• Optimized Path Total: ' + formatCurrency(totalFvIdeal));
    body.appendParagraph('• Total Additional Wealth: ' + formatCurrency(totalFvGain)).setBold(true);
    body.appendParagraph('');
    
    // Chapter 5 - Vehicle recommendations
    body.appendParagraph('CHAPTER 5: YOUR VEHICLES').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const recommendations = formatVehicleRecommendations(rowData, hdr);
    if (recommendations && recommendations.length > 0) {
      const table = body.appendTable();
      populateVehicleRecommendationsTable(table, recommendations);
    } else {
      body.appendParagraph('Vehicle recommendations will be provided based on your profile.');
    }
    body.appendParagraph('');
    
    // Chapter 6 - Action plan
    body.appendParagraph('CHAPTER 6: YOUR ACTION PLAN').setHeading(DocumentApp.ParagraphHeading.HEADING1);
    const actionSteps = truncateNarrative(
      generateActionStepsNarrative(rowData, hdr, recommendations), 
      2000
    );
    body.appendParagraph(actionSteps);
    body.appendParagraph('');
    
    // Closing
    body.appendParagraph('The best retirement plan is the one you actually implement.');
    body.appendParagraph('Start today, and your future self will thank you.');
    body.appendParagraph('');
    body.appendParagraph('To your financial freedom,');
    body.appendParagraph('The Retirement Blueprint Team');
    
    // Save and move
    doc.saveAndClose();
    const file = DriveApp.getFileById(doc.getId());
    file.moveTo(folder);
    
    const docUrl = doc.getUrl();
    
    // Save URL to sheet
    let urlCol = hdr['retirement_blueprint_doc_url'];
    
    // If column doesn't exist in header map, search for it
    if (urlCol === undefined) {
      // Search through headers to find the column
      for (let i = 0; i < headers.length; i++) {
        if (headers[i] === 'retirement_blueprint_doc_url') {
          urlCol = i;
          hdr['retirement_blueprint_doc_url'] = i;
          break;
        }
      }
    }
    
    // If still not found, add it as a new column
    if (urlCol === undefined) {
      urlCol = lastCol;  // This will be the next column (0-based index)
      ws.getRange(DOC_CONFIG.HEADER_ROW, urlCol + 1).setValue('retirement_blueprint_doc_url');
      Logger.log(`Added retirement_blueprint_doc_url header at column ${urlCol + 1}`);
    }
    
    // Save the URL (urlCol is 0-based, getRange needs 1-based)
    ws.getRange(rowNum, urlCol + 1).setValue(docUrl);
    Logger.log(`Saved document URL to row ${rowNum}, column ${urlCol + 1}`);
    
    Logger.log(`Safe document created successfully: ${docUrl}`);
    
    // Generate PDF and email if requested
    if (email) {
      try {
        sendRetirementBlueprintEmailWithAddendums(doc.getId(), email, fullName, headers, rowData, hdr, profileId);
      } catch (emailError) {
        Logger.log(`Failed to send email with addendums: ${emailError}`);
        // Fallback to simple email
        sendSimpleEmail(doc.getId(), email, fullName);
      }
    }
    
    return docUrl;
    
  } catch (error) {
    Logger.log(`Error in safe generation: ${error.toString()}`);
    throw error;
  }
}

/**
 * Send retirement blueprint email with PDF attachments
 * Includes: main blueprint PDF, universal addendum, and profile-specific addendum
 */
function sendRetirementBlueprintEmailWithAddendums(docId, email, fullName, headers, rowData, hdr, profileId) {
  try {
    Logger.log(`Preparing email for ${email}`);
    
    // Get the main document as PDF
    const doc = DriveApp.getFileById(docId);
    const mainPdfBlob = doc.getBlob().getAs('application/pdf')
      .setName(doc.getName() + '.pdf');
    
    // Prepare attachments array
    const attachments = [mainPdfBlob];
    
    // Add universal addendum
    if (ADDENDUM_CONFIG.UNIVERSAL_ADDENDUM_ID) {
      try {
        const universalFile = DriveApp.getFileById(ADDENDUM_CONFIG.UNIVERSAL_ADDENDUM_ID);
        const universalPdf = universalFile.getBlob().getAs('application/pdf')
          .setName('Retirement Blueprint - Universal Guide.pdf');
        attachments.push(universalPdf);
        Logger.log('Added universal addendum');
      } catch (error) {
        Logger.log(`Warning: Could not attach universal addendum: ${error}`);
      }
    }
    
    // Add profile-specific addendum
    const profileAddendumId = ADDENDUM_CONFIG.PROFILE_ADDENDUMS[profileId];
    if (profileAddendumId) {
      try {
        const profileFile = DriveApp.getFileById(profileAddendumId);
        const profileName = PROFILE_CONFIG[profileId]?.title || profileId;
        const profilePdf = profileFile.getBlob().getAs('application/pdf')
          .setName(`Retirement Blueprint - ${profileName} Guide.pdf`);
        attachments.push(profilePdf);
        Logger.log(`Added profile addendum for ${profileId}`);
      } catch (error) {
        Logger.log(`Warning: Could not attach profile addendum: ${error}`);
      }
    }
    
    // Prepare email body with replacements
    const replacements = prepareReplacements(headers, rowData, hdr);
    const firstName = fullName.split(' ')[0] || fullName;
    const profileTitle = PROFILE_CONFIG[profileId]?.title || 'Retirement Strategist';
    
    // Enhanced email template
    const emailBody = `Dear ${firstName},

Thank you for your patience as we develop this course. Together we are creating something that has not existed before. In this I am always going to improve the system. As you know we launched the first version of the Retirement Blueprint system right before our class. I have been spending the last week optimizing the system and have found two bugs and made two improvements.  

Here are the details:
1. I fixed the engine that runs the Business Owners Group allocation calculations.
2. I fixed a bug that excluded Employer Match balances from the final report.
3. I added current balances to the Future Calculator so that you would have a clearer view of your financial trajectory.
4. I added a Family Bank section in the Future Calculator to represent an accurate look at what growth you could expect from a standard Family Bank strategy.

Therefore, I reran every report and that is what you are seeing below.  Some of your results may have changed others have stayed the same.  I look forward to going through all these this evening.

I cannot promise you that this is the last redo that I will send, but I can promise you that I will continue to improve the system.

**Your Documents Include:**

1. **Retirement Blueprint Report** - Your personalized analysis showing:
   • Current savings path vs. optimized strategy
   • Projected future values at your ${replacements.personalized_annual_rate || 'personalized'} growth rate
   • Specific vehicle recommendations ranked by priority
   • Step-by-step action plan

2. **Universal Planning Guide** - Essential strategies that apply to all retirement savers:
   • Tax optimization techniques
   • Contribution limit reference for ${new Date().getFullYear()}
   • Common planning mistakes to avoid

3. **${profileTitle} Specialized Guide** - Advanced strategies specific to your profile:
   • Tailored recommendations for your situation
   • Profile-specific optimization opportunities
   • Case studies and examples

**Key Highlights from Your Analysis:**
• Current monthly contributions: ${replacements.total_actual_monthly || '$0'}
• Optimized monthly strategy: ${replacements.total_ideal_monthly || '$0'}
• Potential additional wealth at retirement: ${replacements.retirement_fv_gain || '$0'}

**Next Steps:**
1. Review your main Blueprint report first
2. Implement the prioritized vehicle recommendations
3. Reference the guides for deeper strategies
4. Schedule a review in 6 months to track progress

Remember: The best retirement plan is the one you actually implement. Start with your highest-priority recommendations and build from there.

Best regards,
Larry and the TruPath team

P.S. This analysis was generated on ${replacements.report_date || new Date().toLocaleDateString()} based on your current situation. As your circumstances change, your optimal strategy may evolve as well.`;

    // Send email
    MailApp.sendEmail({
      to: email,
      subject: 'Your Retirement Blueprint Strategy Documents',
      body: emailBody,
      attachments: attachments
    });
    
    Logger.log(`Email sent successfully to ${email} with ${attachments.length} attachments`);
    
  } catch (error) {
    Logger.log(`Error sending email: ${error}`);
    throw error;
  }
}

/**
 * Simple email function (fallback)
 */
function sendSimpleEmail(docId, email, fullName) {
  try {
    const doc = DriveApp.getFileById(docId);
    const pdfBlob = doc.getBlob().getAs('application/pdf')
      .setName(doc.getName() + '.pdf');
    
    const subject = 'Your Retirement Blueprint Report';
    const body = `Dear ${fullName.split(' ')[0]},\n\n` +
      `Thank you for completing your Retirement Blueprint assessment. ` +
      `Attached you'll find your personalized retirement savings strategy report.\n\n` +
      `Please review the report carefully and don't hesitate to reach out if you have any questions.\n\n` +
      `Best regards,\nThe Retirement Blueprint Team`;
    
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body,
      attachments: [pdfBlob]
    });
    
    Logger.log(`Email sent to ${email}`);
  } catch (error) {
    Logger.log(`Error sending email: ${error}`);
  }
}

/**
 * Helper function to prevent excessive narrative length
 */
function truncateNarrative(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Prepare all replacements including calculated fields
 */
function prepareReplacements(headers, rowData, hdr) {
  const replacements = {};
  
  // Add all raw data fields
  headers.forEach((header, idx) => {
    if (header) {
      const value = rowData[idx];
      replacements[header] = formatValue(header, value);
    }
  });
  
  // Add calculated fields
  const firstName = (rowData[hdr['Full_Name']] || '').split(' ')[0];
  replacements['FirstName'] = firstName;
  replacements['report_date'] = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'MMMM d, yyyy');
  
  // Calculate total actual vs ideal monthly contributions
  const actualTotal = calculateTotalMonthly(rowData, hdr, 'actual');
  const idealTotal = calculateTotalMonthly(rowData, hdr, 'ideal');
  replacements['total_actual_monthly'] = formatCurrency(actualTotal);
  replacements['total_ideal_monthly'] = formatCurrency(idealTotal);
  replacements['monthly_difference'] = formatCurrency(idealTotal - actualTotal);
  
  // Format percentages
  if (replacements['personalized_annual_rate']) {
    replacements['personalized_annual_rate'] = formatPercentage(replacements['personalized_annual_rate']);
  }
  
  // Calculate future value gains
  const retirementFvActual = parseFloat(rowData[hdr['retirement_fv_actual']]) || 0;
  const retirementFvIdeal = parseFloat(rowData[hdr['retirement_fv_ideal']]) || 0;
  replacements['retirement_fv_gain'] = formatCurrency(retirementFvIdeal - retirementFvActual);
  
  // Profile information
  const profileConfig = PROFILE_CONFIG[rowData[hdr['ProfileID']]] || {
    title: 'Retirement Strategist',
    description: ''
  };
  replacements['profile_title'] = profileConfig.title;
  replacements['profile_description'] = profileConfig ? profileConfig.description : '';
  
  return replacements;
}

/**
 * Menu function to run safe generation
 */
function generateDocumentSafe() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const row = sheet.getActiveRange().getRow();
  
  if (row < 3) {
    SpreadsheetApp.getUi().alert('Please select a data row (row 3+)');
    return;
  }
  
  try {
    const url = generateRetirementBlueprintSafe(row);
    SpreadsheetApp.getUi().alert('Document generated safely!\\n\\n' + url);
  } catch (error) {
    SpreadsheetApp.getUi().alert('Error: ' + error.toString());
  }
}