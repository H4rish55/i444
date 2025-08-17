//TS algebraic data types for domain modelling

//sum type
type PaymentType = 'CASH' | 'CARD' | 'CHECK';


type BasePayment = { kind: PaymentType };
type CardType = 'MasterCard' | 'Visa';

//intersection and product types
type CreditCard = BasePayment & {
  kind: 'CARD',
  cardType: CardType,
  cardNumber: string
};

type Check = BasePayment &
  {checkNumber: number } & {kind: 'CHECK', };

type Cash = BasePayment & {kind: 'CASH', };

//sum type
type PaymentMethod = CreditCard | Check | Cash;

//product type
type Payment = {
  method: PaymentMethod,
  amount: number
};

//.1.
//var declaration
const cashPayment: Payment = {
  method: {kind: 'CASH'},
  amount: 19.22,
};

//var declaration
const chkPayment: Payment = {
  method: {kind: 'CHECK', checkNumber: 1001},
  amount: 432.22,
};


type Result =
  { status: string } & { isError: false } |
  { message: string } & { isError: true };

declare function pay(payment: Payment) : Result;

