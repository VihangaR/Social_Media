$(function(){
    $('select').material_select();
    $('.datepicker').pickadate({
        selectMonths: false, // Creates a dropdown to control month
        selectYears: 20, // Creates a dropdown of 15 years to control year,
        today: 'Today',
        clear: 'Clear',
        close: 'Ok',
        closeOnSelect: false // Close upon selecting a date,
    });
    console.log("H46i!");
});
