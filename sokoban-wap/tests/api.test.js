import { expect, describe, beforeAll, afterEach, jest, it } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import createApiRoutes from '../backend/api';
import AuthServer from 'express-oauth-server';

let app;
let mockFind;
let mockInsertOne;

beforeAll(() => {
    // App initialisieren
    app = express();
    app.use(express.json());

    // Mock collection mit Spies
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

    // Mock OAuth model
    const mockOAuthModel = {
        getAccessToken: jest.fn().mockResolvedValue({
            accessToken: 'mock-token',
            accessTokenExpiresAt: new Date(Date.now() + 3600000),
            client: { id: 'mock-client' },
            user: { id: 'mock-user' }
        }),
        verifyScope: jest.fn().mockResolvedValue(true)
    };

    // OAuth server mit mock model
    const mockOauth = new AuthServer({
        model: mockOAuthModel
    });

    // Die Mock-Collection der App bereitstellen
    app.set('highscoresCollection', highscoresCollection);
    
    // Apply OAuth authentication at app level
    const router = createApiRoutes(mockOauth);
    app.use('/', mockOauth.authenticate(), router);
});

afterEach(() => {
    //mockFind.mockClear();
    //mockInsertOne.mockClear();
    jest.clearAllMocks();
});

describe('GET /highscore', () => {
    it('should return an empty array when no highscores exist', async () => {
        const response = await request(app)
            .get('/highscore')
            .set('Authorization', 'Bearer mock-token');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
        expect(mockFind).toHaveBeenCalled();
        expect(mockFind().sort).toHaveBeenCalledWith({ score: -1 });
    });
    
    it('should return highscores sorted by score in descending order', async () => {
        // Mock-Daten vorbereiten
        const mockHighscores = [
            { name: 'Bob', score: 200 },
            { name: 'Alice', score: 100 },
        ];

        mockFind.mockReturnValue({
            sort: jest.fn().mockReturnThis(),
            toArray: jest.fn().mockResolvedValue(mockHighscores),
        });
    
        const response = await request(app)
            .get('/highscore')
            .set('Authorization', 'Bearer mock-token');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockHighscores);
        expect(mockFind).toHaveBeenCalled(); // Sicherstellen, dass 'find' aufgerufen wurde
    });
    
    it('should reject requests without valid authentication', async () => {
        const response = await request(app).get('/highscore');
        expect(response.status).toBe(401);
    });

    it('should handle errors and return status 500', async () => {

        // Fehler simulieren
       
       mockFind.mockImplementation(() => {
       
       throw new Error('Database error');
       
        });
       
       const response = await request(app).get('/highscore').set('Authorization', 'Bearer mock-token');
       
       expect(response.status).toBe(500); // 500-Fehler erwarten
       
        });
});

describe('POST /highscore/add', () => {
    const validHighscore = { name: 'Charlie', score: 150 };

    it('should return 400 if name or score is missing', async () => {
        const response = await request(app)
            .post('/highscore/add')
            .set('Authorization', 'Bearer mock-token')
            .send({});
        
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'Username and score are required' });
        expect(mockInsertOne).not.toHaveBeenCalled(); // Sicherstellen, dass 'insertOne' nicht aufgerufen wurde
    });

    it('should successfully add a new highscore', async () => {
        // Mock-Verhalten für 'insertOne' definieren
        mockInsertOne.mockResolvedValue({ acknowledged: true });

        const response = await request(app)
            .post('/highscore/add')
            .set('Authorization', 'Bearer mock-token')
            .send(validHighscore);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ message: 'Highscore added successfully' });
        // Sicherstellen, dass 'insertOne' korrekt aufgerufen wurde
        expect(mockInsertOne).toHaveBeenCalledWith(validHighscore);
    });

    it('should reject unauthorized requests', async () => {
        const response = await request(app)
            .post('/highscore/add')
            .send(validHighscore);

        expect(response.status).toBe(401);
        expect(mockInsertOne).not.toHaveBeenCalled();
    });

    it('should return 500 if insertOne fails', async () => {
        // Fehler bei 'insertOne' simulieren
        mockInsertOne.mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .post('/highscore/add')
            .set('Authorization', 'Bearer mock-token')
            .send(validHighscore);

        expect(response.status).toBe(500);
        expect(mockInsertOne).toHaveBeenCalledWith(validHighscore);
    });
});