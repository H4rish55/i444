export default doOrder;

//.1
function doOrder(orderer, params) {
  orderer.validate(params, succ1 => {
    orderer.placeOrder(succ1, succ2 => {
      orderer.sendEmail(succ2, succ3 => {
	console.log(succ3);
      });
    });
  });
}

			
  
