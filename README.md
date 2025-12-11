# AppCenar - Delivery Application

## Prerequisites

Before running the application, ensure you have the following installed:

1.  **Node.js**: [Download and Install Node.js](https://nodejs.org/)
2.  **MongoDB**: [Download and Install MongoDB Community Server](https://www.mongodb.com/try/download/community)

## Installation

1.  Open a terminal in the project root directory (`c:\Users\breil\OneDrive\Documents\itla\pw\AppCenar`).
2.  Install the dependencies:
    ```bash
    npm install
    ```

## Configuration

The application uses a `.env` file for configuration. It has been created with default values:

```properties
PORT=3000
MONGODB_URI=mongodb://127.0.0.1/appcenar-dev
SESSION_SECRET=somesecretkey
NODE_ENV=development
```

## Running MongoDB

**Crucial Step:** You must have MongoDB running for the application to work.

-   **Windows Service:** If you installed MongoDB as a service, it should be running automatically.
-   **Manual Start:** If not, open a separate terminal and run:
    ```bash
    mongod
    ```
    (You might need to add the MongoDB bin folder to your system PATH or run it from the installation directory, e.g., `C:\Program Files\MongoDB\Server\X.X\bin\mongod.exe`).

## Running the Application

1.  **Development Mode** (with auto-reload):
    ```bash
    npm run dev
    ```

2.  **QA Mode** (uses a different database):
    ```bash
    npm run qa
    ```

3.  **Production Mode**:
    ```bash
    npm start
    ```

## Accessing the App

Once the server is running (you should see `Server on port 3000` and `MongoDB Connected`), open your browser and go to:

[http://localhost:3000](http://localhost:3000)

## Default Users

Since the database is empty initially, you will need to register users:

1.  **Admin**: No default admin. You might want to temporarily change the code or register a user and manually update their role in the database to 'admin' to access the dashboard initially, or use a seed script (not included yet).
    *   *Tip:* Register a user, then use a tool like MongoDB Compass to change their `role` to `admin`.

2.  **Commerce/Client/Delivery**: Use the registration forms on the login page.
