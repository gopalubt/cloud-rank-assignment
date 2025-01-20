

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
    const accountIndexByTerritory = {}; // Territory -> Accounts
    const callIndexByAccount = {};     // AccountId -> Calls
    const emailIndexByAccount = {};    // AccountId -> Emails

    // Index accounts by territory
    for (const account of accounts) {
        if (!accountIndexByTerritory[account.territory]) {
            accountIndexByTerritory[account.territory] = [];
        }
        accountIndexByTerritory[account.territory].push(account);
    }

    // Index calls by accountId
    for (const call of calls) {
        if (!callIndexByAccount[call.accountId]) {
            callIndexByAccount[call.accountId] = [];
        }
        callIndexByAccount[call.accountId].push(call);
    }

    // Index emails by accountId
    for (const email of emails) {
        if (!emailIndexByAccount[email.accountId]) {
            emailIndexByAccount[email.accountId] = [];
        }
        emailIndexByAccount[email.accountId].push(email);
    }

    return { accountIndexByTerritory, callIndexByAccount, emailIndexByAccount };
}



