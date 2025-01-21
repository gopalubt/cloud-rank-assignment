function createPaginator(containerId, totalPages, onPageChange) {
    let currentPage = 1;

    const container = document.getElementById(containerId);

    // Create buttons and page info display
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Previous';
    prevButton.disabled = true;

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Next';

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;

    // Append elements to container
    container.classList.add('paginator');
    container.appendChild(prevButton);
    container.appendChild(pageInfo);
    container.appendChild(nextButton);

    // Event listeners for buttons
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updatePaginator();
        }
    });

    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updatePaginator();
        }
    });

    // Update paginator UI and trigger callback
    function updatePaginator() {
        pageInfo.textContent = `Page ${currentPage} / ${totalPages}`;
        prevButton.disabled = currentPage === 1;
        nextButton.disabled = currentPage === totalPages;
        onPageChange(currentPage); // Call the provided callback
    }

    // Initialize paginator
    updatePaginator();
}

// Example usage
createPaginator('paginator-container', 10, (currentPage) => {
    console.log(`Current Page: ${currentPage}`);
    // You can add your logic here to fetch data or update the UI for the current page.
});