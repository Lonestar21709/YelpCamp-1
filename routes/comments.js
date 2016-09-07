var express     = require("express"),
    router      = express.Router({mergeParams: true}),
    Campground  = require("../models/campground"),
    Comment     = require("../models/comment"),
    middleware  = require("../middleware");

// Comments New
router.get('/new', middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err){
            console.log(err);
        } else {
            res.render('comments/new', {campground: campground});
        }
    });
})

// Comments Create
router.post('/',middleware.isLoggedIn, function(req, res) {
  // lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if (err){
            console.log(err);
            res.redirect('/campgrounds')
        } else {
          // create new comment
            Comment.create(req.body.comment, function(err, comment) {
                if (err){
                    req.flash('error', 'Something went wrong!');
                    console.log(err);
                } else {
                    // Add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // Save comment
                    comment.save();
                    // connect new comment to campground
                    campground.comments.push(comment);
                    campground.save();
                    req.flash('success', 'Successfully added comment!');
                    // redirect campground show page
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});


// Edit Route
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            res.redirect('back');
        } else {
            res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
        }
    })
});


// Update Route
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
        if(err) {
            res.redirect('back');
        } else {
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});


//Destroy Route
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err, removedComment) {
        if(err) {
            res.redirect('back');
        } else {
            req.flash('success', 'Comment deleted!');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});



module.exports = router;