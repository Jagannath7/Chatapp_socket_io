const express = require('express')
const http = require('http')
const app = express()
const socketio = require('socket.io')
const { Socket } = require('dgram')

const server = http.createServer(app)
const io = socketio(server)

let users = {}

let socketmap = {}

io.on('connection', (socket) => {
    console.log('connected with socket id = ' + socket.id)

    socket.on('login',(data) => {
        if(users[data.username]){
            if(users[data.username] == data.password){
                socket.join(data.username)
                socket.emit('logged_in')
                socketmap[socket.id] = data.username
            }else{
                socket.emit('login_failed')
            }

        }else{
            users[data.username] = data.password
            socket.join(data.username)
            socket.emit('logged_in')
            socketmap[socket.id] = data.username
        }
       console.log(users)
    })
   
    socket.on('msg_send',(data) => {
        data.from = socketmap[socket.id]
        if(data.to){
            io.to(data.to).emit('msg_recvd',data)
        }else{
            socket.broadcast.emit('msg_recvd',data)
        }
    })
    
})


app.use('/',express.static(__dirname + '/public'))

server.listen(2123,() => {
    console.log('server started')
})