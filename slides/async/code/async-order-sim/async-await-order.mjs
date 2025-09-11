export default doOrder;

//.1
async function doOrder(orderer, params) {
  try {
    const validation = await orderer.validate(params);
    const order = await orderer.placeOrder(validation);
    const result = await orderer.sendEmail(order);
    console.log(result);
  }
  catch (err) {
    console.error(err);
  }
}
