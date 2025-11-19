/**
 * Authentication Module for Financial TruPath v3
 * Client ID validation with name/email backup lookup
 * Adapted from v2 pattern, simplified for v3 structure
 */

/**
 * Normalize IDs for flexible matching
 * Strips spaces, hyphens, underscores, dots, slashes, zero-width chars
 */
function normalizeId(id) {
  return String(id || '')
    .toUpperCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // zero-width characters
    .replace(/[\s\-_./\\]/g, '')           // spaces, special chars
    .trim();
}

/**
 * Lookup student by Client ID
 * @param {string} clientId - The client ID to lookup
 * @returns {Object} Result with student info or error
 */
function lookupClientById(clientId) {
  try {
    // Input validation
    const input = (clientId || '').toString().trim();
    if (!input) {
      return { success: false, error: 'Please enter your Student ID' };
    }

    const idNorm = normalizeId(input);

    // Load Students sheet
    const studentsSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      return {
        success: false,
        error: 'Unable to access student roster. Please contact support.'
      };
    }

    const data = studentsSheet.getDataRange().getValues();

    if (data.length < 2) {
      return { success: false, error: 'Student roster is empty' };
    }

    // Headers: Client_ID, Name, Email, Status, ...
    const headers = data[0];
    const clientIdCol = 0;
    const nameCol = 1;
    const emailCol = 2;
    const statusCol = 3;

    // Search for matching client
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const candidate = normalizeId(row[clientIdCol] || '');

      if (candidate && candidate === idNorm) {
        // Check if account is active
        const status = String(row[statusCol] || '').trim().toLowerCase();
        if (status === 'inactive') {
          return {
            success: false,
            error: 'Your account is inactive. Please contact support.'
          };
        }

        // Return student info
        return {
          success: true,
          clientId: row[clientIdCol],
          name: String(row[nameCol] || '').trim(),
          email: String(row[emailCol] || '').trim(),
          status: status || 'active'
        };
      }
    }

    return {
      success: false,
      error: 'Student ID not found. Please check your ID and try again.'
    };

  } catch (error) {
    console.error('lookupClientById error:', error);
    return {
      success: false,
      error: 'System error during lookup. Please try again.'
    };
  }
}

/**
 * Lookup student by first name, last name, and/or email
 * @param {Object} params - Object with firstName, lastName, and/or email
 * @returns {Object} Result with student info or error
 */
function lookupClientByDetails(params) {
  try {
    // Validate parameters
    const firstName = (params.firstName || '').toString().trim().toLowerCase();
    const lastName = (params.lastName || '').toString().trim().toLowerCase();
    const email = (params.email || '').toString().trim().toLowerCase();

    // Count provided fields
    let providedCount = 0;
    if (firstName) providedCount++;
    if (lastName) providedCount++;
    if (email) providedCount++;

    if (providedCount < 2) {
      return {
        success: false,
        error: 'Please provide at least 2 fields (first name, last name, and/or email)'
      };
    }

    // Load Students sheet
    const studentsSheet = SpreadsheetCache.getSheet(CONFIG.SHEETS.STUDENTS);

    if (!studentsSheet) {
      return {
        success: false,
        error: 'Unable to access student roster. Please contact support.'
      };
    }

    const data = studentsSheet.getDataRange().getValues();

    if (data.length < 2) {
      return { success: false, error: 'Student roster is empty' };
    }

    // Headers: Client_ID, Name, Email, Status, ...
    const clientIdCol = 0;
    const nameCol = 1;
    const emailCol = 2;
    const statusCol = 3;

    const matches = [];

    // Search for matches
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      // Skip inactive accounts
      const status = String(row[statusCol] || '').trim().toLowerCase();
      if (status === 'inactive') continue;

      const rowFullName = String(row[nameCol] || '').trim().toLowerCase();
      const rowEmail = String(row[emailCol] || '').trim().toLowerCase();
      const rowClientId = String(row[clientIdCol] || '').trim();

      // Split the stored full name into parts for matching
      const nameParts = rowFullName.split(/\s+/);
      const rowFirstName = nameParts[0] || '';
      const rowLastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : '';

      let matchScore = 0;
      let matchTypes = [];

      // First name matching (exact match on first word)
      if (firstName && rowFirstName === firstName) {
        matchScore += 1;
        matchTypes.push('First Name');
      }

      // Last name matching (exact match on last word)
      if (lastName && rowLastName === lastName) {
        matchScore += 1;
        matchTypes.push('Last Name');
      }

      // Email matching (exact)
      if (email && rowEmail === email) {
        matchScore += 2; // Email match is strongest
        matchTypes.push('Email');
      }

      // Require at least 2 matches (matching the "at least 2 fields" requirement)
      if (matchScore >= 2 && rowClientId) {
        matches.push({
          clientId: rowClientId,
          name: String(row[nameCol] || '').trim(),
          email: String(row[emailCol] || '').trim(),
          status: status || 'active',
          matchedOn: matchTypes.join(' & '),
          matchScore: matchScore
        });
      }
    }

    // Sort by match score (best matches first)
    matches.sort((a, b) => b.matchScore - a.matchScore);

    if (matches.length === 0) {
      return {
        success: false,
        error: 'No matching student found. Please check your information or use your Student ID.'
      };
    }

    if (matches.length === 1) {
      return {
        success: true,
        clientId: matches[0].clientId,
        name: matches[0].name,
        email: matches[0].email,
        status: matches[0].status,
        matchedOn: matches[0].matchedOn
      };
    }

    // Multiple matches - return the best one if it's significantly better
    if (matches[0].matchScore > matches[1].matchScore) {
      return {
        success: true,
        clientId: matches[0].clientId,
        name: matches[0].name,
        email: matches[0].email,
        status: matches[0].status,
        matchedOn: matches[0].matchedOn
      };
    }

    // Multiple equally good matches
    return {
      success: false,
      error: `Found ${matches.length} possible matches. Please use your Student ID for precise login.`,
      matches: matches.slice(0, 3).map(m => ({
        name: m.name,
        email: m.email
      }))
    };

  } catch (error) {
    console.error('lookupClientByDetails error:', error);
    return {
      success: false,
      error: 'System error during lookup. Please try again.'
    };
  }
}

/**
 * Create or update user session (placeholder for future session management)
 * @param {Object} clientInfo - Validated client information
 * @returns {Object} Session data
 */
function createUserSession(clientInfo) {
  const sessionId = Utilities.getUuid();
  const session = {
    sessionId: sessionId,
    clientId: clientInfo.clientId,
    name: clientInfo.name,
    email: clientInfo.email,
    loginTime: new Date(),
    lastActivity: new Date()
  };

  // In the future, store this in SESSIONS sheet or Properties Service
  // For now, just return it for client-side storage
  return session;
}

/**
 * Verify existing session (placeholder for future session management)
 * @param {string} sessionId - Session ID to verify
 * @param {string} clientId - Client ID to verify
 * @returns {boolean} Whether session is valid
 */
function verifySession(sessionId, clientId) {
  // Simple verification for now
  // In production, check against stored sessions
  return sessionId && clientId && normalizeId(clientId).length > 0;
}
