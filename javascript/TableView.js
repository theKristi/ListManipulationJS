var TableView = function (tableElement) {
    this.list = new List();
    this.tableElement = tableElement;
    this.sortOnElements = this.tableElement.querySelectorAll("[data-sort-on]");
    this.SetSortIcons();
    this.searchElements = document.querySelectorAll("[data-search-bar-for=" + this.tableElement.id + "]");
    var submitSearch = document.querySelectorAll("[data-submit-search-bar-for=" + this.tableElement.id + "]")
    if (submitSearch.length > 0)
        this.submitSearch = submitSearch;
    this.highlightClass = this.tableElement.getAttribute("data-highlight-class");
    this.searchFilter = "";
    this.list.createFromHtml(this.tableElement);
    this.displayed = this.list.getList();
    this.displayedSortedOn = undefined;
    var clearSelected = document.querySelectorAll("[data-clear-selected-for=" + this.tableElement.id + "]");
    if (clearSelected.length>0)
        this.clearSelected = clearSelected;
    var submitButtons = document.querySelectorAll("[data-submit-selected-for=" + this.tableElement.id + "]");
    if (submitButtons.length > 0)
        this.submitButtons = submitButtons;
    var pagerElement = document.querySelectorAll("[data-pager-for=" + this.tableElement.id + "]")[0];
    if (pagerElement) {
        this.pagerElement = pagerElement;
        this.setUpPagerAttributes();
        this.currentPage = 0;
        this.goToPage = function (page) {
			if(page<0||page>this.pages.length)
				throw "goToPage called with invalid index "+page;
            if (this.pages) {
                this.currentPage = page;
                this.buildTable(this.pages[page]);
					//update label
				var startingrecord=this.itemsPerPage*page+1
				var labelString="Showing records "+startingrecord +" to "+ (startingrecord+this.pages[page].length-1)+" of "+this.displayed.length
				if(this.displayed.length!=this.list.getList().length)
					labelString+="(Filtered from "+this.list.getList().length+")"
				document.getElementById("showRecords").innerHTML=labelString
                this.SetUpEventListeners();
            }
        }
        this.buildPager();

    }
    this.SetUpEventListeners();

}
TableView.prototype.SetSortIcons = function () {
    var headElements = this.sortOnElements;

    for (var i = 0; i < headElements.length; i++) {
        var elem = headElements[i];
        if (elem === this.currentSortElement) {
            if (this.asc) {
                elem.children[0].removeAttribute("class");
                this.AddClassesFromAttribute(elem, elem.children[0], "data-sort-icon-asc");
                this.AddClassesFromAttribute(elem, elem.children[0], "data-active-sort-classes");
            } else {
                elem.children[0].removeAttribute("class");

                this.AddClassesFromAttribute(elem, elem.children[0], "data-sort-icon-dsc");
                this.AddClassesFromAttribute(elem, elem.children[0], "data-active-sort-classes");
            }
            this.AddClassesFromAttribute(elem, elem, "data-active-sort-classes");
        } else { //not current sort element, set to asc icon
            if(elem.children.length>0)
            elem.children[0].removeAttribute("class");
            this.AddClassesFromAttribute(elem, elem.children[0], "data-sort-icon-asc");
            this.RemoveClassesFromAttribute(elem, elem, "data-active-sort-classes");
        }
    }
}
TableView.prototype.buildTable = function (filteredlist) {
    if (filteredlist === undefined)
        filteredlist = this.list.getList();

    var tbody = this.tableElement.tBodies[0];
    if (tbody)
        this.RemoveChildren(tbody);

    for (var i = 0; i < filteredlist.length; i++) {
        tbody.appendChild(filteredlist[i].html);

    }

}
TableView.prototype.update = function (newList) {
    this.buildTable(newList);
    if (this.pagerElement) {
        this.buildPager();
    }
    this.SetUpEventListeners();
}

TableView.prototype.Sort = function (attr) {
    if (this.displayedSortedOn === attr.currentTarget.innerText)
        this.asc = !this.asc;
    else {
        this.asc = true;
    }

    this.currentSortElement = attr.currentTarget;
    this.SetSortIcons();

    var sorted = this.list.sort(this.displayed, attr.currentTarget.innerText, this.asc);
    this.displayedSortedOn = attr.currentTarget.innerText;
    this.update(sorted);
    var sortedEvent = document.createEvent("CustomEvent");
    sortedEvent.initCustomEvent("Sorted", true, true,  { 'attribute': this.displayedSortedOn, 'ascending': this.asc, "element": attr.currentTarget });
    //var sortedEvent = new CustomEvent("sorted", { 'detail': { 'attribute': this.displayedSortedOn, 'ascending': this.asc, "element": attr.currentTarget } });
    this.tableElement.dispatchEvent(sortedEvent);

  
}

TableView.prototype.Search = function (element) {
    var filter=element.value;
    //get properties tied to this by id
    var regexs=this.BuildSearchExpressions();
	var properties=[];
	document.querySelectorAll("[search-attribute-for=" + element.id + "]").forEach(function(header){
		 properties[header.cellIndex]=header.innerText.replace(/\s+/g, '');
	});
    var filteredList = this.list.search(filter, properties)
	  var searchEvent = document.createEvent("CustomEvent");
    searchEvent.initCustomEvent("Searched", false, true,  { 'input':element,'attributes': properties, 'results': filteredList, 'target':filter});
    this.tableElement.dispatchEvent(searchEvent);


    if (this.displayedSortedOn)
        this.displayed = this.list.sort(filteredList, this.displayedSortedOn,this.asc);
    else
        this.displayed = filteredList;
    this.update(this.displayed);
	
}

TableView.prototype.SelectRow = function (event) {
    var element = event.currentTarget;
    var clickedRecord = this.list.search(element, ["html"])[0];
    var recordClickedEvent;
    if (element.classList.contains(this.highlightClass)) {
        recordClickedEvent = document.createEvent("CustomEvent");
        recordClickedEvent.initCustomEvent("Select", true, true,  { "action": 'Deselect', 'record': clickedRecord } );
        
        element.classList.remove(this.highlightClass);

    } else {
       
        recordClickedEvent = document.createEvent("CustomEvent");
        recordClickedEvent.initCustomEvent("Select", true, true,   { "action": 'Select', 'record': clickedRecord } );
        element.classList.add(this.highlightClass);

    }
    
    //window.CustomEvent = recordClickedEvent;
    this.tableElement.dispatchEvent(recordClickedEvent);
}
TableView.prototype.ClearSelected= function(event) {

    var list = this.list.getList();

    for (var i = 0; i < list.length; i++) {
        if (list[i].html.classList.contains(this.highlightClass)) {
            list[i].html.classList.remove(this.highlightClass);

        }
       
        
    }
    var clearEvent = document.createEvent("CustomEvent");
    clearEvent.initCustomEvent("ClearSelected",true, true, {});
    this.tableElement.dispatchEvent(clearEvent);
}
TableView.prototype.SubmitSelected= function(event) {
    var submitEvent = document.createEvent("CustomEvent");
    submitEvent.initCustomEvent("SubmitSelected", true, true, { "clicked": event.currentTarget });
        //new CustomEvent("SubmitSelected", { 'detail': { "clicked": event.currentTarget } });
    this.tableElement.dispatchEvent(submitEvent);
}
TableView.prototype.buildPager = function () {
    this.RemoveChildren(this.pagerElement);
    var self = this;
	this.pages = this.list.toPages(this.itemsPerPage, this.displayed);
	if(this.currentPage>=this.pages.length)
		this.currentPage=this.pages.length-1;
    var startPage = 1;
    var endPage = this.pages.length;
    if (this.maxDisplayedPages) {

        var range = this.CalculatePageRange();
        var startPage = range.start + 1;
        var endPage = range.end;

    }
    for (var i = startPage; i <= endPage; i++) {
        var template = document.createElement("div");
        template.innerHTML = this.pagerTemplate.replace(new RegExp("{pagenum}", "gi"), i);
        this.pagerElement.appendChild(template.children[0]);
        this.pagerElement.lastChild.addEventListener("click", function (event) {

            self.goToPage(this.innerText - 1);
            self.buildPager();

        }, false);

        if (i - 1 === this.currentPage) {
            self.pagerElement.lastChild.classList.add(this.currentPageClass);

        }

    }
	self.itemsPerPageElement.value=localStorage.getItem("itemsPerPage")

    self.goToPage(this.currentPage);

}
TableView.prototype.setUpPagerAttributes = function () {
    this.pagerTemplate = this.pagerElement.querySelectorAll("[data-pager-template]")[0].innerHTML;
    this.pagerElement.removeChild(this.pagerElement.querySelectorAll("[data-pager-template]")[0]);
    this.currentPageClass = this.pagerElement.getAttribute("data-active-page-class");
    this.maxDisplayedPages = ~~this.pagerElement.getAttribute("data-max-displayed-pages");
    this.itemsPerPageElement = document.querySelectorAll("[data-items-per-page-for=" + this.tableElement.id + "]")[0];
    if (this.itemsPerPageElement) {
		if(localStorage.getItem("itemsPerPage")===null){
        this.itemsPerPage = ~~this.itemsPerPageElement.value;
		localStorage.setItem("itemsPerPage", this.itemsPerPage)
		}
	else
		
		this.itemsPerPage=~~localStorage.getItem("itemsPerPage")
		this.itemsPerPageElement.value=this.itemsPerPage;

    }
    else {
        this.itemsPerPage = 5;
    }
	
}

TableView.prototype.SetUpEventListeners = function() {
    var self = this; // Use so event handlers can use this object

    if (this.sortOnElements) {
        for (var j = 0; j < this.sortOnElements.length; j++) {
            // Handler for when the table headers are clicked, triggering the table to sort.
            this.sortOnElements[j].addEventListener("click", function(event) {
                event.stopImmediatePropagation();
                self.Sort(event);
            }, false);
        }
    }
    if (this.searchElements && !this.submitSearch) {
		for(var i=0; i<this.searchElements.length;i++)
		{
			this.searchElements[i].addEventListener("input", function(event) {
            event.stopImmediatePropagation();
            self.Search(this);
        }, false);}
       
    }
    if (this.searchElements && this.submitSearch) {

        for (var i = 0; i < this.submitSearch.length; i++) {
            this.submitSearch[i].addEventListener("click", function() { self.Search(this); }, false);
        }

    }
    if (this.tableElement.hasAttribute("data-select-table")) {
        var rows = this.tableElement.tBodies[0].rows;
        for (var i = 0; i < rows.length; i++) {
            //Handler for when a row is selected
            rows[i].addEventListener("click", function(event) {
                event.stopImmediatePropagation();
                self.SelectRow(event);
            }, false);
        }
    }
    if (this.itemsPerPageElement) {
        this.itemsPerPageElement.addEventListener("change", function (event) {
            event.stopImmediatePropagation();
                self.itemsPerPage = ~~event.srcElement.options[event.srcElement.selectedIndex].value;
				localStorage.setItem("itemsPerPage",self.itemsPerPage)
                self.update(self.displayed);

            });
        }
    
    if (this.clearSelected) {
        for (var e = 0; e < this.clearSelected.length; e++) {
            this.clearSelected[e].addEventListener("click", function(event) {
                event.stopImmediatePropagation();
                self.ClearSelected();
            });
        };
    }
    if (this.submitButtons) {
        for (var b = 0; b < this.submitButtons.length; b++) {
            this.submitButtons[b].addEventListener("click", function(event) {
                event.stopImmediatePropagation();
                self.SubmitSelected(event);
            });
        }
    }

}//end setup


TableView.prototype.AddClassesFromAttribute = function (element, elementToAddClassesTo, attrName) {
    if (element && elementToAddClassesTo && attrName) {
    if (element.hasAttribute(attrName)) {
        var classes = element.getAttribute(attrName).split(" ");
        for (var i = 0; i < classes.length; i++) {
            elementToAddClassesTo.classList.add(classes[i]);
        }
    }}
}

TableView.prototype.RemoveClassesFromAttribute = function (element, elementToRemoveClassesFrom, attrName) {
    if (element && elementToRemoveClassesFrom && attrName) {
        if (element.hasAttribute(attrName)) {
            var classes = element.getAttribute(attrName).split(" ");
            for (var i = 0; i < classes.length; i++) {
                elementToRemoveClassesFrom.classList.remove(classes[i]);
            }
        }
    }
}
TableView.prototype.RemoveChildren = function (element) {
    if (element) {
        while (element.lastChild) {
            element.removeChild(element.lastChild);
        }
    }
}


TableView.prototype.CalculatePageRange = function () {
    var last = this.pages.length;
    var range = this.maxDisplayedPages;
    var current = this.currentPage;
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
TableView.prototype.BuildSearchExpressions=function(){
	//(?:"property":("?\w*(target)))
	var searchExpressions=[];
	this.searchElements.forEach(function(element){
        var stringRegex='(';
        var properties=[];
        document.querySelectorAll("[search-attribute-for=" + element.id + "]").forEach(function(header){
         properties[header.cellIndex]=header.innerText.replace(/\s+/g, '');
    });
      for(var property in properties){
        properties[property]
      }  
    });
	return searchExpressions;
	
}
var tableViews;
document.addEventListener("DOMContentLoaded", function (event) {
    //do work
    tableViews = [];
    var tables = document.querySelectorAll("[data-sort-table]");
    for (var i = 0; i < tables.length; i++) {
        tableViews.push(new TableView(tables[i]));
    }
});