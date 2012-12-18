/* Copyright (c) 2010-2012 Richard Rodger */

var seneca   = require('seneca')

var assert  = require('assert')

var gex     = require('gex')
var async   = require('async')





function cberr(win){
  return function(err){
    if(err) {
      assert.fail(err, 'callback error')
    }
    else {
      win.apply(this,Array.prototype.slice.call(arguments,1))
    }
  }
}




var si = seneca()
si.use( require('../lib/user.js') )


module.exports = {
  
  version: function() {
    assert.ok(gex(si.version),'0.4.*')
  },

  happy: function() {

    var userpin = si.pin({role:'user',cmd:'*'})
    var userent = si.make('test','sys','user')
    
    async.series({
      prep: function(cb){
        userent.load$({nick:'nick1'},cberr(function(user){
          if( user ) {
            user.remove$({nick:'nick1'},cb)
          }
          else cb();
        }))
      },

      reg1: function(cb) {
        userpin.register({
          nick:'nick1',
          email:'nick1@example.com',
          password:'testtest',
          active:true
        }, cberr(cb))
      },

      login1: function(cb) {
        userpin.login({
          nick:'nick1',
          password:'testtest'
        }, cberr(function(out){
          assert.ok(out.ok)
          var token = out.login.token
        }))
      },


    })
  }
}

/*
        ;seneca.act({
          tenant:'test',
          on:'user',
          cmd:'login',
          nick:'nick1',
          password:'testtestX'
        }, function(err,out){
          assert.isNull(err)
          //console.log(out)
          assert.ok(!out.pass)
      
      
      
        ;seneca.act({
          tenant:'test',
          on:'user',
          cmd:'auth',
          token:token,
        }, function(err,out){
          assert.isNull(err)
          //console.log(out)
          assert.ok(out.auth)
      
        ;seneca.act({
          tenant:'test',
          on:'user',
          cmd:'auth',
          token:token+'BAD',
        }, function(err,out){
          assert.isNull(err)
          //console.log(out)
          assert.ok(!out.auth)
      
      
      
        ;seneca.act({
          tenant:'test',
          on:'user',
          cmd:'logout',
          token:token,
        }, function(err,out){
          assert.isNull(err)
          //console.log(out)
          assert.ok(out.logout)
      
        ;seneca.act({
          tenant:'test',
          on:'user',
          cmd:'auth',
          token:token,
        }, function(err,out){
          assert.isNull(err)
          //console.log(out)
          assert.ok(!out.auth)
      
      
        ;userpin.cmd('change_password',{
          nick:'nick1',
          password:'passpass'
        }, cberr(function(out){
          //console.log(out)
          assert.ok(out.ok)
      
        ;userpin.cmd('login',{
          nick:'nick1',
          password:'passpass'
        }, cberr(function(out){
          //console.log(out)
          assert.ok(out.pass)
      
        ;userpin.cmd('login',{
          nick:'nick1',
          password:'testtest'
        }, cberr(function(out){
          //console.log(out)
          assert.ok(!out.pass)
      
  
          done();

        })) // login fail
        })) // login ok
        })) // change_password
      
        }) // login fail
        }) // logout
      
        }) // login fail
        }) // auth ok
        
        }) // login fail
        }) // login ok
      
        }) // register

      }
      }
      catch(e) {
        done()
        throw e
      }
    })

  },

  password: function() {
    ;seneca(function(seneca){
      var userpin = seneca.pin({tenant:'test',on:'user'})

    ;userpin.cmd('encrypt_password',{
        password:'passpass'
      }, cberr(function(outpass){
        //console.log(out)
        assert.isNotNull(outpass.salt)
        assert.isNotNull(outpass.pass)

    ;userpin.cmd('verify_password',{
      proposed:'passpass',
      salt:outpass.salt,
      pass:outpass.pass
    }, cberr(function(out){
      //console.log(out)
      assert.ok(out.ok)

    ;userpin.cmd('verify_password',{
      proposed:'failfail',
      salt:outpass.salt,
      pass:outpass.pass
    }, cberr(function(out){
      //console.log(out)
      assert.ok(!out.ok)

        
    })) // verify_password
    })) // verify_password
    })) // encrypt_password

    }) // seneca
  }

}



/*
var Entity   = require('entity').Entity;
require('entity-mongo');

var seneca   = require('seneca');



var E = common.E;

var assert  = common.assert;
var eyes    = common.eyes;


var bexit
var senI = 0
var sen


function getsen(cb) {
  senI++
  if( sen ) {
    cb(sen)
  }
  else {
    Entity.init$('mongo://localhost/entity_mongo_test',function(err,entity) {
      assert.isNull(err)
      sen = new seneca.Seneca({entity:entity})
      new seneca.User(sen)

      bexit = function(){
        senI--
        if( 0 == senI ) {
          entity.close$();
        }
      }

      cb(sen);
    })
  }
}


module.exports = {

  happy: function() {
    getsen(function(sen){
      sen.act({on:'user',cmd:'signup',tenant:'test',email:'a@b.com'},function(err,signup){
        E(err); eyes.inspect(signup,'signup');

      ;sen.act({on:'user',cmd:'activate',tenant:'test',signup:signup.token},function(err,user){
        E(err); eyes.inspect(user,'user');
        bexit();

      }) })
    })
  }
}
*/