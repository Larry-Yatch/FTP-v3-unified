/**
 * EditModeBanner - Shared utility for rendering edit mode banners
 * Used by Tool1 and Tool2 to show consistent edit mode UI
 */

const EditModeBanner = {
  /**
   * Renders the edit mode banner HTML
   * @param {string} originalDate - The timestamp of the original response being edited
   * @param {string} clientId - The client ID for cancel navigation
   * @param {string} toolId - The tool ID (tool1, tool2, etc.)
   * @returns {string} HTML string for the edit mode banner
   */
  render(originalDate, clientId, toolId) {
    return `
      <div class="edit-mode-banner" style="
        background: rgba(173, 145, 104, 0.1);
        border: 2px solid #ad9168;
        border-radius: 10px;
        padding: 15px 20px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div>
          <strong style="color: #ad9168; font-size: 16px;">✏️ Edit Mode</strong>
          <p style="margin: 5px 0 0 0; color: #fff; font-size: 14px;">
            You're editing your response from ${originalDate}
          </p>
        </div>
        <button
          type="button"
          onclick="cancelEdit()"
          style="
            background: transparent;
            color: #ad9168;
            border: 1px solid #ad9168;
            padding: 8px 16px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            transition: all 0.3s;
          "
          onmouseover="this.style.background='rgba(173, 145, 104, 0.1)'"
          onmouseout="this.style.background='transparent'"
        >
          Cancel Edit
        </button>
      </div>

      <script>
        function cancelEdit() {
          if (confirm('Cancel editing and discard changes?')) {
            showLoading('Canceling edit...');
            google.script.run
              .withSuccessHandler(function(result) {
                // Don't hide loading - navigate directly to dashboard
                if (result && result.success !== false) {
                  // Use navigateToDashboard to avoid iframe issues
                  navigateToDashboard('${clientId}', 'Loading Dashboard');
                } else {
                  hideLoading();
                  alert('Error canceling edit: ' + (result ? result.error : 'Unknown error'));
                }
              })
              .withFailureHandler(function(error) {
                hideLoading();
                console.error('Cancel edit error:', error);
                alert('Error canceling edit: ' + error.message);
              })
              .cancelEditDraft('${clientId}', '${toolId}');
          }
        }
      </script>
    `;
  }
};
