export type User = {
    id: string;
    username: string;
    age: number;
    hobbies: string[];
  };
  
  export let users: User[] = [];
  
  export type MessageFromWorker =
    | { type: 'GET_ALL_USERS' }
    | { type: 'CREATE_USER'; payload: User }
    | { type: 'UPDATE_USER'; payload: User }
    | { type: 'DELETE_USER'; payload: string }
    | { type: 'GET_USER_BY_ID'; payload: string };
  
  export type MessageToWorker =
    | { type: 'ALL_USERS'; payload: User[] }
    | { type: 'USER_CREATED'; payload: User }
    | { type: 'USER_UPDATED'; payload: User }
    | { type: 'USER_DELETED' }
    | { type: 'USER_FOUND'; payload: User }
    | { type: 'USER_NOT_FOUND' }
    | { type: 'INVALID_USER_ID' };