<!-- =============================================
     EDIT REQUEST MODAL
     Add this HTML to your foia-dashboard.html before </body>
     ============================================= -->

<!-- Edit Request Modal -->
<div id="editModal" class="modal">
    <div class="modal-overlay" onclick="closeEditModal()"></div>
    <div class="modal-content">
        <div class="modal-header">
            <h2 class="modal-title">Edit Request</h2>
            <button class="modal-close" onclick="closeEditModal()">&times;</button>
        </div>

        <form id="editRequestForm" class="modal-body">
            <!-- Request ID (read-only) -->
            <div class="form-group">
                <label>Request ID</label>
                <input type="text" id="edit_request_id" readonly style="background: #1e2533; cursor: not-allowed;">
            </div>

            <!-- Status & Priority Row -->
            <div class="form-row">
                <div class="form-group">
                    <label for="edit_status">Status *</label>
                    <select id="edit_status" required>
                        <option value="Filed">Filed</option>
                        <option value="Acknowledged">Acknowledged</option>
                        <option value="Processing">Processing</option>
                        <option value="Responsive Records Identified">Responsive Records Identified</option>
                        <option value="Partial Release">Partial Release</option>
                        <option value="Denied">Denied</option>
                        <option value="Appeal Filed">Appeal Filed</option>
                        <option value="Appeal Denied">Appeal Denied</option>
                        <option value="Appeal Granted">Appeal Granted</option>
                        <option value="Closed - Complete">Closed - Complete</option>
                        <option value="Closed - Abandoned">Closed - Abandoned</option>
                        <option value="Past Due">Past Due</option>
                        <option value="Fee Dispute">Fee Dispute</option>
                        <option value="Awaiting Clarification">Awaiting Clarification</option>
                        <option value="Appeal Needed">Appeal Needed</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="edit_priority">Priority</label>
                    <select id="edit_priority">
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>
            </div>

            <!-- Agency & Filed Date -->
            <div class="form-row">
                <div class="form-group">
                    <label>Agency</label>
                    <input type="text" id="edit_agency_name" readonly style="background: #1e2533; cursor: not-allowed;">
                </div>
                <div class="form-group">
                    <label>Filed Date</label>
                    <input type="date" id="edit_filed_date" readonly style="background: #1e2533; cursor: not-allowed;">
                </div>
            </div>

            <!-- Subject -->
            <div class="form-group">
                <label>Subject</label>
                <textarea id="edit_subject" rows="3" readonly style="background: #1e2533; cursor: not-allowed;"></textarea>
            </div>

            <!-- Tracking Number -->
            <div class="form-group">
                <label for="edit_tracking_number">Agency Tracking Number</label>
                <input type="text" id="edit_tracking_number" placeholder="Optional">
            </div>

            <!-- Next Action -->
            <div class="form-row">
                <div class="form-group">
                    <label for="edit_next_action">Next Action</label>
                    <input type="text" id="edit_next_action" placeholder="e.g., Follow up with FOIA officer">
                </div>
                <div class="form-group">
                    <label for="edit_next_action_date">Action Date</label>
                    <input type="date" id="edit_next_action_date">
                </div>
            </div>

            <!-- Denial Reason (shows only if status is Denied) -->
            <div class="form-group" id="denialReasonGroup" style="display: none;">
                <label for="edit_denial_reason">Denial Reason</label>
                <textarea id="edit_denial_reason" rows="2" placeholder="Exemptions cited or reason for denial"></textarea>
            </div>

            <!-- Appeal Status (shows only if status involves appeal) -->
            <div class="form-group" id="appealStatusGroup" style="display: none;">
                <label for="edit_appeal_status">Appeal Status</label>
                <select id="edit_appeal_status">
                    <option value="N/A">N/A</option>
                    <option value="Needed">Needed</option>
                    <option value="Filed">Filed</option>
                    <option value="Denied">Denied</option>
                    <option value="Granted">Granted</option>
                    <option value="Exhausted">Exhausted</option>
                </select>
            </div>

            <!-- Notes -->
            <div class="form-group">
                <label for="edit_notes">Notes</label>
                <textarea id="edit_notes" rows="4" placeholder="Additional information, follow-up details, etc."></textarea>
            </div>

            <!-- Hidden field for ID -->
            <input type="hidden" id="edit_id">

            <!-- Buttons -->
            <div class="modal-footer">
                <button type="button" class="btn-secondary" onclick="closeEditModal()">Cancel</button>
                <button type="submit" class="btn-primary">Save Changes</button>
            </div>
        </form>
    </div>
</div>

<!-- =============================================
     MODAL CSS
     Add this to your foia-dashboard.css
     ============================================= -->
<style>
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 10000;
    overflow-y: auto;
}

.modal.active {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: -1;
}

.modal-content {
    background: #141922;
    border: 1px solid #2d3748;
    border-radius: 12px;
    width: 100%;
    max-width: 800px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #2d3748;
}

.modal-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #00e5cc;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 2rem;
    color: #9ca3af;
    cursor: pointer;
    padding: 0;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
}

.modal-close:hover {
    background: #374151;
    color: #e6e8eb;
}

.modal-body {
    padding: 2rem;
}

.modal-footer {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    padding: 1.5rem 2rem;
    border-top: 1px solid #2d3748;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    font-size: 0.875rem;
    font-weight: 600;
    color: #9ca3af;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #1e2533;
    border: 1px solid #374151;
    border-radius: 8px;
    color: #e6e8eb;
    font-size: 1rem;
    transition: all 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #00e5cc;
}

.form-group textarea {
    resize: vertical;
    font-family: inherit;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}

.btn-primary,
.btn-secondary {
    padding: 0.875rem 2rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary {
    background: #00e5cc;
    color: #0a0e14;
}

.btn-primary:hover {
    background: #00cdb8;
    transform: translateY(-2px);
}

.btn-secondary {
    background: #374151;
    color: #e6e8eb;
}

.btn-secondary:hover {
    background: #4b5563;
}

@media (max-width: 640px) {
    .modal-content {
        margin: 0;
        max-height: 100vh;
        border-radius: 0;
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>

<!-- =============================================
     MODAL JAVASCRIPT
     Add this to dashboard-supabase.js
     ============================================= -->
<script>
// Store current request being edited
let currentEditRequest = null;

// Open edit modal with request data
function openEditModal(request) {
    currentEditRequest = request;
    
    // Populate form fields
    document.getElementById('edit_id').value = request.id;
    document.getElementById('edit_request_id').value = request.request_id;
    document.getElementById('edit_status').value = request.status;
    document.getElementById('edit_priority').value = request.priority;
    document.getElementById('edit_agency_name').value = request.agency_name;
    document.getElementById('edit_filed_date').value = request.filed_date;
    document.getElementById('edit_subject').value = request.subject;
    document.getElementById('edit_tracking_number').value = request.tracking_number || '';
    document.getElementById('edit_next_action').value = request.next_action || '';
    document.getElementById('edit_next_action_date').value = request.next_action_date || '';
    document.getElementById('edit_denial_reason').value = request.denial_reason || '';
    document.getElementById('edit_appeal_status').value = request.appeal_status || 'N/A';
    document.getElementById('edit_notes').value = request.notes || '';
    
    // Show/hide conditional fields
    toggleConditionalFields(request.status);
    
    // Show modal
    document.getElementById('editModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close edit modal
function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.body.style.overflow = '';
    currentEditRequest = null;
}

// Toggle conditional fields based on status
document.getElementById('edit_status').addEventListener('change', function() {
    toggleConditionalFields(this.value);
});

function toggleConditionalFields(status) {
    const denialGroup = document.getElementById('denialReasonGroup');
    const appealGroup = document.getElementById('appealStatusGroup');
    
    // Show denial reason if status is Denied
    if (status === 'Denied') {
        denialGroup.style.display = 'block';
    } else {
        denialGroup.style.display = 'none';
    }
    
    // Show appeal status if status involves appeals
    if (['Denied', 'Appeal Needed', 'Appeal Filed', 'Appeal Denied', 'Appeal Granted'].includes(status)) {
        appealGroup.style.display = 'block';
    } else {
        appealGroup.style.display = 'none';
    }
}

// Handle form submission
document.getElementById('editRequestForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const id = document.getElementById('edit_id').value;
    const updatedData = {
        status: document.getElementById('edit_status').value,
        priority: document.getElementById('edit_priority').value,
        tracking_number: document.getElementById('edit_tracking_number').value || null,
        next_action: document.getElementById('edit_next_action').value || null,
        next_action_date: document.getElementById('edit_next_action_date').value || null,
        denial_reason: document.getElementById('edit_denial_reason').value || null,
        appeal_status: document.getElementById('edit_appeal_status').value || null,
        notes: document.getElementById('edit_notes').value || null,
        updated_at: new Date().toISOString()
    };
    
    try {
        const { error } = await supabaseClient
            .from('requests')
            .update(updatedData)
            .eq('id', id);
        
        if (error) throw error;
        
        console.log('✅ Request updated successfully');
        
        // Close modal
        closeEditModal();
        
        // Reload dashboard data
        await loadDashboardData();
        
        // Show success message
        showNotification('Request updated successfully!', 'success');
        
    } catch (error) {
        console.error('❌ Error updating request:', error);
        showNotification('Failed to update request. Check console.', 'error');
    }
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#00e5cc' : '#ef476f'};
        color: ${type === 'success' ? '#0a0e14' : '#fff'};
        border-radius: 8px;
        font-weight: 600;
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Close modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('editModal').classList.contains('active')) {
        closeEditModal();
    }
});
</script>