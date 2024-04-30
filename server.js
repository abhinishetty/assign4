const cluster = require('cluster');
const os = require('os');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Author = require('./author');
const Blog = require('./blog');

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
    });
} else {
    const app = express();
    const port = 3001;

    mongoose.connect('mongodb+srv://varshashetty2003:Shetty@2003@cluster0.gxe5tb1.mongodb.net')
        .then(() => {
            console.log('Connected to MongoDB');
        })
        .catch((err) => {
            console.error('Error connecting to MongoDB', err);
        });

    app.use(bodyParser.json());

    // Create a new author
    app.post('/authors', async (req, res) => {
        try {
            const author = new Author(req.body);
            await author.save();
            res.status(201).send(author);
        } catch (error) {
            res.status(400).send(error);
        }
    });

    // Get all authors
    app.get('/authors', async (req, res) => {
        try {
            const authors = await Author.find();
            res.send(authors);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    // Create a new blog
    app.post('/blogs', async (req, res) => {
        try {
            const blog = new Blog(req.body);
            await blog.save();
            res.status(201).send(blog);
        } catch (error) {
            res.status(400).send(error);
        }
    });

    // Get all blogs
    app.get('/blogs', async (req, res) => {
        try {
            const blogs = await Blog.find();
            res.send(blogs);
        } catch (error) {
            res.status(500).send(error);
        }
    });

    app.listen(port, () => {
        console.log(`Server is listening at http://localhost:${port}`);
    });
}

