$(document).ready(
   function() {
        /*** Building view object***/
        var tableView = new TableView();
        tableView.tableSelector = " .sortable";
        tableView.rowSelector = " .sortable tr";
        tableView.tableBodySelector = ".sortable tbody";
        tableView.pagerUISelector = ".pagination";
        tableView.numRecordsSelector = "#recordsPerPage";
        tableView.headersSelector = ".header";
        tableView.searchSelector = "#search";
        tableView.sortIconAscending = "icon-sort_down gray lg";
        tableView.sortIconDescending = "icon-sort_up gray lg";
        tableView.submitFormSelector = ".submitRows";
        tableView.submitButtonSelector = ".submitButton";
        tableView.clearSelectionSelector = ".clearSelected";
        tableView.highlightCssClass = "outline";
        tableView.numSelectedSelector = "numSelected";
        tableView.setUpHighlightRow();
        tableView.createList();
        tableView.buildPager();
        tableView.setUpPager();
        tableView.setUpSortSearchEvents();
        tableView.setUpSubmitSelected();
       
        /**End Building view Object**/
        /**Tab functionality**/
        if ($("#tabUI").get(0)) {
            if (tableView.list.getList()[0]["Active?"]!==undefined) {
                var inactiveList = tableView.list.search(["Active?"], "false");
                var activeList = tableView.list.search(["Active?"], "true");
                $("#activeTab").addClass('active');
                tableView.list.setList(activeList);
                tableView.displayed = activeList;
                tableView.buildTable();
                tableView.buildPager();
                tableView.setUpPager();

                $("#tabUI li").click(function() {
                    $(this).siblings().removeClass('active');
                    $(this).addClass('active');
                    if (this.id === "inactiveTab") {
                        tableView.list.setList(inactiveList);
                        tableView.displayed = inactiveList;
                    } else {
                        tableView.list.setList(activeList);
                        tableView.displayed = activeList;
                    }

                    tableView.buildTable();
                    tableView.buildPager();
                    tableView.setUpPager();
                    tableView.removeSortIcons();
                    tableView.resetSearch();

                });
            }
        }
       
   });
 