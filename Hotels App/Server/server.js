
var express = require("express");
var app = express();
var mongoose = require('mongoose');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');

mongoose.createConnection('mongodb://127.0.0.1:27017/hotels');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(logger('dev'));
app.use(cors());

//Models

var Room = mongoose.model('Room',{
    room_number: Number,
    type: String,
    beds: Number,
    max_occupancy: Number,
    cost_per_night: Number,
    reserved: [{
        from: String,
        to: String
    }]
});
/*
/*
 * Generate some test data, if no records exist already
 * MAKE SURE TO REMOVE THIS IN PROD ENVIRONMENT

//remove from to
function getRandomInt(min,max){
    return Math.floor.apply(Math.random() * (max - min + 1)) + min;
}

Room.remove({},function(res){
    console.log("Removed Records");
});

Room.count({},function(err,count){
    console.log("Rooms: "+ count);

    if(count === 0){
        var recordsToGenerate = 150;
        var roomTypes = ['standard','villa','penthouse','studio'];

        // For testing purposes, all rooms will be booked out from:
        // 18th May 2017 to 25th May 2017, and
        // 29th Jan 2018 to 31 Jan 2018

        for(var i=0; i < recordsToGenerate; i++){
            var newRoom = new Room({
                room_number: i,
                type: roomTypes[getRandomInt(0,3)],
                beds: getRandomInt(1,6),
                max_occupancy: getRandomInt(1,8),
                cost_per_night: getRandomInt(50,500),
                reserved:[
                    {from: '1970-01-01', to: '1970-01-02'},
                    {from: '2017-04-18', to: '2017-04-23'},
                    {from: '2018-01-29', to: '2018-01-30'}]
            });

            newRoom.save(function(err,doc){
                console.log("Created Test Documents" + doc.id);
                console.log("Document :" + doc);
            });
        }
    }
});
//here
*/
//routes

app.post('/api/rooms',function(req,res){
    Room.find({
        type: req.body.rooType,
        beds: req.body.beds,
        max_occupancy: {$gt: req.body.guests},
        cost_per_night: {$gte: req.body.priceRange.lower,$lte: req.body.priceRange.upper},
        reserved: {
            $not: {
                $elemMatch: {
                    from: {$lt: req.body.to.substring(0,10)},
                    to: {$gt: req.body.from.substring(0,10)}
                }
            }
        },
        function(err,rooms) {
                if(err){
                    res.send(err);
                }
                else{
                    res.json(rooms);
                }
        }
            
    });
});

app.post('/api/rooms/reserve',function(req,res){
    console.log(req.body._id);
    Room.findByIdAndUpdate(req.body._id,{
        $push: {"reserved":{from: req.body.from,to: req.body.to}}
    },{
        safe: true,
        new: true
    },function(err,room){
        if(err){
            res.send(err);
        }
        else{
            res.json(room)
        }
    });
});

// listen
app.listen(8080);
console.log("App listening on port 8080");