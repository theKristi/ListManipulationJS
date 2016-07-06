function TableView(htmlTableElement) {
    this.itemList = new List();
    //TODO:Make sure this is actually a table
    this.tableElement = htmlTableElement; //the table

    // Elements for submiting selected rows and ui elements for feedback
    this.submitRowsButton = document.querySelectorAll("[data-submit-selected-for=" + this.tableElement.id + "]");
    this.submitRowsForm = document.querySelectorAll("[data-form-for=" + this.tableElement.id + "]")[0];
    this.highlightClass = this.tableElement.getAttribute("data-highlight-class");
    this.displayCountElement = document.querySelectorAll("[data-display-count-for=" + this.tableElement.id + "]")[0];
    this.clearSelectedElement = document.querySelectorAll("[data-clear-selected-for=" + this.tableElement.id + "]")[0];

    // which table elements should be used to sort. Operates through the cell index of the table row.
    this.sortOnElements = this.tableElement.querySelectorAll("[data-sort-on]");

    // Text input element for searching
    this.searchElement = document.querySelectorAll("[data-search-bar-for=" + this.tableElement.id + "]")[0];
    this.searchFilter = "";


    this.pagerElement = document.querySelectorAll("[data-pager-for=" + this.tableElement.id + "]")[0];
    if (this.pagerElement) {
        this.pagerTemplate = this.pagerElement.querySelectorAll("[data-pager-template]")[0].innerHTML;
        this.pagerElement.removeChild(this.pagerElement.querySelectorAll("[data-pager-template]")[0]);
        this.currentPageClass = this.pagerElement.getAttribute("data-active-page-class");
        this.maxDisplayedPages = ~~this.pagerElement.getAttribute("data-max-displayed-pages");
        this.itemsPerPageElement = document.querySelectorAll("[data-items-per-page-for=" + this.tableElement.id + "]")[0];
        if (this.itemsPerPageElement) {
            this.itemsPerPage = ~~this.itemsPerPageElement.value;
        } else {
            this.itemsPerPage = 5;
        }
    }

    this.currentSortElement = undefined;
    this.sortDir = true;

    this.currentPage = 0;

    for (var i = 0; i < this.sortOnElements.length; i++) {
        var span = document.createElement("span");

        if (this.sortOnElements[i].getAttribute("data-sort-icon-asc")) {
            var classes = this.sortOnElements[i].getAttribute("data-sort-icon-asc").split(" ");
            for (var css in classes) {
                span.classList.add(classes[css]);
            }
        }
        this.sortOnElements[i].appendChild(span);
    }

    this.itemList.createFromHtml(this.tableElement);
    this.SetUpEventListeners();
    this.UpdateTable();
}

TableView.prototype.SetUpEventListeners = function () {
    var self = this; // Use so event handlers can use this object.

    if (this.submitRowsButton && this.highlightClass) {
        // Handler for when the submit rows button is clicked. Requires the submitRowsForm to exist to work.
        for (var i = 0; i < this.submitRowsButton.length; i++) {
            this.submitRowsButton[i].addEventListener("click", function(event) { self.BuildAndSubmitForm(event); }, false);
        }

        var rows = this.tableElement.tBodies[0].rows;
        for (var i = 0; i < rows.length; i++) {
            //Handler for when a row is selected
            rows[i].addEventListener("click", function (event) { self.HighlightRow(event); }, false);

            if (this.displayCountElement) {
                // Handler for updating count selected display. Only works if the displayCountElement is defined
                rows[i].addEventListener("click", function (event) { self.UpdateSelectedCount(event); }, false);
            }
        }
    }

    if (this.clearSelectedElement) {
        // Handler for when a button with the [data-clear-selected-for] attribut eis pressed. Removes the selected class from each row.
        this.clearSelectedElement.addEventListener("click", function () { self.ClearSelected(); }, false);
    }

    if (this.sortOnElements) {
        for (var j = 0; j < this.sortOnElements.length; j++) {
            // Handler for when the table headers are clicked, triggering the table to sort.
            this.sortOnElements[j].addEventListener("click", function (event) { self.Sort(event); }, false);
        }
    }

    if (this.searchElement) {
        this.searchElement.addEventListener("keyup", function () { self.UpdateSearchFilter(); }, false);
    }

    if (this.itemsPerPageElement) {
        this.itemsPerPageElement.addEventListener("change", function () { self.SetItemsPerPage(); }, false);
    }
}

TableView.prototype.SetItemsPerPage = function() {
    this.itemsPerPage = ~~this.itemsPerPageElement.value;
    this.UpdateTable();
}

TableView.prototype.CreatePager = function (list) {
    RemoveChildren(this.pagerElement);
    var self = this;
    var numPages = Math.ceil(list.length / this.itemsPerPage);

    if (this.currentPage > 0) {
        var prevPageElem = document.createElement("div");
        prevPageElem.innerHTML = this.pagerTemplate.replace(new RegExp("{pagenum}", "gi"), "<<");
        this.pagerElement.appendChild(prevPageElem.children[0]);
        this.pagerElement.lastChild.addEventListener("click", function (event) {
            self.SetCurrentPage((self.currentPage > 0) ? self.currentPage - 1 : self.currentPage);
        }, false);
    }

    var startPage = 1;
    var endPage = numPages;

    if (this.maxDisplayedPages) {
        var range = CalculatePageRange(this.currentPage, numPages, this.maxDisplayedPages);
        startPage = 1 + range.start;
        endPage = range.end;
    }

    for (var i = startPage; i <= endPage; i++) {
        var template = document.createElement("div");
        template.innerHTML = this.pagerTemplate.replace(new RegExp("{pagenum}", "gi"), i);
        this.pagerElement.appendChild(template.children[0]);
        this.pagerElement.lastChild.addEventListener("click", function (event) {
            self.SetCurrentPage(event.target.innerText - 1);
        }, false);

        if (i - 1 === this.currentPage) {
            this.pagerElement.lastChild.classList.add(this.currentPageClass);
        }
    }
    if (this.currentPage < numPages - 1) {
        var nextPageElem = document.createElement("div");
        nextPageElem.innerHTML = this.pagerTemplate.replace(new RegExp("{pagenum}", "gi"), ">>");
        this.pagerElement.appendChild(nextPageElem.children[0]);
        this.pagerElement.lastChild.addEventListener("click", function (event) {
            self.SetCurrentPage((self.currentPage < numPages - 1) ? self.currentPage + 1 : self.currentPage + 0);
        }, false);
    }
}

TableView.prototype.SetCurrentPage = function (pageNum) {
    this.currentPage = pageNum;
    this.UpdateTable();
}

TableView.prototype.UpdateSearchFilter = function () {
    this.searchFilter = this.searchElement.value;
    this.UpdateTable();
}

TableView.prototype.ClearSelected = function () {
    var list = this.itemList.getList();

    for (var i = 0; i < list.length; i++) {
        list[i].html.classList.remove(this.highlightClass);
    }

    this.UpdateSelectedCount();
}

TableView.prototype.UpdateSelectedCount = function () {
    this.displayCountElement.innerHTML = this.GetSelectedRows().length;
}

TableView.prototype.GetSelectedRows = function () {
    var selectedRows = [];

    var list = this.itemList.getList();

    for (var i = 0; i < list.length; i++) {
        if (list[i].html.classList.contains(this.highlightClass)) {
            selectedRows.push(list[i].html);
        }
    }

    return selectedRows;
}

TableView.prototype.RowToInputElements = function (row, index) {
    var elements = [];

    var elems = row.querySelectorAll("[data-bind-to]");

    for (var i = 0; i < elems.length; i++) {
        if (elems[i].getAttribute("data-bind-to")) {
            var element = document.createElement("input");
            element.hidden = "hidden";

            //todo: make generic name 'list' more "settable"
            element.name = "list[" + index + "]." + elems[i].getAttribute("data-bind-to");
            element.id = "list[" + index + "]." + elems[i].getAttribute("data-bind-to");
            element.value = elems[i].innerHTML.trim();
            elements.push(element);
        }
    }

    return elements;
}

TableView.prototype.BuildAndSubmitForm = function (event) {
    var button = event.currentTarget;
    var form = document.getElementById(button.getAttribute("data-form"));

    var rows = this.GetSelectedRows();

    for (var i = 0; i < rows.length; i++) {
        var elems = this.RowToInputElements(rows[i], i);

        for (var j = 0; j < elems.length; j++) {
            form.appendChild(elems[j]);
        }
    }

    this.submitRowsForm.submit();
}

TableView.prototype.HighlightRow = function (event) {
    var element = event.currentTarget;

    if (element.classList.contains(this.highlightClass)) {
        element.classList.remove(this.highlightClass);
    } else {
        element.classList.add(this.highlightClass);
    }
}

TableView.prototype.SetSortIcons = function () {
    var headElements = this.sortOnElements;

    for (var i = 0; i < headElements.length; i++) {
        var elem = headElements[i];
        if (elem === this.currentSortElement) {
            if (this.sortDir === true) {
                elem.children[0].removeAttribute("class");
                AddClassesFromAttribute(elem, elem.children[0], "data-sort-icon-asc");
                AddClassesFromAttribute(elem, elem.children[0], "data-active-sort-classes");
            } else {
                elem.children[0].removeAttribute("class");
                
                AddClassesFromAttribute(elem, elem.children[0], "data-sort-icon-dsc");
                AddClassesFromAttribute(elem, elem.children[0], "data-active-sort-classes");
            }
            AddClassesFromAttribute(elem, elem, "data-active-sort-classes");
        } else { //not current sort element, set to asc icon
            elem.children[0].removeAttribute("class");
            AddClassesFromAttribute(elem, elem.children[0], "data-sort-icon-asc");
            RemoveClassesFromAttribute(elem, elem, "data-active-sort-classes");
        }
    }
}

TableView.prototype.Sort = function (event) {
    var element = event.currentTarget;
    var index = element.cellIndex;

    if (this.currentSortElement === element) {
        this.sortDir = !this.sortDir;
    } else {
        this.currentSortElement = element;
        this.sortDir = true;
    }

    this.SetSortIcons();

  

    this.itemList.sort(index, this.sortDir);

    this.UpdateTable();
}

TableView.prototype.UpdateTable = function () {
    var tbody = this.tableElement.tBodies[0];

    RemoveChildren(tbody);

    var list = this.itemList.search(this.searchFilter);

    var startIndex = 0;
    var endIndex = list.length;

    if (this.pagerElement) {
        if (this.currentPage < 0)
            this.currentPage = 0;

        startIndex = this.currentPage * this.itemsPerPage;
        endIndex = startIndex + this.itemsPerPage;

        while (startIndex >= list.length && startIndex > 0) {
            this.currentPage--;
            startIndex = this.currentPage * this.itemsPerPage;
        }

        this.CreatePager(list);
    }

    for (var i = startIndex; i < list.length && i < endIndex; i++) {
        tbody.appendChild(list[i].html);
    }
}

var AddClassesFromAttribute = function (element, elementToAddClassTo, attrName) {
    if (element.hasAttribute(attrName)) {
        var classes = element.getAttribute(attrName).split(" ");
        for (var i = 0; i < classes.length; i++) {
            elementToAddClassTo.classList.add(classes[i]);
        }
    }
}

var RemoveClassesFromAttribute = function (element, elementToRemoveClassesFrom, attrName) {
    if (element.hasAttribute(attrName)) {
        var classes = element.getAttribute(attrName).split(" ");
        for (var i = 0; i < classes.length; i++) {
            elementToRemoveClassesFrom.classList.remove(classes[i]);
        }
    }
}

var RemoveChildren = function (element) {
    if (element) {
        while (element.lastChild) {
            element.removeChild(element.lastChild);
        }
    }
}

var CalculatePageRange = function (current, last, range) {
    if (last < range) {
        return {
            start: 0,
            end: last
        };
    } else if (current <= range / 2) {
        return {
            start: 0,
            end: range
        };
    } else if (current >= last - (range / 2)) {
        return {
            start: last - range,
            end: last
        };
    } else {
        return {
            start: current - Math.floor(range / 2),
            end: current + Math.ceil(range / 2)
        };
    }
}

$(document).ready(function () {
    var tableViews = [];
    var tables = document.querySelectorAll("[data-sort-table]");
    for (var i = 0; i < tables.length; i++) {
        tableViews.push(new TableView(tables[i]));
    }
});