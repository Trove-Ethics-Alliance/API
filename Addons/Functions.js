/**
 * Checks if a username contains only alphanumeric lowercase between 3 and 20 characters.
 * @param {string} username - The username to validate.
 * @returns {boolean} - Returns true if the username is valid, false otherwise.
 */
function isAlphanumericLowercase(username) {
    const alphanumericLowercaseRegex = /^[a-z0-9]{3,20}$/;
    return alphanumericLowercaseRegex.test(username);
}

module.exports = {
    isAlphanumericLowercase
};