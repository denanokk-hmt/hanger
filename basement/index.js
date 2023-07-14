
class Base {  
  constructor(lists) {
    for (let i in lists) {
      this[i] = require(`${REQUIRE_PATH.hanger}${lists[i]}`)
      console.log(`require & moduler exported::${i}`)
    }
  }
}

module.exports = {
  Base,
}