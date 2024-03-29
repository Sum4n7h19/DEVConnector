const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const authMW = require("../../middleWare/authMW");
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/user");

// @route   Post api/posts
//@desc     Createa post
// @Acccess  private
router.post(
  "/",
  [authMW, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   Get api/posts
//@desc     Get all post
// @Acccess  private
router.get("/", authMW, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   Get api/post/:id
//@desc     Get post by id
// @Acccess  private
router.get("/:id", authMW, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   Delete api/posts/:id
//@desc     Delete all post
// @Acccess  private
router.delete("/:id", authMW, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }
    // check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.deleteOne();
    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);
    if (err.kind === "ObjectId") {
      return res.status(404).json({ msg: "Post not found" });
    }
    res.status(500).send("Server error");
  }
});

// @route   Put api/posts/like/:id
//@desc     like a post
// @Acccess  private
router.put("/like/:id", authMW, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the user already liked the post
    if (
      post.comments.filter((like) => like.user.toString() === req.user.id)
        .length > 0
    ) {
      return res.status(400).json({ msg: "Post already liked" });
    }

    post.comments.unshift({ user: req.user.id });

    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   Put api/posts/unlike/:id
//@desc     like a post
// @Acccess  private
router.put("/unlike/:id", authMW, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post already been liked
    if (
      post.comments.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: "Post already unliked" });
    }

    // Get remove index
    const removeIndex = post.comments.map((like) =>
      like.user.toString().indexOf(req.user.id)
    );

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route   Post api/posts/comment/:id
//@desc     Comment on post
// @Acccess  private
router.post(
  "/comment/:id",
  [authMW, [check("text", "Text is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

// @route   Delets api/posts/comment/:id/:comment_id
//@desc     delete comment on post
// @Acccess  private
router.delete("/comment/:id/:comment_id", authMW, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //Pullout comment
    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: "Comment does not exists" });
    }

    // Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    const removeIndex = post.comments.map((like) =>
      like.user.toString().indexOf(req.user.id)
    );

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
