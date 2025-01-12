import {expect, describe, beforeAll, afterEach, jest, it} from '@jest/globals';
import request from 'supertest';
import express from 'express';
import createApiRoutes from '../backend/api';

let app;
let mockFind;
let mockInsertOne;

beforeAll(() => {
    // App initialisieren
    app = express();
    app.use(express.json());

    // Mock-Collection mit Spies
    const highscoresCollection = {
        find: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([]),
        }),
        insertOne: jest.fn(),
    };

    // `jest.spyOn` auf die Methoden der Collection anwenden
    mockFind = jest.spyOn(highscoresCollection, 'find');
    mockInsertOne = jest.spyOn(highscoresCollection, 'insertOne');

    // Die Mock-Collection der App bereitstellen
    app.set('highscoresCollection', highscoresCollection);

    // Router mit mock-oauth erstellen und registrieren
    const mockOauth = {
        authenticate: () => (req, res, next) => next(),
    };
    const router = createApiRoutes(mockOauth);
    app.use('/', router);
});

afterEach(() => {
    mockFind.mockClear();
    mockInsertOne.mockClear();
});


describe('GET /highscore', () => {
    it('should return an empty array when no highscores exist', async () => {
        const response = request(app).get('/highscore');        // undefined?
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(mockFind).toHaveBeenCalled();
    });

    it('should return highscores sorted by score in descending order', async () => {
        // Mock-Daten vorbereiten
        mockFind.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue([
                { name: 'Bob', score: 200 },
                { name: 'Alice', score: 100 },
            ]),
        });

        const response = request(app).get('/highscore');
        expect(response.status).toBe(200);      // undefined? again?
        expect(response.body).toEqual([
            { name: 'Bob', score: 200 },
            { name: 'Alice', score: 100 },
        ]);
        expect(mockFind).toHaveBeenCalled(); // Sicherstellen, dass `find` aufgerufen wurde
    });

    it('should handle errors and return status 500', async () => {
        // Fehler simulieren
        mockFind.mockImplementation(() => {
            throw new Error('Database error');
        });

        const response = request(app).get('/highscore');
        expect(response.status).toBe(500); // 500-Fehler erwarten - wieder undefinded :-(
    });
});

describe('POST /highscore/add', () => {
    it('should return 400 if name or score is missing', async () => {
        const response = await request(app).post('/highscore/add').send({});
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Username and score are required' });
        expect(mockInsertOne).not.toHaveBeenCalled(); // Sicherstellen, dass `insertOne` nicht aufgerufen wurde
    });

    it('should successfully add a new highscore', async () => {
        // Mock-Verhalten für `insertOne` definieren
        mockInsertOne.mockResolvedValue({ acknowledged: true });

        const response = await request(app)
            .post('/highscore/add')
            .send({ name: 'Charlie', score: 150 });

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Highscore added successfully' });

        // Sicherstellen, dass `insertOne` korrekt aufgerufen wurde
        expect(mockInsertOne).toHaveBeenCalledWith({ name: 'Charlie', score: 150 });
    });

    it('should return 500 if insertOne fails', async () => {
        // Fehler bei `insertOne` simulieren
        mockInsertOne.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/highscore/add')
            .send({ name: 'Charlie', score: 150 });

        expect(response.status).toBe(500);
        expect(mockInsertOne).toHaveBeenCalledWith({ name: 'Charlie', score: 150 });
    });
});