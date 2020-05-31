var express = require('express');
var router = express.Router();

const sqlite3 = require('sqlite3').verbose();
var ACTIVE_STATE = '"ACTIVE"';
var COMPLETE_STATE = '"COMPLETE"';
var ACTIVITIES_TABLE_NAME = "Activities";
var CREATE_ACTIVITIES_TABLE_STATEMENT = 'CREATE TABLE ' + ACTIVITIES_TABLE_NAME +
  '(event_id integer PRIMARY KEY AUTOINCREMENT NOT NULL,' +
  'activity_type text,' +
  'label text,' +
  'start_time DATETIME NOT NULL,' +
  'end_time DATETIME,' +
  'state text);';
var CREATE_LABELS_TABLE_STATEMENT = 'CREATE TABLE Labels ' +
  '(label_id integer PRIMARY KEY AUTOINCREMENT NOT NULL,' +
  'activity_type text,' +
  'label text);';
  
let db = new sqlite3.Database(':memory:');
db.run(CREATE_ACTIVITIES_TABLE_STATEMENT);
db.run(CREATE_LABELS_TABLE_STATEMENT);

/* GET current activity. */
router.get('/current', function (req, res, next) {
  respondWithActiveActivities(res);
});

/* LIST all activities. If START_TIME is specified, returns activities since the start_time. 
If end_time is provided, will return all events before end_time. If both are provided returns
ones between the two.  */
router.get('/', async function (req, res, next) {
  var hasStartTime = !(typeof req.query.start_time === "undefined");
  var hasEndTime = !(typeof req.query.end_time === "undefined");
  if (!hasStartTime && !hasEndTime) {
    console.log("1");
    await respondWithAllActivities(res);
  }
  else if (!hasStartTime && hasEndTime) {
    console.log("2");
    await respondWithActivitiesUpToTime(req.query.end_time, res);
  }
  else if (hasStartTime && !hasEndTime) {
    console.log("3");
    await respondWithActivitiesFromTime(req.query.start_time, res);
  }
  else {
    await respondWithActivitesBetweenTimes(req.query.start_time, req.query.end_time, res);
  }
});

/* PUT new activity. The currently active activity is moved to COMPLETE, if there is a new label we write it to DB. */
router.put("/", async (req, res, next) => {
  await moveAllActivitiesToComplete(req.body.start_time);
  const labelID = await writeLabelIfPresent(req.body.activity_type, req.body.label);
  insertActiveActivityAndRespond(req.body.activity_type, req.body.start_time, req.body.label, res);
});

/* PUT new label. */
router.put('/labels', async function (req, res, next) {
  const labelID = await writeLabelIfPresent(req.query.activity_type ,req.query.label);
  res.status(200).json(labelID);
});

/* GET labels. If you specify an Activity it will only return tables for that activity. */
router.get('/labels', async function (req, res, next) {
  if(typeof req.query.activity_type === "undefined") await queryAllLabels(res);
  else await queryLabelsForActivity(req.query.activity_type, res);
});

async function queryAllLabels(res){
  var getAllLabelsQuery = "SELECT * from Labels;";
  await runQueryAndRespond(getAllLabelsQuery, res);
}

async function queryLabelsForActivity(activity_type, res){
  var getLabelsForActivityQuery = 'SELECT DISTINCT label from Labels where activity_type = "'+ activity_type +'";';
  await runQueryAndRespond(getLabelsForActivityQuery, res);
}

async function writeLabelIfPresent(activity_type, label): Promise<number | null> {
  if(typeof label === "undefined") return null;
  return writeLabel(activity_type, label);
}

async function writeLabel(activity_type, label): Promise<number | null> {
  const exists = await checkIfLabelAlreadyExists(activity_type, label);
  if (!exists) return null;

  var insertStatement = 'INSERT INTO Labels (activity_type, label)' +
    'values("' + activity_type + '", "' + label + '");';
  return new Promise((resolve, reject) => {
    db.run(insertStatement, [], function (err) {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      else {
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        resolve(this.lastID);
      }
    });
  });
}

async function checkIfLabelAlreadyExists(activity_type, label): Promise<boolean> {
  var selectStatement = 'SELECT * from Labels where activity_type = "' + activity_type + '" AND label = "' + label + '";';
  return new Promise((resolve, reject) => {
    db.all(selectStatement, [], (err, rows)  => {
      if (err) reject(err);
      else resolve(rows.length != 0);
    });
  });
}

async function respondWithAllActivities(res) {
  var getAllActivitesQuery = "SELECT * from " + ACTIVITIES_TABLE_NAME + ";";
  console.log(getAllActivitesQuery);
  await runQueryAndRespond(getAllActivitesQuery, res);
}

async function respondWithActivitiesUpToTime(time , res) {
  var getActivitiesUpToTimeQuery = "SELECT * from " + ACTIVITIES_TABLE_NAME + ' WHERE  datetime("' + time + '") > start_time;';
  console.log(getActivitiesUpToTimeQuery);
  await runQueryAndRespond(getActivitiesUpToTimeQuery, res);
}

async function respondWithActivitiesFromTime(time, res){
  var getActivitiesFromTimeQuery = "SELECT * from " + ACTIVITIES_TABLE_NAME + ' WHERE  datetime("' + time + '") < end_time;';
  console.log(getActivitiesFromTimeQuery);
  await runQueryAndRespond(getActivitiesFromTimeQuery, res);
}

async function respondWithActivitesBetweenTimes(start_time, end_time, res){
  var getActivitiesBetweenTimesQuery = "SELECT * from " + ACTIVITIES_TABLE_NAME + ' WHERE datetime("' + start_time + '") < end_time ' +
   'AND datetime("' + end_time + '") > start_time;';
   console.log(getActivitiesBetweenTimesQuery);
   await runQueryAndRespond(getActivitiesBetweenTimesQuery, res);
}

async function respondWithActiveActivities(res) {
  var getActiveActivitiesQuery = "SELECT * from " + ACTIVITIES_TABLE_NAME + " WHERE state = " + ACTIVE_STATE + ";";
  console.log(getActiveActivitiesQuery);
  await runQueryAndRespond(getActiveActivitiesQuery, res);
}

async function moveAllActivitiesToComplete(start_time): Promise<void> {
  var updateStatement = 'UPDATE ' + ACTIVITIES_TABLE_NAME + " SET state = " + COMPLETE_STATE + ', end_time = ' 
                   + " datetime('" + start_time + "') where event_id = (SELECT MAX(event_id) from "+ ACTIVITIES_TABLE_NAME + ") ;";
  console.log(updateStatement);
  return new Promise((resolve, reject) => {
    db.run(updateStatement, [], function (err) {
      if (err) {
        console.error(err.message);
        reject(err);
      } else resolve();
    });
  });
}

async function insertActiveActivityAndRespond(activity_type, start_time, label, res): Promise<number> {
  var insertStatement;
  if (typeof label === "undefined") insertStatement = 'INSERT INTO ' + ACTIVITIES_TABLE_NAME + ' (activity_type, start_time, state)' +
    'values("' + activity_type + '", datetime("' + start_time + '"),' + ACTIVE_STATE + ')';
  else insertStatement = 'INSERT INTO ' + ACTIVITIES_TABLE_NAME + ' (activity_type, label, start_time, state) ' +
    'values("' + activity_type + '","' + label + '", datetime("' + start_time + '"), ' + ACTIVE_STATE + ')';
  console.log(insertStatement);
  return new Promise((resolve, reject) => {
    db.run(insertStatement, [], function (err) {
      if (err) {
        console.log(err.message);
        reject(err);
      }
      else {
        // get the last insert id
        console.log(`A row has been inserted with rowid ${this.lastID}`);
        res.status(200).json({ ID: this.lastID });
        resolve(this.lastID);
      }
    });
  });
}

async function runQueryAndRespond(query, res): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) reject(err);
      else {
        res.status(200).json(rows).end();
        resolve(rows);
      }
    });
  });
}

process.on('exit', function () {
  db.close();
});

module.exports = router;