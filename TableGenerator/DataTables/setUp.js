$(document).ready(function(){

	TableBuilder=new TableBuilder(5, 50000, "table table-bordered","#tableWrapper");
	  
         
           $("#tester").DataTable({
				
                "searchHighlight": true,
                "pageLength": 10,
                "oLanguage": {
                    "sZeroRecords": "No records matching search criteria"
                },
                
            });
			  
			
            $("#tester").show();
})