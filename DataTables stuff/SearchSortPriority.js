var PriorityColIndex;
function SetSearchSortPriorityUIElements(columnMap) {
    //get columns
    var columns = $("#tester tr>th");
    var searchableColumns = [];
    if (columns.length === columnMap.length) {
        for (var i = 0; i < columns.length; i++) {
            if (columnMap[i].bSearchable === true) {
                searchableColumns.push(columns[i]);
                CurrentSelection.push(100);
                $(columns[i]).append("<select id=" + i + " class='orderSelector'><option value=100 selected='selected'>--</option></select>");
            }
        }
        for (var j = 0; j < searchableColumns.length; j++) {
            $(".orderSelector").append("<option value=" + (j + 1) + ">" + (j + 1) + "</option>");

        }
    }
    $(".orderSelector").on("change", function () {
        var currentMenu = this;

        var priorityDropDowns = $(".orderSelector");
        for (var i = 0; i < priorityDropDowns.length; i++) {
           
            removeValues(priorityDropDowns[i], currentMenu);
            if (CurrentSelection[~~currentMenu.id] !== 100)
                addValue(CurrentSelection[~~currentMenu.id], priorityDropDowns[i], currentMenu);
        }


        CurrentSelection[~~currentMenu.id] = ~~$(currentMenu).val();
    });
}
var CurrentSelection = [];
function removeValues(menu, currentMenu) {
    if (menu !== currentMenu) {
        var selected = ~~$(currentMenu).val();
        if (selected < 100)
            $("#" + menu.id + " option[value=" + selected + "]").remove()
    }

}
function addValue(value, menu, currentMenu) {
    if (menu !== currentMenu)
        $(menu).append("<option value=" + value + ">" + value + "</option>");
}
function SearchByPriority(target) {
    //copy slections to array
    var selections = CurrentSelection.slice(0);

    for (var s = 0; s < selections.length; s++) {
        //get highest priority
        var min = Math.min.apply(null, selections);
        var index = selections.indexOf(min);
        //filter by column
        var subset = Table.column(index).search(target).rows({ filter: 'applied' });
        //set priority of result
        setSearchPriority(subset, s);
        selections[index] = 100;
        //clear search so next terms act on whole list
        Table.search('').columns().search('');
    };
    Table.search('').columns().search('');
    Table.search(target).rows({ filter: 'applied' });
    Table.order([PriorityColIndex, 'asc']);
    Table.draw();


}
function setSearchPriority(columnResults, priority) {
    for (var r = 0; r < columnResults[0].length; r++) {
        var cell = columnResults.cell(columnResults[0][r], PriorityColIndex);
        var currentPriority = cell.data();
        if (currentPriority === ""||currentPriority==undefined)
            cell.data(priority).draw();
        else {
            currentPriority = ~~currentPriority;
            if (currentPriority > priority)
                cell.data(priority).draw();
        }


    }

}



