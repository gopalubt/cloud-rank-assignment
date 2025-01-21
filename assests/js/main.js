let rowsPerPage = 10;
let currentPage = 1;
let processedDatabase = null;
let territoryDetails= null;
let callAnalysis= null;
let territorialCallAnalysis= null
const userDropdown = document.getElementById("user");
const ctx = document.getElementById('myChart').getContext('2d');

const populateUserDropdown = (users) => {
  const fragment = document.createDocumentFragment(); 
  users.forEach(user => {
      const option = document.createElement("option");
      option.value = user.territory;
      option.textContent = user.userName;
      fragment.appendChild(option);
  });

  userDropdown.appendChild(fragment);
};
// load processed data from db.js  
loadData().then((data) => {
  if (data) {
      const { users, accounts, calls, emails } = data;
      console.log("All data loaded successfully:", data);
      processedDatabase = createIndexes(accounts, calls, emails);
      console.log({processedDatabase})
    
      populateUserDropdown(users);
  }
});




const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0'); // Add leading zero if needed
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed, so add 1
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
};

function getAccountDataByUser(territory, processedDatabase) {
    const { accountIndexByTerritory, proccessedCallData, callIndexedSummary, emailIndexedSummury } = processedDatabase;
    // Get accounts for the specified territory
    const accounts = accountIndexByTerritory[territory] || [];
  
    for (const account of accounts) {
      account['totalCalls'] = callIndexedSummary[account.id]['totalCalls']
      account['latestCallDate'] = callIndexedSummary[account.id]['latestCallDate']
      
      account['totalEmails'] = emailIndexedSummury[account.id]['totalEmails']
      account['latestEmailDate'] = emailIndexedSummury[account.id]['latestEmailDate']
      
    }

    return accounts;
}
// Function to create the table
function createTable(data, tableId) {
    // const tableContainer = document.getElementById('territoryDetails');
    const tableContainer = document.getElementById(tableId);
    tableContainer.innerHTML = '';
  
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');
  
    // Table header
    thead.innerHTML = `
      <tr>
        <th>Account Name</th>
        <th>Total Calls</th>
        <th>Total Emails</th>
        <th>Latest Call Date</th>
        <th>Latest Email Date</th>
      </tr>
    `;
  
    // Table body (current page data)
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pageData = data.slice(startIndex, endIndex);
  
    pageData.forEach(row => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${row.accountName}</td>
        <td>${row.totalCalls}</td>
        <td>${row.totalEmails}</td>
        <td>${row.latestCallDate}</td>
        <td>${row.latestEmailDate}</td>
      `;
      tbody.appendChild(tr);
    });
  
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
  }
  
  // Function to create pagination controls
  function createPagination(totalItems) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
  
    const totalPages = Math.ceil(totalItems / rowsPerPage);
  
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement('button');
      button.textContent = i;
      button.classList.toggle('active', i === currentPage);
      button.disabled = i === currentPage;
  
      button.addEventListener('click', () => {
        currentPage = i;
        updateTableAndPagination();
      });
  
      pagination.appendChild(button);
    }
  }
  
  // Function to update the table and pagination
  function updateTableAndPagination() {
    createTable(data);
    createPagination(data.length);
  }
  
function onChangeUser(){
    console.log(userDropdown.value);
    const userTerritory = userDropdown.value;
    // analysis  
    getTerritorialAnalysis(userTerritory, processedDatabase.proccessedCallData)
    // territorial data details 
    territoryDetails = getAccountDataByUser(userTerritory, processedDatabase);
    
    console.log({[userTerritory]: territoryDetails})
    result = territoryDetails.reverse()
    createTable(territoryDetails, 'territoryDetails')
}
function getTerritorialAnalysis(territory, analysisDetails){
  territorialCallAnalysis = processedDatabase.proccessedCallData[territory]
  console.log({territorialCallAnalysis});
  createChart(ctx, territorialCallAnalysis)
}
function createChart(ctx, dataSet) {
  const labels = [];
  const dataValues = [];
  for (let key in dataSet) {
    labels.push(key);
    dataValues.push(dataSet[key].length);
  }

  const myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Dataset',
          data: dataValues,
          backgroundColor: [
            'rgb(210, 237, 255)',
            'rgb(35, 116, 170)',
            'rgb(178, 217, 243)',
            'rgb(54, 162, 235)',
            'rgb(8, 149, 243)',
          ],
          hoverOffset: 4,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
              const percentage = ((value / total) * 100).toFixed(2);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
        title: {
          display: true,
          text: 'Custom Chart Title',
        },
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const segmentIndex = elements[0].index;
          const label = myChart.data.labels[segmentIndex];
          const callTypeData = dataSet[label] || [];
          console.log({[label]:callTypeData})
          createTable(callTypeData, 'callAnalysis')
        }
      },
    },
  });
}
