# Simple CRUD API

## Description

This project implements a **CRUD API** for managing users.  
All data is stored in memory (**in-memory**), without any external databases.

It is built with **Node.js** and **TypeScript**, without using any web frameworks like Express.

---

## Installation & Running

### 1. Clone the repository and install dependencies

```bash
git clone <your-repo-url>
cd simple-crud-api
npm install
```

### 2. Create .env file
```bash
PORT=3000
```

### 3. Run in development mode
```bash
npm run start:dev
```

### 4. Run in production mode
```bash
npm run start:prod
```
This compiles TypeScript to JavaScript and starts the server.

## API Endpoints

### GET /api/users

	•	Returns a list of all users.

	•	Response: 200 OK + array of users.


### GET /api/users/:id

	•	Returns a user by id.

	•	Responses:

	    •	200 OK — if user is found

	    •	400 Bad Request — if the ID is not a valid UUID

	    •	404 Not Found — if no user with the given ID exists


### POST /api/users

	•	Creates a new user.

	•	Request body:    
        {
        "username": "Alice",
        "age": 30,
        "hobbies": ["reading", "chess"]
        }
    
    •	Responses:

	    •	201 Created — returns the created user

	    •	400 Bad Request — if the body is invalid


### PUT /api/users/:id

	•	Updates an existing user.

	•	Request body must include all required fields.

	•	Responses:

        •	200 OK — updated user

        •	400 Bad Request — invalid ID or body

        •	404 Not Found — user not found


### DELETE /api/users/:id

	•	Deletes the user with the specified ID.

	•	Responses:

        •	204 No Content — if deleted

        •	400 Bad Request — invalid ID

        •	404 Not Found — user not found

### Error Handling

   •	Code 400 - Invalid user ID or body

   •	Code 404 - User not found / Route not found

   •	Code 500 - Internal Server Error


### Example Usage (via curl)

Create user
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"Alice","age":30,"hobbies":["reading","coding"]}'
```


Get all users
```bash
curl http://localhost:3000/api/users
```

### Testing

