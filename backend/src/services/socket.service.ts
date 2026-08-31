import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';
import pool from '../config/database';

let io: SocketIOServer;

export const initSocket=(httpServer:HttpServer)=>{
 io=new SocketIOServer(httpServer,{cors:{origin:process.env.CORS_ORIGIN||'http://localhost:5173',methods:['GET','POST'],credentials:true}});
 io.use((socket,next)=>{
  const token=socket.handshake.auth?.token;
  const secret=process.env.JWT_SECRET;
  if(!token||!secret)return next(new Error('Authentication required'));
  try{socket.data.user=jwt.verify(token,secret) as {id:string;role:string};next();}catch{return next(new Error('Invalid authentication token'));}
 });
 io.on('connection',(socket:Socket)=>{
  socket.on('join_ticket',async(ticketId:string)=>{
   try{
    const [rows]:any=await pool.execute('SELECT user_id FROM support_tickets WHERE id=?',[ticketId]);
    if(!rows.length)return socket.emit('socket_error',{message:'Ticket not found'});
    const owner=rows[0].user_id;const role=socket.data.user.role;
    const agents=['ADMIN','SUPER_ADMIN','OFFICER','SUPPORT_AGENT'];
    if(socket.data.user.id!==owner&&!agents.includes(role))return socket.emit('socket_error',{message:'Not authorized for this ticket'});
    socket.join('ticket_'+ticketId);
   }catch{socket.emit('socket_error',{message:'Unable to join ticket'});}
  });
  socket.on('disconnect',()=>undefined);
 });
};

export const getIO=()=>{if(!io)throw new Error('Socket.io not initialized');return io;};