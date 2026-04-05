// Format dates safely
function timeSince(dateStr) {
    try {
        const date = new Date(dateStr);
        if(isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch(e) { return dateStr; }
}

// Fetch real-time alerts
async function fetchAlerts() {
    try {
        const response = await fetch('http://localhost:8000/api/alerts');
        const data = await response.json();
        const marquee = document.getElementById('live-alerts-marquee');
        if(data.alerts && data.alerts.length > 0) {
            let alertText = data.alerts.map(a => `&#9888; <strong>${a.title}</strong> (${timeSince(a.date)}) - ${a.description}`).join(' &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp; ');
            marquee.innerHTML = alertText;
        } else {
            marquee.innerText = "No active severe weather or flood alerts at this time.";
        }
    } catch(e) {
        console.error('Error fetching alerts', e);
        const marquee = document.getElementById('live-alerts-marquee');
        if(marquee) marquee.innerText = "Unable to connect to Real-Time Alert Server. Make sure backend is running.";
    }
}

// Run fetch
fetchAlerts();
setInterval(fetchAlerts, 60000); // refresh every minute

// Handle Image Upload
const uploadBox = document.getElementById('upload-box');
const fileInput = document.getElementById('image-upload');
const resultContainer = document.getElementById('result-container');
const resultImg = document.getElementById('result-img');
const spinner = document.getElementById('loading-spinner');
const resetBtn = document.getElementById('reset-btn');

if(uploadBox) {
    uploadBox.addEventListener('click', () => fileInput.click());
    
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--ast-global-color-1)';
        uploadBox.style.background = '#f0f5ff';
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = 'var(--ast-global-color-0)';
        uploadBox.style.background = 'white';
    });

    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.style.borderColor = 'var(--ast-global-color-0)';
        uploadBox.style.background = 'white';
        if(e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if(e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    async function handleFile(file) {
        if(!file.type.startsWith('image/')) {
            alert("Please upload an image file.");
            return;
        }

        uploadBox.style.display = 'none';
        resultContainer.style.display = 'block';
        
        // Show original image while processing
        const reader = new FileReader();
        reader.onload = (e) => {
            resultImg.src = e.target.result;
            spinner.style.display = 'flex';
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('http://localhost:8000/api/predict', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            resultImg.src = data.mask_overlay;
        } catch(e) {
            console.error('Error during prediction:', e);
            alert("Analysis failed. Ensure the Fast API backend is running on local port 8000.");
            resetView();
        } finally {
            spinner.style.display = 'none';
        }
    }

    function resetView() {
        resultContainer.style.display = 'none';
        uploadBox.style.display = 'block';
        fileInput.value = "";
    }

    resetBtn.addEventListener('click', resetView);
}
