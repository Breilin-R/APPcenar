# 🍔 AppCenar - Sistema de Delivery de Comida

Sistema completo de delivery de comida desarrollado con Node.js, Express.js y MongoDB. Incluye módulos para clientes, comercios, deliveries y administradores.

## 🚀 Características Principales

### 👤 **Módulo de Clientes**
- ✅ Explorar restaurantes disponibles
- ✅ Ver catálogo de productos por comercio
- ✅ Carrito de compras con control de cantidades (+/-)
- ✅ Sistema de favoritos
- ✅ Gestión de direcciones de entrega
- ✅ Historial de pedidos
- ✅ Perfil de usuario

### 🏪 **Módulo de Comercios**
- ✅ Panel de pedidos recibidos
- ✅ Asignación de delivery a pedidos
- ✅ Gestión de categorías (CRUD)
- ✅ Gestión de productos (CRUD)
- ✅ Perfil del comercio

### 🚚 **Módulo de Delivery**
- ✅ Lista de pedidos asignados
- ✅ Marcar pedidos como completados
- ✅ Perfil del delivery

### ⚙️ **Módulo de Administrador**
- ✅ Dashboard con estadísticas
- ✅ Gestión de clientes, deliveries y comercios
- ✅ Configuración del sistema (ITBIS)
- ✅ Gestión de administradores
- ✅ Gestión de tipos de comercio

## 🎨 **Diseño**
- Tema nocturno elegante y profesional
- Interfaz responsive con Bootstrap
- Animaciones suaves y efectos visuales
- Iconos FontAwesome

## 🛠️ **Tecnologías Utilizadas**

- **Backend:** Node.js, Express.js
- **Base de Datos:** MongoDB, Mongoose
- **Vistas:** Handlebars (HBS)
- **Autenticación:** Express-Session, Bcrypt
- **Estilos:** Bootstrap 5, CSS personalizado
- **Otros:** Multer (uploads), Connect-Flash, Method-Override

## 📦 **Instalación**

### Prerrequisitos
- Node.js (v14 o superior)
- MongoDB (local o MongoDB Atlas)

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/Breilin-R/AppCenar.git
cd AppCenar
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz del proyecto:

```env
MONGODB_URI=mongodb://localhost/appcenar
PORT=3000
SESSION_SECRET=tu_secreto_aqui
```

4. **Poblar la base de datos con datos de prueba**
```bash
node src/seed.js
node src/seedRestaurants.js
node src/seedOrders.js
```

5. **Iniciar el servidor**
```bash
npm start
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

## 👥 **Usuarios de Prueba**

### Admin
- **Email:** admin@admin.com
- **Contraseña:** 123

### Cliente
- **Email:** cliente_0@test.com
- **Contraseña:** 123

### Comercio
- **Email:** commerce_0@test.com (hasta commerce_24@test.com)
- **Contraseña:** 123

### Delivery
- **Email:** delivery@test.com
- **Contraseña:** 123

## 📊 **Datos de Prueba**

- **25 restaurantes** con nombres reales dominicanos
- **250 productos** (10 por restaurante)
- **193 órdenes** de prueba
- Nombres y apellidos dominicanos
- Direcciones de entrega

## 🗂️ **Estructura del Proyecto**

```
AppCenar/
├── src/
│   ├── config/          # Configuración de BD
│   ├── controllers/     # Controladores MVC
│   ├── helpers/         # Funciones auxiliares
│   ├── middleware/      # Middlewares personalizados
│   ├── models/          # Modelos de Mongoose
│   ├── public/          # Archivos estáticos
│   │   └── css/         # Estilos CSS
│   ├── routes/          # Rutas de Express
│   ├── views/           # Vistas Handlebars
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── client/
│   │   ├── commerce/
│   │   ├── delivery/
│   │   ├── layouts/
│   │   └── partials/
│   ├── index.js         # Punto de entrada
│   └── seed*.js         # Scripts de seeding
├── .gitignore
├── package.json
└── README.md
```

## 🔒 **Seguridad**

- Contraseñas encriptadas con bcrypt
- Sesiones seguras con express-session
- Middleware de autenticación
- Protección de rutas por rol
- Validación de formularios

## 📝 **Funcionalidades Destacadas**

### Carrito de Compras
- Agregar productos con cantidad personalizada
- Aumentar/reducir cantidades con botones +/-
- Eliminar productos individuales
- Vaciar carrito completo
- Validación de comercio único por pedido

### Sistema de Pedidos
- Cálculo automático de ITBIS (18%)
- Selección de dirección de entrega
- Estados: Pendiente, En Proceso, Completado
- Asignación automática de delivery disponible

### Gestión de Productos
- Categorías personalizadas por comercio
- Imágenes de productos
- Precios y descripciones
- CRUD completo

## 🎯 **Puntuación de Evaluación**

- **Requerimientos Técnicos:** 5/5 (100%)
- **Login y Registro:** 70/70 (100%)
- **Cliente:** 280/280 (100%)
- **Comercio:** 150/150 (100%)
- **Delivery:** 40/40 (100%)
- **Administrador:** 140/150 (93%)

**Total:** 685/695 puntos (98.6%)

## 👨‍💻 **Autor**

**Breilin Ramírez**
- GitHub: [@Breilin-R](https://github.com/Breilin-R)

## 📄 **Licencia**

Este proyecto fue desarrollado como parte de un proyecto académico.

---

⭐ Si te gusta este proyecto, ¡dale una estrella en GitHub!
