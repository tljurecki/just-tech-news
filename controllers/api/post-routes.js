const router = require('express').Router();
const { Post, User, Vote } = require('../../models');
const sequelize = require('../../config/connection');

//get all users
router.get('/', (req, res) => {
    console.log('================');
    Post.findAll({
        attributes: ['id', 'post_url', 'title', 'created_at', [sequelize.literal('SELECT COUNT(*) FROM votes WHERE id = vote.post_id'), 'vote_count']],
       order:[[ 'created_at', 'DESC']],
        include: [
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.get('/:id', (req, res) => {
    Post.findOne({
        where: {
            id: req.params.id
        },
        attributes: ['id', 'post_url', 'title', 'created_at', [sequelize.literal('SELECT FROM COUNT(*) WHERE post_id = vote.post_id'), 'vote_count']],
        include: [
            {
                model: User,
                attributes: ['username']
            }
        ]
    })
    .then(dbPostData => {
        if(!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

router.post('/', (req, res) => {
    //expects (title, post_url)
    Post.create({
        title: req.body.title,
        post_url: req.body.post_url,
        user_id: req.body.user_id
    })
    .then(dbPostData => res.json(dbPostData))
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});
//Put /api/posts/upvote
router.put('/upvote', (req, res) => {
Vote.create({
    user_id: req.body.user_id,
    post_id: req.body.post_id
})
.then(() => {
    //then find the one we just voted on
    return Post.findOne({
        where: {
            id: req.body.post_id
        },
        attributes: [
            'id',
            'post_url',
            'title',
            'created_at',
            //user raw MYSQL aggregate function query to get a count of how many votes the post has and return it under the na,e 'vote_count'
            [
                sequelize.literal('SELECT COUNT (*) FROM voteWHERE post_id = vote.post_id '),
                'vote_count'
            ]
        ]
    })
    .then(dbPostData => res.json(dbPostData))
.catch(err => res.json(err));
});
});


router.put('/:id', (req, res) => {
    Post.update(
        {
            title: req.body.title
        },
        {
            where: {
                id: req.params.id
            }
        }
    )
    .then(dbPostData => {
        if(!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});


router.delete('/:id', (req, res) => {
    Post.destroy({
        where: {
            id: req.params.id
        }
    })
    .then(dbPostData => {
        if(!dbPostData) {
            res.status(404).json({ message: 'No post found with this id' });
            return;
        }
        res.json(dbPostData);
    })
    .catch(err => {
        console.log(err);
        res.status(500).json(err);
    });
});

module.exports = router;