/**
 * FeedbackWidget - Reusable feedback/support system
 *
 * Provides a floating "Get Help" button with modal form that:
 * - Captures user feedback/bug reports
 * - Automatically includes context (client, tool, page, URL, browser)
 * - Sends email to support@trupathmastery.com
 * - Logs to FEEDBACK sheet for tracking
 *
 * Usage: Call FeedbackWidget.render(clientId, toolId, page) in your page template
 */

const FeedbackWidget = {

  /**
   * Render the feedback widget HTML (button + modal)
   * @param {string} clientId - Client ID
   * @param {string} toolId - Tool identifier (e.g., 'tool1', 'dashboard')
   * @param {number|string} page - Page number or identifier
   * @returns {string} HTML for feedback widget
   */
  render(clientId, toolId = 'unknown', page = 'unknown') {
    return `
      <!-- Feedback Widget -->
      <button class="feedback-button" onclick="openFeedbackModal()" title="Get Help or Report an Issue">
        💬 Get Help
      </button>

      <!-- Feedback Modal -->
      <div id="feedbackModal" class="feedback-modal">
        <div class="feedback-modal-content">
          <span class="feedback-close" onclick="closeFeedbackModal()">&times;</span>

          <h2 style="margin-top: 0; color: ${CONFIG.UI.PRIMARY_COLOR};">Get Help</h2>
          <p class="muted" style="margin-bottom: 20px;">
            Report a bug, ask a question, or request a feature. We'll respond within 24 hours.
          </p>

          <form id="feedbackForm" onsubmit="return submitFeedback()">
            <div class="form-group">
              <label class="form-label">What can we help with? *</label>
              <select name="type" required style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; background: white;">
                <option value="">Select a type...</option>
                <option value="bug">🐛 Report a Bug</option>
                <option value="question">❓ Ask a Question</option>
                <option value="feature">💡 Suggest a Feature</option>
                <option value="other">💬 Other Feedback</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Tell us more *</label>
              <textarea
                name="message"
                required
                rows="6"
                placeholder="Please describe your issue, question, or feedback in detail..."
                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-family: inherit; resize: vertical;"
              ></textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Your Email (optional)</label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com (for follow-up)"
                style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px;"
              >
              <small class="muted">We'll use your student email on file if you don't provide one.</small>
            </div>

            <input type="hidden" name="clientId" value="${clientId}">
            <input type="hidden" name="toolId" value="${toolId}">
            <input type="hidden" name="page" value="${page}">
            <input type="hidden" name="url" value="">
            <input type="hidden" name="userAgent" value="">

            <div style="display: flex; gap: 10px; margin-top: 20px;">
              <button type="submit" class="btn-primary" style="flex: 1;">
                Send Feedback
              </button>
              <button type="button" class="btn-secondary" onclick="closeFeedbackModal()" style="flex: 1;">
                Cancel
              </button>
            </div>
          </form>

          <div id="feedbackSuccess" style="display: none; text-align: center; padding: 40px 20px;">
            <div style="font-size: 48px; margin-bottom: 10px;">✅</div>
            <h3 style="color: #4CAF50; margin: 0 0 10px 0;">Thank You!</h3>
            <p class="muted">Your feedback has been received. We'll respond within 24 hours.</p>
            <button class="btn-primary" onclick="closeFeedbackModal()" style="margin-top: 20px;">
              Close
            </button>
          </div>
        </div>
      </div>

      <style>
        /* Floating Help Button */
        .feedback-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: ${CONFIG.UI.PRIMARY_COLOR};
          color: white;
          border: none;
          border-radius: 50px;
          padding: 14px 24px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .feedback-button:hover {
          background: #9d8158;
          box-shadow: 0 6px 16px rgba(0,0,0,0.4);
          transform: translateY(-2px);
        }

        /* Modal Styles */
        .feedback-modal {
          display: none;
          position: fixed;
          z-index: 2000;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0,0,0,0.6);
          animation: fadeIn 0.3s ease;
        }

        .feedback-modal-content {
          background-color: white;
          margin: 5% auto;
          padding: 30px;
          border-radius: 8px;
          max-width: 600px;
          width: 90%;
          box-shadow: 0 8px 32px rgba(0,0,0,0.3);
          animation: slideDown 0.3s ease;
          max-height: 85vh;
          overflow-y: auto;
        }

        .feedback-close {
          color: #aaa;
          float: right;
          font-size: 32px;
          font-weight: bold;
          line-height: 20px;
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .feedback-close:hover {
          color: #000;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideDown {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .feedback-button {
            bottom: 15px;
            right: 15px;
            padding: 12px 20px;
            font-size: 14px;
          }

          .feedback-modal-content {
            margin: 10% auto;
            padding: 20px;
            width: 95%;
          }
        }
      </style>

      <script>
        // Capture context on page load
        document.addEventListener('DOMContentLoaded', function() {
          const urlInput = document.querySelector('input[name="url"]');
          const uaInput = document.querySelector('input[name="userAgent"]');
          if (urlInput) urlInput.value = window.location.href;
          if (uaInput) uaInput.value = navigator.userAgent;
        });

        function openFeedbackModal() {
          document.getElementById('feedbackModal').style.display = 'block';
          document.body.style.overflow = 'hidden'; // Prevent background scroll
        }

        function closeFeedbackModal() {
          document.getElementById('feedbackModal').style.display = 'none';
          document.body.style.overflow = 'auto';

          // Reset form
          document.getElementById('feedbackForm').reset();
          document.getElementById('feedbackForm').style.display = 'block';
          document.getElementById('feedbackSuccess').style.display = 'none';
        }

        function submitFeedback() {
          const form = document.getElementById('feedbackForm');
          const formData = new FormData(form);
          const data = Object.fromEntries(formData.entries());

          // Add timestamp
          data.timestamp = new Date().toISOString();

          // Show loading
          const submitBtn = form.querySelector('button[type="submit"]');
          const originalText = submitBtn.textContent;
          submitBtn.textContent = 'Sending...';
          submitBtn.disabled = true;

          // Submit via google.script.run
          google.script.run
            .withSuccessHandler(function(result) {
              if (result.success) {
                // Show success message
                form.style.display = 'none';
                document.getElementById('feedbackSuccess').style.display = 'block';
              } else {
                alert('Error sending feedback: ' + (result.error || 'Unknown error'));
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
              }
            })
            .withFailureHandler(function(error) {
              alert('Error sending feedback: ' + error.message);
              submitBtn.textContent = originalText;
              submitBtn.disabled = false;
            })
            .submitFeedback(data);

          return false; // Prevent form submission
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
          const modal = document.getElementById('feedbackModal');
          if (event.target === modal) {
            closeFeedbackModal();
          }
        }

        // Close modal on ESC key
        document.addEventListener('keydown', function(event) {
          if (event.key === 'Escape') {
            closeFeedbackModal();
          }
        });
      </script>
    `;
  }
};
