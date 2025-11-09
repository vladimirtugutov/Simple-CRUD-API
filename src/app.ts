import { createServer } from 'http';
import { usersRouter } from './routes/users';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const server = createServer((req, res) => {
  usersRouter(req, res);
});

server.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});