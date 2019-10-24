'use strict';

const app = require('express')();
const port = process.env.PORT || 3000;
var cors = require('cors')
const bodyParser = require('body-parser')

const Pool = require('pg').Pool

const pool = new Pool({
  host : 'onedemo.metrosystems.co.th',
  user: 'postgres', 
  database: 'postgres',
  password: 'password',
  port: 80,
  ssl:false
  
})

const issue2options = {
  origin: true,
  methods: ["POST"],
  credentials: true,
  maxAge: 3600
};

app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

const request = require('request');

// Replace <Subscription Key> with your valid subscription key.
const subscriptionKey = '8b1838e13407455daf92a98bd51016ba';

// You must use the same location in your REST call as you used to get your
// subscription keys. For example, if you got your subscription keys from
// westus, replace "westcentralus" in the URL below with "westus".
const uriDetect = 'https://southeastasia.api.cognitive.microsoft.com/face/v1.0/detect/';

const imageUrl =
    'https://noblesamplebot9711.blob.core.windows.net/oneteam/arun_1.PNG';

    // Request parameters.
const params = {
    'returnFaceId': 'true',
    'returnFaceLandmarks': 'false',
    'returnFaceAttributes': 'age,gender,headPose,smile,facialHair,glasses,' +
        'emotion,hair,makeup,occlusion,accessories,blur,exposure,noise'
};

const options = {
    uri: uriDetect,
    qs: params,
    body: '{"url": ' + '"' + imageUrl + '"}',
    headers: {
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key' : subscriptionKey
    }
};


app.get('/monthly/',cors(issue2options),function(req,res){
  request.post(options, (error, response, body) => {
    if (error) {
      console.log('Error: ', error);
      return;
    }
    let jsonResponse = JSON.parse(body);
    //let res = JSON.stringify(jsonResponse, null, '  ');
    var date = new Date();
    var month = date.getMonth()+1;
    var day = date.getDate();
  
    let gender = jsonResponse[0].faceAttributes.gender;
    let age = jsonResponse[0].faceAttributes.age;
    console.log('JSON Response\n');
    console.log("age: " ,age + " , gender: " + gender);
  
    var cluster = "";
    if(gender="female"){
      if(age>=54 && age <= 80){
        cluster="Cluster_1";
      }else if(age>=41 && age <= 53 ){
        cluster="Cluster_2"
      }else if(age>=15 && age <= 40 ){
        cluster="Cluster_3"
      }
      else{
        cluster="Cluster_3"
      }
    }if(gender="male"){
      if(age>=56 && age <= 80){
        cluster="Cluster_6";
      }else if(age>=42 && age <= 55 ){
        cluster="Cluster_5"
      }else if(age>=15 && age <= 41 ){
        cluster="Cluster_4"
      }else{
        cluster="Cluster_4"
      }
    }
      pool.query('SELECT round_500 FROM  public_b1.cluster_monthly_spent where cluster_group = $1 and Day = $2 and Month = $3;',[cluster,day,month], (error, results) => {
        if (error) {
          throw error
        }
       // response.status(200).json(results.rows);
       console.log(day+" "+month+" "+cluster);
        res.send(results.rows);
      })
  });

});

app.listen(port, function() {
  console.log('Starting node.js on port ' + port);
});

