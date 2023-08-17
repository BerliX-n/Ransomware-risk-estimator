let chartInstance; // Global variable to store the current chart instance.

// Grabbing the dropdown and display elements
const frequencyDropdown = document.querySelector('[name="attack_frequency"]');
const displayFrequency = document.getElementById('displayFrequency');

// Event listener to update displayed value when dropdown changes
frequencyDropdown.addEventListener('change', function() {
    displayFrequency.innerText = frequencyDropdown.value;
});

// On page load, display the default value (Medium)
document.addEventListener('DOMContentLoaded', function() {
    displayFrequency.innerText = frequencyDropdown.value;
});

// Grabbing the dropdown and display elements
const attackCountDropdown = document.querySelector('#attack_count');
const displayCount = document.getElementById('displayCount');

// Event listener to update displayed value when dropdown changes
attackCountDropdown.addEventListener('change', function() {
    displayCount.innerText = attackCountDropdown.value;
});

// On page load, display the default value (10)
document.addEventListener('DOMContentLoaded', function() {
    displayCount.innerText = attackCountDropdown.value;
});

function updateDisplayedValues() {
    const attackFrequencyDropdown = document.querySelector('select[name="attack_frequency"]');
    const attackCountDropdown = document.querySelector('select[name="attack_count"]');
    document.getElementById('displayFrequency').innerText = attackFrequencyDropdown.value;
    document.getElementById('displayCount').innerText = attackCountDropdown.value;
    updateThreatEventFrequency();  // Calculate the Threat Event Frequency
}

function updateThreatEventFrequency() {
    const attackFrequencyValue = parseFloat(document.getElementById('displayFrequency').innerText);
    const attackCountValue = parseInt(document.getElementById('displayCount').innerText);
    const threatFrequency = attackFrequencyValue * attackCountValue;
    document.getElementById('threatEventFrequency').innerText = threatFrequency.toFixed(2);
    updateLossEventFrequency(); // Update the Loss Event Frequency after updating the Threat Event Frequency
}

function updateLossEventFrequency() {
    const likelihoodSuccessPercentage = parseFloat(document.getElementById('totalLikelihood').innerText) / 100;
    const threatFrequency = parseFloat(document.getElementById('threatEventFrequency').innerText);
    const lossFrequency = likelihoodSuccessPercentage * threatFrequency;
    document.getElementById('lossEventFrequency').innerText = lossFrequency.toFixed(2);
}

document.querySelector('select[name="attack_frequency"]').addEventListener('change', updateDisplayedValues);
document.querySelector('select[name="attack_count"]').addEventListener('change', updateDisplayedValues);
document.getElementById("likelihood-tbody").addEventListener('input', function() {
    calculateTotalLikelihood();
    updateLossEventFrequency();
});

document.addEventListener('DOMContentLoaded', function() {
    updateDisplayedValues();
});


// Function to add another set of fields for a new asset.
function addAssetForm() {
    const formContainer = document.getElementById("assets-container");

    const newAssetDiv = document.createElement("div");
    newAssetDiv.innerHTML = `
        <hr>
        Asset Name: <input type="text" name="asset_name[]" required><br>

        Asset Type:
        <select name="asset_type[]">
            <option value="10">Hardware</option>
            <option value="20">Software</option>
            <option value="20">Data</option>
        </select><br>

        Criticality/Importance:
        <select name="criticality[]">
            <option value="20">Very High</option>
            <option value="15">Slightly High</option>
            <option value="5">Medium</option>
            <option value="5">Slightly Low</option>
            <option value="2">Low</option>
        </select><br>

        Sensitivity of Data within Asset:
        <select name="data_sensitivity[]">
            <option value="10">Highly Sensitive</option>
            <option value="5">Moderately Sensitive</option>
            <option value="2">Not Sensitive</option>
        </select><br>

        Dependency Level:
        <select name="dependency_level[]">
            <option value="10">High</option>
            <option value="5">Medium</option>
            <option value="2">Low</option>
        </select><br>

        Back-up Status:
        <select name="backup_status[]">
            <option value="0">Backed Up</option>
            <option value="10">Not Backed Up</option>
        </select><br>

        Incident History:
        <select name="incident_history[]">
            <option value="10">Multiple Incidents</option>
            <option value="5">One Incident</option>
            <option value="1">No Incidents</option>
        </select><br>
    `;

    formContainer.appendChild(newAssetDiv);

    calculateRisk();  // Recalculate the risk and update the chart.
}

function resetForm() {
    // Reset form fields
    let formElements = document.getElementsByTagName('input');
    for (let i = 0; i < formElements.length; i++) {
        if (formElements[i].type !== 'button') { // avoid resetting button elements
            formElements[i].value = '';
        }
    }

    // Reset dropdowns to their default value
    let selectElements = document.getElementsByTagName('select');
    for (let i = 0; i < selectElements.length; i++) {
        selectElements[i].selectedIndex = 0;
    }

    // Clear the graph by removing the canvas and creating it again.
    const chartContainer = document.getElementById('chart-container');
    const oldCanvas = document.getElementById('myChart');
    chartContainer.removeChild(oldCanvas);
    
    const newCanvas = document.createElement('canvas');
    newCanvas.id = 'myChart';
    chartContainer.appendChild(newCanvas);
}

// Function to calculate the risk values for each asset and plot on the chart.
function calculateRisk() {
    const assetNames = document.querySelectorAll('input[name="asset_name[]"]');
    const assetTypes = document.querySelectorAll('select[name="asset_type[]"]');
    const criticalities = document.querySelectorAll('select[name="criticality[]"]');
    const dataSensitivities = document.querySelectorAll('select[name="data_sensitivity[]"]');
    const dependencyLevels = document.querySelectorAll('select[name="dependency_level[]"]');
    const backupStatuses = document.querySelectorAll('select[name="backup_status[]"]');
    const incidentHistories = document.querySelectorAll('select[name="incident_history[]"]');

    let riskValues = [];
    let assetLabels = [];

    for(let i = 0; i < assetNames.length; i++) {
        const riskValue = parseInt(assetTypes[i].value) + parseInt(criticalities[i].value) + 
                          parseInt(dataSensitivities[i].value) + parseInt(dependencyLevels[i].value) + 
                          parseInt(backupStatuses[i].value) + parseInt(incidentHistories[i].value);

        riskValues.push(riskValue);
        assetLabels.push(assetNames[i].value);
    }

    // If there's a previous chart instance, destroy it to avoid overlapping.
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Plotting data on the chart.
    const ctx = document.getElementById('myChart').getContext('2d');
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: assetLabels,
            datasets: [{
                label: 'Total Risk Value',
                data: riskValues,
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function confirmTTPs() {
    const ttpList = document.getElementById("ttp-select");
    const selectedTTPs = [...ttpList.selectedOptions].map(option => option.value);

    // Assuming you want to allow selection of up to 5 TTPs
    if (selectedTTPs.length > 5) {
        alert("Please select only up to 5 TTPs.");
        return;
    }

    populateLikelihoodTable(selectedTTPs);
}

function populateLikelihoodTable() {
    const tbody = document.getElementById("likelihood-tbody");
    tbody.innerHTML = ""; // Clear the table

    for (let i = 1; i <= 5; i++) {
        const dropdown = document.getElementById("ttp-dropdown-" + i);
        const selectedTTP = dropdown.options[dropdown.selectedIndex].value;

        const row = tbody.insertRow();
        const ttpCell = row.insertCell(0);
        const likelihoodCell = row.insertCell(1);

        ttpCell.innerText = selectedTTP;

        const input = document.createElement("input");
        input.type = "number";
        input.min = "0";
        input.max = "100";
        likelihoodCell.appendChild(input);
    }

    // Show the likelihood input section
    document.getElementById("likelihood-section").style.display = "block";
}

function calculateTotalLikelihood() {
    const tbody = document.getElementById("likelihood-tbody");
    let totalLikelihood = 0;
    let count = 0;

    for (const row of tbody.rows) {
        const input = row.cells[1].getElementsByTagName("input")[0];
        totalLikelihood += Number(input.value);
        count++;
    }

    // Displaying the average likelihood among the selected TTPs
    document.getElementById("totalLikelihood").innerText = (totalLikelihood / count).toFixed(2);
}

var estimatedRansomAmount = 0;  
var numberOfEmployees = 0;  
var estimatedDowntime = 0;  
var hourlyWage = 0;  

function storeRansomValue() {
    estimatedRansomAmount = parseFloat(document.getElementById("estimatedRansom").value);
    console.log("Stored estimated ransom amount:", estimatedRansomAmount);
    localStorage.setItem('estimatedRansomAmount', estimatedRansomAmount);
}

function storeEmployeeCount() {
    numberOfEmployees = parseInt(document.getElementById("numberOfEmployees").value);
    console.log("Stored number of employees:", numberOfEmployees);
}

function storeDowntimeEstimate() {
    estimatedDowntime = parseFloat(document.getElementById("estimatedDowntime").value);
    console.log("Stored estimated downtime in hours:", estimatedDowntime);
}

function storeHourlyWage() {
    hourlyWage = parseFloat(document.getElementById("hourlyWage").value);
    console.log("Stored average hourly wage:", hourlyWage);
}

function calculateLostProductivity() {
    var lostProductivity = numberOfEmployees * estimatedDowntime * hourlyWage;
    console.log("Calculated Lost Productivity:", lostProductivity);
    document.getElementById("lostProductivityOutput").innerText = `£${lostProductivity.toFixed(2)}`;
}

var averageDailyProfit = 0;  // A global variable to store the user's input

function storeAverageDailyProfit() {
    averageDailyProfit = parseFloat(document.getElementById("averageDailyProfit").value);
    console.log("Stored average daily profit:", averageDailyProfit);

    // Optional: Store the value in localStorage for persistence across sessions
    localStorage.setItem('averageDailyProfit', averageDailyProfit);
}

var estimatedDowntimeDays = 0;  // A global variable to store the user's input

function storeEstimatedDowntimeDays() {
    estimatedDowntimeDays = parseFloat(document.getElementById("estimatedDowntimeDays").value);
    console.log("Stored estimated downtime in days:", estimatedDowntimeDays);

    // Optional: Store the value in localStorage for persistence across sessions
    localStorage.setItem('estimatedDowntimeDays', estimatedDowntimeDays);
}

var averageDailyProfit = 0;  // A global variable to store the user's input

function storeAverageDailyProfit() {
    averageDailyProfit = parseFloat(document.getElementById("averageDailyProfit").value);
    console.log("Stored average daily profit:", averageDailyProfit);
    
    // Optional: Store the value in localStorage for persistence across sessions
    localStorage.setItem('averageDailyProfit', averageDailyProfit);
}

function calculateLossOfProfit() {
    var lossOfProfit = averageDailyProfit * estimatedDowntimeDays;
    console.log("Calculated Loss of Profit:", lossOfProfit);

    // Displaying the calculated value to the user
    document.getElementById("lossOfProfitOutput").innerText = `£${lossOfProfit.toFixed(2)}`;
}

function calculateTotalLossMagnitude() {
    // Getting lost productivity, loss of profit and estimated ransom amount
    var lostProductivity = numberOfEmployees * estimatedDowntime * hourlyWage;
    var lossOfProfit = averageDailyProfit * estimatedDowntimeDays;

    // Summing up the values to calculate the total loss magnitude
    var totalLossMagnitude = estimatedRansomAmount + lostProductivity + lossOfProfit;

    console.log("Calculated Total Loss Magnitude:", totalLossMagnitude);

    // Displaying the calculated value to the user
    document.getElementById("totalLossMagnitudeOutput").innerText = `£${totalLossMagnitude.toFixed(2)}`;
}

function calculateEstimatedFinancialRisk() {
    // Get the Loss Event Frequency and Loss Magnitude from the DOM
    const lossEventFrequency = parseFloat(document.getElementById('lossEventFrequency').innerText);
    const totalLossMagnitude = parseFloat(document.getElementById('totalLossMagnitudeOutput').innerText.replace('£', ''));

    // Calculate the Estimated Financial Risk
    const estimatedFinancialRisk = lossEventFrequency * totalLossMagnitude;

    console.log("Calculated Estimated Financial Risk:", estimatedFinancialRisk);

    // Display the result on the webpage
    document.getElementById("estimatedFinancialRiskOutput").innerText = `£${estimatedFinancialRisk.toFixed(2)}`;
}

// Add an event listener to trigger this function whenever necessary
document.getElementById("calculateRisk").addEventListener('click', calculateEstimatedFinancialRisk);

