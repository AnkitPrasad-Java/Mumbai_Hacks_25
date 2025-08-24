document.addEventListener("DOMContentLoaded", () => {
    // --- Multilingual Support ---
    const languageSelect = document.getElementById("language-select");

    function applyTranslations(lang) {
        document.querySelectorAll("[data-translate]").forEach(element => {
            const key = element.getAttribute("data-translate");
            if (translations[lang] && translations[lang][key]) {
                element.textContent = translations[lang][key];
            }
        });
        document.querySelectorAll("[data-translate-title]").forEach(element => {
            const key = element.getAttribute("data-translate-title");
            if (translations[lang] && translations[lang][key]) {
                element.title = translations[lang][key];
            }
        });
        // Special case for title tag
        const titleElement = document.querySelector('title');
        if (titleElement && translations[lang] && translations[lang]['dashboard_title']) {
            titleElement.textContent = translations[lang]['dashboard_title'];
        }
    }

    languageSelect.addEventListener("change", (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem("selectedLanguage", selectedLang);
        applyTranslations(selectedLang);
    });

    // Set initial language
    const savedLanguage = localStorage.getItem("selectedLanguage") || "en";
    languageSelect.value = savedLanguage;
    applyTranslations(savedLanguage);

    // --- Chart Functions ---
    async function updateCharts() {
        const currentLang = languageSelect.value;

        // Update AQI Trend Chart with static data
        updateAqiTrendChart(aqiHistory, currentLang);

        // Update Beds Available and Wait Times charts with static data
        updateBedsAvailableChart(staticResources, currentLang);
        updateWaitTimesChart(staticResources, currentLang);
    }

    function updateAqiTrendChart(data, lang) {
        const ctx = document.getElementById("aqiTrendChart").getContext("2d");
        const labels = Array.from({ length: data.length }, (_, i) => i + 1);

        if (aqiTrendChart) {
            aqiTrendChart.data.labels = labels;
            aqiTrendChart.data.datasets[0].data = data;
            aqiTrendChart.options.plugins.title.text = translations[lang]['aqi_trend_chart_title'];
            aqiTrendChart.update();
        } else {
            aqiTrendChart = new Chart(ctx, {
                type: "line",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "AQI",
                        data: data,
                        borderColor: "var(--primary-brand)",
                        backgroundColor: "rgba(162, 210, 255, 0.1)",
                        fill: true,
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: translations[lang]['aqi_trend_chart_title'],
                            color: "var(--text-color)"
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Time (Latest -> Oldest)",
                                color: "var(--text-color)"
                            },
                            ticks: {
                                color: "var(--text-color)"
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: "AQI Value",
                                color: "var(--text-color)"
                            },
                            beginAtZero: true,
                            ticks: {
                                color: "var(--text-color)"
                            }
                        }
                    }
                }
            });
        }
    }

    function updateBedsAvailableChart(resources, lang) {
        const hospitals = resources.filter(r => r.type === "Hospital");
        const labels = hospitals.map(h => h.name);
        const data = hospitals.map(h => h.beds_available);

        const ctx = document.getElementById("bedsAvailableChart").getContext("2d");

        if (bedsAvailableChart) {
            bedsAvailableChart.data.labels = labels;
            bedsAvailableChart.data.datasets[0].data = data;
            bedsAvailableChart.options.plugins.title.text = translations[lang]['beds_available_chart_title'];
            bedsAvailableChart.update();
        } else {
            bedsAvailableChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Beds Available",
                        data: data,
                        backgroundColor: "rgba(189, 224, 254, 0.15)",
                        borderColor: "var(--primary-brand)",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: translations[lang]['beds_available_chart_title'],
                            color: "var(--text-color)"
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Hospital",
                                color: "var(--text-color)"
                            },
                            ticks: {
                                color: "var(--text-color)"
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Number of Beds",
                                color: "var(--text-color)"
                            },
                            beginAtZero: true,
                            ticks: {
                                color: "var(--text-color)"
                            }
                        }
                    }
                }
            });
        }
    }

    function updateWaitTimesChart(resources, lang) {
        const hospitals = resources.filter(r => r.type === "Hospital");
        const labels = hospitals.map(h => h.name);
        const data = hospitals.map(h => h.wait_time_minutes);

        const ctx = document.getElementById("waitTimesChart").getContext("2d");

        if (waitTimesChart) {
            waitTimesChart.data.labels = labels;
            waitTimesChart.data.datasets[0].data = data;
            waitTimesChart.options.plugins.title.text = translations[lang]['wait_time_chart_title'];
            waitTimesChart.update();
        } else {
            waitTimesChart = new Chart(ctx, {
                type: "bar",
                data: {
                    labels: labels,
                    datasets: [{
                        label: "Wait Time (minutes)",
                        data: data,
                        backgroundColor: "rgba(255, 200, 221, 0.15)",
                        borderColor: "var(--secondary-brand)",
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        title: {
                            display: true,
                            text: translations[lang]['wait_time_chart_title'],
                            color: "var(--text-color)"
                        },
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: "Hospital",
                                color: "var(--text-color)"
                            },
                            ticks: {
                                color: "var(--text-color)"
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: "Minutes",
                                color: "var(--text-color)"
                            },
                            beginAtZero: true,
                            ticks: {
                                color: "var(--text-color)"
                            }
                        }
                    }
                }
            });
        }
    }

    // --- Tab Navigation ---
    const tabLinks = document.querySelectorAll(".tab-link");
    const tabContents = document.querySelectorAll(".tab-content");

    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            const tabId = link.getAttribute("data-tab");

            // Deactivate all tabs and content
            tabLinks.forEach(item => item.classList.remove("active"));
            tabContents.forEach(item => item.classList.remove("active"));

            // Activate the clicked tab and its content
            link.classList.add("active");
            document.getElementById(tabId).classList.add("active");
        });
    });

    // --- City Rotation & Data Fetching ---
    const CITIES = [
        { name: "Mumbai", lat: 19.0760, lon: 72.8777 },
        { name: "Delhi", lat: 28.7041, lon: 77.1025 },
        { name: "Bangalore", lat: 12.9716, lon: 77.5946 },
        { name: "Kolkata", lat: 22.5726, lon: 88.3639 },
        { name: "Chennai", lat: 13.0827, lon: 80.2707 },
        { name: "Hyderabad", lat: 17.3850, lon: 78.4867 }
    ];
    let currentCityIndex = 0;
    let currentWs = null;
    let map = null; // Global map instance
    let heatLayer = null; // Global heat layer instance

    // Chart instances
    let aqiTrendChart = null;
    let bedsAvailableChart = null;
    let waitTimesChart = null;

    // AQI history for chart (static data)
    const aqiHistory = [80, 85, 90, 92, 88, 95, 100, 105, 110, 108, 115, 120, 118, 125, 130, 128, 135, 140, 138, 145];
    // const MAX_AQI_HISTORY = 20; // No longer needed for static data

    // Static resources data for charts
    const staticResources = [
        { "id": 1, "name": "Apollo Hospital", "type": "Hospital", "address": "Jubilee Hills, Hyderabad", "contact": "+91-40-2360 7777", "website": "https://www.apollohospitals.com/", "beds_available": 15, "wait_time_minutes": 30 },
        { "id": 2, "name": "Max Healthcare", "type": "Hospital", "address": "Saket, New Delhi", "contact": "+91-11-2651 5050", "website": "https://www.maxhealthcare.in/", "beds_available": 10, "wait_time_minutes": 45 },
        { "id": 3, "name": "Fortis Hospital", "type": "Hospital", "address": "Bannerghatta Road, Bangalore", "contact": "+91-80-2639 4444", "website": "https://www.fortishealthcare.com/", "beds_available": 20, "wait_time_minutes": 20 },
        { "id": 4, "name": "Lilavati Hospital", "type": "Hospital", "address": "Bandra Reclamation, Mumbai", "contact": "+91-22-2675 1000", "website": "https://www.lilavatihospital.com/", "beds_available": 8, "wait_time_minutes": 50 },
        { "id": 5, "name": "AIIMS Delhi", "type": "Hospital", "address": "Ansari Nagar, New Delhi", "contact": "+91-11-2658 8500", "website": "https://www.aiims.edu/", "beds_available": 25, "wait_time_minutes": 60 },
        { "id": 6, "name": "Manipal Hospital", "type": "Hospital", "address": "Old Airport Road, Bangalore", "contact": "+91-80-2502 4444", "website": "https://www.manipalhospitals.com/", "beds_available": 12, "wait_time_minutes": 35 },
        { "id": 7, "name": "MedPlus Pharmacy", "type": "Pharmacy", "address": "Various locations", "contact": "1800-123-4567", "website": "https://www.medplusindia.com/", "beds_available": "N/A", "wait_time_minutes": "N/A" },
        { "id": 8, "name": "Dr. Lal PathLabs", "type": "Diagnostic Center", "address": "Various locations", "contact": "+91-11-3988 5050", "website": "https://www.lalpathlabs.com/", "beds_available": "N/A", "wait_time_minutes": "N/A" }
    ];

    const pollutionDataElement = document.getElementById("pollution-data");
    const recommendationsTextElement = document.getElementById("recommendations-text");
    const refreshButton = document.getElementById("refresh-recommendations");
    const cityTextElement = document.getElementById("current-city");

    // --- Map Initialization ---
    function initMap(initialCityInfo) {
        if (map === null) {
            map = L.map('heatmap-container').setView([initialCityInfo.lat, initialCityInfo.lon], 11); // Initial view

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        }
    }

    async function updateMap(cityInfo) {
        if (map === null) return; // Map not initialized yet

        // Clear existing heat layer
        if (heatLayer) {
            map.removeLayer(heatLayer);
        }

        try {
            const response = await fetch(`/api/heatmap_data?city=${cityInfo.name}`);
            const data = await response.json();

            if (data && data.points) {
                heatLayer = L.heatLayer(data.points, {
                    radius: 25,
                    blur: 15,
                    maxZoom: 17,
                    gradient: {
                        0.0: 'blue',
                        0.5: 'lime',
                        1.0: 'red'
                    }
                }).addTo(map);
                map.setView([data.center.lat, data.center.lon], 11); // Pan to new city
            } else {
                console.error("No heatmap data points received.", data);
            }
        } catch (error) {
            console.error("Error fetching heatmap data:", error);
        }
    }

    function connectWebSocket(city) {
        if (currentWs) {
            currentWs.close();
        }

        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${wsProtocol}//${window.location.host}/ws/pollution?city=${city}`;
        currentWs = new WebSocket(wsUrl);

        currentWs.onopen = () => {
            console.log(`WebSocket connected for ${city}`);
            pollutionDataElement.textContent = "Waiting for data...";
        };

        currentWs.onmessage = (event) => {
            const data = JSON.parse(event.data);
            pollutionDataElement.textContent = `${data.location}: ${data.aqi}`;
            
            // Removed dynamic AQI history update for static charts

            if (data.aqi > 150) {
                pollutionDataElement.style.color = "var(--aqi-bad)";
            } else if (data.aqi > 100) {
                pollutionDataElement.style.color = "var(--aqi-moderate)";
            } else {
                pollutionDataElement.style.color = "var(--aqi-good)";
            }
        };

        currentWs.onclose = () => {
            console.log(`WebSocket closed for ${city}`);
        };

        currentWs.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
    }

    async function fetchRecommendations(city) {
        recommendationsTextElement.innerHTML = `<i>Generating new recommendations for ${city}...</i>`;
        try {
            const response = await fetch(`/api/recommendations?city=${city}`);
            const data = await response.json();
            if (data && data.recommendations) {
                let formattedText = data.recommendations.replace(/\n/g, '<br>');
                formattedText = formattedText.replace(/\*\*/g, '');
                formattedText = formattedText.replace(/(Staffing:)/g, '<b>$1</b>');
                formattedText = formattedText.replace(/(Supplies:)/g, '<b>$1</b>');
                recommendationsTextElement.innerHTML = formattedText;
            } else {
                recommendationsTextElement.textContent = "Could not retrieve recommendations.";
            }
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            recommendationsTextElement.textContent = "Could not load recommendations.";
        }
    }

    // This function now updates the city title, WebSocket, and Map
    async function updateDashboardForCity(cityInfo) {
        cityTextElement.textContent = cityInfo.name;
        connectWebSocket(cityInfo.name);
        await updateMap(cityInfo);
    }

    async function handleRotation() {
        currentCityIndex = (currentCityIndex + 1) % CITIES.length;
        const newCityInfo = CITIES[currentCityIndex];
        await updateDashboardForCity(newCityInfo);
    }

    // --- Initial Load & Event Listeners ---
    const initialCityInfo = CITIES[0];
    initMap(initialCityInfo); // Initialize map once
    updateDashboardForCity(initialCityInfo); // Set up the ticker and map for the first city
    fetchRecommendations(initialCityInfo.name); // Fetch recommendations ONCE on load
    updateCharts(); // Initial chart load

    setInterval(handleRotation, 5000); // Cycle city, ticker, and map every 5 seconds

    refreshButton.addEventListener("click", () => {
        const currentCity = CITIES[currentCityIndex].name;
        fetchRecommendations(currentCity);
    });

    // Modify language change listener to also update charts
    languageSelect.addEventListener("change", (event) => {
        const selectedLang = event.target.value;
        localStorage.setItem("selectedLanguage", selectedLang);
        applyTranslations(selectedLang);
        updateCharts(); // Update charts on language change
    });

    // --- Chatbot Logic ---
    const chatbotIcon = document.getElementById("chatbot-icon");
    const chatbotUI = document.getElementById("chatbot-ui");
    const chatbotCloseBtn = document.getElementById("chatbot-close");
    const chatbotMessages = document.getElementById("chatbot-messages");
    const chatbotInput = document.getElementById("chatbot-input");
    const chatbotSendBtn = document.getElementById("chatbot-send");

    chatbotIcon.addEventListener("click", () => {
        chatbotUI.classList.toggle("hidden");
        if (!chatbotUI.classList.contains("hidden")) {
            chatbotInput.focus();
            chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Scroll to bottom on open
        }
    });

    chatbotCloseBtn.addEventListener("click", () => {
        chatbotUI.classList.add("hidden");
    });

    function addMessage(sender, message) {
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("chatbot-message", sender);
        messageDiv.textContent = message;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight; // Auto-scroll to latest message
    }

    async function sendChatMessage() {
        const message = chatbotInput.value.trim();
        if (message === "") return;

        addMessage("user", message);
        chatbotInput.value = "";

        try {
            addMessage("ai", "Typing..."); // Show typing indicator
            const response = await fetch("/api/chatbot", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ message: message }),
            });
            const data = await response.json();
            chatbotMessages.lastChild.remove(); // Remove typing indicator
            addMessage("ai", data.response);
        } catch (error) {
            console.error("Error sending message to chatbot:", error);
            chatbotMessages.lastChild.remove(); // Remove typing indicator
            addMessage("ai", "Sorry, I'm having trouble connecting. Please try again later.");
        }
    }

    chatbotSendBtn.addEventListener("click", sendChatMessage);
    chatbotInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            sendChatMessage();
        }
    });

    // --- Resource Directory Logic ---
    const resourceSearchInput = document.getElementById("resource-search-input");
    const resourceSearchButton = document.getElementById("resource-search-button");
    const resourceResultsDiv = document.getElementById("resource-results");

    async function performResourceSearch() {
        const query = resourceSearchInput.value.trim();
        const currentLang = languageSelect.value; // Get current language

        resourceResultsDiv.innerHTML = `<p>${translations[currentLang]['resource_search_placeholder_text']}</p>`;

        try {
            const response = await fetch(`/api/resources?query=${encodeURIComponent(query)}`);
            const resources = await response.json();

            resourceResultsDiv.innerHTML = ""; // Clear previous results

            if (resources.length === 0) {
                resourceResultsDiv.innerHTML = `<p>${translations[currentLang]['resource_no_results_text']}</p>`;
                return;
            }

            resources.forEach(resource => {
                const card = document.createElement("div");
                card.classList.add("resource-card");
                card.innerHTML = `
                    <h3>${resource.name}</h3>
                    <p><strong>${translations[currentLang]['resource_type_label']}</strong> ${resource.type}</p>
                    <p><strong>${translations[currentLang]['resource_address_label']}</strong> ${resource.address}</p>
                    <p><strong>${translations[currentLang]['resource_contact_label']}</strong> ${resource.contact}</p>
                    ${resource.website ? `<p><strong>${translations[currentLang]['resource_website_label']}</strong> <a href="${resource.website}" target="_blank">${resource.website}</a></p>` : ''}
                    ${resource.beds_available !== undefined ? `<p><strong>${translations[currentLang]['resource_beds_available_label']}</strong> ${resource.beds_available}</p>` : ''}
                    ${resource.wait_time_minutes !== undefined ? `<p><strong>${translations[currentLang]['resource_wait_time_label']}</strong> ${resource.wait_time_minutes} ${translations[currentLang]['resource_wait_time_unit']}</p>` : ''}
                `;
                resourceResultsDiv.appendChild(card);
            });

        } catch (error) {
            console.error("Error fetching resources:", error);
            resourceResultsDiv.innerHTML = `<p>${translations[currentLang]['resource_error_loading_text']}</p>`;
        }
    }

    resourceSearchButton.addEventListener("click", performResourceSearch);
    resourceSearchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            performResourceSearch();
        }
    });
});
