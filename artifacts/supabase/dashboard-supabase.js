// =============================================
// FOIA Dashboard - Supabase Integration
// =============================================

// REPLACE THESE with your Supabase credentials
const SUPABASE_URL = 'https://raqonwahukpejuftbqav.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcW9ud2FodWtwZWp1ZnRicWF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MDM1MjcsImV4cCI6MjA4NjE3OTUyN30.p7ZEoIXrR6H95H6phQBp3XU-pzOptDSVZe6ZSv7lelM'

// Initialize Supabase
const { createClient } = supabase
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// =============================================
// LOAD AND UPDATE DASHBOARD
// =============================================

async function loadDashboardData() {
    console.log('🚀 FOIA Dashboard initializing...')
    
    try {
        const { data: requests, error } = await supabaseClient
            .from('requests')
            .select('*')
            .order('filed_date', { ascending: false })
        
        if (error) throw error
        
        console.log('✅ Dashboard loaded with', requests.length, 'requests')
        
        updateDashboardMetrics(requests)
        updateStatusBreakdown(requests)
        renderRequestCards(requests)
        
    } catch (error) {
        console.error('❌ Error loading dashboard:', error)
        alert('Error connecting to Supabase. Check console for details.')
    }
}

// =============================================
// UPDATE DASHBOARD METRICS
// =============================================

function updateDashboardMetrics(requests) {
    const totalRequests = requests.length
    
    const today = new Date()
    const overdue = requests.filter(r => {
        if (!r.response_deadline) return false
        const deadline = new Date(r.response_deadline)
        return deadline < today && !['Closed - Complete', 'Closed - Abandoned'].includes(r.status)
    }).length
    
    const critical = requests.filter(r => r.priority === 'Critical').length
    
    const appealsNeeded = requests.filter(r => 
        r.appeal_status === 'Needed' || r.status === 'Denied'
    ).length
    
    const activeRequests = requests.filter(r => 
        !['Closed - Complete', 'Closed - Abandoned'].includes(r.status)
    )
    const avgDays = activeRequests.length > 0
        ? Math.round(activeRequests.reduce((sum, r) => {
            const days = r.days_pending || calculateDaysPending(r.filed_date)
            return sum + days
        }, 0) / activeRequests.length)
        : 0
    
    const longestPending = activeRequests.length > 0
        ? Math.max(...activeRequests.map(r => r.days_pending || calculateDaysPending(r.filed_date)))
        : 0
    
    const avgStatus = activeRequests.length > 0
        ? Math.round(activeRequests.reduce((sum, r) => {
            return sum + (r.days_in_status || 0)
        }, 0) / activeRequests.length)
        : 0
    
    updateElement('[data-metric="total"]', totalRequests)
    updateElement('[data-metric="total-text"]', totalRequests)
    updateElement('[data-metric="overdue"]', overdue)
    updateElement('[data-metric="critical"]', critical)
    updateElement('[data-metric="appeals"]', appealsNeeded)
    updateElement('[data-metric="avg-days"]', avgDays)
    updateElement('[data-metric="longest"]', longestPending)
    updateElement('[data-metric="avg-status"]', avgStatus)
}

// =============================================
// UPDATE STATUS BREAKDOWN
// =============================================

function updateStatusBreakdown(requests) {
    const totalRequests = requests.length
    
    const statusCounts = {}
    requests.forEach(r => {
        const status = r.status || 'Filed'
        statusCounts[status] = (statusCounts[status] || 0) + 1
    })
    
    const statuses = ['Filed', 'Acknowledged', 'Processing', 'Denied', 'Appeal Filed']
    statuses.forEach(status => {
        const count = statusCounts[status] || 0
        const percentage = totalRequests > 0 ? Math.round((count / totalRequests) * 100) : 0
        
        updateElement(`[data-status="${status}"]`, count)
        updateElement(`[data-status-pct="${status}"]`, percentage)
    })
}

// =============================================
// RENDER REQUEST CARDS
// =============================================

let allRequests = [] // Store all requests for filtering

function renderRequestCards(requests) {
    allRequests = requests // Save for filtering
    
    const container = document.getElementById('requestCardsContainer')
    if (!container) return
    
    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No requests found</div>
                <div class="empty-state-subtext">Click "New Request" to create your first FOIA request</div>
            </div>
        `
        return
    }
    
    container.innerHTML = requests.map(request => {
        const daysPending = request.days_pending || calculateDaysPending(request.filed_date)
        const isOverdue = request.response_deadline && new Date(request.response_deadline) < new Date()
        const statusClass = getStatusBadgeClass(request.status)
        const priorityClass = `priority-${(request.priority || 'medium').toLowerCase()}`
        
        return `
            <div class="request-card" data-request-id="${request.request_id}">
                <div class="request-card-header">
                    <div class="request-card-title">
                        <div class="request-id">${request.request_id}</div>
                        <div class="request-agency">${request.agency_name}</div>
                    </div>
                    <div class="request-card-badges">
                        <span class="priority-badge ${priorityClass}">${request.priority || 'Medium'}</span>
                    </div>
                </div>
                
                <div class="request-card-body">
                    <div class="request-subject">${request.subject}</div>
                    
                    <div class="request-meta">
                        <div class="meta-item">
                            <span class="meta-label">Filed</span>
                            <span class="meta-value">${formatDate(request.filed_date)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Days Pending</span>
                            <span class="meta-value ${isOverdue ? 'overdue' : ''}">${daysPending} days</span>
                        </div>
                        ${request.tracking_number ? `
                        <div class="meta-item">
                            <span class="meta-label">Tracking #</span>
                            <span class="meta-value">${request.tracking_number}</span>
                        </div>
                        ` : ''}
                        ${request.next_action_date ? `
                        <div class="meta-item">
                            <span class="meta-label">Next Action</span>
                            <span class="meta-value">${formatDate(request.next_action_date)}</span>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="request-card-footer">
                    <span class="badge ${statusClass}">${request.status}</span>
                    <button class="edit-btn" onclick="editRequestFromCard(this)">Update Request</button>
                </div>
            </div>
        `
    }).join('')
}

// =============================================
// FILTER AND SEARCH FUNCTIONS
// =============================================

function filterAndSearchRequests() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || ''
    const statusFilter = document.getElementById('filterStatus')?.value || 'all'
    const priorityFilter = document.getElementById('filterPriority')?.value || 'all'
    
    let filtered = allRequests.filter(request => {
        // Search filter
        const matchesSearch = !searchTerm || 
            request.request_id.toLowerCase().includes(searchTerm) ||
            request.agency_name.toLowerCase().includes(searchTerm) ||
            request.subject.toLowerCase().includes(searchTerm) ||
            (request.tracking_number && request.tracking_number.toLowerCase().includes(searchTerm))
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || request.status === statusFilter
        
        // Priority filter
        const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter
        
        return matchesSearch && matchesStatus && matchesPriority
    })
    
    renderRequestCards(filtered)
}

function getStatusBadgeClass(status) {
    const statusMap = {
        'Filed': 'status-filed',
        'Acknowledged': 'status-acknowledged',
        'Processing': 'status-processing',
        'Responsive Records Identified': 'status-processing',
        'Partial Release': 'status-processing',
        'Denied': 'status-denied',
        'Appeal Filed': 'status-appeal',
        'Appeal Denied': 'status-denied',
        'Appeal Granted': 'status-appeal',
        'Closed - Complete': 'status-complete',
        'Closed - Abandoned': 'status-abandoned',
        'Past Due': 'status-overdue',
        'Fee Dispute': 'status-warning',
        'Awaiting Clarification': 'status-warning',
        'Appeal Needed': 'status-appeal'
    }
    return statusMap[status] || 'status-filed'
}

function formatDate(dateString) {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// =============================================
// UTILITY FUNCTIONS
// =============================================

function updateElement(selector, value) {
    const element = document.querySelector(selector)
    if (element) {
        element.textContent = value
    }
}

function calculateDaysPending(filedDate) {
    if (!filedDate) return 0
    const filed = new Date(filedDate)
    const today = new Date()
    return Math.floor((today - filed) / (1000 * 60 * 60 * 24))
}

// =============================================
// INITIALIZE ON PAGE LOAD
// =============================================

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData()
    
    setInterval(loadDashboardData, 5 * 60 * 1000)
    
    // Search and filter event listeners
    const searchInput = document.getElementById('searchInput')
    if (searchInput) {
        searchInput.addEventListener('input', filterAndSearchRequests)
    }
    
    const filterStatus = document.getElementById('filterStatus')
    if (filterStatus) {
        filterStatus.addEventListener('change', filterAndSearchRequests)
    }
    
    const filterPriority = document.getElementById('filterPriority')
    if (filterPriority) {
        filterPriority.addEventListener('change', filterAndSearchRequests)
    }
    
    const statusSelect = document.getElementById('edit_status')
    if (statusSelect) {
        statusSelect.addEventListener('change', function() {
            toggleConditionalFields(this.value)
        })
    }
    
    const editForm = document.getElementById('editRequestForm')
    if (editForm) {
        editForm.addEventListener('submit', async function(e) {
            e.preventDefault()
            
            const id = document.getElementById('edit_id').value
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
            }
            
            try {
                const { error } = await supabaseClient
                    .from('requests')
                    .update(updatedData)
                    .eq('id', id)
                
                if (error) throw error
                
                console.log('✅ Request updated successfully')
                closeEditModal()
                await loadDashboardData()
                showNotification('Request updated successfully!', 'success')
                
            } catch (error) {
                console.error('❌ Error updating request:', error)
                showNotification('Failed to update request. Check console.', 'error')
            }
        })
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('editModal').classList.contains('active')) {
            closeEditModal()
        }
    })
})

// =============================================
// EDIT REQUEST MODAL FUNCTIONS
// =============================================

let currentEditRequest = null

function openEditModal(request) {
    console.log('🎬 openEditModal called with:', request);

    currentEditRequest = request

    try {
        document.getElementById('edit_id').value = request.id
        document.getElementById('edit_request_id').value = request.request_id
        document.getElementById('edit_status').value = request.status
        document.getElementById('edit_priority').value = request.priority || 'Medium'
        document.getElementById('edit_agency_name').value = request.agency_name
        document.getElementById('edit_filed_date').value = request.filed_date
        document.getElementById('edit_subject').value = request.subject
        document.getElementById('edit_tracking_number').value = request.tracking_number || ''
        document.getElementById('edit_next_action').value = request.next_action || ''
        document.getElementById('edit_next_action_date').value = request.next_action_date || ''
        document.getElementById('edit_denial_reason').value = request.denial_reason || ''
        document.getElementById('edit_appeal_status').value = request.appeal_status || 'N/A'
        document.getElementById('edit_notes').value = request.notes || ''

        console.log('✅ Form fields populated successfully');

        toggleConditionalFields(request.status)

        const modal = document.getElementById('editModal');
        console.log('🔍 Modal element:', modal);

        if (modal) {
            modal.classList.add('active')
            console.log('✅ Modal should now be visible');
        } else {
            console.error('❌ Modal element not found!');
        }

        document.body.style.overflow = 'hidden'
    } catch (error) {
        console.error('❌ Error in openEditModal:', error);
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active')
    document.body.style.overflow = ''
    currentEditRequest = null
}

function toggleConditionalFields(status) {
    const denialGroup = document.getElementById('denialReasonGroup')
    const appealGroup = document.getElementById('appealStatusGroup')
    
    denialGroup.style.display = status === 'Denied' ? 'block' : 'none'
    
    appealGroup.style.display = [
        'Denied',
        'Needed',
        'Filed',
        'Appeal Filed',
        'Appeal Denied',
        'Appeal Granted',
        'Exhausted'
    ].includes(status)
        ? 'block'
        : 'none'
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div')
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
    `
    notification.textContent = message
    document.body.appendChild(notification)
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease'
        setTimeout(() => notification.remove(), 300)
    }, 3000)
}

async function editRequestFromCard(btn) {
    console.log("editRequestFromCard fired", btn);

    const card = btn.closest('.request-card');
    const requestId = card.querySelector('.request-id').textContent.trim();

    console.log('🔍 Looking for request_id:', requestId);

    const { data, error } = await supabaseClient
        .from('requests')
        .select('*')
        .eq('request_id', requestId)
        .single();

    console.log('📊 Query result:', { data, error });

    if (error || !data) {
        console.error('❌ Could not load request for editing:', error);
        console.error('❌ Request ID searched:', requestId);
        console.error('❌ This usually means the request_id does not exist in the database');
        showNotification(`Unable to load request "${requestId}". Check if it exists in database.`, 'error');
        return;
    }

    console.log('✅ Found request data:', data);
    openEditModal(data);
}

// =============================================
// DELETE REQUEST FUNCTION
// =============================================

async function deleteRequest() {
    if (!currentEditRequest) {
        console.error('❌ No request currently being edited');
        return;
    }

    const requestId = currentEditRequest.request_id;
    const requestSubject = currentEditRequest.subject;

    // Confirmation dialog
    const confirmed = confirm(
        `Are you sure you want to delete this request?\n\n` +
        `Request ID: ${requestId}\n` +
        `Subject: ${requestSubject}\n\n` +
        `This action CANNOT be undone.`
    );

    if (!confirmed) {
        console.log('🚫 Delete cancelled by user');
        return;
    }

    try {
        console.log('🗑️ Deleting request:', requestId);

        const { error } = await supabaseClient
            .from('requests')
            .delete()
            .eq('id', currentEditRequest.id);

        if (error) throw error;

        console.log('✅ Request deleted successfully');
        showNotification('Request deleted successfully', 'success');
        closeEditModal();
        await loadDashboardData();

    } catch (error) {
        console.error('❌ Error deleting request:', error);
        showNotification('Failed to delete request: ' + error.message, 'error');
    }
}

// =============================================
// NEW REQUEST MODAL
// =============================================

function openNewRequestModal() {
    console.log('📝 Opening new request modal')

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0]
    document.getElementById('add_filed_date').value = today

    // Reset form
    document.getElementById('addRequestForm').reset()
    document.getElementById('add_filed_date').value = today
    document.getElementById('addStateGroup').style.display = 'none'

    // Show modal
    const modal = document.getElementById('addRequestModal')
    if (modal) {
        modal.classList.add('active')
        document.body.style.overflow = 'hidden'
    }
}

function closeAddRequestModal() {
    const modal = document.getElementById('addRequestModal')
    if (modal) {
        modal.classList.remove('active')
        document.body.style.overflow = ''
    }
}

// Handle agency type change to show/hide state field
document.addEventListener('DOMContentLoaded', function() {
    const agencyTypeSelect = document.getElementById('add_agency_type')
    if (agencyTypeSelect) {
        agencyTypeSelect.addEventListener('change', function() {
            const stateGroup = document.getElementById('addStateGroup')
            const stateSelect = document.getElementById('add_state_code')

            if (this.value === 'State' || this.value === 'Local') {
                stateGroup.style.display = 'block'
                stateSelect.required = true
            } else {
                stateGroup.style.display = 'none'
                stateSelect.required = false
                stateSelect.value = ''
            }
        })
    }

    // Handle form submission
    const addForm = document.getElementById('addRequestForm')
    if (addForm) {
        addForm.addEventListener('submit', async function(e) {
            e.preventDefault()
            await handleAddRequest(e)
        })
    }

    // Close modal on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && document.getElementById('addRequestModal')?.classList.contains('active')) {
            closeAddRequestModal()
        }
    })
})

// Calculate response deadline based on agency type and state
function calculateResponseDeadline(filedDate, agencyType, stateCode) {
    const days = agencyType === 'Federal' ? 20 :
                 stateCode === 'MO' ? 3 :
                 stateCode === 'IN' ? 7 :
                 stateCode === 'MN' ? 10 : 20

    return addBusinessDays(new Date(filedDate), days)
}

// Add business days (skip weekends)
function addBusinessDays(date, days) {
    let current = new Date(date)
    let added = 0

    while (added < days) {
        current.setDate(current.getDate() + 1)
        if (current.getDay() !== 0 && current.getDay() !== 6) {
            added++
        }
    }

    return current.toISOString().split('T')[0]
}

async function handleAddRequest(e) {
    const formData = new FormData(e.target)
    const filedDate = document.getElementById('add_filed_date').value
    const agencyType = document.getElementById('add_agency_type').value
    const stateCode = document.getElementById('add_state_code').value

    const requestData = {
        request_id: document.getElementById('add_request_id').value,
        filed_date: filedDate,
        agency_name: document.getElementById('add_agency_name').value,
        agency_type: agencyType,
        state_code: stateCode || null,
        subject: document.getElementById('add_subject').value,
        investigation: document.getElementById('add_investigation').value || null,
        priority: document.getElementById('add_priority').value,
        contact_name: document.getElementById('add_contact_name').value || null,
        contact_email: document.getElementById('add_contact_email').value || null,
        notes: document.getElementById('add_notes').value || null,
        status: 'Filed',
        response_deadline: calculateResponseDeadline(filedDate, agencyType, stateCode)
    }

    try {
        const { data, error } = await supabaseClient
            .from('requests')
            .insert([requestData])

        if (error) throw error

        console.log('✅ Request added successfully')
        showNotification('Request added successfully!', 'success')
        closeAddRequestModal()
        await loadDashboardData()

    } catch (error) {
        console.error('❌ Error adding request:', error)
        showNotification('Failed to add request: ' + error.message, 'error')
    }
}