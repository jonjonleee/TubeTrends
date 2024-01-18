// HTML FORM REFERENCE: https://www.tutsmake.com/node-js-express-insert-data-from-form-into-mysql-database/
// READING DATA INTO HTML: https://codingstatus.com/how-to-display-data-from-mysql-database-table-in-node-js/
var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var path = require('path');
const session = require("express-session");


var landing = require("./routes/landing.js");
const { userInfo } = require('os');

// MSQL DISCONNECT CONFIG: https://stackoverflow.com/questions/20210522/nodejs-mysql-error-connection-lost-the-server-closed-the-connection
var db_config = {
  host: '34.171.181.180', 
  user: 'root',      
  password: 'password',      
  database: 'TubeTrendz' 
};

var connection;

function handleDisconnect() {
  connection = mysql.createConnection(db_config); // Recreate the connection, since
                                                  // the old one cannot be reused.

  connection.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log("Failed to connect to TubeTrendz", err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    }                                     // to avoid a hot loop, and to allow our node script to
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  connection.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();

var app = express();

// set up ejs view engine 
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
 
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + '../public'));

// Configure Session middleware
app.use(session({
  secret: 'Shhhhh TubeTrendz',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    maxAge: 60000 // 1 min
  } 
 }));


app.use("/", landing); // Use / as landing page path

/* GET New User Page. */
app.get('/newuser', function (req, res, next) {
    var sql = 'SELECT MAX(userID) AS maxId FROM User';
    connection.query(sql,(err, rows) => {
      if (err) {
          return res.send(err);
        }
      // assign userID here
      req.session.userID = rows[0].maxId + 1;

      return res.render('newuser', {warning: ""});
    });
});


app.post('/user_favorites', async function(req, res) {

  favoriteVideoIDs = req.body;
  req.session.userFavorties = "";
  for (const vid in favoriteVideoIDs){
    req.session.userFavorties += vid + ",";
    console.log(vid);
  }
  req.session.userFavorties = req.session.userFavorties.slice(0,-1);
  if (req.session.userFavorties == undefined) {
    req.session.userFavorties = '';
  }
  var sql = `CALL favoriteRanks ('${req.session.userID}','${req.session.userFavorties}') `;
  connection.query(sql,(err, rows) => {
  if (err) {
      return res.send(err);
    }
    // req.session.userFavoritesQuery = rows[0];
    // console.log(req.session.userFavorties);
  return res.redirect('/trends'); // go back to trends 
});
});

/* Read From New User Page. */
app.post('/user_info', async function(req, res) {

  req.session.f_name = req.body.f_name;
  req.session.l_name = req.body.l_name;
  req.session.email = req.body.email.toLowerCase();
  req.session.password  = req.body.password;
  req.session.birthday = req.body.birthday;

  var sql = `INSERT INTO User (userID,FirstName,LastName,Email,Password,Birthday) VALUES ('${req.session.userID}','${req.session.f_name}','${req.session.l_name}','${req.session.email}','${req.session.password}','${req.session.birthday}')`;
  
  connection.query(sql,(err, rows) => {
    if (err) {
      if(err.code == "ER_DUP_ENTRY"){
        return res.render('newuser', {warning: "An Account Already Exists With That Email Address. Try a New One."});
      }
      else {
        return res.send(err);
      }
    } 
    req.session.authorized = true;
    return res.redirect('/trends'); // go to landing page 
    });
  });

  /* GET edit user page*/
  app.get('/editprofile', function (req, res, next) {
    if (req.session.authorized == undefined) {
      res.redirect('/');
    }
    else{
      var user = {};
      user.FirstName = req.session.f_name;
      user.LastName = req.session.l_name;
      user.Email = req.session.email;   
      user.Password = req.session.password;
      user.Birthday = req.session.birthday;
      var date = new Date(user.Birthday);
      let datestring = date.getFullYear().toString().padStart(4, '0') + '-' + (date.getMonth()+1).toString().padStart(2, '0') + '-' + date.getDate().toString().padStart(2, '0');
      current_name = req.session.f_name;
      return res.render('editprofile', { user: user, birthday: datestring, current_name, warning: "" });
    }
   });

/* Edit Details of User*/
app.post('/edit_profile_details', async function(req, res) {

  var f_name = req.body.f_name;
  var l_name = req.body.l_name;
  var email = req.body.email.toLowerCase();
  var password  = req.body.password;          // changing email may cause conflicts in DB if email already exists elsewhere
  var birthday = req.body.birthday;

  req.session.f_name = f_name;
  req.session.l_name = l_name;
  req.session.email = email;
  req.session.password  = password;
  req.session.birthday = birthday;
  var sql = `UPDATE User SET FirstName = '${f_name}', LastName = '${l_name}', Email = '${email}', Password = '${password}', Birthday = '${birthday}' WHERE userID = '${req.session.userID}'`;
  
  connection.query(sql,(err, rows) => {
    if (err) {
      return res.send(err);
    } 
    return res.redirect('/editprofile'); 
  });
  });


/* Read From Delete Button action */
  app.post('/delete_profile', async function(req, res) {
    var sql = `DELETE FROM User WHERE userID = '${req.session.userID}'`;
    connection.query(sql,(err, rows) => {
      if (err) {
        return res.send(err);
      } 
      req.session.destroy();
      return res.redirect('/'); // go to landing page 
      });
 });

/* GET Login Page. */
app.get('/userlogin', function (req, res, next) {
  if (req.session.authorized) {
    return res.redirect('/trends');
  }
  else{
    return res.render('login');
  }
});
/* Read From Login Page. */
app.post('/login_user', async function(req, res) {

  var username = req.body.username.toLowerCase();
  var password  = req.body.password;

  var sql = `SELECT * FROM User WHERE Email = '${username}' AND Password = '${password}'`;
  connection.query(sql,(err, rows) => {
    if (err) {
        return res.send(err); 
    }
    else if(rows.length > 0 ) {
      // console.log(rows);
      req.session.authorized = true;
      req.session.userID = rows[0].userID;
      req.session.f_name = rows[0].FirstName;
      req.session.l_name =rows[0].LastName;
      req.session.email = rows[0].Email;
      req.session.password = rows[0].Password;
      req.session.birthday = rows[0].Birthday;
      return res.redirect('/trends'); // go to trends page 
    }
    else{
      return res.render('login'); // redisplay login page, since they logined with the wrong credentials, 
                                  // add a warning that their username/password is wrong
    }
    });
  });

  /* GET Trends Page */
  function getInitialData(callback) {
    var sql = `SELECT Channel.channelName as channel, SUM(TrendingStats.viewCount) as views
                FROM Video 
                LEFT JOIN TrendingStats ON Video.videoID = TrendingStats.videoID 
                LEFT JOIN Channel on Channel.channelID = Video.channelID 
                GROUP BY Video.ChannelID ORDER BY views DESC LIMIT 15`;
    
    connection.query(sql, (err, rows) => {
        if (err) {
            return callback(err, null, null);
        }

        var sql2 = `SELECT Video.title as title, TrendingStats.likeCount as likes, TrendingStats.viewCount as views
                    FROM Video
                    LEFT JOIN TrendingStats ON Video.videoID = TrendingStats.videoID
                    ORDER BY views DESC
                    LIMIT 1`;

        connection.query(sql2, (err2, rows2) => {
            if (err2) {
                return callback(err2, null, null);
            }

            var sql3 = `SELECT DISTINCT Video.videoID as id, Video.title as title, Channel.channelName as channel, Category.categoryName as category, videoMax.maxCount as views
                        FROM  
                        (SELECT v.title, MAX(t.viewCount) as maxCount
                        FROM Video v JOIN TrendingStats t ON v.videoID = t.videoID
                        GROUP BY v.title) AS videoMax
                        JOIN Video ON videoMax.title = Video.title
                        JOIN Channel on Channel.channelID = Video.channelID 
                        JOIN Category on Category.categoryID = Video.categoryID
                        ORDER BY views DESC LIMIT 100`

            connection.query(sql3, (err3, rows3) => {
                if (err3) {
                    return callback(err3, null, null);
                }
                //console.log(rows3);

                var sql4 = `SELECT DISTINCT Category.categoryName as category, SUM(TrendingStats.viewCount) as views
                        FROM Video
                        JOIN Category on Category.categoryID = Video.categoryID
                        JOIN TrendingStats ON Video.videoID = TrendingStats.videoID
                        GROUP BY category
                        ORDER BY views DESC LIMIT 1`

                  connection.query(sql4, (err4, rows4) => {
                      if (err4) {
                          return callback(err4, null, null);
                      }


                callback(null, rows, rows2, rows3, rows4);
                });
            });
        });
    });
}

// Route to render the initial page with the table
app.get('/trends', (req, res) => {
  if (req.session.authorized == undefined) {
    res.redirect('/');
  }
  else {
    getInitialData((err, rows, rows2, rows3, rows4) => {
        if (err) {
            return res.send(err);
        }
        let curr_userID = req.session.userID;
        var sql5 = `SELECT DISTINCT Favorite.videoID as ID
        FROM Favorite
        JOIN Video ON Video.videoID = Favorite.videoID
        WHERE Favorite.userID = '${curr_userID}';`

        connection.query(sql5, (err5, rows5) => {
          if (err5) {
              return callback(err5, null, null);
          }
        let current_name = req.session.f_name;
        // GET CHECKED BOXES AS A LIST 
        let rows5new = rows5.map(item => item.ID);
        //console.log(rows5new);
        //console.log(rows3);
        res.render('trends', { items: rows, items2: rows2, items3: rows3, items4: rows4, items5: rows5new, current_name});
    });
  });
  }
});

// Route to handle the form submission and execute the SQL query
app.post('/search', (req, res) => {
    const searchTerm = req.body.category;
  
      // Function to perform the search
      function performSearch(callback) {
          // Modify the SQL query conditionally based on whether a search term is provided
          let searchSql;
          let searchParams;
  
          if (searchTerm && searchTerm.trim() !== '') {
              // If a non-empty search term is provided, filter by the specified category
              searchSql = `SELECT DISTINCT Video.videoID as id, Video.title as title, Channel.channelName as channel, Category.categoryName as category, videoMax.maxCount as views
                            FROM  
                            (SELECT v.title, MAX(t.viewCount) as maxCount
                            FROM Video v JOIN TrendingStats t ON v.videoID = t.videoID
                            GROUP BY v.title) AS videoMax
                            JOIN Video ON videoMax.title = Video.title
                            JOIN Channel on Channel.channelID = Video.channelID 
                            JOIN Category on Category.categoryID = Video.categoryID
                            WHERE Category.categoryName = ?
                            ORDER BY views DESC LIMIT 100`
              searchParams = [searchTerm];
          } else {
              // If no search term is provided, include results for any category
              searchSql = `SELECT DISTINCT Video.videoID as id, Video.title as title, Channel.channelName as channel, Category.categoryName as category, videoMax.maxCount as views
                            FROM  
                            (SELECT v.title, MAX(t.viewCount) as maxCount
                            FROM Video v JOIN TrendingStats t ON v.videoID = t.videoID
                            GROUP BY v.title) AS videoMax
                            JOIN Video ON videoMax.title = Video.title
                            JOIN Channel on Channel.channelID = Video.channelID 
                            JOIN Category on Category.categoryID = Video.categoryID
                            ORDER BY views DESC LIMIT 100`;
              searchParams = [];
          }
  
          connection.query(searchSql, searchParams, (err, searchResults) => {
              if (err) {
                  return callback(err, null);
              }
  
              callback(null, searchResults);
          });
      }

    // Perform the search and get the necessary data
    performSearch((err, searchResults) => {
        if (err) {
            return res.send(err);
        }

        // Retrieve rows2 and rows3 for consistency
        getInitialData((err, rows, rows2, rows3, rows4) => {
            if (err) {
                return res.send(err);
            }
            let curr_userID = req.session.userID;
            var sql5 = `SELECT DISTINCT Favorite.videoID as ID
                        FROM Favorite
                        JOIN Video ON Video.videoID = Favorite.videoID
                        WHERE Favorite.userID = '${curr_userID}';`

        connection.query(sql5, (err5, rows5) => {
          if (err5) {
              return callback(err5, null, null);
          }
            let current_name = req.session.f_name;
            // Render the trends page with the search results
            let rows5new = rows5.map(item => item.ID);
            // console.log(rows5new);
            // console.log(searchResults);
            res.render('trends', { items: rows, items2: rows2, items3: searchResults, items4: rows4, items5: rows5new, current_name });
        });
      });
    });
});

app.get('/favorites', function (req, res, next) {
  if (req.session.authorized == undefined) {
    res.redirect('/');
  }
  else {
    if (req.session.userFavorties == undefined) {
      req.session.userFavorties = '';
    }
  var sql = `CALL favoriteRanks ('${req.session.userID}','${req.session.userFavorties}') `;
  connection.query(sql,(err, rows) => {
    if (err) {
        return res.send(err);
      }
    current_name = req.session.f_name;
    // req.session.userFavoritesQuery = rows[0];
    return res.render('favorites', {items: rows[0], current_name});
  });
}
});

// End User session when they logout
app.get('/logout', async function(req, res, next) {
  req.session.destroy(function(err) {
      console.log('Destroyed session')
   })
  res.redirect('/');
});

app.listen(3000, function () {
  console.log('TubeTrendz app is running on port 3000');
  });
