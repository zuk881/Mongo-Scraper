$(document).ready(function () {

    // Getting reference to the article container div we will be rendering all articles 
    var articleContainer = $(".article-container");

    // Adding event listeners for dynamically generated buttons for deleting aricles,
    // pulling up article notes, saving article notes, and deleting article notes
    $(document).on("click", ".btn.delete", handleArticleDelete);
    $(document).on("click", ".btn.notes", handleArticleNotes);
    $(document).on("click", ".btn.save", handleNoteSave);
    $(document).on("click", ".btn.note-delete", handleNoteDelete);


    function kickPage() {
        // Empty the article container, run an AJAX request for any saved headlines
        articleContainer.empty();
        $.get("/api/headlines?saved=true").then(function (data) {
            // If we have headlines, render them to the page
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
        // This function handles appending HTML containing our article data to the page
        // We are passed an array of JSON containing all available articles in our database
        var articleCard = [];
        // We pass each article JSON object to the createPanel function which returns a bootstrap
        // panwl with our aricle data inside
        for (var i = 0; i < articles.length; i++) {
            articleCard.push(createCard(articles[i]));
        }
        // Once we have all of the HTML for the aricles stored on our articlePanesl array,
        // append them to the articlesPanels container
        articleContainer.append(articleCard);
    }

    function createCard(article) {
        // This function takes in a single JSON object for an article
        // It constructs a JQuery element containing  all of the formatted HTML for the article panel
        var card =
            $(["<div class='card'>",
                "<div class='card-header'>",
                "<h3>",
                article.headline,
                "<a class='btn btn-danger delete'>",
                "Delete",
                "<a/>",
                "<a class='btn btn-success notes'>Notes</a>",
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

    function renderEmpty() {
        // This function renders some HTML to the page explaining we don't have any articles to view
        // Using a joined array of HTML string dta because it's easier to read/change than a concatenated string
        var emptyAlert =
            $(["<div class='alert alert-warning text-center'>",
                "<h4>Looks like we don't have any new aricles.</h4>",
                "</div>",
                "<div class='card'>",
                "<div class='card-header text-center'>",
                "<h3>Would you like to browse available articles?</h3>",
                "</div>",
                "<div class='card-body text-center'>",
                "<h4><a href='/'>Browse Articles</a></h4>",
                "</div>",
                "</div>"
            ].join(''));
        // Appending this data to the page
        articleContainer.append(emptyAlert);
    }

    function handleArticleNotes() {
        // This function handles opening the notes modal and displaying our notes
        //We grab the id of the article to get notes for the panel element the delete button sits inside
        var currentArticle = $(this).parents(".card").data();
        // Grab any notes with this headline/article id
        $.get("/api/notes/" + currentArticle._id).then(function (data) {
            // Constructing our initial HTML to add to the notes modal
            var modalText = [
                "<div class='container-fluid text-center'>",
                "<h4>Notes For Article: ",
                currentArticle._id,
                "</h4>",
                "<hr />",
                "<ul class='list-group note-container'>",
                "</ul>",
                "<textarea placeholder='New Note' rows='4' cols='60'></textarea>",
                "<button class='btn btn-success save'>Save Note</button>",
                "</div>"
            ].join("");
            // Adding the formatted HTML to the note modal
            bootbox.dialog({
                message: modalText,
                closeButton: true
            });
            var noteData = {
                _id: currentArticle._id,
                notes: data || []
            };
            // Adding some information about the article and article notes to the save button for easy access
            // when trying to add a new note
            $(".btn.save").data("article", noteData);
            // renderNotesList will populate the actual note HTML inside of the modal we just created/opened
            renderNotesList(noteData);
        });
    }

    function handleNoteSave() {
        // This function handles what happens when a user tries to save a new note for an article
        // Setting a variable to hold some formatted data about our note
        // Grabbing the note typed into the input box
        var noteData;
        var newNote = $(".bootbox-body textarea").val().trim();
        // If we actually have data typed into the note input field, format it
        // and post it to the "/api/notes" route and send the formatted noteData as well
        if (newNote) {
            noteData = {
                _id: $(this).data("article")._id,
                noteText: newNote
            };
            $.post("/api/notes", noteData).then(function () {
                // When complete, close the modal
                bootbox.hideAll();
            });
        }
    }

    function renderNotesList(data) {
        // This function handles rendering note list items to our notes modal
        // Setting up an array of notes to render after finished
        // Also setting up a currentNote variable to temporarily store each note
        var notesToRender = [];
        var currentNote;
        // If we have no notes, just display a message explaining this
        if (!data.notes.length) {
            currentNote = [
                "<li class='list-group-item'>",
                "No notes for this article yet.",
                "</li>"
            ].join("");
            notesToRender.push(currentNote);
        }
        else {
            // If we do have notes, go through each one
            for (var i = 0; i < data.notes.length; i++) {
                // Construct an li element to contain our noteText and a delete button
                currentNote = $([
                    "<li class='list-group-item note'>",
                    data.notes[i].noteText,
                    "<button class='btn btn-danger note-delete'>x</button>",
                    "</li>"
                ].join(""));
                // Store the note id on the delete button for easy access when trying to delete
                currentNote.children("button").data("_id", data.notes[i]._id);
                // Adding our currentNote to the notesToRender array
                notesToRender.push(currentNote);
            }
        }
        //Now append the notesToRender to the note-container inside the note modal
        $(".note-container").append(notesToRender);
    }

    function handleNoteDelete() {
        // This function handles the deletion of notes
        // First we grab the id of the note we want to delete
        // We store thsi data on the delete button when we created it
        var noteToDelete = $(this).data("_id");
        // Perform an DELETE request to "/api/notes/" with th id of the note we're deleting as a parameter
        $.ajax({
            url: "/api/notes/" + noteToDelete,
            method: "DELETE"
        }).then(function () {
            // When done, hide the modal
            bootbox.hideAll();
        });
    }

    // InitPage kicks everything off when the page is loaded
    kickPage();

});