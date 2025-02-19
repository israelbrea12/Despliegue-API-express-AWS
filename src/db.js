const { Sequelize } = require("sequelize");
const { generateHashedPassword } = require("./auth");
require("dotenv").config();

const db = new Sequelize(
    process.env.DB_NAME || "express",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "root",
    {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        port: process.env.DB_PORT || 3306,
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
    }
);


module.exports = {
    get instance() {
        return db;
    },
    initialize() {

        // ENTIDAD MOVIE
        const Movie = db.define("Movie", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            genre: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            rating: {
                type: Sequelize.FLOAT,
                allowNull: true,
            },
        });

        // ENTIDAD RATING
        const Rating = db.define("Rating", {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            movieId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
            },
            rating: {
                type: Sequelize.FLOAT,
                allowNull: false,
                validate: { min: 0, max: 5 }
            },
            comment: {
                type: Sequelize.STRING,
                allowNull: true,
                validate: {
                    len: [0, 500],
                },
            },

        });

        // ENTIDAD WATCHLIST
        const Watchlist = db.define(
            "Watchlist",
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                userId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                movieId: {
                    type: Sequelize.INTEGER,
                    allowNull: false,
                },
                title: {
                    type: Sequelize.STRING,
                    allowNull: true,
                },
                watched: {
                    type: Sequelize.BOOLEAN,
                    allowNull: false,
                },
            });

        // ENTIDAD USER
        const User = db.define(
            "User",
            {
                id: {
                    type: Sequelize.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                },
                name: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                email: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                username: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
                password: {
                    type: Sequelize.STRING,
                    allowNull: false,
                },
            },
            {
                indexes: [
                    {
                        unique: true,
                        fields: ["email"],
                    },
                    {
                        unique: true,
                        fields: ["username"],
                    },
                ],
            }
        );

        // RELACIONES ENTRE ENTIDADES

        // User - Rating relationship
        User.hasMany(Rating, { foreignKey: "userId", onDelete: "CASCADE" });
        Rating.belongsTo(User, { foreignKey: "userId" });

        // Movie - Rating relationship
        Movie.hasMany(Rating, { foreignKey: "movieId", onDelete: "CASCADE" });
        Rating.belongsTo(Movie, { foreignKey: "movieId" });

        // User - Watchlist relationship
        User.hasOne(Watchlist, { foreignKey: "userId", onDelete: "CASCADE" });
        Watchlist.belongsTo(User, { foreignKey: "userId" });

        // Watchlist - Movie relationship
        Watchlist.hasMany(Movie, { foreignKey: "movieId", onDelete: "CASCADE" });
        Movie.belongsTo(Watchlist, { foreignKey: "movieId" });

        // SEEDER BASE DE DATOS
        return db.sync({ alter: true }).then(async () => {

            // Insertar usuarios con contraseñas encriptadas
            const hashedPasswords = await Promise.all([
                generateHashedPassword("test_test_test", 10),
                generateHashedPassword("test_test_test2", 10),
                generateHashedPassword("test_test_test3", 10),
            ]);

            // Insertar películas
            await Movie.bulkCreate([
                { title: "Inception", genre: "Sci-Fi", duration: 148, rating: 2.3 },
                { title: "The Dark Knight", genre: "Action", duration: 152, rating: 4.7 },
                { title: "Interstellar", genre: "Sci-Fi", duration: 169, rating: 3.3 },
                { title: "Pulp Fiction", genre: "Crime", duration: 154, rating: 4.1 },
                { title: "The Godfather", genre: "Crime", duration: 175, rating: 1.9 },
                { title: "The Shawshank Redemption", genre: "Drama", duration: 142, rating: 4.1 },
                { title: "Fight Club", genre: "Drama", duration: 139, rating: 4.3 },
                { title: "Forrest Gump", genre: "Drama", duration: 142, rating: 4.6 },
                { title: "The Matrix", genre: "Sci-Fi", duration: 136, rating: 4.8 },
                { title: "Goodfellas", genre: "Crime", duration: 146, rating: 4.5 },
                { title: "The Lord of the Rings: The Fellowship of the Ring", genre: "Fantasy", duration: 178, rating: 4.9 },
                { title: "The Lord of the Rings: The Two Towers", genre: "Fantasy", duration: 179, rating: 4.7 },
                { title: "The Lord of the Rings: The Return of the King", genre: "Fantasy", duration: 201, rating: 4.9 },
                { title: "The Avengers", genre: "Action", duration: 143, rating: 4.0 },
                { title: "Avengers: Endgame", genre: "Action", duration: 181, rating: 4.7 },
                { title: "Spider-Man: No Way Home", genre: "Action", duration: 148, rating: 4.6 },
                { title: "The Batman", genre: "Action", duration: 176, rating: 4.2 },
                { title: "Joker", genre: "Crime", duration: 122, rating: 4.5 },
                { title: "Titanic", genre: "Romance", duration: 195, rating: 4.3 },
                { title: "Gladiator", genre: "Action", duration: 155, rating: 4.4 }
            ]);

            
            // Insertar usuarios estáticos
            await User.findOrCreate({
                where: { email: "Test@example.org" },
                defaults: { name: "Test", username: "test", password: hashedPasswords[0] }
            });
            
            await User.findOrCreate({
                where: { email: "Test2@example.org" },
                defaults: { name: "Test2", username: "test2", password: hashedPasswords[1] }
            });
            
            await User.findOrCreate({
                where: { email: "Test3@example.org" },
                defaults: { name: "Test3", username: "test3", password: hashedPasswords[2] }
            });
            
        });
    },

    async close() {
        await db.close();
    }
};