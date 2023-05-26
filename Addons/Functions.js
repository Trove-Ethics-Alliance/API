/**
 * Checks if a username contains only alphanumeric lowercase between 3 and 20 characters.
 * @param {string} username - The username to validate.
 * @returns {boolean} - Returns true if the username is valid, false otherwise.
 */
function isAlphanumericLowercase(username) {
    const alphanumericLowercaseRegex = /^[a-z0-9]{3,20}$/;
    return alphanumericLowercaseRegex.test(username);
}

/**
 * Converts a string to the specified format.
 * @param {String} str - The input string to convert.
 * @returns {String} - The converted string in the specified format.
 */
function convertStringToMongoID(str) {
    // Convert to lowercase.
    const lowercaseStr = str.toLowerCase();

    // Replace spaces with hyphens.
    const formattedStr = lowercaseStr.replace(/\s+/g, '-');

    // Return the formatted sting.
    return formattedStr;
}

module.exports = {
    isAlphanumericLowercase,
    convertStringToMongoID
};