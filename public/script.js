let editMode = false;
let currentItemID = null;

document.addEventListener('DOMContentLoaded', fetchItems);
async function fetchItems() {
    try {
        const response = await fetch('http://localhost:3000/items');
        if (response.ok) {
            const items = await response.json();
            items.forEach(displayItem);
        } else {
            console.error('Error fetching items:', response.statusText);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
function displayItem(item) {
    const { id, name, price, quantity, barcode } = item;
    const tbody = document.getElementById('items-table').getElementsByTagName('tbody')[0];
    const newRow = tbody.insertRow();
    newRow.insertCell(0).innerHTML = id;
    newRow.insertCell(1).innerHTML = name;
    newRow.insertCell(2).innerHTML = price;
    newRow.insertCell(3).innerHTML = quantity;
    newRow.insertCell(4).innerHTML = `<div class="ob3">
        <button onclick="displayBarcode(${barcode})">Display Barcode</button>
        <button onclick="deleteItem(${id})">Delete</button>
        <button onclick="editItem(${id}, '${name}', ${price}, ${quantity})" class="edit-button">Edit</button>
    </div>`;
}
function fun1(){
    const bu = document.getElementById('specials');
    bu.style.display = (bu.style.display === 'none' || bu.style.display === '') ? 'flex' : 'none';
}


// script.js

async function switchtobilling() {
    document.getElementById('form-heading').textContent = 'Billing';
    resetAndRecreateForm();
}

async function switchtobilling() {
    document.getElementById('form-heading').textContent = 'Billing';
    resetAndRecreateForm();
}

async function resetAndRecreateForm() {
    const form = document.getElementById('item-form');
    form.innerHTML = '';  // Clear form's content

    const itemIdField = document.createElement('input');
    itemIdField.type = 'hidden';
    itemIdField.id = 'item-id';
    itemIdField.name = 'item-id';

    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'itemname');
    nameLabel.textContent = 'Item Name:';
    
    const nameDropdown = document.createElement('select');
    nameDropdown.id = 'itemname';
    nameDropdown.name = 'itemname';
    nameDropdown.required = true;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '-- Select Item --';
    nameDropdown.appendChild(defaultOption);

    try {
        const response = await fetch('http://localhost:3000/items');
        if (response.ok) {
            const items = await response.json();
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.name;
                option.textContent = item.name;
                nameDropdown.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching items:', error);
    }

    const quantityLabel = document.createElement('label');
    quantityLabel.setAttribute('for', 'itemquantity');
    quantityLabel.textContent = 'Quantity:';
    
    const quantityField = document.createElement('input');
    quantityField.type = 'number';
    quantityField.id = 'itemquantity';
    quantityField.name = 'itemquantity';
    quantityField.required = true;

    const totalPriceDisplay = document.createElement('div');
    totalPriceDisplay.id = 'totalPriceDisplay';
    totalPriceDisplay.style.fontSize = 'large';
    totalPriceDisplay.style.fontWeight = 'bold';
    totalPriceDisplay.style.margin = '10px';
    totalPriceDisplay.style.display = 'none';
    totalPriceDisplay.style.color = 'green';

    const validationMessage = document.createElement('div');
    validationMessage.id = 'validation-message';
    validationMessage.style.color = 'red';
    validationMessage.style.display = 'none';
    
   // Submit and reset button container
   const buttonContainer = document.createElement('div');
   buttonContainer.classList.add('bu');

   const submitButtonDiv = document.createElement('div');
   submitButtonDiv.classList.add('but1');
   
   const billButton = document.createElement('button'); 
   billButton.type = 'button';
   billButton.textContent = 'Bill Item';
   
   submitButtonDiv.appendChild(billButton);

   const resetButtonDiv = document.createElement('div');
   resetButtonDiv.classList.add('but2');
   
   const resetButton = document.createElement('button');
   resetButton.type = 'reset';
   resetButton.textContent = 'Clear';
   
   resetButton.onclick = resetAndRecreateForm; // Reset the form
   resetButtonDiv.appendChild(resetButton);

   buttonContainer.appendChild(submitButtonDiv);
   buttonContainer.appendChild(resetButtonDiv);

   // Append everything to the form
   form.appendChild(itemIdField);
   form.appendChild(nameLabel);
   form.appendChild(nameDropdown);
   form.appendChild(quantityLabel);
   form.appendChild(quantityField);
   form.appendChild(totalPriceDisplay);
   form.appendChild(validationMessage);
   form.appendChild(buttonContainer);

   // Event listener for quantity input change
   quantityField.addEventListener('input', async () => {
       const name = nameDropdown.value; 
       const quantity = parseInt(quantityField.value, 10); 

       validationMessage.style.display = 'none'; 

       if (!name || isNaN(quantity) || quantity <= 0) {
           totalPriceDisplay.style.display = 'none'; 
           return;
       }

       try {
           const response = await fetch(`http://localhost:3000/invitem/${name}`);
           if (response.ok) {
               const item = await response.json();
               const availableQuantity = item.quantity;
               const totalPriceValue = item.price;

               if (quantity > availableQuantity) {
                   totalPriceDisplay.style.display='none'; 
                   validationMessage.textContent= `Error: Only ${availableQuantity} items are available.`;
                   validationMessage.style.display= 'block'; 
               } else {
                   validationMessage.style.display= 'none';
                   totalPriceDisplay.textContent= `To Pay: ₹ ${quantity * totalPriceValue}`; 
                   totalPriceDisplay.style.display= 'block'; 
               }
           } else {
               console.error('Error fetching item details:', response.statusText);
           }
       } catch (error) {
           console.error('Error:', error);
       }
   });

   // Event listener for bill button click
   billButton.addEventListener('click', async () => { 
        const name = nameDropdown.value; 
        const quantity= parseInt(quantityField.value, 10); 
        const totalPriceText= totalPriceDisplay.textContent; // Get the displayed total price

        validationMessage.style.display= 'none';

        if (!name || isNaN(quantity) || quantity <= 0) {
            validationMessage.textContent= 'Please enter a valid item and quantity'; 
            validationMessage.style.display= 'block'; 
            return; 
        }

        try {
            const response= await fetch(`http://localhost:3000/invitem/${name}`); 
            if (response.ok) { 
                const item= await response.json(); 
                const availableQuantity= item.quantity; 

                if (quantity > availableQuantity) { 
                    validationMessage.textContent= `Error: Only ${availableQuantity} items are available.`; 
                    validationMessage.style.display= 'block'; 
                    return; 
                }

                // Proceed with the billing process
                const action= (quantity === availableQuantity) ? 'delete' : 'update';

                const requestBody= { 
                    itemName: name, 
                    quantity, 
                    action 
                };

                const billResponse= await fetch('http://localhost:3000/bill', { 
                    method: 'POST', 
                    headers: { 
                        'Content-Type': 'application/json' 
                    }, 
                    body: JSON.stringify(requestBody) 
                });

                if (billResponse.ok) { 
                    alert('Item billed successfully'); 

                    // Generate PDF
                    generatePDF(name, item.price, quantity, totalPriceText);

                    resetAndRecreateForm(); // Reset form after successful billing
                    location.reload();
                } else { 
                    console.error('Error billing item:', billResponse.statusText); 
                } 
            } else { 
                console.error('Error fetching item details:', response.statusText); 
            } 
        } catch (error) { 
            console.error('Error:', error); 
        } 
   });
}


function generatePDF(itemName, pricePerUnit, quantity, totalPrice) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Get the current date and time
  const now = new Date();
  const formattedDate = now.toLocaleDateString();
  const formattedTime = now.toLocaleTimeString();

  // Set font size for the main heading
  doc.setFontSize(24);
  doc.setFont("Helvetica", "bold");
  const heading = "Inventory Management System";

  // Center the main heading
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const headingWidth = doc.getTextWidth(heading);
  const headingX = (pageWidth - headingWidth) / 2;
  doc.text(heading, headingX, 20);

  doc.setTextColor(76,175,80); //added
  doc.text(heading, headingX, 20); //added

  // Add a horizontal line below the heading
  doc.setLineWidth(0.5);
  doc.line(10, 25, pageWidth - 10, 25);

  // Add a border around the entire page
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
  doc.setTextColor(0, 0, 0); //added
  // Set font size and style for the title
  doc.setFontSize(20);
  const title = "Invoice";
  const titleWidth = doc.getTextWidth(title);
  const titleX = (pageWidth - titleWidth) / 2;
  doc.text(title, titleX, 35);

  // Add the current date and time below the title
  doc.setFontSize(12);
  const dateTimeText = `Date: ${formattedDate}   Time: ${formattedTime}`;
  const dateTimeWidth = doc.getTextWidth(dateTimeText);
  const dateTimeX = (pageWidth - dateTimeWidth) / 2;
  doc.text(dateTimeText, dateTimeX, 42);

  // Define content area position and dimensions
  const contentStartY = 50;
  const contentWidth = pageWidth - 20;
  const contentHeight = 80;

  // Draw a border for the content area
  doc.rect(10, contentStartY, contentWidth, contentHeight);

  // Set font size for details
  doc.setFontSize(14);
  doc.setFont("Helvetica", "normal");

  // Prepare text for item details
  const itemNameText = `Item Name: ${itemName}`;
  const priceText = `Price per Unit: Rs. ${pricePerUnit}`;
  const quantityText = `Quantity: ${quantity}`;

  // Ensure `totalPrice` is calculated correctly
  const numericPricePerUnit = parseFloat(pricePerUnit);
  const numericQuantity = parseInt(quantity, 10);
  const numericTotalPrice = numericPricePerUnit * numericQuantity; // Calculate total price
  const totalPriceText = `Total Price: Rs. ${numericTotalPrice.toFixed(2)}`;

  // Calculate X positions for centering each line
  const itemNameX = (contentWidth - doc.getTextWidth(itemNameText)) / 2 + 10;
  const priceX = (contentWidth - doc.getTextWidth(priceText)) / 2 + 10;
  const quantityX = (contentWidth - doc.getTextWidth(quantityText)) / 2 + 10;
  const totalPriceX =
    (contentWidth - doc.getTextWidth(totalPriceText)) / 2 + 10;

  // Add item details inside the bordered area
  doc.text(itemNameText, itemNameX, contentStartY + 15);
  doc.text(priceText, priceX, contentStartY + 30);
  doc.text(quantityText, quantityX, contentStartY + 45);

  // Add a horizontal line before the total price
  doc.line(15, contentStartY + 50, pageWidth - 15, contentStartY + 50);

  // Highlight the total price with bold font
  doc.setFont("Helvetica", "bold");
  doc.text(totalPriceText, totalPriceX, contentStartY + 60);

  // Save the PDF
  doc.save(`${itemName}_invoice.pdf`);
}



switchtobilling();


document.getElementById('submit-btn').addEventListener('click', async () => {
    const name = document.getElementById('itemname').value;
    const price = parseFloat(document.getElementById('itemprice').value);
    const quantity = parseInt(document.getElementById('itemquantity').value);

    if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
        displayErrorMessage("Please provide valid inputs: name, valid price, and valid quantity.");
        return;
    }

    clearErrorMessage();
    if (editMode) {
        const id = currentItemID;
        try {
            const response = await fetch(`http://localhost:3000/edit-item/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, price, quantity }),
            });

            if (response.ok) {
                location.reload();
            } else {
                displayErrorMessage('Error editing item.');
            }
        } catch (error) {
            displayErrorMessage('Error editing item.');
        }
    } else {
        // Add new item
        try {
            const response = await fetch('http://localhost:3000/add-item', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, price, quantity }),
            });

            if (response.ok) {
                const result = await response.json();
                displayItem(result);
                document.getElementById('item-form').reset();
            } else {
                displayErrorMessage('Error adding item.');
            }
        } catch (error) {
            displayErrorMessage('Error adding item.');
        }
    }
});


async function addItems() {
    document.getElementById('form-heading').textContent = 'Add Item';
    
    // Reset the form to its original state
    const form = document.getElementById('item-form');
    form.innerHTML = '';  // Clear the form's current content

    // Recreate the hidden Item ID field
    const itemIdField = document.createElement('input');
    itemIdField.type = 'hidden';
    itemIdField.id = 'item-id';
    itemIdField.name = 'item-id';

    // Create label and input for Item Name
    const nameLabel = document.createElement('label');
    nameLabel.setAttribute('for', 'itemname');
    nameLabel.textContent = 'Item Name:';

    const nameField = document.createElement('input');
    nameField.type = 'text';
    nameField.id = 'itemname';
    nameField.name = 'itemname';
    nameField.required = true;

    // Create label and input for Item Price
    const priceLabel = document.createElement('label');
    priceLabel.setAttribute('for', 'itemprice');
    priceLabel.textContent = 'Item Price:';

    const priceField = document.createElement('input');
    priceField.type = 'number';
    priceField.id = 'itemprice';
    priceField.name = 'itemprice';
    priceField.required = true;

    // Create label and input for Quantity
    const quantityLabel = document.createElement('label');
    quantityLabel.setAttribute('for', 'itemquantity');
    quantityLabel.textContent = 'Quantity:';

    const quantityField = document.createElement('input');
    quantityField.type = 'number';
    quantityField.id = 'itemquantity';
    quantityField.name = 'itemquantity';
    quantityField.required = true;

    // Error message container
    const errorMessage = document.createElement('div');
    errorMessage.id = 'error-message';
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'none';

    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('bu');

    // Submit button
    const submitButtonDiv = document.createElement('div');
    submitButtonDiv.classList.add('but1');
    const submitButton = document.createElement('button');
    submitButton.type = 'button';
    submitButton.textContent = 'Add Item & Generate Barcode';
    submitButtonDiv.appendChild(submitButton);

    // Reset button
    const resetButtonDiv = document.createElement('div');
    resetButtonDiv.classList.add('but2');
    const resetButton = document.createElement('button');
    resetButton.type = 'reset';
    resetButton.textContent = 'Clear';
    resetButton.onclick = resetForm; // Reset button calls resetForm
    resetButtonDiv.appendChild(resetButton);
    buttonContainer.appendChild(submitButtonDiv);
    buttonContainer.appendChild(resetButtonDiv);

    // Append all recreated fields to the form
    form.appendChild(itemIdField);
    form.appendChild(nameLabel);
    form.appendChild(nameField);
    form.appendChild(priceLabel);
    form.appendChild(priceField);
    form.appendChild(quantityLabel);
    form.appendChild(quantityField);
    form.appendChild(errorMessage);
    form.appendChild(buttonContainer);

    // Reset edit mode and current item
    editMode = false;
    currentItemID = null;

    // Add event listener for the submit button inside the function
    submitButton.addEventListener('click', async () => {
        const name = document.getElementById('itemname').value;
        const price = parseFloat(document.getElementById('itemprice').value);
        const quantity = parseInt(document.getElementById('itemquantity').value);

        if (!name || isNaN(price) || isNaN(quantity) || price <= 0 || quantity <= 0) {
            displayErrorMessage("Please provide valid inputs: name, valid price, and valid quantity.");
            return;
        }

        clearErrorMessage();
        if (editMode) {
            const id = currentItemID;
            try {
                const response = await fetch(`http://localhost:3000/edit-item/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, price, quantity }),
                });

                if (response.ok) {
                    location.reload();
                } else {
                    displayErrorMessage('Error editing item.');
                }
            } catch (error) {
                displayErrorMessage('Error editing item.');
            }
        } else {
            // Add new item
            try {
                const response = await fetch('http://localhost:3000/add-item', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, price, quantity }),
                });
                if (response.ok) {
                    const result = await response.json();
                    displayItem(result); // Add the item to the table
                    document.getElementById('item-form').reset(); // Clear the form
                } else {
                    displayErrorMessage('Error adding item.');
                }
            } catch (error) {
                displayErrorMessage('Error adding item.');
            }
        }
    });
}


function displayErrorMessage(message) {
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function clearErrorMessage() {
    const errorMessage = document.getElementById('error-message');
    errorMessage.style.display = 'none';
    errorMessage.textContent = '';
}

function displayBarcode(data) {
    const { barcode } = data;
    const barcodeImage = document.createElement('img');
        
    barcodeImage.src = `http://localhost:3000/barcodes/${data}.png`;

    const barcodeDisplay = document.getElementById('barcode-display');
    barcodeDisplay.innerHTML = ''; 
    barcodeDisplay.appendChild(barcodeImage);
}

async function deleteItem(id) {
    try {
        const response = await fetch(`http://localhost:3000/delete-item/${id}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            location.reload();
        } else {
            displayErrorMessage('Error deleting item.');
        }
    } catch (error) {
        displayErrorMessage('Error deleting item.');
    }
}

function editItem(id, name, price, quantity) {
    document.getElementById('itemname').value = name;
    document.getElementById('itemprice').value = price;
    document.getElementById('itemquantity').value = quantity;

    editMode = true;
    currentItemID = id;

    document.getElementById('form-heading').textContent = 'Edit Item';
    document.getElementById('submit-btn').textContent = 'Update Item';
}

function resetForm() {
    editMode = false;
    currentItemID = null;
    document.getElementById('form-heading').textContent = 'Add Item';
    document.getElementById('submit-btn').textContent = 'Add Item & Generate Barcode';
    clearErrorMessage();
}