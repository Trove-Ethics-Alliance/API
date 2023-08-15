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

/**
 * Validate if a variable is boolean, otherwise returns 'wrong'.
 * @param {String} variable string to validate.
 * @returns boolean value or string 'wrong' if variable is not a boolean.
 */
function checkBoolean(variable) {

    // Convert provided variable to lower case string.
    const lowerCaseValue = variable.toString().toLowerCase();

    if (lowerCaseValue === "true") return true; // Return true if "true"
    else if (lowerCaseValue === "false") return false; // Return false if "false"
    else return 'wrong'; // Return 'wrong' if variable is not a boolean string.
}

/**
 * Function with more human friendly representation of the code difficulty.
 * @param {Integer} difficulty integer value of the code difficulty (1-3).
 * @returns string representation of the code difficulty.
 */
function convertDifficultyToString(difficulty) {
    switch (true) {
        case difficulty === 1: return 'Hard'
        case difficulty === 2: return 'Medium'
        case difficulty === 3: return 'Easy'
        default: 'Invalid difficulty'
    }
}

module.exports = {
    isAlphanumericLowercase,
    convertStringToMongoID,
    checkBoolean,
    convertDifficultyToString
};