import { Router } from "express";
import { listPosts, getPostBySlug } from "../controllers/post.js";
import { addComment, listComments } from "../controllers/comment.js";
import { authMiddleware } from "../middlewares/authorization.js";

const postRouter = Router();

// Posts
postRouter.get("/", listPosts);
postRouter.get("/:slug", getPostBySlug);

// Comments
postRouter.get("/:postId/comments", listComments);
postRouter.post("/comments", [authMiddleware], addComment);

export default postRouter;
