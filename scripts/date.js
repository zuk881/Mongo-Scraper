var makeDate = () => {

    // Set variable for new date
    var d = new Date();

    // Set it as an empty string
    var formattedDate = "";

    // Add Month
    formattedDate += (d.getMonth() + 1) + "_";
    // Add date
    formattedDate += d.getDate() + "_";
    // add year
    formattedDate += d.getFullYear();

    // return full date
    return formattedDate;

};

module.exports = makeDate
