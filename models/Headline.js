var mongoose = require("mongoose");
require('mongoose-type-url');
var Schema = mongoose.Schema;

var headlineSchema = new Schema ({
    headline: {
        type: String,
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: true
    },
    url: {
        type: mongoose.SchemaTypes.Url,
        required: true
      },
    date: String,
    saved: {
        type: Boolean,
        default: false
    }

});

var Headline = mongoose.model("Headline", headlineSchema);

module.exports = Headline;
