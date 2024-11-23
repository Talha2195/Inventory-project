console.log("filter.js is loaded");

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('filterBtn').addEventListener('click', function () {
        console.log('Filter button clicked');
        var dropdown = this.parentElement;
        dropdown.classList.toggle('active');
    });
});