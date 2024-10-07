// script.js

document.addEventListener('DOMContentLoaded', () => {
    const findBtn = document.getElementById('find-btn');
    const addressInput = document.getElementById('address');
    const representativesSection = document.getElementById('representatives-section');
    const representativesList = document.getElementById('representatives-list');
    const keydatesList = document.getElementById('keydates-list');

    // Load key dates on page load
    //loadKeyDates();

    findBtn.addEventListener('click', () => {
        const address = addressInput.value.trim();
        if (address) {
            findRepresentatives(address);
        } else {
            alert('Please enter an address.');
        }
    });

    function findRepresentatives(address) {
        fetch(`https://www.googleapis.com/civicinfo/v2/representatives?key=AIzaSyBw0xMiRc3dwVEjg_XKFtD0On3-JFQlnA0&address=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    alert(data.error.message);
                } else {
                    // Get the city from the normalized input
                    const city = data.normalizedInput.city || '';
                    displayRepresentatives(data);
                    if (city) {
                        // Now load key dates for this city
                        loadKeyDates(city);
                    } else {
                        // If city is not available, display a message
                        displayNoCityDatesMessage('your area');
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching representatives:', error);
                alert('An error occurred while fetching representatives.');
            });
    }

    function displayRepresentatives(data) {
        representativesList.innerHTML = ''; // Clear previous results
    
        if (data && data.officials) {
            const officials = data.officials;
            const offices = data.offices;
    
            // Create arrays to hold representatives by level
            let federalReps = [];
            let stateReps = [];
            let localReps = [];
    
            // Map officials to their offices
            offices.forEach(office => {
                office.officialIndices.forEach(index => {
                    const official = officials[index];
    
                    // Determine the level based on the division ID
                    const divisionId = office.divisionId;
                    let level = getLevelFromDivisionId(divisionId);
    
                    const rep = {
                        name: official.name,
                        office: office.name,
                        party: official.party || 'Unknown',
                        phones: official.phones || ['Not Available'],
                        emails: official.emails || ['Not Available'],
                        photoUrl: official.photoUrl || '',
                        urls: official.urls || []
                    };
    
                    // Categorize representatives
                    if (level === 'federal') {
                        federalReps.push(rep);
                    } else if (level === 'state') {
                        stateReps.push(rep);
                    } else {
                        localReps.push(rep);
                    }
                });
            });
    
            // Create collapsible sections
            createCollapsibleSection('Federal Representatives', federalReps, 'federal-section', true);
            createCollapsibleSection('State Representatives', stateReps, 'state-section', true);
            createCollapsibleSection('Local Representatives', localReps, 'local-section', false);
    
            representativesSection.style.display = 'block';
        } else {
            representativesSection.style.display = 'none';
            alert('No representatives found for this address.');
        }
    }
    
    function getLevelFromDivisionId(divisionId) {
        if (divisionId.includes('/country:us')) {
            if (divisionId.includes('/state:')) {
                if (divisionId.includes('/county:') || divisionId.includes('/place:') || divisionId.includes('/cd:') || divisionId.includes('/sld')) {
                    return 'local';
                } else {
                    return 'state';
                }
            } else {
                return 'federal';
            }
        } else {
            return 'local';
        }
    }

    function createCollapsibleSection(title, repsArray, sectionId, collapsed) {
        let levelIcon = '';
        if (title.includes('Federal')) {
            levelIcon = '<i class="fas fa-landmark mr-2"></i>';
        } else if (title.includes('State')) {
            levelIcon = '<i class="fas fa-university mr-2"></i>';
        } else if (title.includes('Local')) {
            levelIcon = '<i class="fas fa-city mr-2"></i>';
        }
        
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'mb-3';
    
        const headerId = sectionId + '-header';
        const collapseId = sectionId + '-collapse';
    
        sectionDiv.innerHTML = `
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center" id="${headerId}" data-toggle="collapse" data-target="#${collapseId}" aria-expanded="${!collapsed}" aria-controls="${collapseId}" style="cursor: pointer;">
                <h5 class="mb-0">
                    ${levelIcon}${title}
                </h5>
                <i class="fas fa-chevron-${collapsed ? 'down' : 'up'} toggle-icon"></i>
            </div>
            <div id="${collapseId}" class="collapse ${collapsed ? '' : 'show'}" aria-labelledby="${headerId}" data-parent="#representatives-list">
                <div class="card-body" id="${sectionId}-body">
                    <!-- Representatives will be appended here -->
                </div>
            </div>
        </div>
    `;
    
        representativesList.appendChild(sectionDiv);
    
        const repsBody = document.getElementById(`${sectionId}-body`);
    
        repsArray.forEach(rep => {
            const repCard = document.createElement('div');
            repCard.className = 'card mb-3';
    
            repCard.innerHTML = `
                <div class="card mb-3 border-0">
                    <div class="row no-gutters align-items-center">
                        ${rep.photoUrl ? `
                        <div class="col-md-3">
                            <img src="${rep.photoUrl}" class="card-img" alt="${rep.name}">
                        </div>
                        ` : ''}
                        <div class="${rep.photoUrl ? 'col-md-9' : 'col-md-12'}">
                            <div class="card-body">
                                <h5 class="card-title">${rep.name}</h5>
                                <p class="card-text mb-1"><strong>Office:</strong> ${rep.office}</p>
                                <p class="card-text mb-1"><strong>Party:</strong> ${rep.party}</p>
                                <p class="card-text mb-1"><strong>Phone:</strong> ${rep.phones.join(', ')}</p>
                                <p class="card-text mb-1"><strong>Email:</strong> ${rep.emails.join(', ')}</p>
                                ${rep.urls.length > 0 ? `<p class="card-text mb-1"><strong>Website:</strong> <a href="${rep.urls[0]}" target="_blank">${rep.urls[0]}</a></p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
    
            repsBody.appendChild(repCard);
        });
    
        // Add event listener to toggle icons on collapse/expand
        const collapseElement = document.getElementById(collapseId);
        const toggleButton = sectionDiv.querySelector(`[data-target="#${collapseId}"]`);
        const toggleIcon = toggleButton.querySelector('.toggle-icon');
    
        $(collapseElement).on('hide.bs.collapse', function () {
            toggleIcon.classList.remove('fa-chevron-up');
            toggleIcon.classList.add('fa-chevron-down');
        });
    
        $(collapseElement).on('show.bs.collapse', function () {
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-up');
        });
    }
    

    function loadKeyDates(userCity) {
        fetch('keydates.json')
            .then(response => response.json())
            .then(data => {
                console.log('Fetched Key Dates:', data);
                // Filter key dates based on the user's city
                const cityKeyDates = data.filter(event => event.city.toLowerCase() === userCity.toLowerCase());
                if (cityKeyDates.length > 0) {
                    displayKeyDates(cityKeyDates);
                } else {
                    displayNoCityDatesMessage(userCity);
                }
            })
            .catch(error => {
                console.error('Error loading key dates:', error);
                alert('An error occurred while loading key dates.');
            });
    }

    function displayKeyDates(dates) {
        keydatesList.innerHTML = ''; // Clear previous content
    
        // Get today's date without time
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        // Separate dates into upcoming and past
        const upcomingDates = [];
        const pastDates = [];
    
        dates.forEach(event => {
            const eventDate = new Date(event.date + 'T00:00:00');
            if (eventDate >= today) {
                upcomingDates.push(event);
            } else {
                pastDates.push(event);
            }
        });
    
        // Sort the upcoming dates in ascending order
        upcomingDates.sort((a, b) => new Date(a.date) - new Date(b.date));
    
        // Sort the past dates in descending order
        pastDates.sort((a, b) => new Date(b.date) - new Date(a.date));
    
        // Display upcoming dates
        if (upcomingDates.length > 0) {
            createKeyDatesSection('Upcoming Dates', upcomingDates, 'upcoming-dates-section', false);
        }
    
        // Display past dates in a collapsible section
        if (pastDates.length > 0) {
            createKeyDatesSection('Past Dates', pastDates, 'past-dates-section', true);
        }
    }
    
    function createKeyDatesSection(title, datesArray, sectionId, collapsed) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'mb-3';
    
        const headerId = sectionId + '-header';
        const collapseId = sectionId + '-collapse';
    
        sectionDiv.innerHTML = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center" id="${headerId}" data-toggle="collapse" data-target="#${collapseId}" aria-expanded="${!collapsed}" aria-controls="${collapseId}" style="cursor: pointer;">
                    <h5 class="mb-0">${title}</h5>
                    <i class="fas fa-chevron-${collapsed ? 'down' : 'up'} toggle-icon"></i>
                </div>
                <div id="${collapseId}" class="collapse ${collapsed ? '' : 'show'}" aria-labelledby="${headerId}">
                    <div class="card-body" id="${sectionId}-body">
                        <!-- Events will be appended here -->
                    </div>
                </div>
            </div>
        `;
    
        keydatesList.appendChild(sectionDiv);
    
        const datesBody = document.getElementById(`${sectionId}-body`);
    
        datesArray.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'card mb-3 border-0';
    
            eventItem.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${formatDate(event.date)}</h5>
                    <p class="card-text">${event.description}</p>
                </div>
            `;
    
            datesBody.appendChild(eventItem);
        });
    
        // Add event listener to toggle icons on collapse/expand
        const collapseElement = document.getElementById(collapseId);
        const headerElement = sectionDiv.querySelector(`#${headerId}`);
        const toggleIcon = headerElement.querySelector('.toggle-icon');
    
        $(collapseElement).on('hide.bs.collapse', function () {
            toggleIcon.classList.remove('fa-chevron-up');
            toggleIcon.classList.add('fa-chevron-down');
        });
    
        $(collapseElement).on('show.bs.collapse', function () {
            toggleIcon.classList.remove('fa-chevron-down');
            toggleIcon.classList.add('fa-chevron-up');
        });
    }    
      

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString + 'T00:00:00');
        if (isNaN(date)) {
            console.error('Invalid date:', dateString);
            return 'Invalid Date';
        }
        return date.toLocaleDateString(undefined, options);
    }

    function displayNoCityDatesMessage(city) {
        keydatesList.innerHTML = ''; // Clear previous content
        const messageDiv = document.createElement('div');
        messageDiv.className = 'alert alert-info text-center';
        messageDiv.textContent = `Key dates for ${city} are coming soon.`;
        keydatesList.appendChild(messageDiv);
    }

    // Subscription form handling
    const subscriptionForm = document.getElementById('subscription-form');
    const subscriberEmailInput = document.getElementById('subscriber-email');
    const subscriptionMessage = document.getElementById('subscription-message');

    subscriptionForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent the form from refreshing the page

        const email = subscriberEmailInput.value.trim();
        if (email) {
            // TODO: Implement backend integration to store the email
            // For now, we'll just display a success message
            subscriptionMessage.textContent = 'Thank you for subscribing!';
            subscriptionMessage.style.color = 'green';

            // Reset the form
            subscriptionForm.reset();
        } else {
            subscriptionMessage.textContent = 'Thank you for subscribing!';
            subscriptionMessage.style.color = 'green!';    

            // subscriptionMessage.textContent = 'Please enter a valid email address.';
            // subscriptionMessage.style.color = 'red';
        }
    });    
    // Home button handling
    const homeButton = document.getElementById('home-button');

    homeButton.addEventListener('click', (event) => {
        event.preventDefault(); // Prevent default anchor behavior

        // Reset input fields and hide sections
        addressInput.value = '';
        representativesSection.style.display = 'none';
        representativesList.innerHTML = '';
    });    
});
