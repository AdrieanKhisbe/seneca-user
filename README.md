![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) User Management Plugin

# seneca-user
[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dependency Status][david-badge]][david-url]
[![Gitter chat][gitter-badge]][gitter-url]

Lead Maintainers: [Mircea Alexandru](https://github.com/mirceaalexandru) and [Mihai Dima](https://github.com/mihaidma)

## A user management plugin for the [Seneca](http://senecajs.org) toolkit

This module is a plugin for the Seneca framework. It provides business logic for user management, such as:

   * login
   * logout
   * registration
   * password handling, incl. resets

There are two core concepts: user and login. A _user_, storing the user account details and encrypted passwords,
and a _login_, representing an instance of a user that has been authenticated. A user can have multiple logins.

This module does not make any assumptions about the context it runs in.
Use the [seneca-auth](http://github.com/senecajs/seneca-auth) plugin to handle web and social media authentication.

For a working example, see the [Seneca user accounts example](https://github.com/rjrodger/seneca-examples/tree/master/user-accounts)

## Support

If you're using this module, feel free to contact me on Twitter if you
have any questions! :) [@rjrodger](http://twitter.com/rjrodger)

## Quick example

```js
var seneca = require('seneca')()
seneca.use('user')

seneca.ready(function (){

  var userpin = seneca.pin({role: 'user', cmd:'*'})

  userpin.register( {name: "Flann O'Brien",email:'nincompoop@deselby.com',password:'blackair'},
  function (err, out) {

    userpin.login({email: 'nincompoop@deselby.com', password: 'bicycle'}, function (err, res) {
      console.log('login success: ' + res.ok)

      userpin.login({email: 'nincompoop@deselby.com',password:'blackair'}, function (err,res) {
        console.log('login success: ' + res.ok)
        console.log('login instance: ' + res.login)
      })
    })
  })
})
```

This example, uses a _pin_ for convenience: `userpin.register( ... )` is the same as
`seneca.act({role:'user',cmd:'register', ... )`.

In the example code, a user is registered, and then two login attempts are made. The first with an incorrect password, the second with the correct
password. The successful login provides a login instance. The `login.id` property can be used to authenticate this login. For example,
the [seneca-auth](http://github.com/senecajs/seneca-auth) plugin uses this token as a HTTP authentication cookie.

To run this example (and the other code in this README), try:

```sh
node test/readme.js
```


## Deeper example

Take a look at the [user accounts example](http://github.com/rjrodger/seneca-examples).

## Install

```sh
npm install seneca
npm install seneca-user
```

You'll need the [seneca](http://github.com/senecajs/seneca) module to use this module - it's just a plugin.

## Usage

To load the plugin:

```js
seneca.use('user', { ... options ... })
```

The user and login data is persisted using Seneca entities. These have
names `sys/user` and `sys/login`.

Passwords are not stored in plaintext, but using an ~10k round salted SHA512 hash. In
the context of password reset functionality, this means you can
generate new passwords, but cannot recover old ones.
[This is what you want](http://www.codinghorror.com/blog/2007/09/youre-probably-storing-passwords-incorrectly.html).

There are separate actions to encrypt and verify passwords, so you can do things your own way if you like.

To support different use cases, users can be identified by either a
`nick` or their email address. The `nick` property is the traditional
'username', but does not need to be used in this fashion (hence the name 'nick').

All actions defined by this plugin return meta data objects containing the results of the action. The meta data object
contains an `ok` field that is either true or false, indicating the success or failure of the action. For example, a login attempt with an invalid password will result in an `{ok:false,...}`. When relevant, a `why` property is also provided, with a code that indicates the reason for the result. For example: {...,why:'user-not-found'}.

> **The full Api and actions offered by this plugin are available in the [API.md file](./API.md)**

## Annotated Source Code

The full source code of this plugin is [annotated](http://senecajs.github.io/seneca-user/user.html).


## Logging

To see what this plugin is doing, try:

```sh
node your-app.js --seneca.log=plugin:user
```

This will print action logs and plugin logs for the user plugin. To skip the action logs, use:

```sh
node your-app.js --seneca.log=type:plugin,plugin:user
```

You can also set up the logging programmatically:

    var seneca = require('seneca')({
      log:{
        map:[
          {plugin:'user',handler:'print'}
        ]
      }
    })

For more on logging, see the [seneca logging example](http://senecajs.org/logging-example.html).


### Customization

As with all seneca plugins, you can customize behavior simply by overwriting actions.

For example, to add some custom fields when registering a user:


```js
    // override by using the same action pattern
    seneca.add({role:' user', cmd: 'register'},function (args, done) {

      // assign user to one of 10 random "teams"
      args.team = Math.floor(10 * Math.random())

      // this calls the original action, as provided by the user plugin
      this.prior(args,done)
    })

    userpin.register({name: "Brian O'Nolan", email: 'brian@swim-two-birds.com', password: 'na-gCopaleen'},
    function (err, out) {
      console.log('user has team: ' + out.user.team)
    })
```


## Test

```sh
npm test
```

[npm-badge]: https://badge.fury.io/js/seneca-user.svg
[npm-url]: https://badge.fury.io/js/seneca-user
[travis-badge]: https://api.travis-ci.org/senecajs/seneca-user.svg
[travis-url]: https://travis-ci.org/senecajs/seneca-user
[coveralls-badge]:https://coveralls.io/repos/senecajs/seneca-user/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/senecajs/seneca-user?branch=master
[david-badge]: https://david-dm.org/senecajs/seneca-user.svg
[david-url]: https://david-dm.org/senecajs/seneca-user
[gitter-badge]: https://badges.gitter.im/senecajs/seneca.svg
[gitter-url]: https://gitter.im/senecajs/seneca
