const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
const mongoUrl = "mongodb://127.0.0.1:27017/";
const dbName = "emp";
const collectionName = "teacher";
app.post("/addteacher", function(req, res) {
    const { fullName, age, dateOfBirth, numberOfClasses } = req.body;
    MongoClient.connect(mongoUrl)
        .then(function(db) {
            const dbo = db.db(dbName);
            const myobj = { fullName, age, dateOfBirth, numberOfClasses };
            dbo.collection(collectionName).insertOne(myobj)
                .then(function() {
                    console.log("Teacher Record Inserted.");
                    res.send("Insert Success.");
                })
                .catch(function(err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                })
                .finally(() => db.close());
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});
app.post("/updateteacher", function(req, res) {
    const { empid, fullName, age, dateOfBirth, numberOfClasses } = req.body;
    MongoClient.connect(mongoUrl)
        .then(function(db) {
            const dbo = db.db(dbName);
            const myquery = { empid };
            const newvalues = { $set: { fullName, age, dateOfBirth, numberOfClasses } };
            dbo.collection(collectionName).updateOne(myquery, newvalues)
                .then(function() {
                    console.log("Teacher Record Updated.");
                    res.send("Update Success.");
                })
                .catch(function(err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                })
                .finally(() => db.close());
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});
app.post("/filterteachers", function(req, res) {
    const { age, numberOfClasses } = req.body;
    MongoClient.connect(mongoUrl)
        .then(function(db) {
            const dbo = db.db(dbName);
            const query = {};
            if (age) {
                query.age = age;
            }
            if (numberOfClasses) {
                query.numberOfClasses = numberOfClasses;
            }
            dbo.collection(collectionName).find(query).toArray()
                .then(function(result) {
                    console.log("Fetching filtered teachers");
                    res.send(result);
                })
                .catch(function(err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                })
                .finally(() => db.close());
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});
app.get("/allteachers", function(req, res) {
    MongoClient.connect(mongoUrl)
        .then(function(db) {
            const dbo = db.db(dbName);
            dbo.collection(collectionName).find({}).toArray()
                .then(function(result) {
                    console.log("Fetching all teachers");
                    res.send(result);
                })
                .catch(function(err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                })
                .finally(() => db.close());
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});
app.post("/searchteacher", function(req, res) {
    const fullName = req.body.fullName;
    MongoClient.connect(mongoUrl)
        .then(function(db) {
            const dbo = db.db(dbName);
            const query = { fullName };

            dbo.collection(collectionName).find(query).toArray()
                .then(function(result) {
                    console.log("Searching for teacher");
                    res.send(result);
                })
                .catch(function(err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                })
                .finally(() => db.close());
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});
app.post("/deleteteacher", function(req, res) {
    const fullName = req.body.fullName;
    MongoClient.connect(mongoUrl)
        .then(function(db) {
            const dbo = db.db(dbName);
            const query = { fullName };
            dbo.collection(collectionName).deleteOne(query)
                .then(function() {
                    console.log("Teacher Record Deleted.");
                    res.send("Delete Success.");
                })
                .catch(function(err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                })
                .finally(() => db.close());
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});
app.get("/averageclasses", function(req, res) {
    MongoClient.connect(mongoUrl)
        .then(function(db) {
            const dbo = db.db(dbName);
            dbo.collection(collectionName).aggregate([{
                        $match: { numberOfClasses: { $exists: true, $ne: null } }
                    },
                    {
                        $group: {
                            _id: null,
                            averageClasses: { $avg: { $toDouble: "$numberOfClasses" } }
                        }
                    }
                ]).toArray()
                .then(function(result) {
                    if (result.length > 0) {
                        console.log("Calculating average number of classes");
                        res.send({ averageClasses: result[0].averageClasses });
                    } else {
                        console.log("No data available");
                        res.send({ averageClasses: null });
                    }
                })
                .catch(function(err) {
                    console.log(err);
                    res.status(500).send("Internal Server Error");
                })
                .finally(() => db.close());
        })
        .catch(function(err) {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});
app.listen(5000, function() {
    console.log("Server is running on port number 5000");
});
