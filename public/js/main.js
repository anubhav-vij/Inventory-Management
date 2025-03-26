document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("productTable")) {
    loadProducts();
  }
  if (document.getElementById("editProductForm")) {
    loadProductForEdit();
  }
});

function loadProducts() {
    fetch("/api/products")
        .then((response) => response.json())
        .then((products) => {
            const tbody = document.querySelector("#productTable tbody");
            if (!tbody) {
                console.error("Could not find tbody in #productTable");
                return;
            }
            tbody.innerHTML = "";
            products.forEach((product) => {
                const lotsInfo = product.lots
                    .map(
                        (lot) =>
                            `Lot ${lot.lot_number}: ${lot.quantity} (Rec: ${new Date(
                                lot.receipt_date
                            ).toLocaleDateString()}, Exp: ${new Date(
                                lot.expiration_date
                            ).toLocaleDateString()})`
                    )
                    .join("<br>");

                const totalQuantity = product.lots.reduce((sum, lot) => sum + parseInt(lot.quantity), 0);

                const row = `
                    <tr>
                        <td>P${String(product.product_id).padStart(3, "0")}</td>
                        <td>${product.vendor}</td>
                        <td>${product.vendor_part}</td>
                        <td>${product.location}</td>
                        <td>${lotsInfo}</td>
                        <td class="total-quantity">${totalQuantity}</td>
                        <td>${product.additional_info || ''}</td> <!-- Added additional info column -->
                        <td>
                            <a href="/edit/${
                                product.product_id
                            }" class="btn btn-sm btn-warning">Edit</a>
                            <button onclick="deleteProduct(${
                                product.product_id
                            })" class="btn btn-sm btn-danger">Delete</button>
                        </td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        })
        .catch((error) => {
            console.error("Error loading products:", error);
        });
}


function addLotField() {
  const lotFields = document.getElementById("lotFields");
  const lotDiv = document.createElement("div");
  lotDiv.className = "lot-group mb-3";
  lotDiv.innerHTML = `
        <h6>Lot Details</h6>
        <input type="text" class="form-control mb-2" name="lot_number" placeholder="Lot Number" required>
        <input type="number" class="form-control mb-2" name="quantity" placeholder="Quantity" required>
        <input type="date" class="form-control mb-2" name="receipt_date" required>
        <input type="date" class="form-control mb-2" name="expiration_date" required>
        <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove(); updateLotTotal();">Remove</button>
    `;

  // Add event listener to quantity input
  const quantityInput = lotDiv.querySelector('[name="quantity"]');
  quantityInput.addEventListener("input", updateLotTotal);

  lotFields.appendChild(lotDiv);
  updateLotTotal(); // Update total when new lot is added
}

// function submit Product

function submitProduct() {
    const form = document.getElementById("addProductForm");
    const vendor = form.querySelector('[name="vendor"]').value.trim();
    const vendor_part = form.querySelector('[name="vendor_part"]').value.trim();
    const location = form.querySelector('[name="location"]').value.trim();
    const additional_info = form.querySelector('[name="additional_info"]').value.trim();
    const lots = Array.from(document.querySelectorAll(".lot-group")).map(
        (group) => ({
            lot_number: group.querySelector('[name="lot_number"]').value.trim(),
            quantity: group.querySelector('[name="quantity"]').value.trim(),
            receipt_date: group.querySelector('[name="receipt_date"]').value,
            expiration_date: group.querySelector('[name="expiration_date"]').value,
        })
    );

    // Validation checks
    if (!vendor || !vendor_part || !location) {
        alert("Please fill in all product information fields (Vendor, Vendor Part, Location).");
        return;
    }

    if (lots.length === 0) {
        alert("Please add at least one lot.");
        return;
    }

    for (const lot of lots) {
        if (!lot.lot_number || !lot.quantity || !lot.receipt_date || !lot.expiration_date) {
            alert("Please fill in all fields for each lot.");
            return;
        }
        if (lot.quantity <= 0) {
            alert('Quantity must be a positive number when adding a new product.');
            return;
        }
    }

    const data = {
        vendor: vendor,
        vendor_part: vendor_part,
        location: location,
        additional_info: additional_info, // Added new field
        lots: lots,
    };

    fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then(() => {
            form.reset();
            const lotFields = document.getElementById("lotFields");
            lotFields.innerHTML = "";
            bootstrap.Modal.getInstance(document.getElementById("addProductModal")).hide();
            loadProducts();
        })
        .catch((error) => {
            console.error("Error submitting product:", error);
            alert("An error occurred while submitting the product.");
        });
}

// function submitProduct() {
//   const form = document.getElementById("addProductForm");
//   const lots = Array.from(document.querySelectorAll(".lot-group")).map(
//     (group) => ({
//       lot_number: group.querySelector('[name="lot_number"]').value,
//       quantity: group.querySelector('[name="quantity"]').value,
//       receipt_date: group.querySelector('[name="receipt_date"]').value,
//       expiration_date: group.querySelector('[name="expiration_date"]').value,
//     })
//   );

//   const data = {
//     vendor: form.querySelector('[name="vendor"]').value,
//     vendor_part: form.querySelector('[name="vendor_part"]').value,
//     location: form.querySelector('[name="location"]').value,
//     lots: lots,
//   };

//   fetch("/api/products", {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   })
//     .then((response) => response.json())
//     .then(() => {
//       bootstrap.Modal.getInstance(
//         document.getElementById("addProductModal")
//       ).hide();
//       loadProducts();
//     });
// }

function loadProductForEdit() {
    const productId = window.location.pathname.split("/").pop();
    fetch("/api/products")
        .then((response) => response.json())
        .then((products) => {
            const product = products.find((p) => p.product_id == productId);
            console.log("Product data:", product);
            const form = document.getElementById("editProductForm");
            form.querySelector('[name="product_id"]').value = `P${String(product.product_id).padStart(3, "0")}`;
            form.querySelector('[name="vendor"]').value = product.vendor;
            form.querySelector('[name="vendor_part"]').value = product.vendor_part;
            form.querySelector('[name="location"]').value = product.location;
            form.querySelector('[name="additional_info"]').value = product.additional_info || ""; // Load additional info

            const lotFields = document.getElementById("lotFields");
            product.lots.forEach((lot) => {
                const receiptDate = new Date(lot.receipt_date).toISOString().split("T")[0];
                const expirationDate = new Date(lot.expiration_date).toISOString().split("T")[0];
                const lotDiv = document.createElement("div");
                lotDiv.className = "lot-group mb-3";
                lotDiv.innerHTML = `
                    <h6>Lot Details</h6>
                    <input type="text" class="form-control mb-2" name="lot_number" value="${lot.lot_number}" required>
                    <input type="number" class="form-control mb-2" name="quantity" value="${lot.quantity}" required>
                    <input type="date" class="form-control mb-2" name="receipt_date" value="${receiptDate}" required>
                    <input type="date" class="form-control mb-2" name="expiration_date" value="${expirationDate}" required>
                    <button type="button" class="btn btn-sm btn-danger" onclick="this.parentElement.remove(); updateLotTotal();">Remove</button>
                `;
                const quantityInput = lotDiv.querySelector('[name="quantity"]');
                quantityInput.addEventListener('input', updateLotTotal);
                lotFields.appendChild(lotDiv);
            });
            updateLotTotal();
        });
}


// function updateProduct

function updateProduct() {
    const productId = document.querySelector('[name="product_id"]').value.replace('P', '');
    const form = document.getElementById('editProductForm');
    const vendor = form.querySelector('[name="vendor"]').value.trim();
    const vendor_part = form.querySelector('[name="vendor_part"]').value.trim();
    const location = form.querySelector('[name="location"]').value.trim();
    const additional_info = form.querySelector('[name="additional_info"]').value.trim();
    const lots = Array.from(document.querySelectorAll('.lot-group')).map(group => ({
        lot_number: group.querySelector('[name="lot_number"]').value.trim(),
        quantity: group.querySelector('[name="quantity"]').value.trim(),
        receipt_date: group.querySelector('[name="receipt_date"]').value,
        expiration_date: group.querySelector('[name="expiration_date"]').value
    }));

    // Validation checks
    if (!vendor || !vendor_part || !location) {
        alert('Please fill in all product information fields (Vendor, Vendor Part, Location).');
        return;
    }

    if (lots.length === 0) {
        alert('Please add at least one lot.');
        return;
    }

    for (const lot of lots) {
        if (!lot.lot_number || lot.quantity === '' || !lot.receipt_date || !lot.expiration_date) {
            alert('Please fill in all fields for each lot.');
            return;
        }
        if (lot.quantity < 0) {
            alert('Quantity cannot be negative when editing a product.');
            return;
        }
    }

    const data = {
        vendor: vendor,
        vendor_part: vendor_part,
        location: location,
        additional_info: additional_info, // Added new field
        lots: lots
    };

    fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(() => {
        window.location.href = '/';
    })
    .catch(error => {
        console.error('Error updating product:', error);
        alert('An error occurred while updating the product.');
    });
}

// function updateProduct() {
//   const productId = document
//     .querySelector('[name="product_id"]')
//     .value.replace("P", "");
//   const form = document.getElementById("editProductForm");
//   const lots = Array.from(document.querySelectorAll(".lot-group")).map(
//     (group) => ({
//       lot_number: group.querySelector('[name="lot_number"]').value,
//       quantity: group.querySelector('[name="quantity"]').value,
//       receipt_date: group.querySelector('[name="receipt_date"]').value,
//       expiration_date: group.querySelector('[name="expiration_date"]').value,
//     })
//   );

//   const data = {
//     vendor: form.querySelector('[name="vendor"]').value,
//     vendor_part: form.querySelector('[name="vendor_part"]').value,
//     location: form.querySelector('[name="location"]').value,
//     lots: lots,
//   };

//   fetch(`/api/products/${productId}`, {
//     method: "PUT",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data),
//   })
//     .then((response) => response.json())
//     .then(() => {
//       window.location.href = "/";
//     });
// }

function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product?")) {
    fetch(`/api/products/${productId}`, {
      method: "DELETE",
    }).then(() => loadProducts());
  }
}

function updateLotTotal() {
  const lotGroups = document.querySelectorAll(".lot-group");
  let total = 0;

  lotGroups.forEach((group) => {
    const quantity =
      parseInt(group.querySelector('[name="quantity"]').value) || 0;
    total += quantity;
  });

  // Create or update total display element
  let totalDisplay = document.getElementById("lotTotalDisplay");
  if (!totalDisplay) {
    totalDisplay = document.createElement("div");
    totalDisplay.id = "lotTotalDisplay";
    totalDisplay.className = "mt-2 fw-bold";
    const lotFields = document.getElementById("lotFields");
    lotFields.parentNode.insertBefore(totalDisplay, lotFields.nextSibling);
  }

  totalDisplay.textContent = `Total Quantity: ${total}`;
}
