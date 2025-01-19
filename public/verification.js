document.getElementById('userForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Check if the username and password match
    if (username === 'shaldon' && password === 'shaldon123') {
        // Redirect to the next window/page if credentials match
        window.location.href = 'addItem.html';  // Replace 'nextpage.html' with the actual URL or page
    } else {
        alert('Invalid username or password.');
    }
});
