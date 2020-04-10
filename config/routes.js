// Server Routes
//==============

// Bring in the Scrape function from our scripts directory
var scrape = require("../scripts/scrape");

// Bring headlines and notes from the controller
var headlinesController = require("../controllers/headlines");
var notesController = require("../controllers/notes");

module.exports = function(router) {
   
    // This route renders the homepage
    router.get("/", function (req, res) {
        res.render("home");
    });
    
    // This route renders the saved handlebars page
    router.get("/saved", function (req, res) {
        res.render("saved");
    });

    // Route to bring in new articles
    router.get("/api/fetch", function(req, res) {
        headlinesController.fetch(function(err, docs) {
            if (!docs || docs.insertedCount === 0) {
                res.json({
                    message: "No new articles today. Check back tomorrow!"
                });
            }
            else {
                res.json({
                    message: "Added " + docs.insertedCount + " new articles!"
                });
            }
        });
    });

   // Gets all the data from our database
    router.get("/api/headlines", function(req, res) {
        var query = {};
        if (req.query.saved) {
            query = req.query;
        }
        headlinesController.get(query, function (data) {
            res.json(data);
        });
    });

    // Route to delete a specific aritcle
    router.delete("/api/headlines/:id", function (req, res) {
        var query = {};
        query._id = req.params.id;
        headlinesController.delete(query, function (err, data) {
            res.json(data);
        });
    });

    // Route to update headlines
    router.patch("/api/headlines", function (req, res) {
        headlinesController.update(req.body, function (err, data) {
            res.json(data);
        });
    });

    // Route to grab all notes associated with an article
    router.get("/api/notes/:headline_id?", function (req, res) {
        var query = {};
        if (req.params.headline_id) {
            query._id = req.params.headline_id;
        }

        notesController.get(query, function (err, data) {
            res.json(data);
        });
    });

    // Route to delete a notee associated with an article
    router.delete("/api/notes/:id", function (req, res) {
        var query = {};
        query._id = req.params.id;
        notesController.delete(query, function (err, data) {
            res.json(data);
        });
    });

    // Route to post new notes to articles
    router.post("/api/notes", function (req, res) {
        notesController.save(req.body, function (data) {
            res.json(data);
        });
    });
}