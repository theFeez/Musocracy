var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var bodyParser=require('body-parser');
var MongoClient = require('mongodb').MongoClient;

var cors = require('cors');
var url='mongodb://neonSlick:theFeez@ds041556.mlab.com:41556/heroku_35lrwd31'
app.use(bodyParser.urlencoded({extended:true,limit:'50mb'}));
app.use(bodyParser.json({limit:'50mb'}));
app.use(cors());


app.get('/',function(req,res){
    
    console.log('sent');
   res.sendFile(__dirname+'/client/index.html'); 
});

app.get('/text',function(req,res){
    console.log('req recieved');
    res.send('gay');
})


app.post('/createRoom',function(req,res){
    console.log(req.body.name);
    MongoClient.connect(url, function(err, db){
      if (err){
        console.log('fuckin errors');
        throw err;
          res.end()
      }
        db.collection('rooms').insert({'roomCode':req.body.code,'playerList':[]},function(error,response){
            console.log('gucci');
            db.close();
            res.end();
           
        });
        
        
        
        
        
    });
    
    
    
});



app.get('/room',function(req,res){
    
})

io.on('connection',function(socket){
   socket.on('join',function(data){
       socket.join(data.room);
       MongoClient.connect(url,function(err,db){
           if(err){
               console.log(err);
               
           }
           else{
               db.collection('rooms').update({roomCode:data.roomCode},{$push:{playerList:data.name}});
               db.collection('rooms').findOne({roomCode:data.roomCode},function(error,doc){
                   console.log('sent to room');
                   io.sockets.in(data.roomCode).emit('playerAdded',{playerList:doc.playerList});
                    
               })
              
           }
       })
   }) 
});




server.listen(process.env.PORT||500,function(){
    console.log('Feezolini!');
});