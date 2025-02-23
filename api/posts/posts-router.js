// implement your posts router here
const express = require('express');
const router = express.Router();
const Post = require('./posts-model');
const { restart } = require('nodemon');

router.get('/', (req, res) => {
    Post.find()
        .then(found => {
            res.json(found);
        })
        .catch(err => {
            res.status(500).json({ message: "The posts information could not be retrieved" });
        })
})

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(posts => {
            if(!posts) {
                res.status(404).json({ message: "The post with the specified ID does not exist" });
            }
            res.json(posts);
        })
        .catch(err => {
            res.status(500).json({ message: "The post information could not be retrieved" });
        })
})

router.post('/', (req, res) => {
    const { title, contents } = req.body;
    if(!title || !contents) {
        res.status(400).json({ message: "Please provide title and contents for the post" });
    } else {
        Post.insert({ title, contents })
            .then(({ id }) => {
                return Post.findById(id);
            })
            .then(createdPost => {
                res.status(201).json(createdPost);
            })
            .catch(err => {
                res.status(500).json({ message: "There was an error while saving the post to the database" })
            })
    }
})

router.delete('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => {
            if(!post) {
                res.status(404).json({ message: "The post with the specified ID does not exist" });
            } else {
                Post.remove(req.params.id);
                res.status(200).json(post);
            }
        })
        .catch(err => {
            res.status(500).json({ message: "The post could not be removed" });
        })
})

router.put('/:id', (req, res) => {
    const { title, contents } = req.body;
    if(!title || !contents) {
        res.status(400).json({ message: "Please provide title and contents for the post" });
    } else {
        Post.findById(req.params.id)
            .then(posts => {
                if(!posts) {
                    res.status(404).json({ message: "The post with the specified ID does not exist" });
                } else {
                    return Post.update(req.params.id, req.body);
                }
            })
            .then(data => {
                if(data) {
                    return Post.findById(req.params.id);
                }
            })
            .then(post => {
                if(post) {
                    res.status(200).json(post);
                }
            })
            .catch(err => {
                res.status(500).json({ message: "The post information could not be modified" });
            })
    }
})

router.get('/:id/comments', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if(!post) {
            res.status(404).json({ message: "The post with the specified ID does not exist" });
        } else {
            const comments = await Post.findPostComments(req.params.id);
            res.json(comments);
        }
    } catch (err) {
        res.status(500).json({ message: "The comments information could not be retrieved" });
    }
})

module.exports = router;
