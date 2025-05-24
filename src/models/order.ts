import OrderCreate from "./order-create.js";
import OrderUpdate from "./order-update.js";

export default interface Order extends OrderCreate, OrderUpdate {
    id: string;
    createdDate: Date;
}
