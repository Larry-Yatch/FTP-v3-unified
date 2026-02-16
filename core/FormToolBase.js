/**
 * FormToolBase.js - Shared boilerplate for form-based tools (1, 2, 3, 5, 7)
 *
 * Provides standard render(), getExistingData(), and savePageData() methods.
 * Tools extend via Object.assign({}, FormToolBase, { ...tool-specific }).
 *
 * Config resolution:
 *   - Tools with formConfig (Tool1/2): reads formConfig.toolId, formConfig.toolName, etc.
 *   - Tools with config (Tool3/5/7): falls back to config.id, config.name, this._totalPages
 *
 * Tool-specific methods each tool MUST provide:
 *   - renderPageContent(page, existingData, clientId) — returns HTML string
 *
 * Optional overrides:
 *   - getCustomValidation(page) — return validation function name or null
 *   - onPageSaved(clientId, page, formData, draftData) — post-save hook (e.g. GPT trigger)
 *   - getExistingData(clientId) — override if merge logic differs (Tool2)
 *   - savePageData(clientId, page, formData) — override if save logic differs (Tool2)
 */
const FormToolBase = {

  /**
   * Standard render pipeline for all form-based tools.
   * Parses params, handles edit/clear, builds page, returns HtmlOutput.
   */
  render(params) {
    const clientId = params.clientId;
    const page = parseInt(params.page) || 1;
    const baseUrl = ScriptApp.getService().getUrl();

    // Resolve tool config from formConfig (Tool1/2) or config (Tool3/5/7)
    const toolId = this.formConfig ? this.formConfig.toolId : this.config.id;
    const toolName = this.formConfig ? this.formConfig.toolName : this.config.name;
    const totalPages = this.formConfig ? this.formConfig.totalPages : this._totalPages;
    const pageTitle = this.formConfig ? this.formConfig.pageTitle : this.config.name;

    // Handle URL parameters for immediate navigation (preserves user gesture)
    const editMode = params.editMode === 'true' || params.editMode === true;
    const clearDraft = params.clearDraft === 'true' || params.clearDraft === true;

    // Page validation
    if (page < 1 || page > totalPages) {
      throw new Error('Invalid page number: ' + page + '. Must be 1-' + totalPages);
    }

    // Execute actions on page 1 (after navigation completes with user gesture)
    if (editMode && page === 1) {
      LogUtils.debug('[' + toolId + '] Edit mode detected for ' + clientId + ' - creating EDIT_DRAFT');
      DataService.loadResponseForEditing(clientId, toolId);
    }

    if (clearDraft && page === 1) {
      LogUtils.debug('[' + toolId + '] Clear draft triggered for ' + clientId);
      DataService.startFreshAttempt(clientId, toolId);
    }

    try {
      // Get existing data if resuming
      var existingData = this.getExistingData(clientId);

      // Get page-specific content (tool must implement this)
      var pageContent = this.renderPageContent(page, existingData, clientId);

      // Add edit mode banner if editing previous response
      if (existingData && existingData._editMode) {
        var originalDate = existingData._originalTimestamp ?
          new Date(existingData._originalTimestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'previous submission';

        pageContent = EditModeBanner.render(originalDate, clientId, toolId) + pageContent;
      }

      // Custom validation (only Tool1 uses this)
      var customValidation = typeof this.getCustomValidation === 'function'
        ? this.getCustomValidation(page) : null;

      // Build standard page with FormUtils
      var template = HtmlService.createTemplate(
        FormUtils.buildStandardPage({
          toolName: toolName,
          toolId: toolId,
          page: page,
          totalPages: totalPages,
          clientId: clientId,
          baseUrl: baseUrl,
          pageContent: pageContent,
          isFinalPage: (page === totalPages),
          customValidation: customValidation
        })
      );

      return template.evaluate()
        .setTitle('TruPath - ' + pageTitle)
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);

    } catch (error) {
      LogUtils.error('[' + toolId + '] Error rendering page ' + page + ': ' + error.message);
      throw error;
    }
  },

  /**
   * Standard getExistingData — used by Tools 1, 3, 5, 7.
   * Tool2 overrides this (different merge order).
   *
   * Priority: EDIT_DRAFT/DRAFT from RESPONSES sheet, merged with PropertiesService.
   * PropertiesService takes precedence (has latest page data).
   */
  getExistingData(clientId) {
    var toolId = this.formConfig ? this.formConfig.toolId : this.config.id;

    try {
      var data = null;

      // Check for active draft in RESPONSES sheet
      if (typeof DataService !== 'undefined') {
        var activeDraft = DataService.getActiveDraft(clientId, toolId);

        if (activeDraft && (activeDraft.status === 'EDIT_DRAFT' || activeDraft.status === 'DRAFT')) {
          LogUtils.debug('[' + toolId + '] Found active draft with status: ' + activeDraft.status);
          data = activeDraft.data;
        }
      }

      // Merge with PropertiesService (has latest page data, takes precedence)
      var propData = DraftService.getDraft(toolId, clientId);

      if (propData) {
        if (data) {
          data = Object.assign({}, data, propData);
        } else {
          data = propData;
        }
      }

      return data || null;

    } catch (error) {
      LogUtils.error('[' + toolId + '] Error getting existing data: ' + error);
      return null;
    }
  },

  /**
   * Standard savePageData — used by Tools 1, 3, 5, 7.
   * Tool2 overrides this (different DraftService args, GPT trigger).
   *
   * Saves to PropertiesService, syncs to RESPONSES sheet, calls onPageSaved hook.
   */
  savePageData(clientId, page, formData) {
    var toolId = this.formConfig ? this.formConfig.toolId : this.config.id;

    // Save to PropertiesService for fast page-to-page navigation
    DraftService.saveDraft(toolId, clientId, page, formData);

    // Get the complete merged data (includes all pages)
    var draftData = DraftService.getDraft(toolId, clientId);

    // Sync to RESPONSES sheet for dashboard detection
    // Skip if in edit mode (EDIT_DRAFT already exists)
    var activeDraft = DataService.getActiveDraft(clientId, toolId);
    var isEditMode = activeDraft && activeDraft.status === 'EDIT_DRAFT';

    if (!isEditMode) {
      if (page === 1) {
        // Page 1: Create new DRAFT row
        DataService.saveDraft(clientId, toolId, draftData);
      } else {
        // Later pages: Update existing DRAFT row with complete merged data
        DataService.updateDraft(clientId, toolId, draftData);
      }
    } else {
      // Edit mode: Update EDIT_DRAFT to keep RESPONSES sheet in sync
      LogUtils.debug('[' + toolId + '] Updating EDIT_DRAFT with current data');
      DataService.updateDraft(clientId, toolId, draftData);
    }

    // Call tool-specific post-save hook if defined
    if (typeof this.onPageSaved === 'function') {
      this.onPageSaved(clientId, page, formData, draftData);
    }

    return { success: true };
  }
};
