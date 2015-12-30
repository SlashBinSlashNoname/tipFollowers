
var http = require("http");
var Twitter = require('twitter');


//Connect to Twitter Api

    
    

var tipFollowers = {
    
    // Specify you api , use an alternative account to prevent spaming your original (ie using @itsnotabot for sending in the name of @itsnotan3rror)

    twitterConsumerKey: 'qpvxkcTru2Rk63IYQfzfPk1IP',
    twitterConsumerSecret: '5BVfP7V2kWJVnMT2c8aC1T7lJVNz8OVWaaPjRHCtATzWMsVIE4',
    twitterAccessTokenKey: '4655677287-4pqJVkcBBRnXFM6Qjkk6hcNUuQnW0VfZAurjtHB',
    twitterAccessTokenSecret: 'VSOTG7NkLOBXONA1gC7aVpTopeeaOHSlHtUzuxudArP1Q',
    
    testnet: true,
    
    // Message to send
    message: 'Merry Christmas %screen_name% ! %sender% sent you %amount% bits worth of Bitcoins ! @changetip',
    
    //amount, in bits.
    maxAmount: 15000,
    
    // 0 to define automatically or force it
    amount: 0, 
    
    
    
    
    params: {
        screen_name: 'itsnotan3rror',   // screen name, source of the tip
        cursor: -1,                     // cursor, working with pagination
        count:40
    },
    
    // delay between queries, prevent the limit of api calls (not needed on status)
    delayQueryFollowers: 60000, 
    
    // api Twitter is stored here
    api : null,
    
    
    
    run: function(){

        tipFollowers.api = new Twitter({
            consumer_key: tipFollowers.twitterConsumerKey,
            consumer_secret: tipFollowers.twitterConsumerSecret,
            access_token_key: tipFollowers.twitterAccessTokenKey,
            access_token_secret: tipFollowers.twitterAccessTokenSecret
        });
        // get an amount 

        tipFollowers.retrieveUserInfo(function(info){
            
            if(tipFollowers.amount == 0)
                tipFollowers.amount = parseInt(((tipFollowers.maxAmount/info.followers_count)/10),10)*10; // round it to int
            
            console.log('Sending ' +tipFollowers.amount + ' bits per followers to '+ info.followers_count+ ' followers');
            tipFollowers.retrieveFollowers();
        });
        
            
    },
    retrieveUserInfo:function(callback){
         tipFollowers.api.get('users/show',{screen_name: tipFollowers.params.screen_name}, function(error, info, response){
            if(!error){
                callback(info);
            } else {
                console.error(error);
            }
           
        });
    },
    retrieveFollowers: function(){
        
        // Get time at start
        var start= new Date().getTime();
        
        // Retrieve users
        tipFollowers.api.get('followers/list',tipFollowers.params, function(error, followers, response){
            if (!error) {
                 
                // define next cursor with next_cursor
                tipFollowers.params.cursor = followers.next_cursor;

                   // Send tips to followers
                   tipFollowers.sendTipToUsers(followers.users, function(array) {
                       
                       // If we are not at the last cursor 
                       if( tipFollowers.params.cursor != 0 ){
                        console.log('chatte');
                            // See the time it takes 
                            var time = tipFollowers.delayQueryFollowers - (new Date().getTime()-start);
                            time = (time>0)?time:0;
                            
                            // Print it to have a log
                            console.log('Ok, waiting for '+time/1000+' seconds');
                            
                            // Set it as interval before retrieving another stack of followers
                            setInterval(tipFollowers.retrieveFollowers, time);
                       }
                   });
                
            } else {
                
                // no comments
                console.log(error);
                
            }
        });
         
    },
    sendTipToUsers: function(users,callback){
       
        // Foreach users, as val
        users.forEach(function(val, index, array){
            
            if(tipFollowers.params.cursor != -1 && index != 0){
                
                // Send Message
                tipFollowers.sendMessage(val);
                
            }
            
            // If we have ended the loop
            if (array.length == index+1)
                callback(array);
        });

    },
    sendMessage:function(user){
        
        // placeholders
        var message = tipFollowers.message.replace(/%screen_name%/g, '@'+user.screen_name)
        message = message.replace(/%sender%/g, '@'+tipFollowers.params.screen_name);
        message = message.replace(/%amount%/g, '@'+tipFollowers.amount);
        
        // If message is over 140, refuse to launch it @todo
        if(message.length > 140){
            console.error(user.screen_name+ ' : Punished by the length');
            return false;
        }
        
        // Press start to play
        var status = {
          status: message
        };
        console.log(message);
        //tipFollowers.api.post('statuses/update', status, function(error, tweet, response){
        //    console.log(tweet);
        //});
        
    },
   
};

tipFollowers.run();