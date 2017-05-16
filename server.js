var express = require('express')
var path = require('path')
var serveStatic = require('serve-static')
var opn = require('opn')

var app = express()
app.use(serveStatic(path.join(__dirname)))

var port = process.env.PORT || 5000
var server = app.listen(port)

console.log("☆'s MHGen Talisman Editor running on http://localhost:" + port + " ...")

opn('http://localhost:' + port)
