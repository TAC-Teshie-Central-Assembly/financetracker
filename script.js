const historyData = JSON.parse(localStorage.getItem('historyData')) || [];
let editingIndex = null;

document.getElementById('authSubmit').addEventListener('click', () => {
    const token = document.getElementById('authToken').value.trim();
    if (token === '12345') {
        document.getElementById('authPrompt').style.display = 'none';
        document.getElementById('historySection').style.display = 'block';
        renderHistory();
    } else {
        alert('Invalid token.');
    }
});

let currentPage = 1;
const itemsPerPage = 5; // Number of items to show per page

function renderHistory() {
    const searchQuery = document.getElementById('search').value.toLowerCase();
    const listContainer = document.getElementById('historyList');
    listContainer.innerHTML = '';

    // Filtered data based on search
    const filteredData = historyData.filter(
        (record) =>
            record.date.includes(searchQuery) ||
            record.tithe.toString().includes(searchQuery) ||
            record.offering.toString().includes(searchQuery)
    );

    // Calculate pagination
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageData = filteredData.slice(start, end);

    if (pageData.length === 0) {
        listContainer.innerHTML = `<p class="text-center text-muted">No records found.</p>`;
        return;
    }

    pageData.forEach((record, index) => {
        const card = document.createElement('div');
        card.className = 'card p-3';
        card.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h5>${record.date}</h5>
                    <p>Tithe: GHS ${record.tithe.toFixed(2)}</p>
                    <p>Offering: GHS ${record.offering.toFixed(2)}</p>
                </div>
                <div>
                    <button class="btn btn-sm btn-warning me-2" onclick="editRecord(${index})">Edit</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteRecord(${index})">Delete</button>
                </div>
            </div>`;
        listContainer.appendChild(card);
    });

    renderPagination(filteredData.length, totalPages);
}

// Function to render pagination
function renderPagination(totalItems, totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    const prevPage = document.createElement('button');
    prevPage.className = 'btn btn-secondary me-2';
    prevPage.innerText = 'Previous';
    prevPage.disabled = currentPage === 1;
    prevPage.onclick = () => changePage(currentPage - 1);
    paginationContainer.appendChild(prevPage);

    for (let page = 1; page <= totalPages; page++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `btn btn-secondary me-2 ${currentPage === page ? 'active' : ''}`;
        pageBtn.innerText = page;
        pageBtn.onclick = () => changePage(page);
        paginationContainer.appendChild(pageBtn);
    }

    const nextPage = document.createElement('button');
    nextPage.className = 'btn btn-secondary';
    nextPage.innerText = 'Next';
    nextPage.disabled = currentPage === totalPages;
    nextPage.onclick = () => changePage(currentPage + 1);
    paginationContainer.appendChild(nextPage);
}

// Change the current page
function changePage(page) {
    if (page < 1 || page > Math.ceil(historyData.length / itemsPerPage)) return;
    currentPage = page;
    renderHistory();
}

document.getElementById('search').addEventListener('input', () => {
    currentPage = 1; // Reset to first page when search changes
    renderHistory();
});

function editRecord(index) {
    const record = historyData[index];
    document.getElementById('dateInput').value = record.date;
    document.getElementById('titheInput').value = record.tithe;
    document.getElementById('offeringInput').value = record.offering;
    editingIndex = index;
    new bootstrap.Modal(document.getElementById('recordModal')).show();
}

document.getElementById('saveRecordBtn').addEventListener('click', () => {
    const date = document.getElementById('dateInput').value;
    const tithe = parseFloat(document.getElementById('titheInput').value) || 0;
    const offering = parseFloat(document.getElementById('offeringInput').value) || 0;

    if (editingIndex !== null) {
        historyData[editingIndex] = { date, tithe, offering };
        editingIndex = null;
    } else {
        historyData.push({ date, tithe, offering });
    }

    // Save data to localStorage
    localStorage.setItem('historyData', JSON.stringify(historyData));

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('recordModal'));
    modal.hide();

    renderHistory();
});

 // Handle deleting a record
 function deleteRecord(index) {
    if (confirm('Are you sure you want to delete this record?')) {
        historyData.splice(index, 1);
    // Save data to localStorage
        localStorage.setItem('historyData', JSON.stringify(historyData));
        renderHistory();
    }
}



document.getElementById('addRecordBtn').addEventListener('click', () => {
    document.getElementById('dateInput').value = '';
    document.getElementById('titheInput').value = '';
    document.getElementById('offeringInput').value = '';
    new bootstrap.Modal(document.getElementById('recordModal')).show();
});

// Share Button Functionality
document.getElementById('shareHistory').addEventListener('click', () => {
    // Convert history data to plain text
    let historyText = '';
    let offeringToDate = 0;
    let titheToDate = 0;
    historyData.forEach(entry => {
        historyText += `${entry.date}\nLocal offerings - ${entry.offering}\nTithe - ${entry.tithe}\n\n`;
        offeringToDate += entry.offering;
        titheToDate += entry.tithe;       
    });

    console.log("offering to date "+offeringToDate);
    console.log("tithe to date "+titheToDate);

    historyText += `================\n`;
    historyText += `TOTALS\n`;
    historyText += `================\n\n`;
    historyText += `Local Offerings - ${offeringToDate}\nTithe - ${titheToDate}\n\n`;

    // Check if the browser supports sharing
    if (navigator.share) {
        navigator.share({
            title: 'Tithe and Offering History',
            text: historyText
        }).catch(console.error);
    } else {
        alert('Sharing is not supported in this browser.');
    }
});


document.getElementById('exportHistory').addEventListener('click', () => {
    const dataStr = JSON.stringify(historyData);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'history.json';
    link.click();
});

document.getElementById('importHistoryBtn').addEventListener('click', () => {
    const fileInput = document.getElementById('importHistory');
    fileInput.click();
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                historyData.push(...JSON.parse(reader.result));
                // Save updated data to localStorage
                localStorage.setItem('historyData', JSON.stringify(historyData));
                renderHistory();
            };
            reader.readAsText(file);
        }
    });
});
