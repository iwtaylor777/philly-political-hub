// script.js

document.addEventListener('DOMContentLoaded', () => {
    const findBtn = document.getElementById('find-btn');
    const addressInput = document.getElementById('address');
    const representativesSection = document.getElementById('representatives-section');
    const representativesList = document.getElementById('representatives-list');
    const keydatesList = document.getElementById('keydates-list');

    // Load key dates on page load
    loadKeyDates();

    findBtn.addEventListener('click', () => {
        const address = addressInput.value.trim();
        if (address) {
            findRepresentatives(address);
        } else {
            alert('Please enter an address.');
        }
    });

    function findRepresentatives(address) {
        const apiKey = 'AIzaSyBw0xMiRc3dwVEjg_XKFtD0On3-JFQlnA0'; // Replace with your actual API key
        const url = `https://www.googleapis.com/civicinfo/v2/representatives?key=${apiKey}&address=${encodeURIComponent(address)}`;

        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                displayRepresentatives(data);
            })
            .catch(error => {
                console.error('Error fetching representatives:', error);
                alert('An error occurred while fetching representatives. Please check the address and try again.');
            });
    }

    function displayRepresentatives(data) {
        representativesList.innerHTML = ''; // Clear previous results
    
        if (data && data.officials) {
            const officials = data.officials;
            const offices = data.offices;
    
            let reps = [];
    
            // Map officials to their offices
            offices.forEach(office => {
                office.officialIndices.forEach(index => {
                    const official = officials[index];
                    reps.push({
                        name: official.name,
                        office: office.name,
                        party: official.party || 'Unknown',
                        phones: official.phones || ['Not Available'],
                        emails: official.emails || ['Not Available'],
                        photoUrl: official.photoUrl || '',
                        urls: official.urls || []
                    });
                });
            });
    
            reps.forEach(rep => {
                const repCard = document.createElement('div');
                repCard.className = 'col-md-6';
    
                const cardContent = `
                    <div class="card mb-4">
                        ${rep.photoUrl ? `
                        <img src="${rep.photoUrl}" class="card-img-top" alt="${rep.name}">
                        ` : ''}
                        <div class="card-body">
                            <h5 class="card-title">${rep.name}</h5>
                            <p class="card-text"><strong>Office:</strong> ${rep.office}</p>
                            <p class="card-text"><strong>Party:</strong> ${rep.party}</p>
                            <p class="card-text"><strong>Phone:</strong> ${rep.phones.join(', ')}</p>
                            <p class="card-text"><strong>Email:</strong> ${rep.emails.join(', ')}</p>
                            ${rep.urls.length > 0 ? `<p class="card-text"><strong>Website:</strong> <a href="${rep.urls[0]}" target="_blank">${rep.urls[0]}</a></p>` : ''}
                        </div>
                    </div>
                `;
    
                repCard.innerHTML = cardContent;
    
                representativesList.appendChild(repCard);
            });
    
            representativesSection.style.display = 'block';
        } else {
            representativesSection.style.display = 'none';
            alert('No representatives found for this address.');
        }
    }    

    function loadKeyDates() {
        fetch('keydates.json')
            .then(response => response.json())
            .then(data => {
                displayKeyDates(data);
            })
            .catch(error => {
                console.error('Error loading key dates:', error);
            });
    }

    function displayKeyDates(dates) {
        keydatesList.innerHTML = ''; // Clear previous results
        dates.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'col-md-6';
    
            eventItem.innerHTML = `
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">${formatDate(event.date)}</h5>
                        <p class="card-text">${event.description}</p>
                    </div>
                </div>
            `;
    
            keydatesList.appendChild(eventItem);
        });
    }    
      

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, options);
    }
});
