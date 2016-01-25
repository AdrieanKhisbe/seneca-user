# seneca-user

## About
Plugin provides business logic for user management, such as _login, logout registration, password handling, incl. resets_

<!-- TODO: point to examples -->

## Usage

There are two core concepts: user and login. A _user_, storing the user account details and encrypted passwords,
and a _login_, representing an instance of a user that has been authenticated. A user can have multiple logins.

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

## Plugin Options
   * `rounds` - _number_ (default `11111`): number of SHA512 rounds to use for password encryption
   * `autopass` - _boolean_ (default `true`): automatically generate an (unrecoverable) password if none is supplied - mostly good for testing
   * `mustrepeat` - _boolean_ : you must provide a `repeat` argument (a repeat of the password) when setting a password
   * `resetperiod` - _number_ (default `24*3600*1000`): duration in millis that a password reset token is valid (default: 24 hours)

## Actions

### login-user - Login an existing user.
#### Pattern: `role:user, cmd:login`
#### Details
 Creates a new `sys_login` entry.
#### Arguments:

   * `nick`: required if no email, identifies user, alias: `username`
   * `email`: required if no nick, identifies user
   * `password`: password as entered by user, optional if using `auto`
   * `auto`: automatic login without password, default: `false`. Use this to generate login tokens.
   * `user`: specify user using a sys/user entity - for convenience use inside your own actions, when you already have a user entity loade`

#### Result
   * `ok`: true if login succeeded, false if no
   * `login`: login entity, id is the login token, used as cookie
   * `user`: user entity
   * `why`: indicates reason login failed or succeeded, refer to [source](https://github.com/senecajs/seneca-user/blob/master/lib/user.js) for codes.

### logout-user - Logout a user.
#### Pattern - `role:user, cmd:logout`
#### Details
Update _sys/login_ entry to _active:false_. Adds _ended_ field with ISOString date time.
#### Arguments: [Token]
#### Provides
Same object format as login command result: `{ok:true|false,user,login}`

### register-user  - Register a new user.
#### Pattern `role:user, cmd:register`
#### Details
Register a new user. You'll probably call this after a user fills out
a registration form. Any additional action arguments are saved as user
properties. The nick and email fields will be checked for
uniqueness. The new user is not logged in, use the login action for
that.

#### Arguments
   * `nick`: Username, mostly. If not provided, will be set to args.username value, if defined, otherwise args.email value
   * `email`: Email address. At least one of nick or email is required
   * `username`: a convenience - just an alias for nick
   * `password`: Plaintext password, supplied by user - will be stored encrypted and unrecoverable
   * `repeat`: Password, repeated. Optional - if provided, must match password
   * `name`: Name of user. Just a text field.
   * `active`: if true, user can log in, if false, user can't. Default: true

#### Result
   * `ok`: true if registration succeeded, false if no
   * `user`: new user entity
   * `why`: indicates reason registration failed, refer to [source](https://github.com/senecajs/seneca-user/blob/master/lib/user.js) for codes`

### check-token - Authenticate a login token
#### Details
Authenticate a login token, returning the associated `sys/login` and `sys/user` if
the token is valid and active. Use this, for example, when handling
HTTP requests with an authentication cookie, to get the user.
#### Pattern: `role:user, cmd:auth`
#### Arguments: [Token][]
#### Result
Same object format as login command result: `{ok:true|false,user:,login:}`

### create-reset-token - Create a reset token
#### Pattern: `role:user, cmd:create_reset`
#### Details
Create a reset token, valid for a 24 hours (use the `resetperiod` options to alter the validity period). This action
creates an entry in the `sys/reset` collection.
#### Arguments
   * `nick`: required if no email, identifies user, alias: `username`
   * `email`: required if no nick, identifies user
   * `user`: specify user using a sys/user entity - for convenience use inside your own actions, when you already have a user entity loaded

#### Result
   * `ok`: true if update succeeded, false if not
   * `user`: `sys/user` entity
   * `reset`: `sys/reset` entity

### load-reset - Load a reset entity
#### Pattern: `role:user, cmd:load_reset`

Load a `sys/reset` entity using a reset token. Use this to load the details of a reset request, possible to confirm with user.
#### Arguments
   * `token`: reset token
#### Result
   * `ok`: true if reset found, false if not
   * `user`: `sys/user` entity
   * `reset`: `sys/reset` entity
   * `why`: reason for failure

### reset-password - Execute a password reset action.
#### Details
The user identified by the reset token is allowed to change their password. THe reset must be active, and the validity period must not be expired. On successful reset, the `sys/reset` is deactivated and cannot be reused.
#### Pattern: `role:user, cmd:execute_reset`
#### Arguments:
   * `token`: reset token
   * `password`: new password
   * `repeat`: optional, repeat of new password
#### Result
   * `ok`: true if reset found, false if not
   * `user`: `sys/user` entity
   * `reset`: `sys/reset` entity
   * `why`: reason for failure

### encrypt-password - Encrypts a plaintext password, providing the salt and ciphertext.
#### Details
 The encyption is `options.rounds` (default:11111) rounds of SHA512.
#### Pattern: `role:user, cmd:encrypt_password`
#### Arguments
   * `password`: plaintext password.
   * `repeat`: optional, repeat of password

#### Result
   * `ok`: true if succeeded
   * `salt`: the salt string
   * `pass`: the ciphertext string
   * `why`: reason for failure

### check-password - Verifies that a password matches a given salt and ciphertext.
#### Pattern: `role:user, cmd:verify_password`
#### Arguments
   * `salt`- _string_ : the salt string to use, find this in user.salt
   * `pass`- _string_ : the pass string to use, find this in user.pass
   * `proposed`- _string_ : the proposed plaintext password to verify
#### Result : [OperationStatus][]

### update-user - Updates a user
#### Pattern `role:user, cmd:update`
#### Arguments
   * `nick`- _string_ : the nick of the user to be updated
   * `orig_nick`- _string_ : if nick will be changed on this update then `orig_nick` will be used to identify the user
   * `email`- _string_ : the email of the user to be updated
   * `orig_email`- _string_ : if email will be changed on this update then `orig_email` will be used to identify the user

At least one of these arguments must be present.
#### Result: [OperationStatus][]

### delete-user - Deletes an user and all relationed records.
#### Pattern: `role:user, cmd:remove`
#### Arguments
` `nick` - _string_ : the nick of the user to be updated
#### Result: [OperationStatus][]


### activate-user - Enables an user.
#### Pattern: `role:user, cmd:activate`
#### Arguments: [UserIdentification][]
#### Result : [OperationStatus][]


### disable-user - Disables an user.
#### Pattern: `role:user, cmd:deactivate`
#### Arguments: [UserIdentification][]
#### Result : [OperationStatus][]

## Schemas
### Message
#### Token
   * `token` - _string_ : existing login token, maybe from a cookie`

#### OperationStatus
   * `ok` - _boolean_ : true if operation is OK

#### UserIdentification
   * `nick` - _string_ : the nick of the user to be updated
   * `email` - _string_: the email of the user to be updated

At least one of these arguments must be present

### Entities
#### User
##### Path: `-/sys/user`
##### About
The user entity has a default type of `-/sys/user` and standard properties:
You can add your own properties, but be careful not to use the standard property names.

##### Properties
   * `nick` - _string_ : Username, mostly. If not provided, will be set to email value.
   * `email` - _string_ : Email address. At least one of nick or email is required.
   * `name` - _string_ : Name of user. Just a text field. [Cultural imperialism damages your conversions, ya know...](http://www.kalzumeus.com/2010/06/17/falsehoods-programmers-believe-about-names/)!
   * `active` - _boolean_ (default `true`): if true, user can log in, if false, user can't.
   * `when` - _string_ : creation time, ISO String, like 2013-03-21T17:32:24.039Z
   * `salt` - _string_ : salt for encrypted password
   * `pass` - _string_ : encrypted password

#### Login
##### Path: `-/sys/login`
##### About
The login entity has a default type of `-/sys/login` and standard properties described below.
You can add your own properties, but be careful not to use the standard property names.

##### Properties

   * `id` - _string_ : authentication token, UUID
   * `nick` - _string_ : copied from user
   * `user` - _string_ : user.id string
   * `when` - _string_ : creation time, ISO String, like 2013-03-21T17:32:24.039Z
   * `active` - _boolean_ : if true, login against this token will succeed, otherwise not

#### Reset
##### Path: `-/sys/reset`
##### About
The reset entity has a default type of `-/sys/reset` and standard properties:
Same as [Login][]
You can add your own properties, but be careful not to use the standard property names.
##### Properties
cf [Login][]

[Login]: #login
[OperationStatus]: #operationstatus
[UserIdentification]: #useridentification
[Token]: #token
