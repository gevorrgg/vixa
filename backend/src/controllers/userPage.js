const UserService = require('../services/userService')

class UserPageController {
  static async getUser (req, res) {
    return res.type('html').send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>StreamVibe Profile</title>
  </head>
  <body>
    <main>
      <h1>StreamVibe profile page</h1>
      <p>Profile pages are being served through the app entrypoint.</p>
    </main>
  </body>
</html>`)
  }
}

module.exports = UserPageController
