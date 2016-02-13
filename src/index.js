var sp = require('./wrappers/sparkpost');


function notify() {
  sp.send([{
    address: { name: 'Cole Furfaro-Strode', email: 'colestrode@gmail.com' }
  }]);
}
