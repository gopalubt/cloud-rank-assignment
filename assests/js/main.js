let rowsPerPage = 10;
let currentPage = 1;
let processedDatabase;
let territoryDetails;
const userDropdown = document.getElementById("user");

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
    const { accountIndexByTerritory, callIndexByAccount, emailIndexByAccount } = processedDatabase;
    const result = [];

    // Get accounts for the specified territory
    const accounts = accountIndexByTerritory[territory] || [];

    for (const account of accounts) {
        // if (account.userId !== parseInt(userId)) continue;

        const calls = callIndexByAccount[account.id] || [];
        const emails = emailIndexByAccount[account.id] || [];

        let totalCalls = calls.length;
        let totalEmails = emails.length;

        let latestPhoneDate = totalCalls
            ? calls.reduce((latest, call) => new Date(call.callDate) > new Date(latest) ? call.callDate : latest, calls[0].callDate)
            : "N/A";

        let latestEmailDate = totalEmails
            ? emails.reduce((latest, email) => new Date(email.emailDate) > new Date(latest) ? email.emailDate : latest, emails[0].emailDate)
            : "N/A";

        result.push({
            accountName: account.name,
            totalCalls,
            totalEmails,
            latestPhoneDate: latestPhoneDate ? formatDate(latestPhoneDate) : "N/A",
            latestEmailDate: latestEmailDate ? formatDate(latestEmailDate) : "N/A",
        });
    }

    return result;
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
        <td>${row.latestPhoneDate}</td>
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
  
function getUserTerritoryDetails(){
    console.log(userDropdown.value);
    const userTerritory = userDropdown.value
    let result = getAccountDataByUser(userTerritory, processedDatabase);
    console.log({[userTerritory]: result})
    result = result.reverse()
    createTable(result, 'territoryDetails')
}


