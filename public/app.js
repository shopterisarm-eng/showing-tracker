// Register service worker for offline support
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(err => {
    console.log('SW registration failed:', err);
  });
}

const STORAGE_KEY = 'showings_tracker';
const API_BASE = '';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognitionAvailable = !!SpeechRecognition;

// Tab switching
function switchTab(tabName) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-tabs button').forEach(b => b.classList.remove('active'));
  
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
}

// Storage functions
function getShowings() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveShowings(showings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(showings));
}

// Add new showing
function addHome() {
  const address = document.getElementById('address').value.trim();
  const client = document.getElementById('client').value.trim();
  const notes = document.getElementById('notes').value.trim();
  
  if (!address) {
    alert('Please enter a property address');
    return;
  }
  
  const showing = {
    id: Date.now(),
    address,
    client,
    notes,
    rating: 0,
    createdAt: new Date().toLocaleString(),
    memos: []
  };
  
  const showings = getShowings();
  showings.unshift(showing);
  saveShowings(showings);
  
  document.getElementById('address').value = '';
  document.getElementById('client').value = '';
  document.getElementById('notes').value = '';
  
  render();
}

// Delete showing
function deleteShowing(id) {
  if (confirm('Delete this showing and all its memos?')) {
    const showings = getShowings().filter(s => s.id !== id);
    saveShowings(showings);
    render();
  }
}

// Set rating
function setRating(showingId, rating) {
  const showings = getShowings();
  const showing = showings.find(s => s.id === showingId);
  if (showing) {
    showing.rating = rating;
    saveShowings(showings);
    render();
  }
}

// Start recording
function startRecording(showingId) {
  if (!recognitionAvailable) {
    alert('Voice recording not supported in this browser. Please use Chrome, Edge, or Safari.');
    return;
  }
  
  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';
  
  const btn = event.target;
  btn.textContent = '⏹ Stop recording';
  btn.classList.add('recording');
  btn.disabled = true;
  
  let transcript = '';
  
  recognition.onresult = (event) => {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcript += event.results[i][0].transcript + ' ';
    }
  };
  
  recognition.onerror = (event) => {
    btn.textContent = '🎙 Record memo';
    btn.classList.remove('recording');
    btn.disabled = false;
    console.error('Recording error:', event.error);
    showStatus(showingId, 'Microphone access denied', 'error');
  };
  
  recognition.onend = () => {
    btn.textContent = '🎙 Record memo';
    btn.classList.remove('recording');
    btn.disabled = false;
    
    if (transcript.trim()) {
      processTranscription(showingId, transcript.trim());
    }
  };
  
  recognition.start();
  
  // Stop after 60 seconds
  setTimeout(() => {
    recognition.stop();
  }, 60000);
}

// Process transcription
async function processTranscription(showingId, transcript) {
  const showings = getShowings();
  const showing = showings.find(s => s.id === showingId);
  if (!showing) return;
  
  showing.memos.push({
    id: Date.now(),
    transcript,
    attributes: null,
    processing: true,
    createdAt: new Date().toLocaleString()
  });
  saveShowings(showings);
  render();
  
  try {
    const response = await fetch(`${API_BASE}/api/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcript })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const showings = getShowings();
    const showing = showings.find(s => s.id === showingId);
    if (showing) {
      const memo = showing.memos[showing.memos.length - 1];
      if (memo) {
        memo.attributes = data.attributes;
        memo.processing = false;
        saveShowings(showings);
        render();
      }
    }
  } catch (error) {
    console.error('Error processing transcription:', error);
    const showings = getShowings();
    const showing = showings.find(s => s.id === showingId);
    if (showing) {
      const memo = showing.memos[showing.memos.length - 1];
      if (memo) {
        memo.processing = false;
        memo.error = true;
        saveShowings(showings);
        render();
      }
    }
  }
}

// Delete memo
function deleteMemo(showingId, memoId) {
  const showings = getShowings();
  const showing = showings.find(s => s.id === showingId);
  if (showing) {
    showing.memos = showing.memos.filter(m => m.id !== memoId);
    saveShowings(showings);
    render();
  }
}

// Show status message
function showStatus(showingId, message, type = 'info') {
  setTimeout(() => {
    const showings = getShowings();
    const showing = showings.find(s => s.id === showingId);
    if (showing) {
      const memo = showing.memos[showing.memos.length - 1];
      if (memo) {
        memo.statusMessage = message;
        memo.statusType = type;
        render();
      }
    }
  }, 1000);
}

// Generate and send summary
async function generateSummary() {
  const email = document.getElementById('summaryEmail').value.trim();
  const clientName = document.getElementById('summaryClientName').value.trim();
  
  if (!email) {
    alert('Please enter a client email');
    return;
  }
  
  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="loading"></span> Generating...';
  
  try {
    const showings = getShowings();
    
    const response = await fetch(`${API_BASE}/api/send-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        showings,
        clientEmail: email,
        clientName
      })
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Show message
    const msgEl = document.getElementById('summaryMessage');
    const msgText = document.getElementById('summaryMessageText');
    msgText.innerHTML = '<strong>✓ Summary generated!</strong> You can download it or copy it to send to your client.';
    msgEl.style.background = '#E8F5E9';
    msgEl.style.color = '#2E7D32';
    msgEl.style.display = 'block';
    
    // Show preview
    document.getElementById('summaryPreview').innerHTML = data.html;
    document.getElementById('summaryPreviewContainer').style.display = 'block';
    
  } catch (error) {
    console.error('Error generating summary:', error);
    const msgEl = document.getElementById('summaryMessage');
    const msgText = document.getElementById('summaryMessageText');
    msgText.innerHTML = '<strong>✗ Error:</strong> ' + error.message;
    msgEl.style.background = '#FCEBEB';
    msgEl.style.color = '#A32D2D';
    msgEl.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Generate summary';
  }
}

// Download summary
function downloadSummary() {
  const email = document.getElementById('summaryEmail').value.trim();
  const html = document.getElementById('summaryPreview').innerHTML;
  
  const doc = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Showing Summary</title>
</head>
<body>
${html}
</body>
</html>`;
  
  const blob = new Blob([doc], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `showing-summary-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Render all showings
function render() {
  const showings = getShowings();
  const list = document.getElementById('homesList');
  
  if (showings.length === 0) {
    list.innerHTML = '<div class="empty-state"><p>No showings yet. Add one above to get started.</p></div>';
    return;
  }
  
  list.innerHTML = showings.map(showing => `
    <div class="home-card">
      <div class="home-header">
        <div class="home-title">
          <h2>${showing.address}</h2>
          <div class="home-meta">${showing.client || 'Client TBD'} • ${showing.createdAt}</div>
        </div>
        <button class="delete-btn" onclick="deleteShowing(${showing.id})">×</button>
      </div>
      
      <div class="rating-picker">
        ${[1, 2, 3, 4, 5].map(i => `
          <span class="star ${i <= showing.rating ? 'filled' : ''}" onclick="setRating(${showing.id}, ${i})">★</span>
        `).join('')}
      </div>
      
      ${showing.notes ? `<div style="font-size: 13px; color: #666; margin-bottom: 12px;">${showing.notes}</div>` : ''}
      
      <div class="record-section">
        <label>Add voice memo</label>
        <button class="record-btn" onclick="startRecording(${showing.id})" ${!recognitionAvailable ? 'disabled' : ''}>🎙 Record memo</button>
      </div>
      
      ${showing.memos.length > 0 ? `
        <div class="memos-section">
          <h3>Memos (${showing.memos.length})</h3>
          ${showing.memos.map(memo => `
            <div class="memo-item">
              <div class="memo-time">${memo.createdAt}</div>
              ${memo.processing ? `
                <div class="status processing"><span class="loading"></span> Transcribing...</div>
              ` : memo.error ? `
                <div class="status error">Error processing memo. Please try again.</div>
              ` : `
                <div class="memo-text">"${memo.transcript}"</div>
                ${memo.attributes ? `
                  <div>
                    ${memo.attributes.positive && memo.attributes.positive.length > 0 ? `
                      <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 4px;">✓ Positive</div>
                        <div class="attributes">
                          ${memo.attributes.positive.map(a => `<span class="attribute-tag tag-positive">${a}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                    ${memo.attributes.concerns && memo.attributes.concerns.length > 0 ? `
                      <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 4px;">⚠ Concerns</div>
                        <div class="attributes">
                          ${memo.attributes.concerns.map(a => `<span class="attribute-tag tag-concerns">${a}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                    ${memo.attributes.size && memo.attributes.size.length > 0 ? `
                      <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 4px;">📐 Size</div>
                        <div class="attributes">
                          ${memo.attributes.size.map(a => `<span class="attribute-tag tag-size">${a}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                    ${memo.attributes.condition && memo.attributes.condition.length > 0 ? `
                      <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 4px;">🔨 Condition</div>
                        <div class="attributes">
                          ${memo.attributes.condition.map(a => `<span class="attribute-tag tag-condition">${a}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                    ${memo.attributes.clientReaction && memo.attributes.clientReaction.length > 0 ? `
                      <div style="margin-bottom: 8px;">
                        <div style="font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; margin-bottom: 4px;">💭 Reaction</div>
                        <div class="attributes">
                          ${memo.attributes.clientReaction.map(a => `<span class="attribute-tag tag-reaction">${a}</span>`).join('')}
                        </div>
                      </div>
                    ` : ''}
                  </div>
                ` : ''}
              `}
              <button class="memo-delete" onclick="deleteMemo(${showing.id}, ${memo.id})">Delete</button>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `).join('');
}

// Initial render
render();
