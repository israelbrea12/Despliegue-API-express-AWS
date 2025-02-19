const request = require("supertest");
const { app } = require("../src/app");
const db = require("../src/db");

let token;

beforeAll(async () => {
    await db.initialize();

    // Obtener token antes de los tests
    const loginResponse = await request(app)
        .post("/sessions")
        .send({ username: "test", password: "test_test_test" });

    token = loginResponse.body.accessToken;
});

afterAll(async () => {
    await db.close();
});

// TESTS GET /MOVIES
describe("GET /movies", () => {
    test("Debe responder con JSON y tener Content-Type application/json", async () => {
        const response = await request(app).get("/movies");
        expect(response.headers["content-type"]).toMatch(/application\/json/);
        expect(response.status).toBe(200);
    });

    test("Debe devolver una lista de películas con el formato correcto", async () => {
        const response = await request(app).get("/movies");
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.results)).toBe(true);

        if (response.body.results.length > 0) {
            response.body.results.forEach(movie => {
                expect(movie).toHaveProperty("id");
                expect(typeof movie.id).toBe("number");

                expect(movie).toHaveProperty("title");
                expect(typeof movie.title).toBe("string");

                expect(movie).toHaveProperty("genre");
                expect(typeof movie.genre).toBe("string");

                expect(movie).toHaveProperty("duration");
                expect(typeof movie.duration).toBe("number");

                expect(movie).toHaveProperty("rating");
                expect(typeof movie.rating).toBe("number");
            });
        }
    });

    test("Debe devolver una paginación válida", async () => {
        const response = await request(app).get("/movies?page=1&limit=5").expect(200);
        expect(response.body).toHaveProperty("results");
        expect(response.body.results.length).toBeLessThanOrEqual(5);
    });

    test("Debe manejar una paginación inválida", async () => {
        await request(app).get("/movies?page=-1").expect(400);
        await request(app).get("/movies?limit=0").expect(400);
    });

    //--------------------------------------------------------------------------------------------------------------
    // TEST GET /movies/:movieId/ratings
    describe("GET /movies/:movieId/ratings", () => {
        test("Debe devolver una lista de valoraciones con el formato correcto", async () => {
            const response = await request(app).get("/movies/1/ratings");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);

            if (response.body.length > 0) {
                response.body.forEach(rating => {
                    expect(rating).toHaveProperty("id");
                    expect(typeof rating.id).toBe("number");

                    expect(rating).toHaveProperty("userId");
                    expect(typeof rating.userId).toBe("number");

                    expect(rating).toHaveProperty("rating");
                    expect(typeof rating.rating).toBe("number");
                    expect(rating.rating).toBeGreaterThanOrEqual(0);
                    expect(rating.rating).toBeLessThanOrEqual(5);

                    expect(rating).toHaveProperty("comment");
                    expect(typeof rating.comment).toBe("string");
                });
            }
        });

        test("Debe manejar una película inexistente con una lista vacía", async () => {
            const response = await request(app).get("/movies/9999/ratings");
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });

        test("Debe devolver error 400 para un movieId inválido", async () => {
            await request(app).get("/movies/abc/ratings").expect(400);
            await request(app).get("/movies/-1/ratings").expect(400);
        });
    });

    //--------------------------------------------------------------------------------------------------------------
    // TEST POST /movies/:movieId/ratings
    describe("POST /movies/:movieId/ratings", () => {

        test("Debe crear una valoración correctamente", async () => {
            const response = await request(app)
                .post("/movies/1/ratings")
                .set("Authorization", `Bearer ${token}`)
                .send({ rating: 4.5, comment: "Gran película" });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("id");
            expect(response.body).toHaveProperty("movieId", 1);
            expect(response.body).toHaveProperty("userId");
            expect(response.body).toHaveProperty("rating", 4.5);
            expect(response.body).toHaveProperty("comment", "Gran película");
        });

        test("Debe rechazar una valoración sin autenticación", async () => {
            await request(app)
                .post("/movies/1/ratings")
                .send({ rating: 3, comment: "Película aceptable" })
                .expect(401);
        });

        test("Debe rechazar una valoración con datos inválidos", async () => {
            await request(app)
                .post("/movies/1/ratings")
                .set("Authorization", `Bearer ${token}`)
                .send({ rating: -1, comment: "Muy mala" })
                .expect(422);

            await request(app)
                .post("/movies/1/ratings")
                .set("Authorization", `Bearer ${token}`)
                .send({ rating: 6, comment: "Excelente" })
                .expect(422);

            await request(app)
                .post("/movies/1/ratings")
                .set("Authorization", `Bearer ${token}`)
                .send({ rating: 4, comment: "a".repeat(501) }) // Comentario demasiado largo
                .expect(422);
        });

        test("Debe devolver error 404 si la valoración no existe", async () => {
            await request(app).delete("/movies/1/ratings/9999")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
        });
    });

    //--------------------------------------------------------------------------------------------------------------
    // TESTS GET /movies/:movieId/ratings/:ratingId
    describe("GET /movies/:movieId/ratings/:ratingId", () => {
        test("Debe obtener una valoración específica con el formato correcto", async () => {
            const response = await request(app).get("/movies/1/ratings/1");
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("id", 1);
            expect(response.body).toHaveProperty("userId");
            expect(response.body).toHaveProperty("rating");
            expect(response.body).toHaveProperty("comment");
        });

        test("Debe devolver error 404 si la valoración no existe", async () => {
            await request(app).get("/movies/1/ratings/9999").expect(404);
        });

        test("Debe devolver error 400 para un ratingId inválido", async () => {
            await request(app).get("/movies/1/ratings/abc").expect(400);
        });
    });

    //--------------------------------------------------------------------------------------------------------------
    // TESTS PATCH /movies/:movieId/ratings/:ratingId
    describe("PATCH /movies/:movieId/ratings/:ratingId", () => {
        test("Debe modificar una valoración correctamente", async () => {
            const response = await request(app)
                .patch("/movies/1/ratings/1")
                .set("Authorization", `Bearer ${token}`)
                .send({ rating: 3.5, comment: "Actualizado" });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("rating", 3.5);
            expect(response.body).toHaveProperty("comment", "Actualizado");
        });

        test("Debe rechazar una modificación sin autenticación", async () => {
            await request(app)
                .patch("/movies/1/ratings/1")
                .send({ rating: 3, comment: "Sin token" })
                .expect(401);
        });

        test("Debe rechazar una modificación con datos inválidos", async () => {
            await request(app)
                .patch("/movies/1/ratings/1")
                .set("Authorization", `Bearer ${token}`)
                .send({ rating: 6, comment: "Valoración inválida" })
                .expect(422);
        });
    });

    //--------------------------------------------------------------------------------------------------------------
    // TESTS DELETE /movies/:movieId/ratings/:ratingId
    describe("DELETE /movies/:movieId/ratings/:ratingId", () => {
        test("Debe eliminar una valoración correctamente", async () => {
            await request(app)
                .delete("/movies/1/ratings/1")
                .set("Authorization", `Bearer ${token}`)
                .expect(204);
        });

        test("Debe rechazar una eliminación sin autenticación", async () => {
            await request(app)
                .delete("/movies/1/ratings/1")
                .expect(401);
        });

        test("Debe devolver error 404 si la valoración no existe", async () => {
            await request(app)
                .delete("/movies/1/ratings/9999")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
        });
    });

    //--------------------------------------------------------------------------------------------------------------
    // TESTS GET /watchlist/:userId
    describe("GET /watchlist/:userId", () => {
        test("Debe devolver la watchlist de un usuario con el formato correcto", async () => {
            const response = await request(app)
                .get("/watchlist/1")
                .set("Authorization", `Bearer ${token}`);
    
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
    
            if (response.body.length > 0) {
                response.body.forEach(item => {
                    expect(item).toHaveProperty("movieId");
                    expect(typeof item.movieId).toBe("number");
    
                    expect(item).toHaveProperty("title");
                    expect(typeof item.title).toBe("string");
    
                    expect(item).toHaveProperty("watched");
                    expect(typeof item.watched).toBe("boolean");
                });
            }
        });
    
        test("Debe manejar una watchlist vacía correctamente", async () => {
            const response = await request(app)
                .get("/watchlist/9999") // Usuario inexistente
                .set("Authorization", `Bearer ${token}`);
    
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(0);
        });
    
        test("Debe rechazar la solicitud sin autenticación", async () => {
            await request(app)
                .get("/watchlist/1")
                .expect(401);
        });
    
        test("Debe devolver error 400 para un userId inválido", async () => {
            await request(app).get("/watchlist/abc").set("Authorization", `Bearer ${token}`).expect(400);
            await request(app).get("/watchlist/-1").set("Authorization", `Bearer ${token}`).expect(400);
        });
    });

    //--------------------------------------------------------------------------------------------------------------
    // TESTS POST /watchlist/:userId/items
    describe("POST /watchlist/:userId/items", () => {
        test("Debe añadir una película al watchlist correctamente", async () => {
            const response = await request(app)
                .post("/watchlist/1/items")
                .set("Authorization", `Bearer ${token}`)
                .send({ movieId: 10, watched: false });
    
            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty("movieId", 10);
            expect(response.body).toHaveProperty("title");
            expect(response.body).toHaveProperty("watched", false);
        });
    
        test("Debe rechazar una petición sin autenticación", async () => {
            await request(app)
                .post("/watchlist/1/items")
                .send({ movieId: 10, watched: false })
                .expect(401);
        });
    
        test("Debe rechazar un movieId inválido", async () => {
            await request(app)
                .post("/watchlist/1/items")
                .set("Authorization", `Bearer ${token}`)
                .send({ movieId: -5, watched: false })
                .expect(422);
        });
    
        test("Debe devolver error 404 si la película no existe", async () => {
            await request(app)
                .post("/watchlist/1/items")
                .set("Authorization", `Bearer ${token}`)
                .send({ movieId: 9999, watched: false })
                .expect(404);
        });
    
        test("Debe devolver error 409 si la película ya está en el watchlist", async () => {
            await request(app)
                .post("/watchlist/1/items")
                .set("Authorization", `Bearer ${token}`)
                .send({ movieId: 10, watched: false })
                .expect(409);
        });
    });
    
    //--------------------------------------------------------------------------------------------------------------
    // TESTS DELETE /watchlist/:userId/items/:itemId
    describe("DELETE /watchlist/:userId/items/:itemId", () => {
        test("Debe eliminar una película del watchlist correctamente", async () => {
            await request(app)
                .delete("/watchlist/1/items/1")
                .set("Authorization", `Bearer ${token}`)
                .expect(204);
        });
    
        test("Debe rechazar una petición sin autenticación", async () => {
            await request(app)
                .delete("/watchlist/1/items/1")
                .expect(401);
        });
    
        test("Debe devolver error 404 si el item no existe en el watchlist", async () => {
            await request(app)
                .delete("/watchlist/1/items/9999")
                .set("Authorization", `Bearer ${token}`)
                .expect(404);
        });
    });
    

});