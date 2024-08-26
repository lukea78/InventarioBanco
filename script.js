import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCWsJ_I0wUeqFPGr9eZDZgY2tLk0K7RSUI",
  authDomain: "banco-de-alimentos1.firebaseapp.com",
  projectId: "banco-de-alimentos1",
  storageBucket: "banco-de-alimentos1.appspot.com",
  messagingSenderId: "238359016709",
  appId: "1:238359016709:web:bfbccf4342b7b81a7e736c"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Inicializar eventos
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

// Función para agregar un producto manualmente
async function addProduct() {
    const productDate = document.getElementById("productDate").value;
    const productName = document.getElementById("productName").value;
    const productStock = parseInt(document.getElementById("productStock").value);
    const productProvider = document.getElementById("productProvider").value;
    const productExpiry = document.getElementById("productExpiry").value;

    try {
        await addDoc(collection(db, "inventario"), {
            date: productDate,
            name: productName,
            stock: productStock,
            provider: productProvider,
            expiry: productExpiry
        });
        alert("Producto añadido exitosamente.");
        document.getElementById("content").innerHTML = "";
    } catch (error) {
        console.error("Error añadiendo producto a Firestore: ", error);
        alert("Error añadiendo producto.");
    }
}

// Función para mostrar el inventario
async function displayInventory() {
    const content = document.getElementById("content");
    content.innerHTML = `
        <h2>Inventario</h2>
        <label for="filterProduct">Filtrar por producto:</label>
        <input type="text" id="filterProduct" onkeyup="filterByProduct()" placeholder="Buscar por nombre o código">
        <button onclick="sortByDate()">Ordenar por Fecha de Ingreso</button>
        <div id="inventoryTableContainer"></div>
    `;

    inventory = [];

    try {
        const querySnapshot = await getDocs(collection(db, "inventario"));
        querySnapshot.forEach((doc) => {
            let product = doc.data();
            product.id = doc.id;  // Añadimos el ID del documento a los datos
            inventory.push(product);
        });
        renderInventoryTable(inventory);
    } catch (error) {
        console.error("Error obteniendo el inventario: ", error);
        alert("Error obteniendo inventario.");
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
async function deleteProduct(index) {
    if (confirm("¿Estás seguro de que deseas eliminar este producto?")) {
        const productId = inventory[index].id;
        try {
            await deleteDoc(doc(db, "inventario", productId));
            alert("Producto eliminado exitosamente.");
            displayInventory();
        } catch (error) {
            console.error("Error eliminando el producto: ", error);
            alert("Error eliminando producto.");
        }
    }
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



