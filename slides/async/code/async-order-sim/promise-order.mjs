export default doOrder;

//.1
function doOrder(orderer, params) {
  orderer.validate(params)
    .then(succ1 => orderer.placeOrder(succ1))
    .then(succ2 => orderer.sendEmail(succ2))
    .then(succ3 => console.log(succ3))
    .catch(err => console.error(err));
}
			
  
