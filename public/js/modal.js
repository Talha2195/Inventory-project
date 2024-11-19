const modal = document.getElementById('deleteModal');
const deleteLinks = document.querySelectorAll('.deleteLink');
const cancelBtn = document.getElementById('cancelBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
deleteLinks.forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); 
        const gameId = event.target.getAttribute('data-id'); 
        confirmDeleteBtn.href = `/deleteGame/${gameId}`;  
        modal.style.display = 'flex'; 
    });
});
cancelBtn.addEventListener('click', function() {
    modal.style.display = 'none'; 
});

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';  
    }
});
