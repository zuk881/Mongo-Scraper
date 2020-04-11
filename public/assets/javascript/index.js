$(document).ready(function () {

    // Setting a reference to the article container div where all the dynamic content will go
    var articleContainer = $(".article-container");

    // Adding event listeners to any dynamically generated "save article"
    $(document).on("click", ".btn.save", handleArticleSave);

    // Event listener for scrape new article button
    $(document).on("click", ".scrape-new", handleArticleScrape);

    // Event listener for delete articles on home page
    $(document).on("click", ".btn.delete", handleArticleDelete);

    // Once the page is ready, run the kickPage function to kick things off
    kickPage();


    function kickPage() {
        // Empty the article container, run an AJAX request for any unsaved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=false")
            .then(function (data) {
              
                //if we have data headlines, render them to the page
                if (data && data.length) {
                    renderArticles(data);
                }
                else {
                    // Otherwise render a message explaining we have no articles
                    renderEmpty();
                }
            });
    }

    function renderArticles(articles) {
        // This function handles appending HTML containing our articles data to the page
        // We are passed an array of JSON containing all available articles in our database
        var articleCards = [];
        // We pass each article JSON object to the createPanel function which returns a bootstrap
        // panel with our article data inside
        for (var i = 0; i < articles.length; i++) {
            articleCards.push(createCard(articles[i]));
        }
        // Once we have all of the HTML for the articles stored in our articlePanels array,
        // append them to the articleCards container
        articleContainer.append(articleCards);
    }

    function createCard(article) {
        // This function takes in a single JSON object for an article
        // It constructs a JQuery element containing  all of the formatted HTML for the article panel
        var card =
            $(["<div class='card'>",
                "<div class='card-header'>",
                "<h3>",
                article.headline,
                "<a class='btn btn-success save'>",
                "Save",
                "<a/>",
                "<a class='btn btn-danger delete'>",
                "Delete",
                "<a/>",
                "</h3>",
                "</div>",
                "<div class='card-body'>",
                "<h4>",
                article.summary,
                "</h4>",
                "<a href='" + article.url + " 'target='_blank'>",
                article.url,
                "</a>",
                "</div>",
                "</div>"
            ].join(""));
        // We attach the article's id to the JQuery element
        // We will use this when trying to figure out which article the user wants to save
        card.data("_id", article._id);
        // We return the constructed card element
        return card;
    }

    function renderEmpty() {
        // This function renders some HTML to the page explaining we don't have any articles to view
        // Using a joined array of HTML string data because it's easier to read/change than a concatenated string
        var emptyAlert =
            $(["<div class='alert alert-warning text-center'>",
                "<h4>Looks like we don't have any new articles</h4>",
                "</div>",
                "<div class='card'>",
                "<div class='card-header text-center'>",
                "<h3>What would you like to do?</h3>",
                "</div>",
                "<div class='card-body text-center'>",
                "<h4><a class='scrape-new'>Try scraping new articles</a></h4>",
                "<h4><a href='/saved'>Go to saved articles</a></h4>",
                "</div>",
                "</div>"
            ].join(''));
        // Appending this data to the page
        articleContainer.append(emptyAlert);
    }

    function handleArticleDelete() {
        // This function handles deleting articles/headlines
        // We grab the id of the article to delete from the panel element the delete button sits inside
        var articleToDelete = $(this).parents(".card").data();
        // Using a delete method here just to be semantic since we are deleting an article/headline
        $.ajax({
            method: "DELETE",
            url: "/api/headlines/" + articleToDelete._id
        }).then(function (data) {
            // If this works, run initPage again which will rerender our list of saved aricles
            if (data.ok) {
                kickPage();
            }
        });
    }

    function handleArticleSave() {
        // This function is triggered when the user wants to save an article
        // When we render the article initially, we attatched a javascript object containing the headline id
        // To the element using the .data method.  Here we retrieve that.
        var articleToSave = $(this).parents(".card").data();
        articleToSave.saved = true;
        // Using a patch method to be semantic since thsi is an update to an existing record in our collection

        $.ajax({
            method: "PATCH",
            url: "/api/headlines",
            data: articleToSave
        })
            .then(function (data) {
                // If successful, mongoose will send back an object containing a key of "oK" with the value of 1
                // Which casts to "true"
                if (data.ok) {
                    // Run the initPage function again. This will reload the entire list of articles
                    kickPage();
                }
            });
    };

    function handleArticleScrape() {
        // This function handles the user clicking any scrape new article buttons
        $.get("/api/fetch")
            .then(function (data) {
                // If we are able to succesfully scrape the news site and compare the articles to those
                // Already in our collection, re render teh articles on the page
                // and let the user know how many unique articles we were able to save
                kickPage();
                bootbox.alert("<h3 class='text-center m-top-80'>" + data.message + "<h3>");
            });
    }

});