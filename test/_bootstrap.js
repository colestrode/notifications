'use strict';

before(function() {
  require('sinon-as-promised')(require('q').Promise);
  require('chai').use(require('sinon-chai'));
});
