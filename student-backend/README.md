# Student Backend

Simple Node.js + Express backend that stores student JSON data in MongoDB using Mongoose.

## Requirements
- Node.js
- MongoDB running locally or a MongoDB URI

## Install

Open a terminal in the `student-backend` folder and run:

```bash
npm install
```

## Run

Start the server (by default it connects to `mongodb://127.0.0.1:27017/studentdb` and listens on port 3000):

```bash
MONGO_URI="your-mongo-uri" npm start
```
Or for local MongoDB:

```bash
npm start
```

## Routes
- GET `/` - returns a simple HTML welcome message
- POST `/students` - accept JSON body `{ id, name, age, course }` and stores a student
- GET `/students` - returns all stored students as JSON

## Example

Create a student:

```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{"id":1,"name":"Alice","age":21,"course":"Math"}'
```

Get all students:

```bash
curl http://localhost:3000/students
```
