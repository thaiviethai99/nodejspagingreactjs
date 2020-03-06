var express = require("express");
var fs = require("fs");
var moment = require("moment");
var pool = require("./database");
var cors = require("cors");
var app = express();
app.use(cors());
app.use(function(req, res, next) {
    res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires', '-1');
    res.header('Pragma', 'no-cache');
    next()
});
// environment variables
process.env.NODE_ENV = "development";
// uncomment below line to test this code against staging environment
// process.env.NODE_ENV = 'staging';
// config variables
const config = require("./config/config.js");
app.get("/", async (req, res) => {
    return res.send("homepage");
});
app.get("/list", async (req, res) => {
    let page = req.query.page;
    let sql = `SELECT count(*) as total FROM news order by id desc`;
    let totalData = await pool.query(sql);
    let totalRecords = totalData[0].total;
    let current_page = 1;
    if (page) {
        current_page = page;
    }
    let limit = 2;
    let total_page = Math.ceil(totalRecords / limit);
    if (current_page > total_page) {
        current_page = total_page;
    } else if (current_page < 1) {
        current_page = 1;
    }
    let start = (current_page - 1) * limit;
    let dataQuery = `SELECT * FROM news  order by id desc LIMIT ${start}, ${limit}`;
    dataQuery = await pool.query(dataQuery);
    var data = [];
    dataQuery.forEach(function(item) {
        data.push({
            id: item.id,
            title: item.title
        });
    });
    let jsonResult = {
        info: 0,
        current_page: current_page,
        per_page: limit,
        total_page: total_page,
        total: totalRecords
    };
    jsonResult = { ...jsonResult,
        data: data
    };
    return res.send(jsonResult);
});
var server = app.listen(global.gConfig.node_port, function() {
    console.log("Magic happens on port " + global.gConfig.node_port);
});
exports = module.exports = app;