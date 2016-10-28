$(document).ready(function () {
  
    $("#Form").change(enableButtons);
    $("form#Form input").on("keyup", enableButtons);
    $("#save").click(function() {
        $("#icon").addClass("rotate");
        var form = $(this).closest('form')[0];
       $("#save>#buttonText").text("SAVING CHANGES");
        form.submit();
        disableForm(form);
    });
    $("#cancel").on("click", function () {
        document.getElementById("Form").reset();
        clearValidationMessages();
        disableButtons();
    });
});

function enableButtons() {
  
    $("#buttons").children().removeAttr("disabled");

}

function disableForm(form) {
    disableButtons();
    var elements = form.elements;
    for (var i = 0, len = elements.length; i < len; ++i) {
        elements[i].readOnly = true;
    }
    $(".switch-input").attr("disabled", true);
    $(".switch-label").attr("readonly", true);
    $(".switch-handle").attr("readonly", true);
    $("#Form").off("change");
    $("#Form .privilege-input").attr("disabled", "disabled");
    $("#Form .input-lg").attr("disabled", "disabled");
}

function disableButtons() {
    $("#buttons").children().attr("disabled", "disabled");
}

function clearValidationMessages() {
    var spans = $("form#Form span:not(#buttonText)");
    for (var i = 0; i < spans.length; i++) {
        if (spans[i].classList.length <= 0) {
            $(spans[i]).remove();
        }
    }
}