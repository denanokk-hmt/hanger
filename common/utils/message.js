/**
 * \\n to \n
 * @param {*} msg 
 * @returns msg 
 */
const escaped2newline = (msg) => {
  return msg.replace(/\\n/g, "\n");
};

/**
 * \n to \\n
 * @param {*} msg 
 * @returns msg
 */
const newline2escaped = (msg) => {
  return msg.replace(/\r?\n/g, '\\n');
};

/**
 * \n or \\n to whitespace
 * @param {*} msg 
 * @returns msg
 */
const newline2whitespace = (msg) => {
  return msg.replace(/\r?\n|\\n/g, " ");
};

module.exports = {
  escaped2newline,
  newline2escaped,
  newline2whitespace
}