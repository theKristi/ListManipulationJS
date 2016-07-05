//This class does all the talking to the view and is jquery dependant
var TableView = function () {
    this.list = new List();
    this.pages = [];
    this.displayed = [];
    this.sortIconAscending = '';
    this.sortIconDesscending = '';
    this.displayedSortedOn = '';
    this.rowSelector = '';
    this.tableBodySelector = '';
    this.tableSelector = '';
    this.pagerUISelector = '';
    this.headersSelector = '';
    this.numRecordsSelector = '';
    this.searchSelector = '';
    this.asc = true;
    this.selectedRows = [];
    this.highlightCssClass = '';
    this.submitFormSelector = '';
    this.submitButtonSelector = '';
    this.clearSelectionSelector = '';
}

TableView.prototype.createList = function() {
    if (this.rowSelector !== '' && this.rowSelector !== null && this.rowSelector !== undefined) {
        this.list.createFromHtml($(this.rowSelector));
        this.displayed = this.list.getList();
        this.displayedSortedOn = undefined;
    }
}

TableView.prototype.buildTable = function(filteredlist) {
    if (filteredlist === undefined)
        filteredlist = this.list.getList();
    $(this.rowSelector + ":not(:first)").remove();
    for (var i = 0; i < filteredlist.length; i++) {
        $(this.tableBodySelector).append(filteredlist[i].html);
        
    }
    this.setUpHighlightRow();
}

TableView.prototype.goToPage = function(event) {
    var view = event.data[0];
    var currentPage = $(this).parent().siblings(".active")[0];
    $(currentPage).removeClass("active");
    var page = currentPage;
    switch (this.id) {
    case "prev":
        if (parseInt(currentPage.innerText) > 1)
            page = currentPage.previousSibling;
        break;
    case "next":
        if (parseInt(currentPage.innerText) < view.pages.length)
            page = currentPage.nextSibling;
        break;
    default:
        page = $(this).parent()[0];

    }

    $(page).addClass("active");

    var index = parseInt(page.innerText) - 1;
    view.buildTable(view.pages[index]);

}

TableView.prototype.searchList = function() {
    var target = $(this.searchSelector).val();

    var headers = this.list.getHeadersFromHtml($(this.headersSelector));

    var filtered = this.list.search(headers, target);
    this.displayed = filtered;
    if (this.displayedSortedOn !== undefined) {
        //resort displayed
        this.displayed = this.list.sort(this.displayed, this.displayedSortedOn, this.asc);
    }

    this.buildTable(this.displayed);
    this.buildPager();
    this.setUpPager();



}

TableView.prototype.sortList = function(attr) {
    if (this.displayedSortedOn === attr)
        this.asc = !this.asc;
    else {
        this.asc = true;
    }

    this.displayed = this.list.sort(this.displayed, attr, this.asc);
    this.displayedSortedOn = attr;
    this.buildTable(this.displayed);
    this.buildPager();
    this.setUpPager();
   
}

TableView.prototype.removeSortIcons= function(){
    $("#sort").remove();
}

TableView.prototype.addSortIconToHeader = function(header, asc) {
    $("#sort").remove();
    var icon = this.sortIconAscending;
    if (!asc)
        icon = this.sortIconDescending;
    $(header).append("<span id=sort class='" + icon + "'></span>");
}

TableView.prototype.buildPager = function () {
    if ($(this.pagerUISelector).get(0)) {
        var entriesPerPage = parseInt($(this.numRecordsSelector).val());
        var pagerUI = $(this.pagerUISelector);
        if (pagerUI.length > 0) {
            pagerUI.empty();

            var numPages = Math.floor(this.displayed.length / entriesPerPage);
            if (this.displayed.length % entriesPerPage !== 0)
                numPages++;
            for (var i = 1; i <= numPages; i++)
                $(this.pagerUISelector).append("<li id=" + "page" + i + "><a>" + i +
                    "</a></li>");
            if (numPages > 1) {
                pagerUI.prepend("<li><a id='prev' aria-label=Previous>" +
                    "<span aria-hidden=true>&laquo;</span>" +
                    "</a></li>");
                pagerUI.append("<li><a id='next' aria-label=Next>" +
                    "<span aria-hidden=true>&raquo;</span>" +
                    "</a></li>");
            }

        }
    }
}

TableView.prototype.setUpPager = function() {
    if ($(this.pagerUISelector).get(0)) {
        var entriesPerPage = parseInt($(this.numRecordsSelector).val());
        this.pages = this.list.toPages(this.displayed, entriesPerPage);
        $(this.pagerUISelector + " li a").click([this], this.goToPage);
        $(this.pagerUISelector+" #page1").addClass("active");
        this.buildTable(this.pages[0]);
    }
}

TableView.prototype.setUpSortSearchEvents= function() {
    $(this.headersSelector).click([this], function (event) {
        var tableView = event.data[0];
        var attr = this.innerText.trim();
        tableView.sortList(attr);
        tableView.addSortIconToHeader(this, tableView.asc);
    });

    $(this.searchSelector).keyup([this], function (event) {
        var tableView = event.data[0];
        tableView.searchList();
    });

}

TableView.prototype.setUpHighlightRow= function() {
    if ($(this.tableSelector).hasClass('highlightRow')) {
        $(this.rowSelector + ":not(:first)").click([this], function (event) {
            var tableView = event.data[0];
            var selecting = tableView.list.search(["html"], this.innerHTML)[0];
            //toggle class on all cells in row
            $(this).toggleClass(tableView.highlightCssClass);
           
            if (tableView.selectedRows.indexOf(selecting) <= -1) {

                tableView.selectedRows.push(selecting);
            } else {

                tableView.selectedRows.splice(tableView.selectedRows.indexOf(selecting), 1);
            }
            selecting.html = this.outerHTML;
           

        });
     
    }
}

TableView.prototype.resetSearch= function() {
    $(this.searchSelector).val('');
}
/* Non-generic*/
TableView.prototype.setUpSubmitSelected = function() {
    if ($(this.submitFormSelector).length > 0) {

        var button = $(this.submitButtonSelector);
        button.click([this], function(event) {
            var tableView = event.data[0];
            var selected = tableView.selectedRows;
            var i = 0;
            if (selected.length > 0) {
                selected.forEach(function(obj) {
                    delete obj.html;
                    //delete obj.Action;

                    for (var prop in obj) {
                        var propertyValue = obj[prop].toString();
                        if (prop !== '')
                            $(tableView.submitFormSelector).prepend("<input hidden='hidden' name='list" + "[" + i + "]." + prop + "' value='" + propertyValue + "'>");
                    }

                    i++;
                });

                $(tableView.submitFormSelector).submit();
            }
        });
        if ($(this.clearSelectionSelector).length > 0) {
            $(this.clearSelectionSelector).click([this], function(event) {
                var tableView = event.data[0];
                var selected = tableView.selectedRows;
                selected.forEach(function(row) {
                    var s = 'class=' + '"' + tableView.highlightCssClass + '"';
                    row.html = row.html.replace(s, '');
                });
                $(tableView.rowSelector).removeClass(tableView.highlightCssClass);
                tableView.selectedRows = [];

            });
        }
    }
}