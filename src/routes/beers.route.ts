import { randomUUID } from "crypto";
import { Request, Response, Router } from "express";
import { JSONFilePreset } from 'lowdb/node';
import requireRole from "../middlewares/require-role.js";
import BeerCreate from "../models/beer-create.js";
import requireScope from "../middlewares/require-scope.js";
import Beer from "../models/beer.js";
import Error from "../models/error.js";
import { NotFoundResponse } from "../utils.js";

const router = Router();
const db = await JSONFilePreset<{ beers: Beer[] }>('db.json', { beers: [] });

router.get('', requireScope('Beers.Read.All'), async (req: Request, res: Response) => {
    const isAvailableFiltering: string | undefined = req.query.isAvailable as string | undefined

    await db.read();
    const beers: Beer[] = db.data.beers;
    const beersFiltered: Beer[] = beers.filter(beer => isAvailableFiltering === undefined ? true : (isAvailableFiltering === "true" ? beer.quantity > 0 : beer.quantity === 0));

    res.status(200).json(
        {
            data: beersFiltered,
            total: beersFiltered.length
        }
    );
})

router.post('', requireScope('Beers.Write'), requireRole('admin'), async (req: Request, res: Response) => {
    const body: BeerCreate = req.body as BeerCreate;
    const beer: Beer = { ...body, createdDate: (new Date()), updatedDate: new Date(), id: randomUUID() };
    await db.update(({ beers }) => beers.push(beer));
    res.status(200).json(beer);
})

router.get('/:id', requireScope('Beers.Read'), async (req: Request, res: Response) => {
    const params = req.params;
    const id: string = params["id"];

    await db.read();

    const beer: Beer | undefined = db.data.beers.find(beer => beer.id === id);

    if (!beer) {
        const error: Error = NotFoundResponse();
        res.status(error.code).json(error);
        return;
    }

    res.status(200).json(beer);
})

router.delete('/:id',requireScope('Beers.Write'), requireRole('admin'), async (req: Request, res: Response) => {
    const params = req.params;
    const id: string = params["id"];
    const currentUser = req.authInfo!; // The authenticated user from passport

    await db.read();

    const beer = db.data.beers.find(beer => beer.id === id);

    if (!beer) {
        const error: Error = NotFoundResponse();
        res.status(error.code).json(error);
        return;
    }

    db.data.beers = db.data.beers.filter(beer => beer.id !== id);

    await db.write();

    res.status(204).send();
})

export default router;