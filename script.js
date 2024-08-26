import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getDatabase, ref, set, get, child, update, remove } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-database.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyABQOaHZqO25X5s8y85IhPGDQ3OtkE4hA0",
    authDomain: "banco-de-alimentos-11.firebaseapp.com",
    projectId: "banco-de-alimentos-11",
    storageBucket: "banco-de-alimentos-11.appspot.com",
    messagingSenderId: "420251243134",
    appId: "1:420251243134:web:29f678e47b9eae5f7c7e2f"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Cargar los datos de Firebase al inicio
window.onload = function () {
    loadInventoryFromFirebase();

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

// Inventario
let inventory = [];
let egresses = [];

// Función para guardar el inventario en Firebase
function saveInventoryToFirebase() {
    set(ref(db, 'inventory'), inventory);
}

// Función para cargar el inventario desde Firebase
function loadInventoryFromFirebase() {
    const dbRef = ref(db);
    get(child(dbRef, 'inventory')).then((snapshot) => {
        if (snapshot.exists()) {
            inventory = snapshot.val() || [];
            displayInventory();
        } else {
            console.log("No data available");
        }
    }).catch((error) => {
        console.error(error);
    });
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
    saveInventoryToFirebase(); // Guardar en Firebase
    displayInventory();
}

// Función para ver el inventario
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
    saveInventoryToFirebase(); // Guardar los cambios en Firebase
    displayInventory();
}

// Función para eliminar un producto
function deleteProduct(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        inventory.splice(index, 1); // Eliminar el producto del array 'inventory'
        alert("Producto eliminado exitosamente.");
        saveInventoryToFirebase(); // Actualizar en Firebase
        displayInventory(); // Actualizar la tabla de inventario
    }
}

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

