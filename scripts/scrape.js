// Scrape Script

// Require axios and cheerio, making our scrapes possible
var axios = require("axios");
var cheerio = require("cheerio");

var scrape = function (cb) {
 
    axios.get("https://www.washingtonpost.com/").then(function(body) {
        var $ = cheerio.load(body.data);

        var articles = [];

        $(".headline").each(function (i, element) {

            var head = $(this).children("a").text().trim();
            var link = $(this).children("a").attr("href");
            var sum = $(this).siblings(".blurb").text().trim();
          
            if (head && sum && link) {
                var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
                var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
                // var linkNeat = link.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
               
                var dataToAdd = {
                    headline: headNeat,
                    summary: sumNeat,
                    url: link
                };
                articles.push(dataToAdd);
            }
        });
        cb(articles);
        console.log(articles)
    });
};

module.exports = scrape;