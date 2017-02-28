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

function generate(){

    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    
    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}



app.get('/room',function(req,res){
    
})


io.sockets.on('connection',function(socket){
    
    
    function deleteSocket(room,name){
        MongoClient.connect(url,function(err,db){
            if(err){
                   console.log(err);
            }
                else{
                   db.collection('rooms').update({roomCode:room},{$pull:{playerList:name}},function(error,result){
                       if(err){
                           console.log(error);
                       }
                       else{
                           db.collection('rooms').findOne({roomCode:socket.roomCode},function(error1,doc){
                               if(err){
                                   console.log(err);
                               }
                               else{
                                   console.log(doc.playerList);
                                    io.sockets.in(socket.roomCode).emit('playerAdded',{playerList:doc.playerList});
                               }


                            });
                       }
                   })
               }
       })
    }

    
  
    
    
    
   socket.on('join',function(data){
       
       socket.disconnected = false;
       socket.nickname=data.name;
       socket.roomCode=data.room;
       socket.join(data.room);
       
       MongoClient.connect(url,function(err,db){
           if(err){
               console.log(err);
               
           }
           else{
               db.collection('rooms').findOne({roomCode:data.room},function(err,doc){
                   console.log(doc);
                   if(doc===undefined){
                       db.collection('rooms').update({roomCode:data.room},{$push:{playerList:data.name,idList:data.id}},function(err,result){
                    db.collection('rooms').findOne({roomCode:data.room},function(error,doc2){
                        console.log('sent to room');
                        console.log(data.room);
                        io.sockets.in(data.room).emit('playerAdded',{playerList:doc2.playerList});
                    
                    });
                    }); 
                   }
                   
                   
                  else{
                      if(doc.idList.indexOf(data.id)===-1){
                      
                     db.collection('rooms').update({roomCode:data.room},{$push:{playerList:data.name,idList:data.id}},function(err,result){
                    db.collection('rooms').findOne({roomCode:data.room},function(error,doc2){
                        console.log('sent to room');
                        console.log(data.room);
                        io.sockets.in(data.room).emit('playerAdded',{playerList:doc2.playerList});
                    
                    });
                    }); 
                      }
                      
                  }
               });
               
               
               
              
              
           }
       })
   })
   
   
   socket.on('disconnect',function(){
       deleteSocket(socket.roomCode,socket.nickname);
   })
   
});




server.listen(process.env.PORT||500,function(){
    console.log('Feezolini!');
});