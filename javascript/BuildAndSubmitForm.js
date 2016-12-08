var SelectedRecords = [];
$('*[data-select-table]').on("Select", function (e) {
    var len = SelectedRecords.length;
    if (e.detail.action === "Select") {
        SelectedRecords.push(e.detail.record);
        $("#noUsers").hide();
    } else {
        var map = SelectedRecords.map(function(element, index, array) {
            //compare element and e.detail.record
            var props = Object.getOwnPropertyNames(element);
            var equal = true;
            for (var i = 0; i < props.length; i++) {
                if (element[props[i]] !== e.detail.record[props[i]]) {
                    equal = false;
                }
            }
            return equal;
        });
        var index = map.indexOf(true);

        SelectedRecords.splice(index, 1);


    }
    var id = e.currentTarget.id;
    var labels = document.querySelectorAll('[data-display-count-for=' + "'" + id + "']");
    for (var j = 0; j < labels.length; j++) {
        $(labels[j]).text(SelectedRecords.length);
    }
});
$('*[data-select-table]').on("ClearSelected", function (e) {
    var id = e.currentTarget.id;
    SelectedRecords = [];
    var labels = document.querySelectorAll('[data-display-count-for=' + "'" + id + "']");
    for (var j = 0; j < labels.length; j++) {
        $(labels[j]).text(SelectedRecords.length);
    }
});
$('*[data-select-table]').on("SubmitSelected", function (e) {
    var id = e.currentTarget.id;
    var form = document.getElementById(e.detail.clicked.getAttribute("data-form"));
    for (var record = 0; record < SelectedRecords.length; record++) {
        var elems = RowToInputElements(SelectedRecords[record].html, record);

        for (var j = 0; j < elems.length; j++) {
            form.appendChild(elems[j]);
        }
    }
    form.submit();
});
function RowToInputElements(row, index) {
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
