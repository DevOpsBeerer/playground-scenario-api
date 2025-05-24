import BeerCreate from "./beer-create.js";

export default interface Beer extends BeerCreate {
    id: string;
    createdDate: Date;
    updatedDate: Date;
}
