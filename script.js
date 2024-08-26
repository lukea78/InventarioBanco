window.onload = function () {
    document.getElementById("addProductBtn").addEventListener("click", function () {
        displayAddProductForm();
    });

    document.getElementById("viewInventoryBtn").addEventListener("click", function () {
        displayInventory();
    });

    document.getElementById("addIngressBtn").addEventListener("click", function () {
        displayAddIngressForm();
    });
};

let inventory = [];

// Formulario para registrar alimentos e importar
function displayAddProductForm() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <h2>Registrar Alimento</h2>
        <label for="productDate">Fecha de Registro:</label>
        <input type="date" id="productDate">
        <label for="productName">Producto:</label>
        <input type="text" id="productName" placeholder="Nombre del producto">
        <label for="productStock">Stock Inicial:</label>
        <input type="number" id="productStock" placeholder="Cantidad inicial">
        <label for="productProvider">Proveedor:</label>
        <input type="text" id="productProvider" placeholder="Proveedor">
        <label for="productExpiry">Fecha de Vencimiento:</label>
        <input type="date" id="productExpiry">
        <button onclick="addProduct()">Añadir Producto</button>
        <button onclick="importProducts()">Importar Productos</button>
        <input type="file" id="fileInput" style="display:none;" />
    `;
}

// Función para agregar un producto manualmente
function addProduct() {
    const productDate = document.getElementById("productDate").value;
    const productName = document.getElementById("productName").value;
    const productStock = parseInt(document.getElementById("productStock").value);
    const productProvider = document.getElementById("productProvider").value;
    const productExpiry = document.getElementById("productExpiry").value;

    let existingProduct = inventory.find(item => item.name === productName && item.expiry === productExpiry);

    if (existingProduct) {
        existingProduct.stock += productStock;
    } else {
        inventory.push({ date: productDate, name: productName, stock: productStock, provider: productProvider, expiry: productExpiry });
    }

    alert("Producto añadido exitosamente.");
    document.getElementById("content").innerHTML = "";
}

// Función para importar productos desde un archivo CSV delimitado por punto y coma
function importProducts() {
    const fileInput = document.getElementById("fileInput");
    fileInput.style.display = 'block';
    fileInput.addEventListener("change", handleFileUpload);
}

// Procesar el archivo CSV con los campos especificados (fecha, producto, proveedor, stock, vencimiento)
function handleFileUpload(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        const rows = text.split('\n');

        rows.forEach((row) => {
            const columns = row.split(';');
            const productDate = columns[0].trim();
            const productName = columns[1].trim();
            const productProvider = columns[2].trim();
            const productStock = parseInt(columns[3].trim());
            const productExpiry = columns[4].trim();

            let existingProduct = inventory.find(item => item.name === productName && item.expiry === productExpiry);

            if (existingProduct) {
                existingProduct.stock += productStock;
            } else {
                inventory.push({ date: productDate, name: productName, stock: productStock, provider: productProvider, expiry: productExpiry });
            }
        });

        alert("Productos importados correctamente.");
        displayInventory();
    };

    reader.readAsText(file);
}

// Función para ver el inventario con filtro y vencimiento editable
function displayInventory() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <h2>Inventario</h2>
        <label for="filterProduct">Filtrar por producto:</label>
        <input type="text" id="filterProduct" onkeyup="filterByProduct()" placeholder="Buscar por nombre o código">
        <button onclick="sortByDate()">Ordenar por Fecha de Ingreso</button>
        <div id="inventoryTableContainer"></div>
    `;

    renderInventoryTable(inventory);
}

// Función para renderizar la tabla del inventario
function renderInventoryTable(inventoryData) {
    const tableContainer = document.getElementById("inventoryTableContainer");

    if (inventoryData.length > 0) {
        let table = `<table border="1" style="width:100%; text-align:center;">
        <thead>
            <tr>
                <th>Fecha de Ingreso</th>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Stock</th>
                <th>Vencimiento</th>
                <th>Acción</th>
            </tr>
        </thead><tbody>`;

        inventoryData.forEach((item, index) => {
            let rowColor = getRowColor(item.expiry);
            table += `
                <tr style="background-color:${rowColor};">
                    <td>${item.date}</td>
                    <td>${item.name}</td>
                    <td>${item.provider}</td>
                    <td>${item.stock}</td>
                    <td>${item.expiry}</td>
                    <td><button onclick="editProduct(${index})">Editar</button></td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        tableContainer.innerHTML = table;
    } else {
        tableContainer.innerHTML = "<p>No hay productos en el inventario.</p>";
    }
}

// Función para editar productos
function editProduct(index) {
    const product = inventory[index];
    const content = document.getElementById("content");
    content.innerHTML = `
        <h2>Editar Producto</h2>
        <label for="editProductName">Producto:</label>
        <input type="text" id="editProductName" value="${product.name}">
        <label for="editProductStock">Stock:</label>
        <input type="number" id="editProductStock" value="${product.stock}">
        <label for="editProductProvider">Proveedor:</label>
        <input type="text" id="editProductProvider" value="${product.provider}">
        <label for="editProductExpiry">Fecha de Vencimiento:</label>
        <input type="date" id="editProductExpiry" value="${product.expiry}">
        <button onclick="saveProduct(${index})">Guardar</button>
    `;
}

// Función para guardar los cambios en el producto
function saveProduct(index) {
    const productName = document.getElementById("editProductName").value;
    const productStock = parseInt(document.getElementById("editProductStock").value);
    const productProvider = document.getElementById("editProductProvider").value;
    const productExpiry = document.getElementById("editProductExpiry").value;

    inventory[index] = {
        ...inventory[index],
        name: productName,
        stock: productStock,
        provider: productProvider,
        expiry: productExpiry
    };

    alert("Producto editado exitosamente.");
    displayInventory();
}

// Función para filtrar productos por nombre
function filterByProduct() {
    const filter = document.getElementById("filterProduct").value.toLowerCase();
    const filteredInventory = inventory.filter(item => item.name.toLowerCase().includes(filter));
    renderInventoryTable(filteredInventory);
}

// Función para obtener el color de la fila según el vencimiento
function getRowColor(expiryDate) {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 20) {
        return 'red';
    } else if (diffDays >= 20 && diffDays <= 40) {
        return 'yellow';
    } else {
        return 'green';
    }
}

// Función para ordenar el inventario por fecha de ingreso
function sortByDate() {
    inventory.sort((a, b) => new Date(b.date) - new Date(a.date));
    renderInventoryTable(inventory);
}
// Formulario para registrar ingreso de productos
function displayAddIngressForm() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <h2>Registrar Ingreso</h2>
        <label for="ingressDate">Fecha de Ingreso:</label>
        <input type="date" id="ingressDate">
        <label for="ingressProduct">Producto:</label>
        <input type="text" id="ingressProduct" placeholder="Nombre del producto">
        <label for="ingressQuantity">Cantidad:</label>
        <input type="number" id="ingressQuantity" placeholder="Cantidad">
        <label for="ingressProvider">Proveedor:</label>
        <input type="text" id="ingressProvider" placeholder="Proveedor">
        <label for="ingressExpiry">Fecha de Vencimiento:</label>
        <input type="date" id="ingressExpiry">
        <button onclick="addIngress()">Registrar Ingreso</button>
    `;
}

// Función para registrar un ingreso al inventario
function addIngress() {
    const ingressDate = document.getElementById("ingressDate").value;
    const productName = document.getElementById("ingressProduct").value;
    const quantity = parseInt(document.getElementById("ingressQuantity").value);
    const provider = document.getElementById("ingressProvider").value;
    const expiry = document.getElementById("ingressExpiry").value;

    // Verificar si el producto y el vencimiento ya existen en el inventario
    let existingProduct = inventory.find(item => item.name === productName && item.expiry === expiry);

    if (existingProduct) {
        // Si existe, sumar la cantidad ingresada al stock existente
        existingProduct.stock += quantity;
        alert("Producto actualizado exitosamente en el inventario.");
    } else {
        // Si no existe, crear una nueva entrada en el inventario
        inventory.push({
            date: ingressDate,
            name: productName,
            stock: quantity,
            provider: provider,
            expiry: expiry
        });
        alert("Nuevo producto ingresado exitosamente en el inventario.");
    }

    // Regresar al inventario después de registrar el ingreso
    displayInventory();
}
window.onload = function () {
    document.getElementById("addProductBtn").addEventListener("click", function () {
        displayAddProductForm();
    });

    document.getElementById("viewInventoryBtn").addEventListener("click", function () {
        displayInventory();
    });

    document.getElementById("addIngressBtn").addEventListener("click", function () {
        displayAddIngressForm();
    });

    document.getElementById("addEgressBtn").addEventListener("click", function () {
        displayAddEgressForm(); // Nuevo evento
    });
};

// Función para mostrar el formulario de egreso
function displayAddEgressForm() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <h2>Registrar Egreso</h2>
        <label for="egressDate">Fecha de Egreso:</label>
        <input type="date" id="egressDate">
        <label for="egressRecipient">Destinatario:</label>
        <input type="text" id="egressRecipient" placeholder="Nombre del destinatario">
        <label for="egressProduct">Producto:</label>
        <input type="text" id="egressProduct" placeholder="Nombre del producto">
        <label for="egressQuantity">Cantidad:</label>
        <input type="number" id="egressQuantity" placeholder="Cantidad">
        <button onclick="confirmEgress()">Confirmar Egreso</button>
    `;
}

// Función para registrar un egreso
function confirmEgress() {
    const egressDate = document.getElementById("egressDate").value;
    const recipient = document.getElementById("egressRecipient").value;
    const productName = document.getElementById("egressProduct").value;
    const quantity = parseInt(document.getElementById("egressQuantity").value);

    if (!egressDate || !recipient || !productName || !quantity) {
        alert("Por favor completa todos los campos.");
        return;
    }

    // Buscar el producto en inventario con el vencimiento más próximo
    let products = inventory.filter(item => item.name === productName);
    if (products.length === 0) {
        alert("Producto no encontrado en el inventario.");
        return;
    }

    // Ordenar los productos por fecha de vencimiento más cercana
    products.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    let remainingQuantity = quantity;
    for (let product of products) {
        if (remainingQuantity <= 0) break;

        if (product.stock >= remainingQuantity) {
            product.stock -= remainingQuantity;
            remainingQuantity = 0;
        } else {
            remainingQuantity -= product.stock;
            product.stock = 0;
        }
    }

    if (remainingQuantity > 0) {
        alert("No hay suficiente stock para completar el egreso.");
    } else {
        alert("Egreso registrado exitosamente.");
    }

    // Filtrar productos con stock > 0 y actualizar inventario
    inventory = inventory.filter(item => item.stock > 0);
    displayInventory();
}
let egresses = []; // Array para almacenar los egresos

// Modificar la función confirmEgress para almacenar los egresos
function confirmEgress() {
    const egressDate = document.getElementById("egressDate").value;
    const recipient = document.getElementById("egressRecipient").value;
    const productName = document.getElementById("egressProduct").value;
    const quantity = parseInt(document.getElementById("egressQuantity").value);

    if (!egressDate || !recipient || !productName || !quantity) {
        alert("Por favor completa todos los campos.");
        return;
    }

    let products = inventory.filter(item => item.name === productName);
    if (products.length === 0) {
        alert("Producto no encontrado en el inventario.");
        return;
    }

    products.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    let remainingQuantity = quantity;
    for (let product of products) {
        if (remainingQuantity <= 0) break;

        if (product.stock >= remainingQuantity) {
            product.stock -= remainingQuantity;
            remainingQuantity = 0;
        } else {
            remainingQuantity -= product.stock;
            product.stock = 0;
        }
    }

    if (remainingQuantity > 0) {
        alert("No hay suficiente stock para completar el egreso.");
    } else {
        // Agregar el egreso al array de egresos
        egresses.push({
            date: egressDate,
            recipient: recipient,
            product: productName,
            quantity: quantity
        });
        alert("Egreso registrado exitosamente.");
    }

    inventory = inventory.filter(item => item.stock > 0);
    displayInventory();
}

// Agregar la función para ver los egresos
function displayEgresses() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <h2>Lista de Egresos</h2>
        <label for="filterEgressDate">Filtrar por Fecha:</label>
        <input type="date" id="filterEgressDate" onchange="filterEgresses()">
        <label for="filterRecipient">Filtrar por Destinatario:</label>
        <input type="text" id="filterRecipient" onkeyup="filterEgresses()" placeholder="Buscar por destinatario">
        <div id="egressTableContainer"></div>
    `;
    renderEgressTable(egresses);
}

// Función para renderizar la tabla de egresos
function renderEgressTable(egressesData) {
    const tableContainer = document.getElementById("egressTableContainer");

    if (egressesData.length > 0) {
        let table = `<table border="1" style="width:100%; text-align:center;">
        <thead>
            <tr>
                <th>Fecha de Egreso</th>
                <th>Destinatario</th>
                <th>Producto</th>
                <th>Cantidad</th>
            </tr>
        </thead><tbody>`;

        egressesData.forEach((item) => {
            table += `
                <tr>
                    <td>${item.date}</td>
                    <td>${item.recipient}</td>
                    <td>${item.product}</td>
                    <td>${item.quantity}</td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        tableContainer.innerHTML = table;
    } else {
        tableContainer.innerHTML = "<p>No hay egresos registrados.</p>";
    }
}

// Función para filtrar egresos por fecha y destinatario
function filterEgresses() {
    const filterDate = document.getElementById("filterEgressDate").value;
    const filterRecipient = document.getElementById("filterRecipient").value.toLowerCase();

    let filteredEgresses = egresses.filter(item => {
        const matchesDate = filterDate ? item.date === filterDate : true;
        const matchesRecipient = filterRecipient ? item.recipient.toLowerCase().includes(filterRecipient) : true;
        return matchesDate && matchesRecipient;
    });

    renderEgressTable(filteredEgresses);
}

window.onload = function () {
    document.getElementById("addProductBtn").addEventListener("click", function () {
        displayAddProductForm();
    });

    document.getElementById("viewInventoryBtn").addEventListener("click", function () {
        displayInventory();
    });

    document.getElementById("addIngressBtn").addEventListener("click", function () {
        displayAddIngressForm();
    });

    document.getElementById("addEgressBtn").addEventListener("click", function () {
        displayAddEgressForm();
    });

    document.getElementById("viewEgressBtn").addEventListener("click", function () {
        displayEgresses(); // Nuevo evento
    });
};
function confirmEgress() {
    const egressDate = document.getElementById("egressDate").value;
    const recipient = document.getElementById("egressRecipient").value;
    const productName = document.getElementById("egressProduct").value.toLowerCase(); // Convertir a minúsculas
    const quantity = parseInt(document.getElementById("egressQuantity").value);

    if (!egressDate || !recipient || !productName || !quantity) {
        alert("Por favor completa todos los campos.");
        return;
    }

    // Buscar el producto en inventario ignorando mayúsculas y minúsculas
    let products = inventory.filter(item => item.name.toLowerCase() === productName);
    if (products.length === 0) {
        alert("Producto no encontrado en el inventario.");
        return;
    }

    products.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    let remainingQuantity = quantity;
    for (let product of products) {
        if (remainingQuantity <= 0) break;

        if (product.stock >= remainingQuantity) {
            product.stock -= remainingQuantity;
            remainingQuantity = 0;
        } else {
            remainingQuantity -= product.stock;
            product.stock = 0;
        }
    }

    if (remainingQuantity > 0) {
        alert("No hay suficiente stock para completar el egreso.");
    } else {
        egresses.push({
            date: egressDate,
            recipient: recipient,
            product: productName,
            quantity: quantity
        });
        alert("Egreso registrado exitosamente.");
    }

    inventory = inventory.filter(item => item.stock > 0);
    displayInventory();
}


function confirmEgress() {
    const egressDate = document.getElementById("egressDate").value;
    const recipient = document.getElementById("egressRecipient").value;
    const productName = document.getElementById("egressProduct").value.toLowerCase(); // Convertir a minúsculas
    const quantity = parseInt(document.getElementById("egressQuantity").value);

    if (!egressDate || !recipient || !productName || !quantity) {
        alert("Por favor completa todos los campos.");
        return;
    }

    // Buscar el producto en inventario ignorando mayúsculas y minúsculas
    let products = inventory.filter(item => item.name.toLowerCase() === productName);
    if (products.length === 0) {
        alert("Producto no encontrado en el inventario.");
        return;
    }

    // Verificación del inventario filtrado
    console.log("Productos filtrados: ", products);

    // Ordenar los productos por fecha de vencimiento (del más cercano al más lejano)
    products.sort((a, b) => new Date(a.expiry) - new Date(b.expiry));

    // Verificación del ordenamiento
    console.log("Productos ordenados por vencimiento: ", products);

    let remainingQuantity = quantity;

    for (let product of products) {
        console.log(`Descontando del producto: ${product.name}, stock disponible: ${product.stock}, vencimiento: ${product.expiry}`);

        if (remainingQuantity <= 0) break; // Si ya se ha descontado todo, detener el bucle

        // Si el stock de este producto puede cubrir la cantidad restante
        if (product.stock >= remainingQuantity) {
            console.log(`Descontando ${remainingQuantity} del producto con vencimiento más próximo: ${product.expiry}`);
            product.stock -= remainingQuantity;
            remainingQuantity = 0;
        } else {
            // Si no puede cubrirlo todo, restar lo que se pueda y continuar con el siguiente
            console.log(`Descontando ${product.stock}, cantidad restante por descontar: ${remainingQuantity - product.stock}`);
            remainingQuantity -= product.stock;
            product.stock = 0;
        }
    }

    if (remainingQuantity > 0) {
        alert("No hay suficiente stock para completar el egreso.");
    } else {
        // Registrar el egreso en el array de egresos
        egresses.push({
            date: egressDate,
            recipient: recipient,
            product: productName,
            quantity: quantity
        });
        alert("Egreso registrado exitosamente.");
    }

    // Filtrar productos que aún tengan stock > 0 para mantener el inventario limpio
    inventory = inventory.filter(item => item.stock > 0);
    displayInventory();
}
function confirmEgress() {
    const egressDate = document.getElementById("egressDate").value;
    const recipient = document.getElementById("egressRecipient").value;
    const productName = document.getElementById("egressProduct").value.toLowerCase(); // Convertir a minúsculas
    const quantity = parseInt(document.getElementById("egressQuantity").value);

    if (!egressDate || !recipient || !productName || !quantity) {
        alert("Por favor completa todos los campos.");
        return;
    }

    // Buscar el producto en inventario ignorando mayúsculas y minúsculas
    let products = inventory.filter(item => item.name.toLowerCase() === productName);
    if (products.length === 0) {
        alert("Producto no encontrado en el inventario.");
        return;
    }

    // Verificación del inventario filtrado
    console.log("Productos filtrados: ", products);

    // Función para convertir una fecha en formato DD-MM-YYYY a un objeto Date para comparar
    function convertToDate(dateStr) {
        const [day, month, year] = dateStr.split('-');
        return new Date(`${year}-${month}-${day}`); // Convertir a YYYY-MM-DD
    }

    // Ordenar los productos por fecha de vencimiento (del más cercano al más lejano)
    products.sort((a, b) => convertToDate(a.expiry) - convertToDate(b.expiry));

    // Verificación del ordenamiento
    console.log("Productos ordenados por vencimiento: ", products);

    let remainingQuantity = quantity;

    for (let product of products) {
        console.log(`Descontando del producto: ${product.name}, stock disponible: ${product.stock}, vencimiento: ${product.expiry}`);

        if (remainingQuantity <= 0) break; // Si ya se ha descontado todo, detener el bucle

        // Si el stock de este producto puede cubrir la cantidad restante
        if (product.stock >= remainingQuantity) {
            console.log(`Descontando ${remainingQuantity} del producto con vencimiento más próximo: ${product.expiry}`);
            product.stock -= remainingQuantity;
            remainingQuantity = 0;
        } else {
            // Si no puede cubrirlo todo, restar lo que se pueda y continuar con el siguiente
            console.log(`Descontando ${product.stock}, cantidad restante por descontar: ${remainingQuantity - product.stock}`);
            remainingQuantity -= product.stock;
            product.stock = 0;
        }
    }

    if (remainingQuantity > 0) {
        alert("No hay suficiente stock para completar el egreso.");
    } else {
        // Registrar el egreso en el array de egresos
        egresses.push({
            date: egressDate,
            recipient: recipient,
            product: productName,
            quantity: quantity
        });
        alert("Egreso registrado exitosamente.");
    }

    // Filtrar productos que aún tengan stock > 0 para mantener el inventario limpio
    inventory = inventory.filter(item => item.stock > 0);
    displayInventory();
}
// Función para renderizar la tabla del inventario
function renderInventoryTable(inventoryData) {
    const tableContainer = document.getElementById("inventoryTableContainer");

    if (inventoryData.length > 0) {
        let table = `<table border="1" style="width:100%; text-align:center;">
        <thead>
            <tr>
                <th>Fecha de Ingreso</th>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Stock</th>
                <th>Vencimiento</th>
                <th>Acción</th>
            </tr>
        </thead><tbody>`;

        inventoryData.forEach((item, index) => {
            let rowColor = getRowColor(item.expiry);
            table += `
                <tr style="background-color:${rowColor};">
                    <td>${item.date}</td>
                    <td>${item.name}</td>
                    <td>${item.provider}</td>
                    <td>${item.stock}</td>
                    <td>${item.expiry}</td>
                    <td>
                        <button onclick="editProduct(${index})">Editar</button>
                        <button onclick="deleteProduct(${index})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        tableContainer.innerHTML = table;
    } else {
        tableContainer.innerHTML = "<p>No hay productos en el inventario.</p>";
    }
}
// Función para eliminar un producto del inventario
function deleteProduct(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        inventory.splice(index, 1); // Eliminar el producto del array 'inventory'
        alert("Producto eliminado exitosamente.");
        displayInventory(); // Actualizar la tabla de inventario
    }
}
// Función para renderizar la tabla del inventario
function renderInventoryTable(inventoryData) {
    const tableContainer = document.getElementById("inventoryTableContainer");

    if (inventoryData.length > 0) {
        let table = `<table border="1" style="width:100%; text-align:center;">
        <thead>
            <tr>
                <th>Fecha de Ingreso</th>
                <th>Producto</th>
                <th>Proveedor</th>
                <th>Stock</th>
                <th>Vencimiento</th>
                <th>Acción</th>
            </tr>
        </thead><tbody>`;

        inventoryData.forEach((item, index) => {
            let rowColor = getRowColor(item.expiry);
            table += `
                <tr style="background-color:${rowColor};">
                    <td>${item.date}</td>
                    <td>${item.name}</td>
                    <td>${item.provider}</td>
                    <td>${item.stock}</td>
                    <td>${item.expiry}</td>
                    <td>
                        <button onclick="editProduct(${index})">Editar</button>
                        <button class="delete-btn" onclick="deleteProduct(${index})">Eliminar</button>
                    </td>
                </tr>
            `;
        });

        table += `</tbody></table>`;
        tableContainer.innerHTML = table;
    } else {
        tableContainer.innerHTML = "<p>No hay productos en el inventario.</p>";
    }
}
// Lista de usuarios y claves
const users = [
    { username: "usuario1", password: "banco21" },
    { username: "usuario2", password: "banco22" },
    { username: "usuario3", password: "banco23" },
    { username: "usuario4", password: "banco24" },
    { username: "usuario5", password: "banco25" },
    { username: "usuario6", password: "banco26" },
    { username: "usuario7", password: "banco27" },
    { username: "usuario8", password: "banco28" }
];

// Función para el inicio de sesión
function login() {
    const usernameInput = document.getElementById("username").value;
    const passwordInput = document.getElementById("password").value;

    const user = users.find(u => u.username === usernameInput && u.password === passwordInput);

    if (user) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("app-container").style.display = "block";
    } else {
        document.getElementById("login-error").textContent = "Usuario o clave incorrecta.";
    }
}

window.onload = function () {
    document.getElementById("addProductBtn").addEventListener("click", function () {
        displayAddProductForm();
    });

    document.getElementById("viewInventoryBtn").addEventListener("click", function () {
        displayInventory();
    });

    document.getElementById("addIngressBtn").addEventListener("click", function () {
        displayAddIngressForm();
    });

    document.getElementById("addEgressBtn").addEventListener("click", function () {
        displayAddEgressForm();
    });

    document.getElementById("viewEgressBtn").addEventListener("click", function () {
        displayEgresses();
    });
};


