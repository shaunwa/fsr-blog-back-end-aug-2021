import express from 'express';
import { MongoClient } from 'mongodb';

const app = express();
app.use(express.json());

const start = async () => {
    const client = await MongoClient.connect('mongodb://localhost:27017', {
        useNewUrlParser: true, useUnifiedTopology: true,
    });
    const db = client.db('react-blog-aug-2021');

    app.get('/api/articles', async (req, res) => {
        const allArticles = await db.collection('articles').find({}).toArray();
        res.json(allArticles);
    });

    app.get('/api/articles/:articleName', async (req, res) => {
        try {
            const { articleName } = req.params;
            const article = await db.collection('articles').findOne({ name: articleName });
            
            if (article) {
                res.json(article);
            } else {
                res.sendStatus(404);
            }
        } catch (e) {
            res.sendStatus(500);
        }
    });

    app.post('/api/articles/:articleName/upvotes', async (req, res) => {
        const { articleName } = req.params;

        const result = await db.collection('articles').findOneAndUpdate({ name: articleName }, {
            $inc: { upvotes: 1 },
        }, { new: true });

        if (result.lastErrorObject.n === 0) {
            res.sendStatus(404);
        } else {
            const updatedArticle = result.value;

            res.json(updatedArticle);
        }
    });

    app.post('/api/articles/:articleName/comments', async (req, res) => {
        const { articleName } = req.params;
        const { postedBy, text } = req.body;

        const result = await db.collection('articles').findOneAndUpdate({ name: articleName }, {
            $push: { comments: { postedBy, text } },
        }, { returnDocument: 'after' });

        if (result.lastErrorObject.n === 0) {
            res.sendStatus(404);
        } else {
            const updatedArticle = result.value;
            res.json(updatedArticle);
        }
    });

    app.listen(8080, () => {
        console.log('Server is listening on port 8080');
    });
}

start();