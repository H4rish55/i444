export default generatorOrder;

//.1
function generatorOrder(orderer, params) {
  const gen = doOrder(orderer, params);
  gen.next().value                        //validation promise
    .then(succ1 => gen.next(succ1).value) //order result promise
    .then(succ2 => gen.next(succ2).value) //email result promise
    .then(succ3 => console.log(succ3))    //output overall result
    .catch(err => console.error(err));    //catch any error
}

function* doOrder(orderer, params) {
  const validationResult = yield orderer.validate(params);
  const orderResult =
    yield orderer.placeOrder(validationResult);
  yield orderer.sendEmail(orderResult);
}
