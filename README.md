# Important note for the reviewers
This task was completed by me for the first time in May 2025. I used another GitHub profile (marmotT) for pushing the code to the repository, but the repository remains mine. Please don't waste your time trying to accuse me of stealing another person's code because marmotT and vladimirtugutov are the same person—me—and I can easily prove that. Thank you for your attention.

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
PORT=4000
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


### 5. Run with load balancing (Cluster API)
```bash
npm run start:multi
```

## API Endpoints

### GET /api/products 

	•	Returns a list of all products .

	•	Response: 200 OK + array of products .


### GET /api/products /:id

	•	Returns a product by id.

	•	Responses:

	    •	200 OK — if product is found

	    •	400 Bad Request — if the ID is not a valid UUID

	    •	404 Not Found — if no product with the given ID exists


### POST /api/users

	•	Creates a new user.

	•	Request body:    
        {
        "name": "iPhone 15",
        "description": "Latest smartphone",
        "price": 999,
        "category":"electronics",
        "inStock":true
        }
    
    •	Responses:

	    •	201 Created — returns the created product

	    •	400 Bad Request — if the body is invalid


### PUT /api/products/:id

	•	Updates an existing product.

	•	Request body must include all required fields.

	•	Responses:

        •	200 OK — updated product

        •	400 Bad Request — invalid ID or body

        •	404 Not Found — product not found


### DELETE /api/products/:id

	•	Deletes the product with the specified ID.

	•	Responses:

        •	204 No Content — if deleted

        •	400 Bad Request — invalid ID

        •	404 Not Found — user not found

### Error Handling

   •	Code 400 - Invalid product ID or body

   •	Code 404 - Product not found / Route not found

   •	Code 500 - Internal Server Error

## Requirements

	•	TypeScript implementation

	•	No external frameworks (like Express)

	•	In-memory DB

	•	.env config

	•	Dev and prod scripts

	•	Cluster-based horizontal scaling

	•	API testable via scripts


## Example Usage (via curl)
### 1. GET all products (an empty array in the very beginning)
curl http://localhost:4000/api/products

### 2. Create product
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "iPhone 15",
    "description": "Latest smartphone",
    "price": 999,
    "category": "electronics",
    "inStock": true
  }'

### 3. Get product by ID
curl http://localhost:4000/api/products/{UUID}

### 4. Check invalid price <= 0
curl -X POST http://localhost:4000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"test","description":"test","price":0,"category":"test","inStock":true}'


### 5. Update
curl -X PUT http://localhost:4000/api/products/{UUID} \
  -H "Content-Type: application/json" \
  -d '{"name":"iPhone Updated","description":"Updated","price":899,"category":"electronics","inStock":false}'

### 6. Delete  
curl -X DELETE http://localhost:4000/api/products/{UUID}

### Testing

This project includes automated tests (see /tests folder, if implemented).

You can run tests with:
```bash
npm run test
```