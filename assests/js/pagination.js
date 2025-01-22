class Pagination {
    constructor(items, itemsPerPage, paginationId, callbackFn, containerId) {
      this.items = items;
      this.itemsPerPage = itemsPerPage;
      this.currentPage = 1;
      this.totalPages = Math.ceil(items.length / itemsPerPage);
      this.container = containerId;
      this.pagination = document.getElementById(paginationId);
      this.callbackFn = callbackFn;

      this.renderItems();
      this.renderPagination();
    }
  
    renderItems(cb) {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
  
      const tableData = this.items.slice(start, end);
      if (this.callbackFn && typeof this.callbackFn === 'function') {
        this.callbackFn(tableData, this.container);
      }
    }
  
    renderPagination() {
      this.pagination.innerHTML = '';
      const maxVisiblePages = 5;
      let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
  
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
  
      // Previous button
      const prevButton = document.createElement('button');
      prevButton.textContent = 'Previous';
      prevButton.className =  'pagination-prev-btn';
      prevButton.disabled = this.currentPage === 1;
      prevButton.onclick = () => this.changePage(this.currentPage - 1);
      this.pagination.appendChild(prevButton);

      // page info 
      const pageInfo = document.createElement('span');
      pageInfo.textContent = `${this.currentPage}/${this.totalPages}`
      pageInfo.className =  'pagination-pg-info';
      this.pagination.appendChild(pageInfo);
      
  
      // Next button
      const nextButton = document.createElement('button');
      nextButton.textContent = 'Next';
      prevButton.className =  'pagination-next-btn';
      nextButton.disabled = this.currentPage === this.totalPages;
      nextButton.onclick = () => this.changePage(this.currentPage + 1);
      this.pagination.appendChild(nextButton);
    }
  
    changePage(page) {
      if (page < 1 || page > this.totalPages) return;
      this.currentPage = page;
      this.renderItems();
      this.renderPagination();
    }
    refresh(newItems, newItemsPerPage) {
      this.items = newItems || this.items; 
      this.itemsPerPage = newItemsPerPage || this.itemsPerPage; 
      this.currentPage = 1;
      this.totalPages = Math.ceil(this.items.length / this.itemsPerPage); 
  
      this.renderItems(() => {}); 
      this.renderPagination(); 
    }
  }
  