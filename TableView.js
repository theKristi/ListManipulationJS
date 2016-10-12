﻿var TableView=function(tableElement){
	this.list=new List();
	this.tableElement=tableElement;
	this.sortOnElements=this.tableElement.querySelectorAll("[data-sort-on]");
	this.SetSortIcons();
	this.searchElement = document.querySelectorAll("[data-search-bar-for=" + this.tableElement.id + "]")[0];
	var submitSearch=document.querySelectorAll("[data-submit-search-bar-for=" + this.tableElement.id + "]")
	if(submitSearch.length>0)
		this.submitSearch=submitSearch;
	this.highlightClass = this.tableElement.getAttribute("data-highlight-class");
    this.searchFilter = "";
	this.list.createFromHtml(this.tableElement);
	this.displayed = this.list.getList();
	this.displayedSortedOn = undefined;
	
	var pagerElement = document.querySelectorAll("[data-pager-for=" + this.tableElement.id + "]")[0];
    if (pagerElement) 
	{
        this.pagerElement=pagerElement;
		this.setUpPagerAttributes();
		this.currentPage=0;
		this.goToPage=function(page){
			if(this.pages){
				this.currentPage=page;
				this.buildTable(this.pages[page]);
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
                
                this.AddClassesFromAttribute(elem, elem.children[0], "data-sort-icon-desc");
                this.AddClassesFromAttribute(elem, elem.children[0], "data-active-sort-classes");
            }
            this.AddClassesFromAttribute(elem, elem, "data-active-sort-classes");
        } else { //not current sort element, set to asc icon
            elem.children[0].removeAttribute("class");
            this.AddClassesFromAttribute(elem, elem.children[0], "data-sort-icon-asc");
            this.RemoveClassesFromAttribute(elem, elem, "data-active-sort-classes");
        }
    }
}
TableView.prototype.buildTable = function(filteredlist) {
    if (filteredlist === undefined)
        filteredlist = this.list.getList();

		 var tbody = this.tableElement.tBodies[0];
		  if (tbody) 
			this.RemoveChildren(tbody);
    
    for (var i = 0; i < filteredlist.length; i++) 
	{
        tbody.appendChild(filteredlist[i].html);
        
    }

}
TableView.prototype.update=function(newList){
	this.buildTable(newList);
	this.buildPager();
	this.SetUpEventListeners();
}

TableView.prototype.Sort = function(attr) {
    if (this.displayedSortedOn === attr.currentTarget.innerText)
        this.asc = !this.asc;
    else 
	{
        this.asc = true;
    }

	this.currentSortElement=attr.currentTarget;
	this.SetSortIcons();

    var sorted = this.list.sort(this.displayed, attr.currentTarget.innerText, this.asc);
    this.displayedSortedOn = attr.currentTarget.innerText;
    this.update(sorted);
	var sortedEvent=new CustomEvent("sorted",{ 'detail': {'attribute': this.displayedSortedOn, 'ascending':this.asc, "element":attr.currentTarget }});
	this.tableElement.dispatchEvent(sortedEvent);
  
   
}

TableView.prototype.Search=function(){
	 this.searchFilter = this.searchElement.value;
	 var properties=this.list.getHeadersFromHtml(this.tableElement.tHead)
	 var filteredList=this.list.search(this.searchFilter,properties)
	 if(this.displayedSortedOn)
	 this.displayed=this.list.sort(filteredList, this.displayedSortedOn);
	else
		this.displayed=filteredList;
	 this.update(this.displayed);
}

TableView.prototype.SelectRow = function (event) {
    var element = event.currentTarget;
	var clickedRecord=this.list.search(element,["html"])[0]
	var recordClickedEvent;
    if (element.classList.contains(this.highlightClass)) {
        recordClickedEvent=new CustomEvent("select",{'detail':{"action":'Deselect', 'record':clickedRecord}} )
		element.classList.remove(this.highlightClass);
		
    } else {
		recordClickedEvent=new CustomEvent("select",{'detail':{"action":'Select', 'record':clickedRecord}} )
        element.classList.add(this.highlightClass);
		
    }
	this.tableElement.dispatchEvent(recordClickedEvent);
}

TableView.prototype.buildPager=function(){
	this.RemoveChildren(this.pagerElement);
	 var self = this;
	this.pages=this.list.toPages(this.itemsPerPage,this.displayed)
	var startPage = 1;
    var endPage = this.pages.length;
	if(this.maxDisplayedPages){
		
		var range=this.CalculatePageRange();
		var startPage = range.start+1;
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
	self.goToPage(this.currentPage)
		
}
TableView.prototype.setUpPagerAttributes=function(){
	this.pagerTemplate = this.pagerElement.querySelectorAll("[data-pager-template]")[0].innerHTML;
    this.pagerElement.removeChild(this.pagerElement.querySelectorAll("[data-pager-template]")[0]);
    this.currentPageClass = this.pagerElement.getAttribute("data-active-page-class");
    this.maxDisplayedPages = ~~this.pagerElement.getAttribute("data-max-displayed-pages");
    this.itemsPerPageElement = document.querySelectorAll("[data-items-per-page-for=" + this.tableElement.id + "]")[0];
    if (this.itemsPerPageElement) 
	{
        this.itemsPerPage = ~~this.itemsPerPageElement.value
		
    }
	else 
	{
        this.itemsPerPage = 5;
    }
}

TableView.prototype.SetUpEventListeners = function () {
    var self = this; // Use so event handlers can use this object
  
    if (this.sortOnElements) {
        for (var j = 0; j < this.sortOnElements.length; j++) {
            // Handler for when the table headers are clicked, triggering the table to sort.
            this.sortOnElements[j].addEventListener("click", function (event) { event.stopImmediatePropagation();
			self.Sort(event); }, false);
        }
    }
	if (this.searchElement&&!this.submitSearch) {
        this.searchElement.addEventListener("keyup", function (event) { 
		event.stopImmediatePropagation();
		self.Search();
		}, false);
    }
	if (this.searchElement&&this.submitSearch) {
		
        for(var i=0;i<this.submitSearch.length;i++){
			this.submitSearch[i].addEventListener("click", function(){self.Search();}, false);
		}
		
    }
	if(this.tableElement.hasAttribute("data-select-table")){
		var rows=this.tableElement.tBodies[0].rows;
		for (var i = 0; i < rows.length; i++) {
            //Handler for when a row is selected
            rows[i].addEventListener("click", function (event) {
				event.stopImmediatePropagation();
				self.SelectRow(event); }, false);
	}
	if (this.itemsPerPageElement) 
	{
		this.itemsPerPageElement.addEventListener("change", function(event){
			self.itemsPerPage = ~~event.srcElement.options[event.srcElement.selectedIndex].value
			self.update(self.displayed);
			
		})
    }
	}
}
/*TableView.prototype.BuildAndSubmitForm = function (event) {
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
}*/

TableView.prototype.AddClassesFromAttribute = function (element, elementToAddClassTo, attrName) {
    if (element.hasAttribute(attrName)) {
        var classes = element.getAttribute(attrName).split(" ");
        for (var i = 0; i < classes.length; i++) {
            elementToAddClassTo.classList.add(classes[i]);
        }
    }
}

TableView.prototype.RemoveClassesFromAttribute = function (element, elementToRemoveClassesFrom, attrName) {
    if(element&&elementToRemoveClassesFrom&&attrName){
	if (element.hasAttribute(attrName)) {
        var classes = element.getAttribute(attrName).split(" ");
        for (var i = 0; i < classes.length; i++) {
            elementToRemoveClassesFrom.classList.remove(classes[i]);
        }
    }}
}
TableView.prototype.RemoveChildren=function(element){
	 if (element) {
        while (element.lastChild) {
            element.removeChild(element.lastChild);
        }
    }
}


TableView.prototype.CalculatePageRange = function () {
	var last=this.pages.length;
	var range=this.maxDisplayedPages;
	var current=this.currentPage;
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
var tableViews;
document.addEventListener("DOMContentLoaded", function(event) { 
  //do work
     tableViews = [];
    var tables = document.querySelectorAll("[data-sort-table]");
    for (var i = 0; i < tables.length; i++) {
        tableViews.push(new TableView(tables[i]));
    }
});