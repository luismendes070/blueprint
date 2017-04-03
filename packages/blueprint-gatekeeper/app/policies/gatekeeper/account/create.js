'use strict';

var blueprint  = require ('@onehilltech/blueprint')
  , Policy     = blueprint.Policy
  , gatekeeper = require ('../../../../lib')
  ;

module.exports = Policy.any ([
  Policy.assert ('gatekeeper.request.hasScope', gatekeeper.scope.account.create),
  Policy.assert ('gatekeeper.isSuperUser')
]);