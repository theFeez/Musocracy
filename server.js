var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser=require('body-parser');
var MongoClient = require('mongodb').MongoClient;
app.use(bodyParser.urlencoded({extended:true,limit:'50mb'}));
app.use(bodyParser.json({limit:'50mb'}));



app.get('/',function(req,res){
    
    console.log('sent');
   res.send('Asombroso!'); 
});

app.get('/socket',function(req,res){
    res.sendFile(__dirname+'/test.html')
})

app.post('/createRoom',function(req,res){
    console.log(req.body.name);
    MongoClient.connect('mongodb://localhost:27017/musocracy', function(err, db){
      if (err){
        console.log('fuckin errors');
        throw err;
      }
        db.collection('rooms').insert({'roomCode':req.body.code},function(error,response){
            console.log('gucci');
            res.end();
            db.close();
        });
        
        
        
        
        
    });
    
    
    
});

app.get('/room',function(req,res){
    
})

io.on('connection',function(socket){
    console.log('connected');
    var list=[];
    socket.on('join',function(data){
        socket.join(data.roomCode);
        MongoClient.connect('mongodb://localhost:27017/musocracy', function(err, db){
      if (err){
        console.log('fuckin errors');
        throw err;
      }
        db.collection('rooms').find({'roomCode':data.roomCode}).toArray(function(error,result){
            console.log(result[0].playerList);
            list = result[0].playerList
        });
            list.push(data.name);
        db.collection('rooms').update({'roomCode': data.roomCode},{$set:{'playerList':list}});
        db.collection('rooms').find({'roomCode':data.roomCode}).toArray(function(error,result){
            console.log(result);
            
        });
        
        
        
        
    });
    })
    socket.emit('message','sonics the name, and speeds my game');
});



server.listen('8080',function(){
    console.log('Feezolini!');
});