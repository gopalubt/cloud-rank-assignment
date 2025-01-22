let rowsPerPage = 12;
let currentPage = 1;
let processedDatabase = null;
let territoryDetails= [];
let callAnalysis= null;
let territorialCallAnalysis= null;
let selectedCallAnalysisLabel = ''
const userDropdown = document.getElementById("user");
let existingChart = null;
Chart.register(ChartDataLabels);

const populateUserDropdown = (users) => {
  const fragment = document.createDocumentFragment(); 
  users.forEach(user => {
      const option = document.createElement("option");
      // option.value = user.territory;
      option.value = JSON.stringify(user);
      option.textContent = user.userName;
      fragment.appendChild(option);
  });

  userDropdown.appendChild(fragment);
};
// load processed data from db.js  
loadData().then((data) => {
  if (data) {
      const { users, accounts, calls, emails } = data;
      processedDatabase = createIndexes(accounts, calls, emails);
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
function createTable( data, tableId ) {
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
        <td>${row.name}</td>
        <td>${row.totalCalls}</td>
        <td>${row.totalEmails}</td>
        <td>${formatDate(row.latestCallDate)}</td>
        <td>${formatDate(row.latestEmailDate)}</td>
      `;
      tbody.appendChild(tr);
    });
  
    table.appendChild(thead);
    table.appendChild(tbody);
    tableContainer.appendChild(table);
  }

function getTerritorialAnalysis(territory, analysisDetails){
  territorialCallAnalysis = analysisDetails[territory]
  console.log({territorialCallAnalysis});
  document.querySelector('.details-box').classList.add('d-none')
  createChart(territorialCallAnalysis);
}
function createChart(dataSet) {
  const ctx = document.getElementById('myChart').getContext('2d');
  if (existingChart) {
    existingChart.destroy();
  }

  const labels = ['Face to Face', 'InPerson', 'Email', 'Phone', 'Other'];
  const dataValues = [];
  for (let key of labels) {
    // labels.push(key);
    dataValues.push(dataSet[key].length);
  }

  existingChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Dataset',
          data: dataValues,
          backgroundColor: [
            'rgb(25, 118, 210)',
            'rgb(40, 136, 231)',
            'rgb(144, 202, 249)',
            'rgb(100, 181, 246)',
            'rgb(60, 166, 252)',
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
          labels: {
              boxWidth: 10,
              boxHeight: 10,
              padding: 5,
              font: {
                  size: 12,
                  weight: 'bold'
              },
              color: 'rgb(13, 65, 213)'
          }
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
        // title: {
        //   display: true,
        //   text: 'Custom Chart Title',
        // },
        datalabels: {
          color: 'rgb(13, 65, 213)', // Label color
          font: {
              size: 12,
              weight: 'bold'
          },
          formatter: (value, context) => {
            const label = context.chart.data.labels[context.dataIndex];
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label} (${percentage}%)`;
          },
         
          anchor: 'start', // Position labels outside the chart
          align: 'end',    // Align labels at the outside
          offset: 100  
      }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const segmentIndex = elements[0].index;
          selectedCallAnalysisLabel = e.chart.legend.legendItems[segmentIndex].text;
          const callTypeData = dataSet[selectedCallAnalysisLabel] || [];
          document.getElementById('selected-chartLabel').innerText = `${selectedCallAnalysisLabel}`;
          // createCallAnalysisTable(callTypeData, 'callAnalysis')
          document.querySelector('.details-box').classList.remove('d-none')
          const analysisPagination = new Pagination(callTypeData, 12, 'analysis-pagination', createCallAnalysisTable, 'callAnalysis' );
        }
      },
    },
  });
}
function createCallAnalysisTable(data, tableId ) {
  const tableContainer = document.getElementById(tableId);
  tableContainer.innerHTML = '';

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const tbody = document.createElement('tbody');
  
  // Table header
  thead.innerHTML = `
    <tr>
      <th>Call ID</th>
      <th>Account Name</th>
      <th>Call Date</th>
      <th>Call Status</th>
    </tr>
  `;

  // Table body (current page data)
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const pageData = data.slice(startIndex, endIndex);

  pageData.forEach(row => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${row.id}</td>
      <td>${row.accountName}</td>
      <td>${formatDate(row.callDate)}</td>
      <td>${row.callStatus}</td>
      
    `;
    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);
  tableContainer.appendChild(table);
}
const territorialPagination = new Pagination(territoryDetails, 12, 'pagination', createTable, 'territoryDetails' );
const userSelected = document.getElementById('selected-user');
const blockHeading = document.querySelectorAll('.block-header.shadow-1');
const contentBlocks = document.querySelectorAll('.block-content');
function onChangeUser(){
 
    if(!userDropdown.value){
      blockHeading.forEach(ele=> ele.classList.remove('d-none'));
      contentBlocks.forEach(ele=> ele.classList.add('d-none'));

    }else{
      blockHeading.forEach(ele=> ele.classList.add('d-none'));
      contentBlocks.forEach(ele=> ele.classList.remove('d-none'));
    }
    const user = JSON.parse(userDropdown.value);
    const userTerritory = user.territory;
    const userName = user.userName;
    
    // territorial data details 
    userSelected.innerText = `${userName}'s`;
    territoryDetails = getAccountDataByUser(userTerritory, processedDatabase);    
    territorialPagination.refresh(territoryDetails );
    // analysis  
    getTerritorialAnalysis(userTerritory, processedDatabase.proccessedCallData)

}
