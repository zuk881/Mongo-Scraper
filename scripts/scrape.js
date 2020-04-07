// Scrape Script

// Require axios and cheerio, making our scrapes possible
var axios = require("axios");
var cheerio = require("cheerio");

var scrape = function (cb) {

 
    axios.get("https://www.foxnews.com/").then(function(body) {
        var $ = cheerio.load(body.data);

        var articles = [];

        $(".title").each(function (i, element) {

            var head = $(element).children("a").text().trim();
            var sum = $(element).children("a").attr("href");
            console.log("log-1" + head)
            console.log("log-2" + sum)
            if (head && sum) {
                var headNeat = head.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
                var sumNeat = sum.replace(/(\r\n|\n|\r|\t|\s+)/gm, " ").trim();
               
                var dataToAdd = {
                    headline: headNeat,
                    summary: sumNeat
                };
                articles.push(dataToAdd);
            }
        });
        cb(articles);
        console.log(articles)
    });
};

module.exports = scrape;