

// Centralized fetch function with error handling
const fetchData = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Error fetching the file from ${url}:`, error);
        return null; // Return null to handle errors gracefully
    }
};

// Function to fetch all data in parallel
const loadData = async () => {
    const urls = {
        users: '/assests/data/users.json',
        accounts: '/assests/data/accounts.json',
        calls: '/assests/data/calls.json',
        emails: '/assests/data/emails.json'
    };

    try {
        // Fetch all data in parallel
        const [users, accounts, calls, emails] = await Promise.all(
            Object.values(urls).map(fetchData)
        );

        // Check if any dataset is null (indicates a fetch error)
        if (!users || !accounts || !calls || !emails) {
            console.error("Failed to load one or more datasets.");
            return;
        }


        // Return all loaded data for further processing
        return { users, accounts, calls, emails };
    } catch (error) {
        console.error("Error loading data:", error);
    }
};

function createIndexes(accounts, calls, emails) {
    const accountIndexByTerritory = {};  // catergorise account by territory;
    const accountIndexById={}    //account indexed with id
    const callIndexedSummary={}  // call indexed with account id and summary count with latestdate
    const proccessedCallData={} //categorised with region then callTypes
    const emailIndexedSummury={} //email summary by region and account id

    // Index accounts by territory and id
    for (const account of accounts) {
        if (!accountIndexByTerritory[account.territory]) {
            accountIndexByTerritory[account.territory] = [];
        }
        accountIndexByTerritory[account.territory].push(account);
        // ac id indexing 
        accountIndexById[account.id]= account
    }
    
    // Index calls by accountId
    for (const call of calls) {
        // call map with account territory and name 
        call['accountName'] = accountIndexById[call.accountId]['name'];
        call['territory']= accountIndexById[call.accountId]['territory'];
        
       
        if(!callIndexedSummary[call.accountId]){
            callIndexedSummary[call.accountId] = {
                accountName: call['accountName'],
                totalCalls : 0,
                latestCallDate : call.callDate
            };
        }
        callIndexedSummary[call.accountId]['totalCalls']++ ;
        let latest =  callIndexedSummary[call.accountId]['latestCallDate'];
        callIndexedSummary[call.accountId]['latestCallDate']  = new Date(call.callDate) > new Date(latest) ? call.callDate : latest;
       
        if(!proccessedCallData[call['territory']]){
            proccessedCallData[call['territory']] = {}
        }
        if(!proccessedCallData[call['territory']][call.callType]){
            proccessedCallData[call['territory']][call.callType] = []
        }
        proccessedCallData[call['territory']][call.callType].push(call)
    }
    console.log({proccessedCallData, callIndexedSummary})

    // Index emails by accountId
   
    for (const email of emails) {
       
        if(!emailIndexedSummury[email.accountId]){
            emailIndexedSummury[email.accountId] = {
                totalEmails : 0,
                latestEmailDate : email.emailDate
            };
        }
        
        emailIndexedSummury[email.accountId]['totalEmails']++ ;
        let latest =  emailIndexedSummury[email.accountId]['latestEmailDate'];
        emailIndexedSummury[email.accountId]['latestEmailDate']  = new Date(email.emailDate) > new Date(latest) ? email.emailDate : latest;
       
    }
    console.log({emailIndexedSummury})
    // { accountIndexByTerritory, callIndexByAccount, emailIndexByAccount, accountIndex };
    return { accountIndexByTerritory, proccessedCallData, callIndexedSummary, emailIndexedSummury };
}



