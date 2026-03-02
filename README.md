# Enterprise Ecosystem

This project is a full-stack enterprise ecosystem with a Java Spring Boot backend and a React frontend.

## Project Structure

- `backend/`: Java Spring Boot application.
- `frontend/`: React application with Vite.
- `docker-compose.yml`: Orchestrates both services.

## Backend

The backend is built with Spring Boot 3.2.2 and uses an H2 in-memory database for development.

### Key Components

- `ApiApplication.java`: Main entry point.
- `model/`: JPA entities (Company, Role, Employee).
- `repository/`: Spring Data JPA repositories.
- `controller/`: REST controllers.

## Frontend

The frontend is built with React 18 and Vite. It uses Tailwind CSS for styling and Recharts for data visualization.

### Key Components

- `src/api.ts`: API service layer.
- `src/pages/`: Page components (Dashboard, Company List, Role Page, etc.).
- `src/components/`: Reusable UI components.

## Docker

To run the entire ecosystem with Docker:

```bash
docker-compose up --build
```
