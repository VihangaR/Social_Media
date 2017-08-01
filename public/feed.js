$(function(){
    $(".button-collapse").sideNav();
    $(".open-side").sideNav({
        menuWidth: 300, // Default is 300
        edge: 'left', // Choose the horizontal origin
        draggable: true, // Choose whether you can drag to open on touch screens,
    });
    n = new Date();
    y = n.getFullYear();
    m = n.getMonth() + 1;
    d = n.getDate();
    $(".date").html(m + "/" + d + "/" + y);
});
